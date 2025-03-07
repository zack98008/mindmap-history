
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, BrainCircuit, Puzzle, ScrollText } from 'lucide-react';

interface MemorizationDashboardProps {
  onSelectMode: (mode: string) => void;
}

const MemorizationDashboard: React.FC<MemorizationDashboardProps> = ({ onSelectMode }) => {
  const studyModes = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      description: 'Study historical entities using interactive flashcards.',
      icon: <BookOpen className="h-10 w-10 text-chronoBlue" />,
      progress: 35,
      color: 'bg-chronoBlue'
    },
    {
      id: 'quiz',
      title: 'Quiz Mode',
      description: 'Test your knowledge with adaptive quizzes that focus on your weak areas.',
      icon: <ScrollText className="h-10 w-10 text-chronoTeal" />,
      progress: 42,
      color: 'bg-chronoTeal'
    },
    {
      id: 'connections',
      title: 'Connections',
      description: 'Understand relationships between historical entities through interactive games.',
      icon: <Puzzle className="h-10 w-10 text-chronoGold" />,
      progress: 18,
      color: 'bg-chronoGold'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <BrainCircuit className="h-5 w-5 mr-2" />
        Study Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {studyModes.map((mode) => (
          <Card key={mode.id} className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>{mode.title}</CardTitle>
                <CardDescription className="mt-1">{mode.description}</CardDescription>
              </div>
              <div>{mode.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{mode.progress}%</span>
                </div>
                <Progress value={mode.progress} className={mode.color} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => onSelectMode(mode.id)} className="w-full">
                Start Studying
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
        <div className="space-y-3">
          <div className="p-3 rounded-md bg-black/10 flex justify-between items-center">
            <span>Studied Ancient Greece concepts</span>
            <span className="text-sm text-muted-foreground">2 hours ago</span>
          </div>
          <div className="p-3 rounded-md bg-black/10 flex justify-between items-center">
            <span>Completed World War II connections quiz</span>
            <span className="text-sm text-muted-foreground">Yesterday</span>
          </div>
          <div className="p-3 rounded-md bg-black/10 flex justify-between items-center">
            <span>Created custom Renaissance flashcards</span>
            <span className="text-sm text-muted-foreground">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorizationDashboard;
