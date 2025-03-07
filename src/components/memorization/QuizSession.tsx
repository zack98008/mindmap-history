
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getHistoricalEvents, getHistoricalPeople, getHistoricalDocuments, getHistoricalConcepts } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  element: HistoricalElement;
  explanation: string;
}

interface QuizResult {
  correct: number;
  total: number;
  questions: Array<{
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

const QuizSession = () => {
  const [quizCategory, setQuizCategory] = useState<'all' | 'people' | 'events' | 'documents' | 'concepts'>('all');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, string>>({});
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  
  // Initialize quiz on mount
  useEffect(() => {
    generateQuiz();
  }, [quizCategory, quizDifficulty]);
  
  const generateQuiz = () => {
    setLoadingQuiz(true);
    
    // Get historical elements based on category
    let elements: HistoricalElement[] = [];
    switch (quizCategory) {
      case 'people':
        elements = getHistoricalPeople();
        break;
      case 'events':
        elements = getHistoricalEvents();
        break;
      case 'documents':
        elements = getHistoricalDocuments();
        break;
      case 'concepts':
        elements = getHistoricalConcepts();
        break;
      default:
        // For 'all', combine all categories
        elements = [
          ...getHistoricalPeople(),
          ...getHistoricalEvents(),
          ...getHistoricalDocuments(),
          ...getHistoricalConcepts()
        ];
    }
    
    // Shuffle the elements
    const shuffledElements = [...elements].sort(() => Math.random() - 0.5);
    
    // Determine number of questions based on difficulty
    const questionCount = quizDifficulty === 'easy' ? 5 : quizDifficulty === 'medium' ? 10 : 15;
    
    // Select a subset of elements for the quiz
    const quizElements = shuffledElements.slice(0, questionCount);
    
    // Generate questions from these elements
    const generatedQuestions = quizElements.map(element => {
      // Determine question type randomly
      const questionType = Math.floor(Math.random() * 3);
      
      let question = '';
      let options: string[] = [];
      let correctAnswer = '';
      let explanation = '';
      
      switch (questionType) {
        case 0: // Year/Period question
          if (element.year) {
            question = `In what year did "${element.name}" occur or was created?`;
            correctAnswer = element.year.toString();
            options = [
              correctAnswer,
              (parseInt(correctAnswer) - 10 - Math.floor(Math.random() * 20)).toString(),
              (parseInt(correctAnswer) + 10 + Math.floor(Math.random() * 20)).toString(),
              (parseInt(correctAnswer) - 50 + Math.floor(Math.random() * 100)).toString(),
            ];
            explanation = `${element.name} occurred/was created in ${element.year}.`;
          } else {
            question = `What is "${element.name}" most known for?`;
            correctAnswer = element.description || "Its historical significance";
            options = [
              correctAnswer,
              `Being a ${element.type === 'person' ? 'document' : element.type === 'document' ? 'concept' : 'person'} rather than a ${element.type}`,
              `Occurring in the 20th century`,
              `Having minimal historical impact`,
            ];
            explanation = element.description || `${element.name} is an important historical ${element.type}.`;
          }
          break;
          
        case 1: // Description/detail question
          question = `Which of the following best describes "${element.name}"?`;
          correctAnswer = element.description || `A historical ${element.type}`;
          options = [
            correctAnswer,
            `A minor ${element.type} with little historical significance`,
            `A fictional ${element.type} often confused with real history`,
            `A modern ${element.type} incorrectly attributed to history`,
          ];
          explanation = element.description || `${element.name} is an important historical ${element.type}.`;
          break;
          
        case 2: // Type/category question
          question = `"${element.name}" is best categorized as what type of historical element?`;
          correctAnswer = element.type.charAt(0).toUpperCase() + element.type.slice(1);
          
          const typeOptions = ['Person', 'Event', 'Document', 'Concept'];
          options = typeOptions.filter(t => t.toLowerCase() !== element.type);
          options.push(correctAnswer);
          
          explanation = `${element.name} is a historical ${element.type}.`;
          break;
      }
      
      // Shuffle the options
      options = options.sort(() => Math.random() - 0.5);
      
      return {
        id: element.id,
        question,
        options,
        correctAnswer,
        element,
        explanation,
      };
    });
    
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setQuizComplete(false);
    setQuizResults(null);
    setAnsweredQuestions({});
    setLoadingQuiz(false);
    
    toast.success(`Generated a new ${quizDifficulty} quiz on ${quizCategory} history!`);
  };
  
  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }
    
    // Mark this question as answered
    setHasAnswered(true);
    setAnsweredQuestions({
      ...answeredQuestions,
      [currentQuestionIndex]: selectedAnswer,
    });
    
    // Wait a moment so user can see if answer was correct
    setTimeout(() => {
      // Move to next question or finish quiz
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setHasAnswered(false);
      } else {
        completeQuiz();
      }
    }, 1500);
  };
  
  const completeQuiz = () => {
    // Calculate results
    let correctCount = 0;
    const detailedResults = questions.map((q, index) => {
      const userAnswer = answeredQuestions[index] || '';
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        question: q.question,
        yourAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });
    
    const results: QuizResult = {
      correct: correctCount,
      total: questions.length,
      questions: detailedResults,
    };
    
    setQuizResults(results);
    setQuizComplete(true);
    
    // Show appropriate toast based on score
    const percentage = (correctCount / questions.length) * 100;
    if (percentage >= 80) {
      toast.success(`Great job! Score: ${correctCount}/${questions.length} (${percentage.toFixed(0)}%)`);
    } else if (percentage >= 60) {
      toast.success(`Good work! Score: ${correctCount}/${questions.length} (${percentage.toFixed(0)}%)`);
    } else {
      toast.error(`You scored: ${correctCount}/${questions.length} (${percentage.toFixed(0)}%). Keep studying!`);
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100;
  
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">History Quiz</h2>
          <Button variant="outline" onClick={generateQuiz} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            New Quiz
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Category:</h3>
            <Tabs value={quizCategory} onValueChange={(value) => setQuizCategory(value as any)}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="concepts">Concepts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Difficulty:</h3>
            <Tabs value={quizDifficulty} onValueChange={(value) => setQuizDifficulty(value as any)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="easy">Easy</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="hard">Hard</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      
      {loadingQuiz ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Generating quiz questions...</p>
        </div>
      ) : !quizComplete ? (
        questions.length > 0 ? (
          <>
            <div className="mb-2 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              {quizDifficulty === 'hard' && (
                <div className="text-sm text-muted-foreground">
                  No time limit • Harder questions
                </div>
              )}
            </div>
            
            <Progress value={progress} className="h-2 mb-4" />
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswerSelect}>
                  {currentQuestion.options.map((option, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center space-x-2 p-3 rounded-md ${
                        hasAnswered && option === currentQuestion.correctAnswer 
                          ? 'bg-green-950 border border-green-600' 
                          : hasAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer
                            ? 'bg-red-950 border border-red-600'
                            : 'hover:bg-slate-800'
                      }`}
                    >
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${i}`} 
                        disabled={hasAnswered}
                      />
                      <Label 
                        htmlFor={`option-${i}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                      {hasAnswered && option === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {hasAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              {hasAnswered && (
                <CardFooter className="bg-slate-800 rounded-b-lg border-t border-slate-700">
                  <div className="text-sm py-2">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </div>
                </CardFooter>
              )}
            </Card>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {questions.length} questions
              </div>
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={!selectedAnswer || hasAnswered}
              >
                {hasAnswered 
                  ? currentQuestionIndex < questions.length - 1 
                    ? "Loading next question..." 
                    : "Completing quiz..." 
                  : "Submit Answer"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No quiz questions available.</p>
            <Button onClick={generateQuiz} className="mt-4">Generate Quiz</Button>
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-2"
            >
              {quizResults?.correct} / {quizResults?.total}
            </motion.div>
            <Progress 
              value={(quizResults?.correct || 0) / (quizResults?.total || 1) * 100} 
              className="h-4 w-64 mx-auto mb-4" 
              indicatorClassName={
                ((quizResults?.correct || 0) / (quizResults?.total || 1)) >= 0.8 
                  ? "bg-green-500" 
                  : ((quizResults?.correct || 0) / (quizResults?.total || 1)) >= 0.6
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
            />
            <p className="text-lg">
              {((quizResults?.correct || 0) / (quizResults?.total || 1)) >= 0.8 
                ? "Excellent! You have a strong grasp of this historical material." 
                : ((quizResults?.correct || 0) / (quizResults?.total || 1)) >= 0.6
                  ? "Good job! With a bit more study, you'll master this material."
                  : "Keep studying! Historical knowledge takes time to develop."}
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-4">Question Review</h3>
            <div className="space-y-4">
              {quizResults?.questions.map((result, index) => (
                <Card key={index} className={result.isCorrect ? "border-green-600" : "border-red-600"}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                      {result.isCorrect 
                        ? <CheckCircle className="h-5 w-5 text-green-500" />
                        : <XCircle className="h-5 w-5 text-red-500" />
                      }
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="mb-1 text-muted-foreground">{result.question}</p>
                    <div className="mt-2 text-sm">
                      <div className="flex items-start mb-1">
                        <span className="font-medium mr-2">Your answer:</span>
                        <span className={result.isCorrect ? "text-green-500" : "text-red-500"}>
                          {result.yourAnswer || "(No answer)"}
                        </span>
                      </div>
                      {!result.isCorrect && (
                        <div className="flex items-start">
                          <span className="font-medium mr-2">Correct answer:</span>
                          <span className="text-green-500">{result.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button onClick={generateQuiz}>Start New Quiz</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSession;
