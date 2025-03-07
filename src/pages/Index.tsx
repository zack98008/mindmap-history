
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import SearchBar from '@/components/SearchBar';
import HistoryMap from '@/components/HistoryMap';
import TimelineView from '@/components/TimelineView';
import DetailCard from '@/components/DetailCard';
import { Button } from '@/components/ui/button';
import { HistoricalElement } from '@/types';
import { FileText } from 'lucide-react';

const Index = () => {
  const [activeView, setActiveView] = useState<'map' | 'timeline'>('map');
  const [selectedElement, setSelectedElement] = useState<HistoricalElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Ensure components have time to render properly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300); // Short delay to ensure DOM is ready
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleElementSelect = (element: HistoricalElement) => {
    setSelectedElement(element);
  };
  
  const handleCloseDetail = () => {
    setSelectedElement(null);
  };
  
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <NavBar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="mb-8">
        <SearchBar onResultSelect={handleElementSelect} />
      </div>
      
      <div 
        className={`flex flex-col md:flex-row gap-8 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        style={{ minHeight: 'calc(100vh - 240px)' }}
      >
        <div className="w-full md:w-2/3 min-h-[500px]">
          {activeView === 'map' ? (
            <HistoryMap 
              onElementSelect={handleElementSelect} 
              selectedElementId={selectedElement?.id}
            />
          ) : (
            <TimelineView onElementSelect={handleElementSelect} />
          )}
        </div>
        
        <div className="w-full md:w-1/3">
          {selectedElement ? (
            <DetailCard 
              element={selectedElement} 
              onClose={handleCloseDetail} 
              onElementSelect={handleElementSelect}
            />
          ) : (
            <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-chronoPurple to-chronoBlue bg-clip-text text-transparent">Welcome to ChronoMind</h2>
              <p className="text-muted-foreground mb-6">
                Explore historical characters, events, documents, and concepts through our interactive visualization.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className="glass-card p-3 text-center bg-chronoPurple/20">
                  <div className="text-2xl mb-1">👥</div>
                  <p className="text-sm">People</p>
                </div>
                <div className="glass-card p-3 text-center bg-chronoBlue/20">
                  <div className="text-2xl mb-1">🗓️</div>
                  <p className="text-sm">Events</p>
                </div>
                <div className="glass-card p-3 text-center bg-chronoTeal/20">
                  <div className="text-2xl mb-1">📄</div>
                  <p className="text-sm">Documents</p>
                </div>
                <div className="glass-card p-3 text-center bg-chronoGold/20">
                  <div className="text-2xl mb-1">💡</div>
                  <p className="text-sm">Concepts</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Click on any node in the map or entry in the timeline to view details
              </p>
              
              <div className="mt-8 border-t pt-6 w-full">
                <p className="font-medium mb-3">Try our new Template Builder</p>
                <Link to="/templates">
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Topic Templates
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
