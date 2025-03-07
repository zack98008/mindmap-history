
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { getHistoricalEvents, getHistoricalPersons, getHistoricalDocuments, getHistoricalConcepts } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCcw, Bookmark, CheckCircle, XCircle, Settings } from 'lucide-react';
import InfoGraphic from './InfoGraphic';

type FlashcardStatus = 'studying' | 'mastered' | 'struggling';

interface Flashcard extends HistoricalElement {
  status: FlashcardStatus;
  lastReviewed?: Date;
  correctCount: number;
  incorrectCount: number;
}

const FlashcardStudy = () => {
  const [currentCategory, setCurrentCategory] = useState<'all' | 'people' | 'events' | 'documents' | 'concepts'>('all');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadFlashcards();
  }, [currentCategory]);

  const loadFlashcards = () => {
    let cards: HistoricalElement[] = [];
    
    switch (currentCategory) {
      case 'people':
        cards = getHistoricalPersons();
        break;
      case 'events':
        cards = getHistoricalEvents();
        break;
      case 'documents':
        cards = getHistoricalDocuments();
        break;
      case 'concepts':
        cards = getHistoricalConcepts();
        break;
      default:
        cards = [
          ...getHistoricalPersons(),
          ...getHistoricalEvents(),
          ...getHistoricalDocuments(),
          ...getHistoricalConcepts()
        ];
        break;
    }
    
    const newFlashcards: Flashcard[] = cards.map(card => ({
      ...card,
      status: 'studying',
      correctCount: 0,
      incorrectCount: 0
    }));
    
    const shuffled = [...newFlashcards].sort(() => Math.random() - 0.5);
    
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
    updateProgress(shuffled, 0);
  };

  const updateProgress = (cards: Flashcard[], index: number) => {
    setProgress(Math.round((index / Math.max(cards.length - 1, 1)) * 100));
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
      updateProgress(flashcards, currentIndex + 1);
    } else {
      toast.success('You finished this deck!');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
      updateProgress(flashcards, currentIndex - 1);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleMarkStatus = (status: 'correct' | 'incorrect') => {
    const updatedFlashcards = [...flashcards];
    const currentCard = updatedFlashcards[currentIndex];
    
    if (status === 'correct') {
      currentCard.correctCount += 1;
      
      if (currentCard.correctCount >= 3 && currentCard.incorrectCount === 0) {
        currentCard.status = 'mastered';
        toast.success('Card mastered! 🎉');
      }
    } else {
      currentCard.incorrectCount += 1;
      
      if (currentCard.incorrectCount >= 2) {
        currentCard.status = 'struggling';
      }
    }
    
    currentCard.lastReviewed = new Date();
    setFlashcards(updatedFlashcards);
    
    handleNext();
  };

  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Flashcard Study</h2>
          <Button variant="outline" onClick={loadFlashcards} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Shuffle Cards
          </Button>
        </div>
        
        <Tabs value={currentCategory} onValueChange={(v) => setCurrentCategory(v as any)} className="mb-6">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="concepts">Concepts</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              {flashcards.filter(f => f.status === 'mastered').length}
            </span>
            <span className="flex items-center">
              <XCircle className="h-4 w-4 text-red-500 mr-1" />
              {flashcards.filter(f => f.status === 'struggling').length}
            </span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
      </div>
      
      {flashcards.length > 0 ? (
        <>
          <div className="perspective-1000 mb-6">
            <motion.div
              className={`relative w-full aspect-[4/3] cursor-pointer perspective-1000 ${flipped ? 'rotate-y-180' : ''}`}
              onClick={handleFlip}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`absolute inset-0 glass-card p-6 flex flex-col items-center justify-center backface-hidden ${
                currentFlashcard?.status === 'mastered' 
                  ? 'border-2 border-green-500' 
                  : currentFlashcard?.status === 'struggling' 
                    ? 'border-2 border-red-500' 
                    : ''
              }`}>
                <div className="absolute top-3 left-3 text-xs text-muted-foreground">
                  {currentFlashcard?.type}
                </div>
                {currentFlashcard?.status === 'mastered' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {currentFlashcard?.status === 'struggling' && (
                  <div className="absolute top-3 right-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
                
                <div className="flex w-full h-full">
                  {/* Left side - Text content */}
                  <div className="w-1/2 flex flex-col justify-center pr-4">
                    <h3 className="text-2xl font-bold mb-4">{currentFlashcard?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentFlashcard?.year && `Year: ${currentFlashcard.year}`}
                    </p>
                  </div>
                  
                  {/* Right side - Infographic */}
                  <div className="w-1/2 border-l border-white/10 pl-4">
                    {currentFlashcard && (
                      <InfoGraphic 
                        type={currentFlashcard.type}
                        year={currentFlashcard.year}
                        name={currentFlashcard.name}
                        tags={currentFlashcard.tags}
                      />
                    )}
                  </div>
                </div>
                
                <div className="absolute bottom-3 w-full text-center text-xs text-muted-foreground">
                  Click to flip
                </div>
              </div>
              
              <div className="absolute inset-0 glass-card p-6 flex flex-col items-center justify-center backface-hidden rotate-y-180">
                <div className="absolute top-3 left-3 text-xs text-muted-foreground">
                  Details
                </div>
                <h3 className="text-xl font-bold text-center mb-4">{currentFlashcard?.name}</h3>
                <p className="text-center">{currentFlashcard?.description}</p>
                <div className="absolute bottom-3 w-full text-center text-xs text-muted-foreground">
                  Click to flip
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleMarkStatus('incorrect')}
                className="border-red-500 hover:bg-red-950"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Still Learning
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleMarkStatus('correct')}
                className="border-green-500 hover:bg-green-950"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Got It
              </Button>
            </div>
            
            <Button variant="outline" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No flashcards available for this category.</p>
          <Button onClick={loadFlashcards} className="mt-4">Refresh</Button>
        </div>
      )}
    </div>
  );
};

export default FlashcardStudy;
