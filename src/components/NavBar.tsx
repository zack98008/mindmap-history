
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Network, 
  Clock, 
  FileText, 
  BrainCircuit,
  Map,
  Home,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavBarProps {
  activeView?: 'map' | 'timeline';
  onViewChange?: (view: 'map' | 'timeline') => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  activeView = 'map', 
  onViewChange = () => {}
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const showViewToggle = location.pathname === '/';
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold mr-4 bg-gradient-to-r from-chronoPurple to-chronoBlue bg-clip-text text-transparent">
          ChronoMind
        </Link>
        
        {showViewToggle && (
          <div className="hidden sm:flex gap-2">
            <Button 
              variant={activeView === 'map' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewChange('map')}
              className={activeView === 'map' ? 'bg-chronoPurple hover:bg-chronoPurple/90' : ''}
            >
              <Network className="h-4 w-4 mr-2" />
              Network View
            </Button>
            
            <Button 
              variant={activeView === 'timeline' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewChange('timeline')}
              className={activeView === 'timeline' ? 'bg-chronoBlue hover:bg-chronoBlue/90' : ''}
            >
              <Clock className="h-4 w-4 mr-2" />
              Timeline View
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 items-center">
        <Button 
          variant={isActive('/') ? 'default' : 'outline'}
          size="sm"
          asChild
        >
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/maps') ? 'default' : 'outline'} 
          size="sm"
          asChild
        >
          <Link to="/maps">
            <Map className="h-4 w-4 mr-2" />
            My Maps
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/generate') ? 'default' : 'outline'} 
          size="sm"
          asChild
        >
          <Link to="/generate">
            <Globe className="h-4 w-4 mr-2" />
            Generate Maps
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/templates') ? 'default' : 'outline'} 
          size="sm"
          asChild
        >
          <Link to="/templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Link>
        </Button>
        
        <Button 
          variant={isActive('/memorization') ? 'default' : 'outline'} 
          size="sm"
          asChild
        >
          <Link to="/memorization">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Memorization
          </Link>
        </Button>
      </div>
      
      {showViewToggle && (
        <div className="sm:hidden flex gap-2">
          <Button 
            variant={activeView === 'map' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('map')}
            className={activeView === 'map' ? 'bg-chronoPurple hover:bg-chronoPurple/90' : ''}
          >
            <Network className="h-4 w-4 mr-2" />
            Network
          </Button>
          
          <Button 
            variant={activeView === 'timeline' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => onViewChange('timeline')}
            className={activeView === 'timeline' ? 'bg-chronoBlue hover:bg-chronoBlue/90' : ''}
          >
            <Clock className="h-4 w-4 mr-2" />
            Timeline
          </Button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
