
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getAllHistoricalElements } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';
import { ArrowLeft, ArrowRight, BookOpen, Check, RotateCcw, X } from 'lucide-react';
import { motion } from 'framer-motion';

const FlashcardStudy = () => {
  const [flashcards, setFlashcards] = useState<HistoricalElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  
  // Get all historical elements and filter them based on the selected type
  useEffect(() => {
    const allElements = getAllHistoricalElements();
    
    let filteredElements = allElements;
    if (selectedType !== 'all') {
      filteredElements = allElements.filter(element => element.type === selectedType);
    }
    
    // Randomize the order
    const shuffled = [...filteredElements].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedType]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      toast.success('You completed this deck!', {
        description: `You mastered ${masteredCards.size} of ${flashcards.length} cards.`
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCardMastery = (mastered: boolean) => {
    const currentCardId = flashcards[currentIndex].id;
    const updatedMasteredCards = new Set(masteredCards);
    
    if (mastered) {
      updatedMasteredCards.add(currentCardId);
      toast('Card marked as mastered!', { 
        icon: <Check className="h-4 w-4 text-green-500" /> 
      });
    } else {
      updatedMasteredCards.delete(currentCardId);
      toast('Card needs more review.', { 
        icon: <RotateCcw className="h-4 w-4 text-yellow-500" /> 
      });
    }
    
    setMasteredCards(updatedMasteredCards);
    handleNext();
  };

  const resetDeck = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.info('Deck reshuffled');
  };

  const currentFlashcard = flashcards[currentIndex];

  // If no flashcards are available yet
  if (!currentFlashcard) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg text-center mb-6">
          Select a category and difficulty to start studying with flashcards
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          <div>
            <label className="text-sm font-medium mb-2 block">Entity Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="person">People</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="concept">Concepts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Difficulty</label>
            <Select value={difficulty} onValueChange={(val: 'easy' | 'medium' | 'hard') => setDifficulty(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            {selectedType === 'all' ? 'All' : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Flashcards
          </h2>
          <p className="text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="person">People</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="concept">Concepts</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={resetDeck}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <motion.div 
        className="w-full h-[400px] mx-auto flex justify-center mb-6 perspective-1000"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-full max-w-2xl h-full relative cursor-pointer"
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={`absolute w-full h-full rounded-lg shadow-xl backface-hidden 
            ${isFlipped ? 'hidden' : 'block'} 
            ${currentFlashcard.type === 'person' ? 'bg-chronoPurple/20' : 
              currentFlashcard.type === 'event' ? 'bg-chronoBlue/20' : 
              currentFlashcard.type === 'document' ? 'bg-chronoTeal/20' : 'bg-chronoGold/20'}`}
          >
            <div className="p-8 h-full flex flex-col justify-center items-center">
              <h3 className="text-2xl font-bold mb-6">{currentFlashcard.name}</h3>
              {currentFlashcard.imageUrl && (
                <div className="mb-8 w-48 h-48 overflow-hidden rounded-lg shadow-md mx-auto">
                  <img 
                    src={currentFlashcard.imageUrl} 
                    alt={currentFlashcard.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-center text-sm text-muted-foreground">
                Click to see details
              </p>
            </div>
          </div>
          
          <div className={`absolute w-full h-full rounded-lg shadow-xl backface-hidden rotate-y-180 bg-black/10 backdrop-blur-sm
            ${isFlipped ? 'block' : 'hidden'}`}
          >
            <div className="p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold mb-2">{currentFlashcard.name}</h3>
              <div className="mb-2 flex items-center">
                <span className="text-sm bg-slate-700/50 rounded-full px-3 py-1 capitalize">
                  {currentFlashcard.type}
                </span>
                {currentFlashcard.date && (
                  <span className="text-sm ml-2 bg-slate-700/50 rounded-full px-3 py-1">
                    {currentFlashcard.date}
                  </span>
                )}
              </div>
              <p className="mt-4 flex-grow overflow-auto text-md">{currentFlashcard.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {currentFlashcard.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white/10 rounded-full px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleCardMastery(false)}
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/20"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Review Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleCardMastery(true)}
            className="border-green-500 text-green-500 hover:bg-green-500/20"
          >
            <Check className="h-4 w-4 mr-2" />
            Know It
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudy;
