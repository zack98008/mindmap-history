
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { getAllHistoricalElements, getRelationshipsByElementId } from '@/utils/dummyData';
import { HistoricalElement, Relationship } from '@/types';
import { motion } from 'framer-motion';
import { Check, RefreshCw, Puzzle } from 'lucide-react';

const ConnectionGame = () => {
  const [elements, setElements] = useState<HistoricalElement[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [foundConnections, setFoundConnections] = useState<Relationship[]>([]);
  const [level, setLevel] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  // Get all relationships for the current game level
  const relationships = useMemo(() => {
    const allRelationships: Relationship[] = [];
    elements.forEach(element => {
      const elementRelationships = getRelationshipsByElementId(element.id);
      elementRelationships.forEach(relationship => {
        // Only add if both elements in the relationship are in our current game elements
        const sourceInGame = elements.some(e => e.id === relationship.sourceId);
        const targetInGame = elements.some(e => e.id === relationship.targetId);
        if (sourceInGame && targetInGame && !allRelationships.some(r => r.id === relationship.id)) {
          allRelationships.push(relationship);
        }
      });
    });
    return allRelationships;
  }, [elements]);
  
  // Initialize game with new elements
  useEffect(() => {
    startNewLevel(level);
  }, [level]);
  
  const startNewLevel = (levelNumber: number) => {
    const allElements = getAllHistoricalElements();
    
    // Filter elements with relationships
    const elementsWithRelationships = allElements.filter(element => {
      const relationships = getRelationshipsByElementId(element.id);
      return relationships.length > 0;
    });
    
    // Pick random elements for this level - more elements for higher levels
    const elementCount = Math.min(4 + levelNumber, 12);
    const shuffled = [...elementsWithRelationships].sort(() => Math.random() - 0.5);
    const gameElements: HistoricalElement[] = [];
    
    // Build a connected graph of elements
    const startElement = shuffled[0];
    gameElements.push(startElement);
    
    // Add connected elements
    let candidateElements = new Set<string>();
    
    // Add initial element's connections
    const startRelationships = getRelationshipsByElementId(startElement.id);
    startRelationships.forEach(rel => {
      const connectedId = rel.sourceId === startElement.id ? rel.targetId : rel.sourceId;
      candidateElements.add(connectedId);
    });
    
    // While we need more elements and have candidates
    while (gameElements.length < elementCount && candidateElements.size > 0) {
      // Convert set to array for selection
      const candidates = Array.from(candidateElements);
      const nextId = candidates[Math.floor(Math.random() * candidates.size)];
      
      // Find and add this element
      const nextElement = allElements.find(e => e.id === nextId);
      if (nextElement && !gameElements.some(e => e.id === nextId)) {
        gameElements.push(nextElement);
        
        // Add its connections to candidates
        const relationships = getRelationshipsByElementId(nextId);
        relationships.forEach(rel => {
          const connectedId = rel.sourceId === nextId ? rel.targetId : rel.sourceId;
          if (!gameElements.some(e => e.id === connectedId)) {
            candidateElements.add(connectedId);
          }
        });
      }
      
      // Remove this element from candidates
      candidateElements.delete(nextId);
    }
    
    // If we don't have enough connected elements, add some random ones
    while (gameElements.length < elementCount) {
      const randomElement = shuffled.find(e => !gameElements.some(ge => ge.id === e.id));
      if (randomElement) {
        gameElements.push(randomElement);
      } else {
        break;
      }
    }
    
    // Shuffle the game elements for display
    setElements(gameElements.sort(() => Math.random() - 0.5));
    setSelectedElements([]);
    setFoundConnections([]);
    setGameComplete(false);
  };
  
  const handleElementClick = (elementId: string) => {
    if (gameComplete) return;
    
    if (selectedElements.includes(elementId)) {
      // Deselect the element
      setSelectedElements(selectedElements.filter(id => id !== elementId));
    } else {
      // Select the element
      const newSelected = [...selectedElements, elementId];
      setSelectedElements(newSelected);
      
      // Check if we have exactly 2 elements selected
      if (newSelected.length === 2) {
        checkForConnection(newSelected[0], newSelected[1]);
      }
    }
  };
  
  const checkForConnection = (elementId1: string, elementId2: string) => {
    // Find a relationship between the two elements
    const connection = relationships.find(rel => 
      (rel.sourceId === elementId1 && rel.targetId === elementId2) ||
      (rel.sourceId === elementId2 && rel.targetId === elementId1)
    );
    
    if (connection) {
      // Found a valid connection!
      const alreadyFound = foundConnections.some(c => c.id === connection.id);
      
      if (!alreadyFound) {
        setFoundConnections([...foundConnections, connection]);
        setScore(score + (10 * level));
        
        toast.success('Connection found!', {
          description: connection.description
        });
        
        // Check if all connections have been found
        if (foundConnections.length + 1 === relationships.length) {
          setGameComplete(true);
          toast.success(`Level ${level} complete!`, {
            description: `You found all ${relationships.length} connections`
          });
        }
      } else {
        toast.info('You already found this connection');
      }
    } else {
      toast.error('No direct connection between these elements');
    }
    
    // Reset selection
    setSelectedElements([]);
  };
  
  const getElementName = (elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    return element ? element.name : 'Unknown';
  };
  
  const handleNextLevel = () => {
    setLevel(level + 1);
  };
  
  const restartGame = () => {
    setLevel(1);
    setScore(0);
    startNewLevel(1);
  };
  
  return (
    <div className="glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Puzzle className="h-5 w-5 mr-2" />
            Connect the Elements
          </h2>
          <p className="text-sm text-muted-foreground">Level {level}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-slate-700/30 rounded-lg px-4 py-2">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-xl font-bold">{score}</p>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg px-4 py-2">
            <p className="text-xs text-muted-foreground">Connections</p>
            <p className="text-xl font-bold">{foundConnections.length}/{relationships.length}</p>
          </div>
          
          <Button variant="outline" size="icon" onClick={() => startNewLevel(level)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {elements.map(element => (
            <motion.div
              key={element.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all hover:scale-105 
                  ${selectedElements.includes(element.id) ? 'ring-2 ring-chronoPurple' : ''}
                  ${element.type === 'person' ? 'bg-chronoPurple/20' : 
                    element.type === 'event' ? 'bg-chronoBlue/20' : 
                    element.type === 'document' ? 'bg-chronoTeal/20' : 'bg-chronoGold/20'}`}
                onClick={() => handleElementClick(element.id)}
              >
                <h3 className="font-medium mb-1">{element.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{element.type}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Connection lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          {foundConnections.map(connection => {
            const sourceElement = document.getElementById(`card-${connection.sourceId}`);
            const targetElement = document.getElementById(`card-${connection.targetId}`);
            
            if (!sourceElement || !targetElement) return null;
            
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            
            const svgRect = document.getElementById('connections-container')?.getBoundingClientRect();
            if (!svgRect) return null;
            
            const sourceX = (sourceRect.left + sourceRect.width / 2) - svgRect.left;
            const sourceY = (sourceRect.top + sourceRect.height / 2) - svgRect.top;
            const targetX = (targetRect.left + targetRect.width / 2) - svgRect.left;
            const targetY = (targetRect.top + targetRect.height / 2) - svgRect.top;
            
            return (
              <line 
                key={connection.id}
                x1={sourceX} 
                y1={sourceY} 
                x2={targetX} 
                y2={targetY}
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Found connections list */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Found Connections</h3>
        {foundConnections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Select two elements to find a connection between them.
          </p>
        ) : (
          <div className="space-y-2">
            {foundConnections.map(connection => (
              <div key={connection.id} className="p-3 rounded-md bg-slate-700/30 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <div>
                  <p className="font-medium">
                    {getElementName(connection.sourceId)} ↔ {getElementName(connection.targetId)}
                  </p>
                  <p className="text-xs text-muted-foreground">{connection.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {gameComplete && (
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={restartGame}>
            Restart Game
          </Button>
          <Button onClick={handleNextLevel}>
            Next Level
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectionGame;
