
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Map, Clock, PlusCircle, BookOpen, Sparkles } from "lucide-react";

interface NavBarProps {
  activeView?: 'map' | 'timeline';
  onViewChange?: (view: 'map' | 'timeline') => void;
  language?: string;
}

const NavBar: React.FC<NavBarProps> = ({ 
  activeView, 
  onViewChange,
  language = 'ar' // Default to Arabic
}) => {
  const navigate = useNavigate();

  const isRTL = language === 'ar';
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h1 
          className="text-2xl font-bold cursor-pointer" 
          onClick={() => navigate('/')}
        >
          {language === 'ar' ? 'كرونومايند' : 'ChronoMind'}
        </h1>
        
        <div className="flex space-x-2">
          {activeView && onViewChange ? (
            <div className="border border-gray-700 rounded-md overflow-hidden flex">
              <Button
                variant={activeView === 'map' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-none ${isRTL ? 'flex-row-reverse' : ''}`}
                onClick={() => onViewChange('map')}
              >
                <Map className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {language === 'ar' ? 'خريطة' : 'Map'}
              </Button>
              <Button
                variant={activeView === 'timeline' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-none ${isRTL ? 'flex-row-reverse' : ''}`}
                onClick={() => onViewChange('timeline')}
              >
                <Clock className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {language === 'ar' ? 'خط زمني' : 'Timeline'}
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={`${isRTL ? 'flex-row-reverse' : ''}`}
                onClick={() => navigate('/maps')}
              >
                <Map className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {language === 'ar' ? 'الخرائط' : 'Maps'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isRTL ? 'flex-row-reverse' : ''}`}
                onClick={() => navigate('/generate')}
              >
                <Sparkles className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {language === 'ar' ? 'إنشاء خريطة' : 'Generate Map'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isRTL ? 'flex-row-reverse' : ''}`}
                onClick={() => navigate('/memorization')}
              >
                <BookOpen className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {language === 'ar' ? 'الحفظ' : 'Memorization'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
