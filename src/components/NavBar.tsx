
import React from 'react';
import { Brain, Calendar, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavBarProps {
  activeView: 'map' | 'timeline';
  onViewChange: (view: 'map' | 'timeline') => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeView, onViewChange }) => {
  return (
    <header className="glass-card py-3 px-6 mb-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Brain className="h-8 w-8 text-chronoPurple animate-pulse-soft" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-chronoPurple via-chronoBlue to-chronoTeal bg-clip-text text-transparent">
          ChronoMind
        </h1>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          variant={activeView === 'map' ? 'default' : 'outline'} 
          size="sm"
          className={activeView === 'map' ? 'bg-chronoPurple hover:bg-chronoPurple/80' : ''}
          onClick={() => onViewChange('map')}
        >
          <Network className="h-4 w-4 mr-2" />
          Knowledge Map
        </Button>
        <Button 
          variant={activeView === 'timeline' ? 'default' : 'outline'} 
          size="sm"
          className={activeView === 'timeline' ? 'bg-chronoPurple hover:bg-chronoPurple/80' : ''}
          onClick={() => onViewChange('timeline')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Timeline
        </Button>
      </div>
    </header>
  );
};

export default NavBar;
