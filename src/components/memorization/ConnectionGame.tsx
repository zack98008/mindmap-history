
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getHistoricalEvents, getHistoricalPeople, getHistoricalDocuments, getHistoricalConcepts } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';
import { motion } from 'framer-motion';
import { Shuffle, Brain, Award, RotateCcw } from 'lucide-react';

const ConnectionGame = () => {
  const [connections, setConnections] = useState<{
    group1: HistoricalElement[];
    group2: HistoricalElement[];
    group3: HistoricalElement[];
    group4: HistoricalElement[];
  }>({
    group1: [],
    group2: [],
    group3: [],
    group4: []
  });
  const [selectedTiles, setSelectedTiles] = useState<HistoricalElement[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Get a subset of each type of historical element
    const people = getHistoricalPeople().slice(0, 4);
    const events = getHistoricalEvents().slice(0, 4);
    const documents = getHistoricalDocuments().slice(0, 4);
    const concepts = getHistoricalConcepts().slice(0, 4);

    // Set up the connections
    setConnections({
      group1: people,
      group2: events,
      group3: documents,
      group4: concepts
    });

    // Reset game state
    setSelectedTiles([]);
    setSolvedGroups([]);
    setAttempts(4);
    setGameOver(false);
    setGameWon(false);
  };

  // Shuffle all tiles for display
  const getShuffledTiles = () => {
    const allTiles = [
      ...connections.group1,
      ...connections.group2,
      ...connections.group3,
      ...connections.group4
    ].filter(tile => !solvedGroups.includes(getGroupForElement(tile)));

    // Fisher-Yates shuffle
    for (let i = allTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }

    return allTiles;
  };

  // Get the group name for a given element
  const getGroupForElement = (element: HistoricalElement): string => {
    if (connections.group1.some(e => e.id === element.id)) return 'group1';
    if (connections.group2.some(e => e.id === element.id)) return 'group2';
    if (connections.group3.some(e => e.id === element.id)) return 'group3';
    if (connections.group4.some(e => e.id === element.id)) return 'group4';
    return '';
  };

  // Handle tile selection
  const handleTileClick = (element: HistoricalElement) => {
    if (gameOver || selectedTiles.find(tile => tile.id === element.id)) return;

    const newSelectedTiles = [...selectedTiles, element];
    setSelectedTiles(newSelectedTiles);

    // Check if we have a full group of 4 selected
    if (newSelectedTiles.length === 4) {
      checkSelection(newSelectedTiles);
    }
  };

  // Check if the selected tiles form a valid group
  const checkSelection = (tiles: HistoricalElement[]) => {
    const groups = [
      tiles.filter(tile => getGroupForElement(tile) === 'group1').length,
      tiles.filter(tile => getGroupForElement(tile) === 'group2').length,
      tiles.filter(tile => getGroupForElement(tile) === 'group3').length,
      tiles.filter(tile => getGroupForElement(tile) === 'group4').length
    ];

    // Check if all tiles belong to the same group
    const correctGroup = groups.findIndex(count => count === 4);
    
    if (correctGroup !== -1) {
      // Correct guess!
      const groupName = `group${correctGroup + 1}`;
      toast.success('Correct match!');
      setSolvedGroups([...solvedGroups, groupName]);
      setSelectedTiles([]);
      
      // Check if all groups are solved
      if (solvedGroups.length + 1 === 4) {
        setGameWon(true);
        setGameOver(true);
        toast.success('Congratulations! You won the game!');
      }
    } else {
      // Incorrect guess
      toast.error('Incorrect match!');
      setAttempts(prev => prev - 1);
      setSelectedTiles([]);
      
      // Check if game over
      if (attempts <= 1) {
        setGameOver(true);
        toast.error('Game over! No more attempts left.');
      }
    }
  };

  // Get group name for display
  const getGroupDisplayName = (group: string): string => {
    switch (group) {
      case 'group1': return 'Historical People';
      case 'group2': return 'Historical Events';
      case 'group3': return 'Historical Documents';
      case 'group4': return 'Historical Concepts';
      default: return '';
    }
  };

  const shuffledTiles = getShuffledTiles();

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Historical Connections</h2>
          <p className="text-muted-foreground">
            Find groups of 4 related historical elements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={initializeGame} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            New Game
          </Button>
          <Badge variant="outline" className="text-lg px-3 py-2">
            <Brain className="h-4 w-4 mr-2" />
            {attempts} attempts left
          </Badge>
        </div>
      </div>
      
      {/* Solved groups */}
      {solvedGroups.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Solved Connections:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solvedGroups.map(group => (
              <Card key={group} className={`border-2 border-${group === 'group1' ? 'chronoPurple' : group === 'group2' ? 'chronoBlue' : group === 'group3' ? 'chronoTeal' : 'chronoGold'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{getGroupDisplayName(group)}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs space-y-1">
                    {connections[group as keyof typeof connections].map(element => (
                      <div key={element.id} className="font-medium">{element.name}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Game board */}
      {!gameOver ? (
        <>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {selectedTiles.map((tile, index) => (
              <motion.div
                key={`selected-${index}`}
                className="h-20 glass-card flex items-center justify-center p-2 cursor-pointer text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {tile.name}
              </motion.div>
            ))}
            {Array(4 - selectedTiles.length).fill(0).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="h-20 border-2 border-dashed border-white/20 rounded-lg"
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {shuffledTiles.map((tile) => {
              const isSelected = selectedTiles.some(s => s.id === tile.id);
              return (
                <motion.div
                  key={tile.id}
                  className={`h-20 glass-card flex items-center justify-center p-2 cursor-pointer text-center ${
                    isSelected ? 'bg-primary/20' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isSelected && handleTileClick(tile)}
                >
                  {tile.name}
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center my-12">
          {gameWon ? (
            <div className="space-y-4">
              <Award className="h-16 w-16 mx-auto text-chronoGold" />
              <h2 className="text-2xl font-bold text-chronoGold">Congratulations!</h2>
              <p className="text-lg">You've successfully identified all the connections.</p>
              <Button onClick={initializeGame} className="mt-4">Play Again</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-destructive">Game Over</h2>
              <p className="text-lg">You've run out of attempts.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {['group1', 'group2', 'group3', 'group4'].filter(g => !solvedGroups.includes(g)).map(group => (
                  <Card key={group} className={`border-2 border-${group === 'group1' ? 'chronoPurple' : group === 'group2' ? 'chronoBlue' : group === 'group3' ? 'chronoTeal' : 'chronoGold'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{getGroupDisplayName(group)}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs space-y-1">
                        {connections[group as keyof typeof connections].map(element => (
                          <div key={element.id} className="font-medium">{element.name}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button onClick={initializeGame} className="mt-4">Play Again</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionGame;
