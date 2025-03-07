
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Network, 
  Clock, 
  FileText, 
  BrainCircuit, 
  User, 
  LogOut,
  Map,
  Home,
  Layers
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavBarProps {
  activeView?: 'map' | 'timeline';
  onViewChange?: (view: 'map' | 'timeline') => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  activeView = 'map', 
  onViewChange = () => {} 
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : 'U';
  
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback className="bg-slate-700 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/maps')}>
              <Map className="h-4 w-4 mr-2" />
              My Maps
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/templates')}>
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/memorization')}>
              <BrainCircuit className="h-4 w-4 mr-2" />
              Memorization
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
