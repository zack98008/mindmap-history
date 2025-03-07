
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import HistoryMap from '@/components/HistoryMap';
import DetailCard from '@/components/DetailCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { MapNode, MapLink, HistoricalElement } from '@/types';
import { toast } from 'sonner';
import { 
  fetchMapNodes, 
  fetchMapLinks, 
  saveMapPositions, 
  saveMapLinks,
  fetchHistoricalElements,
  createHistoricalElement,
  updateHistoricalElement,
  deleteHistoricalElement,
  createRelationship,
  updateRelationship,
  deleteRelationship
} from '@/services/databaseService';

const MapView = () => {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [links, setLinks] = useState<MapLink[]>([]);
  const [selectedElement, setSelectedElement] = useState<HistoricalElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const initialLoadDone = useRef(false);
  
  const loadMapData = async () => {
    if (!mapId) return;
    
    setIsLoading(true);
    try {
      // Load map nodes and links
      const mapNodes = await fetchMapNodes(mapId);
      const mapLinks = await fetchMapLinks(mapId);
      
      if (mapNodes.length === 0 && !initialLoadDone.current) {
        // If this is a new map, load all historical elements
        const elements = await fetchHistoricalElements();
        
        if (elements.length > 0) {
          // Create initial map nodes with random positions
          const width = window.innerWidth * 0.6;
          const height = window.innerHeight * 0.7;
          const centerX = width / 2;
          const centerY = height / 2;
          
          const initialNodes = elements.map((element, index) => {
            const angle = (index / elements.length) * Math.PI * 2;
            const radius = Math.min(width, height) * 0.4;
            
            return {
              id: element.id,
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              element
            };
          });
          
          setNodes(initialNodes);
        }
      } else {
        setNodes(mapNodes);
        setLinks(mapLinks);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
      toast.error('Failed to load map data');
    } finally {
      setIsLoading(false);
      initialLoadDone.current = true;
    }
  };
  
  useEffect(() => {
    if (mapId) {
      loadMapData();
    }
  }, [mapId]);
  
  const handleElementSelect = (element: HistoricalElement) => {
    setSelectedElement(element);
  };
  
  const handleCloseDetail = () => {
    setSelectedElement(null);
  };
  
  const handleSaveMap = async () => {
    if (!mapId) return;
    
    setIsSaving(true);
    try {
      // Save node positions
      const nodesSaved = await saveMapPositions(mapId, nodes);
      
      // Save links
      const linksSaved = await saveMapLinks(mapId, links);
      
      if (nodesSaved && linksSaved) {
        toast.success('Map saved successfully');
      } else {
        toast.error('Failed to save map');
      }
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error('Failed to save map');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleNodeCreate = async (nodeData: Omit<HistoricalElement, 'id'>) => {
    try {
      const newElement = await createHistoricalElement(nodeData);
      if (newElement) {
        // Add to existing nodes with random position
        const width = window.innerWidth * 0.6;
        const height = window.innerHeight * 0.7;
        
        const newNode: MapNode = {
          id: newElement.id,
          x: Math.random() * width,
          y: Math.random() * height,
          element: newElement
        };
        
        setNodes([...nodes, newNode]);
        toast.success('Element created successfully');
        return newNode;
      }
      return null;
    } catch (error) {
      console.error('Error creating node:', error);
      toast.error('Failed to create element');
      return null;
    }
  };
  
  const handleNodeUpdate = async (id: string, updates: Partial<HistoricalElement>) => {
    try {
      const updatedElement = await updateHistoricalElement(id, updates);
      if (updatedElement) {
        // Update the node in the nodes array
        setNodes(nodes.map(node => 
          node.id === id ? { ...node, element: updatedElement } : node
        ));
        
        // If the updated node is selected, update selectedElement
        if (selectedElement?.id === id) {
          setSelectedElement(updatedElement);
        }
        
        toast.success('Element updated successfully');
        return updatedElement;
      }
      return null;
    } catch (error) {
      console.error('Error updating node:', error);
      toast.error('Failed to update element');
      return null;
    }
  };
  
  const handleNodeDelete = async (id: string) => {
    try {
      const success = await deleteHistoricalElement(id);
      if (success) {
        // Remove the node from the nodes array
        setNodes(nodes.filter(node => node.id !== id));
        
        // Remove any links connected to this node
        setLinks(links.filter(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          return sourceId !== id && targetId !== id;
        }));
        
        // If the deleted node is selected, clear selectedElement
        if (selectedElement?.id === id) {
          setSelectedElement(null);
        }
        
        toast.success('Element deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting node:', error);
      toast.error('Failed to delete element');
      return false;
    }
  };
  
  const handleCreateLink = async (sourceId: string, targetId: string, type: string, description: string = '') => {
    try {
      const newRelationship = await createRelationship({
        sourceId,
        targetId,
        type,
        description
      });
      
      if (newRelationship) {
        const newLink: MapLink = {
          id: newRelationship.id,
          source: sourceId,
          target: targetId,
          relationship: newRelationship
        };
        
        setLinks([...links, newLink]);
        toast.success('Connection created successfully');
        return newLink;
      }
      return null;
    } catch (error) {
      console.error('Error creating link:', error);
      toast.error('Failed to create connection');
      return null;
    }
  };
  
  const handleDeleteLink = async (id: string) => {
    try {
      const success = await deleteRelationship(id);
      if (success) {
        setLinks(links.filter(link => link.id !== id));
        toast.success('Connection deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete connection');
      return false;
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
      <NavBar activeView="map" onViewChange={() => {}} />
      
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={() => navigate('/maps')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Maps
        </Button>
        
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={handleSaveMap}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Map'}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <HistoryMap 
            onElementSelect={handleElementSelect} 
            selectedElementId={selectedElement?.id}
            customNodes={nodes}
            customLinks={links}
            onNodesChange={setNodes}
            onLinksChange={setLinks}
            onNodeCreate={handleNodeCreate}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onLinkCreate={handleCreateLink}
            onLinkDelete={handleDeleteLink}
          />
        </div>
        
        <div className="w-full md:w-1/3">
          {selectedElement ? (
            <DetailCard 
              element={selectedElement} 
              onClose={handleCloseDetail} 
              onElementSelect={handleElementSelect}
              onElementUpdate={handleNodeUpdate}
            />
          ) : (
            <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center">
              <h2 className="text-xl font-bold mb-4">Map Editor</h2>
              <p className="text-muted-foreground mb-6">
                Select an element to view details or use the toolbar to add new elements.
              </p>
              <div className="space-y-4 w-full max-w-xs">
                <div className="glass-card p-4 bg-slate-800/50">
                  <h3 className="font-medium mb-2">Tips</h3>
                  <ul className="text-sm text-slate-300 text-left list-disc pl-5 space-y-2">
                    <li>Click the + button to add a new element</li>
                    <li>Drag elements to position them</li>
                    <li>Click on elements to select them</li>
                    <li>Use the lock button to fix elements in place</li>
                    <li>Don't forget to save your changes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
