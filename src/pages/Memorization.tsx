
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemorizationDashboard from '@/components/memorization/MemorizationDashboard';
import FlashcardStudy from '@/components/memorization/FlashcardStudy';
import QuizSession from '@/components/memorization/QuizSession';
import ConnectionGame from '@/components/memorization/ConnectionGame';
import { toast } from 'sonner';
import { Book, BrainCircuit, GraduationCap } from 'lucide-react';

const Memorization = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Welcome toast when component mounts
    toast.success('Welcome to the Memorization Module!', {
      description: 'Select a study method to begin enhancing your historical knowledge.'
    });
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BrainCircuit className="h-8 w-8 mr-3 text-chronoPurple" />
          <h1 className="text-2xl font-bold">ChronoMind Memorization</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-chronoPurple/20">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="data-[state=active]:bg-chronoBlue/20">
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-chronoTeal/20">
            Quiz Mode
          </TabsTrigger>
          <TabsTrigger value="connections" className="data-[state=active]:bg-chronoGold/20">
            Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="rounded-lg glass-card p-6">
          <MemorizationDashboard onSelectMode={setActiveTab} />
        </TabsContent>
        
        <TabsContent value="flashcards" className="mt-0">
          <FlashcardStudy />
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-0">
          <QuizSession />
        </TabsContent>
        
        <TabsContent value="connections" className="mt-0">
          <ConnectionGame />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Memorization;
