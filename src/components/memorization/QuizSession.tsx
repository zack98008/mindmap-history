
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { getAllHistoricalElements, getRelatedElements } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';
import { Check, ChevronRight, RotateCcw, X } from 'lucide-react';
import { motion } from 'framer-motion';

type QuizQuestion = {
  id: string;
  question: string;
  correctAnswerIndex: number;
  answers: string[];
  explanation: string;
  relatedElement: HistoricalElement;
  type: 'multiple-choice' | 'matching' | 'timeline';
};

const generateQuizQuestions = (elements: HistoricalElement[]): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  
  // Generate questions from our historical elements
  elements.forEach(element => {
    // Skip elements without enough data
    if (!element.description || element.description.length < 20) return;
    
    // Basic information question
    const basicInfoQuestion: QuizQuestion = {
      id: `q_${element.id}_basic`,
      question: `Which statement best describes ${element.name}?`,
      correctAnswerIndex: 0,
      answers: [
        element.description.substring(0, 100) + (element.description.length > 100 ? '...' : ''),
        ...getRandomIncorrectDescriptions(element, elements, 3)
      ],
      explanation: `${element.name} is known for ${element.description.substring(0, 150)}...`,
      relatedElement: element,
      type: 'multiple-choice'
    };
    questions.push(basicInfoQuestion);
    
    // If it has a date, ask a timeline question
    if (element.date) {
      const timeQuestion: QuizQuestion = {
        id: `q_${element.id}_time`,
        question: `When did ${element.name} occur?`,
        correctAnswerIndex: 0,
        answers: [
          element.date,
          ...getRandomIncorrectDates(element.date, 3)
        ],
        explanation: `${element.name} occurred in ${element.date}.`,
        relatedElement: element,
        type: 'timeline'
      };
      questions.push(timeQuestion);
    }
    
    // Relationship question
    const relatedElements = getRelatedElements(element.id);
    if (relatedElements.length > 0) {
      const relatedElement = relatedElements[0];
      const relationshipQuestion: QuizQuestion = {
        id: `q_${element.id}_rel`,
        question: `Which historical entity is most closely associated with ${element.name}?`,
        correctAnswerIndex: 0,
        answers: [
          relatedElement.name,
          ...getRandomUnrelatedElements(element, elements, relatedElements, 3).map(e => e.name)
        ],
        explanation: `${element.name} and ${relatedElement.name} are directly connected in history.`,
        relatedElement: element,
        type: 'matching'
      };
      questions.push(relationshipQuestion);
    }
  });
  
  // Shuffle the questions
  return questions.sort(() => Math.random() - 0.5).slice(0, 10);
};

const getRandomIncorrectDescriptions = (
  element: HistoricalElement,
  allElements: HistoricalElement[],
  count: number
): string[] => {
  const otherElements = allElements.filter(e => e.id !== element.id && e.description);
  const randomElements = otherElements
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  
  return randomElements.map(e => e.description.substring(0, 100) + (e.description.length > 100 ? '...' : ''));
};

const getRandomUnrelatedElements = (
  element: HistoricalElement,
  allElements: HistoricalElement[],
  relatedElements: HistoricalElement[],
  count: number
): HistoricalElement[] => {
  const relatedIds = new Set(relatedElements.map(e => e.id));
  relatedIds.add(element.id);
  
  const unrelatedElements = allElements.filter(e => !relatedIds.has(e.id));
  return unrelatedElements.sort(() => Math.random() - 0.5).slice(0, count);
};

