import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getHistoricalEvents, getHistoricalPersons, getHistoricalDocuments, getHistoricalConcepts } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';
import { ArrowRight, CheckCircle, XCircle, RotateCcw, Trophy, BrainCircuit } from 'lucide-react';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

type QuizStatus = 'not-started' | 'in-progress' | 'completed';

const QuizSession = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('not-started');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);

  const isQuizStarted = quizStatus === 'in-progress';
  const isQuizCompleted = quizStatus === 'completed';
  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (timerActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up, handle answer submission
      handleAnswerSubmit(null);
    }

    return () => clearInterval(intervalId);
  }, [timerActive, timeLeft]);

  // Generate quiz questions when component mounts
  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = () => {
    const allData = [
      ...getHistoricalPersons(),
      ...getHistoricalEvents(),
      ...getHistoricalDocuments(),
      ...getHistoricalConcepts()
    ];
    
    if (allData.length === 0) {
      toast.error('No historical data available to generate quiz questions.');
      return;
    }

    const newQuestions: Question[] = [];
    for (let i = 0; i < 5; i++) {
      const correctItem = allData[Math.floor(Math.random() * allData.length)];
      const options: string[] = [correctItem.name];

      // Generate 3 incorrect options
      while (options.length < 4) {
        const randomItem = allData[Math.floor(Math.random() * allData.length)];
        if (!options.includes(randomItem.name)) {
          options.push(randomItem.name);
        }
      }

      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      newQuestions.push({
        questionText: `What is the name of this historical element? (${correctItem.type})`,
        options: options,
        correctAnswer: correctItem.name,
      });
    }

    setQuestions(newQuestions);
  };

  const startQuiz = () => {
    setQuizStatus('in-progress');
    setTimerActive(true);
    setTimeLeft(20);
    setUserAnswers(Array(questions.length).fill(null));
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSelect = (answer: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = answer;
    setUserAnswers(updatedAnswers);
  };

  const handleAnswerSubmit = (selectedAnswer: string | null) => {
    setTimerActive(false); // Pause the timer

    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    let isCorrect = false;

    if (selectedAnswer) {
      isCorrect = selectedAnswer === correctAnswer;
    } else {
      // If no answer is selected, mark as incorrect
      isCorrect = false;
    }

    if (isCorrect) {
      toast.success('Correct!');
      setScore(prevScore => prevScore + 1);
    } else {
      toast.error(`Incorrect. The correct answer was ${correctAnswer}`);
    }

    // Move to the next question or end the quiz
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setTimeLeft(20);
        setTimerActive(true); // Resume the timer
      }, 1000);
    } else {
      endQuiz();
    }
  };

  const endQuiz = () => {
    setQuizStatus('completed');
    setTimerActive(false);
    toast.success('Quiz completed!');
  };

  const resetQuiz = () => {
    setQuizStatus('not-started');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setTimeLeft(20);
    setTimerActive(false);
    generateQuiz();
  };

  const calculatePercentage = useMemo(() => {
    return isQuizCompleted ? (score / questions.length) * 100 : 0;
  }, [isQuizCompleted, score, questions.length]);

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Quiz Mode</h2>
          <p className="text-muted-foreground">Test your knowledge of historical events</p>
        </div>
        <div>
          {quizStatus === 'not-started' && (
            <Button onClick={startQuiz} className="gap-2">
              <BrainCircuit className="h-4 w-4" />
              Start Quiz
            </Button>
          )}
          {quizStatus === 'completed' && (
            <Button onClick={resetQuiz} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Quiz
            </Button>
          )}
        </div>
      </div>
      
      {isQuizCompleted && (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold">Quiz Completed!</h3>
          <p className="text-lg text-muted-foreground mb-4">
            You scored {score} out of {questions.length} ({calculatePercentage.toFixed(0)}%)
          </p>
          {calculatePercentage >= 70 ? (
            <Badge variant="outline" className="text-lg">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Great job!
            </Badge>
          ) : (
            <Badge variant="outline" className="text-lg">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Keep practicing!
            </Badge>
          )}
        </div>
      )}
      
      {isQuizStarted && !isQuizCompleted && currentQuestion && (
        <div className="mb-6">
          <div className="flex justify-between mb-2 text-sm">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{timeLeft} seconds left</span>
          </div>
          <Progress 
            value={((currentQuestionIndex) / questions.length) * 100} 
            className="h-2"
          />
        </div>
      )}
      
      {isQuizStarted && !isQuizCompleted && currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{currentQuestion.questionText}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup onValueChange={handleAnswerSelect} defaultValue={userAnswers[currentQuestionIndex] || ''}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`question-${currentQuestionIndex}-${index}`} className="peer h-5 w-5 shrink-0 rounded-full border-2 border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                  <Label htmlFor={`question-${currentQuestionIndex}-${index}`} className="cursor-pointer peer-checked:text-primary">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="justify-between">
            <Button 
              onClick={() => handleAnswerSubmit(userAnswers[currentQuestionIndex])} 
              disabled={!userAnswers[currentQuestionIndex]}
              className="gap-2"
            >
              Submit Answer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default QuizSession;
