import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import SearchBar from '@/components/SearchBar';
import HistoryMap from '@/components/HistoryMap';
import TimelineView from '@/components/TimelineView';
import DetailCard from '@/components/DetailCard';
import TextAnalyzer from '@/components/TextAnalyzer';
import ExportDialog from '@/components/ExportDialog';
import { Button } from '@/components/ui/button';
import { HistoricalElement, MapNode, MapLink } from '@/types';
import { BrainCircuit, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { exportVisualization } from '@/services/exportService';

const Index = () => {
  const [activeView, setActiveView] = useState<'map' | 'timeline'>('map');
  const [selectedElement, setSelectedElement] = useState<HistoricalElement | null>(null);
  const [customNodes, setCustomNodes] = useState<MapNode[] | null>(null);
  const [customLinks, setCustomLinks] = useState<MapLink[] | null>(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  
  const visualizationRef = useRef<HTMLDivElement>(null);
  
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
        <SearchBar onResultSelect={handleElementSelect} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3" ref={visualizationRef}>
          {activeView === 'map' ? (
            <HistoryMap 
              onElementSelect={handleElementSelect} 
              selectedElementId={selectedElement?.id}
              customNodes={customNodes}
              customLinks={customLinks}
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
              
              {!showAnalyzer && (
                <div className="mt-6 p-4 border border-dashed border-slate-700 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                  <p>Try our new <span className="font-medium text-indigo-400">AI Text Analyzer</span> feature!</p>
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