const getRandomIncorrectDates = (correctDate: string, count: number): string[] => {
  // Extract year from date string (assuming format like "1776" or "1945-08-15")
  const yearMatch = correctDate.match(/\d{4}/);
  if (!yearMatch) return Array(count).fill("Unknown date");
  
  const year = parseInt(yearMatch[0], 10);
  const randomYears = [];
  
  for (let i = 0; i < count; i++) {
    // Generate an offset between -100 and +100 years, but not 0
    let offset = Math.floor(Math.random() * 200) - 100;
    if (offset === 0) offset = 1;
    
    const randomYear = year + offset;
    
    // If the date had a month/day format, preserve it with the new year
    if (correctDate.includes('-')) {
      const parts = correctDate.split('-');
      parts[0] = randomYear.toString();
      randomYears.push(parts.join('-'));
    } else {
      randomYears.push(randomYear.toString());
    }
  }
  
  return randomYears;
};

const QuizSession = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{question: string, correct: boolean}[]>([]);
  
  useEffect(() => {
    const allElements = getAllHistoricalElements();
    const quizQuestions = generateQuizQuestions(allElements);
    setQuestions(quizQuestions);
    resetQuiz();
  }, []);
  
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizComplete(false);
    setShowSummary(false);
    setUserAnswers([]);
  };
  
  const handleAnswerSelection = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswerIndex(answerIndex);
    }
  };
  
  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswerIndex === currentQuestion.correctAnswerIndex;
    
    setIsAnswerSubmitted(true);
    setUserAnswers([...userAnswers, {
      question: currentQuestion.question,
      correct: isCorrect
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success('Correct!', {
        description: currentQuestion.explanation
      });
    } else {
      toast.error('Incorrect', {
        description: currentQuestion.explanation
      });
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizComplete(true);
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center">
        <p className="text-lg text-center mb-6">
          Generating your quiz...
        </p>
        <Button onClick={resetQuiz}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }
  
  if (quizComplete && !showSummary) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-6">Quiz Complete!</h2>
        
        <div className="text-center mb-8">
          <p className="text-5xl font-bold mb-2">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground">
            {Math.round((score / questions.length) * 100)}% Correct
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setShowSummary(true)}>
            Review Answers
          </Button>
          <Button onClick={resetQuiz}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (showSummary) {
    return (
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6">Quiz Summary</h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Final Score: {score}/{questions.length}</p>
            <p className="text-sm text-muted-foreground">
              {Math.round((score / questions.length) * 100)}% Correct
            </p>
          </div>
          <Progress value={(score / questions.length) * 100} className="h-2" />
        </div>
        
        <div className="space-y-4 mb-6">
          {userAnswers.map((answer, index) => (
            <div key={index} className={`p-3 rounded-md ${answer.correct ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <div className="flex items-center">
                {answer.correct ? 
                  <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                  <X className="h-4 w-4 text-red-500 mr-2" />
                }
                <p className="font-medium">{answer.question}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Button onClick={resetQuiz}>
          Start New Quiz
        </Button>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">History Quiz</h2>
        <p className="text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
      
      <Progress 
        value={((currentQuestionIndex) / questions.length) * 100} 
        className="mb-8 h-2"
      />
      
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAnswerIndex?.toString()} className="space-y-3">
              {currentQuestion.answers.map((answer, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-2 rounded-md p-3 cursor-pointer transition-colors
                    ${selectedAnswerIndex === index ? 'bg-slate-700/50' : 'hover:bg-slate-700/20'}
                    ${isAnswerSubmitted && index === currentQuestion.correctAnswerIndex ? 'bg-green-500/20' : ''}
                    ${isAnswerSubmitted && selectedAnswerIndex === index && index !== currentQuestion.correctAnswerIndex ? 'bg-red-500/20' : ''}
                  `}
                  onClick={() => handleAnswerSelection(index)}
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`answer-${index}`} 
                    disabled={isAnswerSubmitted}
                  />
                  <Label htmlFor={`answer-${index}`} className="flex-grow cursor-pointer">
                    {answer}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {currentQuestion.type === 'timeline' ? 'Timeline Question' : 
               currentQuestion.type === 'matching' ? 'Relationship Question' : 
               'Multiple Choice'}
            </div>
            
            {!isAnswerSubmitted ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={selectedAnswerIndex === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Finish Quiz'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuizSession;
