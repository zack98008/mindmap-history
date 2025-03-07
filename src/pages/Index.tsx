
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import SearchBar from '@/components/SearchBar';
import HistoryMap from '@/components/HistoryMap';
import TimelineView from '@/components/TimelineView';
import DetailCard from '@/components/DetailCard';
import TextAnalyzer from '@/components/TextAnalyzer';
import ExportDialog from '@/components/ExportDialog';
import { Button } from '@/components/ui/button';
import { HistoricalElement, MapNode, MapLink } from '@/types';
import { BrainCircuit, FileText, ChevronDown, ChevronUp, Map } from 'lucide-react';
import { exportVisualization } from '@/services/exportService';
import { fetchHistoricalElements, fetchRelationships, createHistoricalElement, updateHistoricalElement, deleteHistoricalElement } from '@/services/databaseService';
import { toast } from 'sonner';

const Index = () => {
  const [activeView, setActiveView] = useState<'map' | 'timeline'>('map');
  const [selectedElement, setSelectedElement] = useState<HistoricalElement | null>(null);
  const [customNodes, setCustomNodes] = useState<MapNode[] | null>(null);
  const [customLinks, setCustomLinks] = useState<MapLink[] | null>(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [elements, setElements] = useState<HistoricalElement[]>([]);
  
  const navigate = useNavigate();
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  const loadHistoricalData = async () => {
    setIsLoading(true);
    try {
      const historicalElements = await fetchHistoricalElements();
      setElements(historicalElements);
    } catch (error) {
      console.error('Error loading historical data:', error);
      toast.error('Failed to load historical data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadHistoricalData();
  }, []);
  
  const handleElementSelect = (element: HistoricalElement) => {
    setSelectedElement(element);
  };
  
  const handleCloseDetail = () => {
    setSelectedElement(null);
  };
  
  const handleAnalysisComplete = (result: { nodes: MapNode[], links: MapLink[] }) => {
    setCustomNodes(result.nodes);
    setCustomLinks(result.links);
  };
  
  const handleElementUpdate = async (id: string, updates: Partial<HistoricalElement>) => {
    try {
      const updatedElement = await updateHistoricalElement(id, updates);
      if (updatedElement) {
        setElements(elements.map(element => 
          element.id === id ? updatedElement : element
        ));
        
        if (selectedElement?.id === id) {
          setSelectedElement(updatedElement);
        }
        
        toast.success('Element updated successfully');
        return updatedElement;
      }
      return null;
    } catch (error) {
      console.error('Error updating element:', error);
      toast.error('Failed to update element');
      return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <NavBar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="mb-4 flex justify-between items-center">
        <Button 
          onClick={() => setShowAnalyzer(!showAnalyzer)} 
          variant="outline" 
          className="flex-1 mr-2 flex justify-between items-center"
        >
          <span>{showAnalyzer ? "Hide AI Text Analyzer" : "Show AI Text Analyzer"}</span>
          {showAnalyzer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        <ExportDialog 
          containerRef={visualizationRef}
          onExport={exportVisualization}
          selectedElement={selectedElement}
          customNodes={customNodes}
          customLinks={customLinks}
        />
      </div>
      
      {showAnalyzer && (
        <div className="mb-4">
          <TextAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        </div>
      )}
      
      <div className="mb-8">
        <SearchBar onResultSelect={handleElementSelect} historicalElements={elements} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3" ref={visualizationRef}>
          {activeView === 'map' ? (
            <HistoryMap 
              onElementSelect={handleElementSelect} 
              selectedElementId={selectedElement?.id}
              customNodes={customNodes}
              customLinks={customLinks}
              historicalElements={elements}
            />
          ) : (
            <TimelineView 
              onElementSelect={handleElementSelect} 
              historicalElements={elements}
            />
          )}
        </div>
        
        <div className="w-full md:w-1/3">
          {selectedElement ? (
            <DetailCard 
              element={selectedElement} 
              onClose={handleCloseDetail} 
              onElementSelect={handleElementSelect}
              onElementUpdate={handleElementUpdate}
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
              
              <div className="mt-6 p-4 border border-dashed border-slate-700 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                <p className="font-medium mb-2">Create your own maps</p>
                <p className="mb-3">Create custom maps to organize your historical visualizations.</p>
                <Button 
                  onClick={() => navigate('/maps')} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Go to My Maps
                </Button>
              </div>
              
              {!showAnalyzer && (
                <div className="mt-6 p-4 border border-dashed border-slate-700 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                  <p>Try our <span className="font-medium text-indigo-400">AI Text Analyzer</span> feature!</p>
                  <p className="mt-1">Enter any historical text and generate an interactive knowledge graph.</p>
                  <Button 
                    onClick={() => setShowAnalyzer(true)} 
                    size="sm" 
                    className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Open AI Text Analyzer
                  </Button>
                </div>
              )}
              
              <div className="mt-8 border-t pt-6 w-full">
                <p className="font-medium mb-3">Try our features</p>
                <div className="space-y-2">
                  <Link to="/templates">
                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Topic Templates
                    </Button>
                  </Link>
                  <Link to="/memorization">
                    <Button className="w-full" variant="outline">
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Memorization Tools
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
