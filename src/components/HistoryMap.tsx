import React, { useRef, useEffect, useState } from 'react';
import { generateMapNodes, generateMapLinks, getElementById } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';

interface HistoryMapProps {
  onElementSelect: (element: HistoricalElement) => void;
  selectedElementId?: string;
}

const HistoryMap: React.FC<HistoryMapProps> = ({ onElementSelect, selectedElementId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState(generateMapNodes());
  const links = generateMapLinks();

  // Animation frame ID for cleanup
  const animationRef = useRef<number>();
  
  // Function to get node color based on type
  const getNodeColor = (type: string) => {
    switch(type) {
      case 'person': return '#8B5CF6';
      case 'event': return '#0EA5E9';
      case 'document': return '#14B8A6';
      case 'concept': return '#F59E0B';
      default: return '#FFFFFF';
    }
  };

  // Draw the visualization
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set transform for panning and zooming
    ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);
    
    // Draw links
    ctx.lineWidth = 1;
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        
        // Curved path
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        const offset = 30;
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const norm = Math.sqrt(dx * dx + dy * dy);
        const xOffset = -dy / norm * offset;
        const yOffset = dx / norm * offset;
        
        ctx.quadraticCurveTo(midX + xOffset, midY + yOffset, targetNode.x, targetNode.y);
        
        // Highlight links connected to selected node
        if (selectedElementId && (link.source === selectedElementId || link.target === selectedElementId)) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
        }
        
        ctx.stroke();
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedElementId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const radius = isSelected ? 20 : isHovered ? 18 : 15;
      
      // Node glow effect
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = `${getNodeColor(node.element.type)}33`;
        ctx.fill();
      }
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = getNodeColor(node.element.type);
      ctx.fill();
      
      // Node border
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
      
      // Node label
      if (isHovered || isSelected) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(node.element.name, node.x, node.y + radius + 20);
      }
    });
  };
  
  // Animation loop
  const animate = () => {
    drawMap();
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale - offset.x / scale;
    const mouseY = (e.clientY - rect.top) / scale - offset.y / scale;
    
    // Handle dragging
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Hit detection for nodes
    let hoveredId = null;
    for (const node of nodes) {
      const distance = Math.sqrt(Math.pow(node.x - mouseX, 2) + Math.pow(node.y - mouseY, 2));
      if (distance <= 15) {
        hoveredId = node.id;
        break;
      }
    }
    
    setHoveredNodeId(hoveredId);
    
    // Change cursor based on hover state
    if (hoveredId) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'move';
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (hoveredNodeId) {
      // Node click
      const node = nodes.find(n => n.id === hoveredNodeId);
      if (node) {
        const element = getElementById(node.id);
        if (element) {
          onElementSelect(element);
        }
      }
    } else {
      // Start dragging
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredNodeId(null);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Calculate where the mouse is pointing in world space before scaling
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate world coordinates under mouse
    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;
    
    // New scale
    const newScale = Math.max(0.5, Math.min(3, scale - e.deltaY * 0.001));
    
    // Calculate new offset to keep point under mouse stationary
    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;
    
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };
  
  // Set up canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const updateCanvasSize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, hoveredNodeId, selectedElementId, offset, scale]);
  
  // Update node positions with physics simulation effect
  useEffect(() => {
    if (selectedElementId) {
      // Move selected node to center
      const selectedNode = nodes.find(n => n.id === selectedElementId);
      if (selectedNode) {
        // Get related nodes
        const relatedNodeIds = links
          .filter(link => link.source === selectedElementId || link.target === selectedElementId)
          .map(link => link.source === selectedElementId ? link.target : link.source);
        
        // Create a copy of nodes with new positions
        const newNodes = [...nodes];
        const centerX = 500;
        const centerY = 300;
        
        // Move selected node to center
        const selectedIndex = newNodes.findIndex(n => n.id === selectedElementId);
        if (selectedIndex !== -1) {
          newNodes[selectedIndex] = {
            ...newNodes[selectedIndex],
            x: centerX,
            y: centerY
          };
        }
        
        // Position related nodes around the selected node
        const relatedCount = relatedNodeIds.length;
        if (relatedCount > 0) {
          relatedNodeIds.forEach((id, index) => {
            const angle = (index / relatedCount) * Math.PI * 2;
            const nodeIndex = newNodes.findIndex(n => n.id === id);
            
            if (nodeIndex !== -1) {
              newNodes[nodeIndex] = {
                ...newNodes[nodeIndex],
                x: centerX + Math.cos(angle) * 150,
                y: centerY + Math.sin(angle) * 150
              };
            }
          });
          
          // Position other nodes farther away
          newNodes.forEach((node, index) => {
            if (node.id !== selectedElementId && !relatedNodeIds.includes(node.id)) {
              const angle = (index / (newNodes.length - relatedCount - 1)) * Math.PI * 2;
              newNodes[index] = {
                ...node,
                x: centerX + Math.cos(angle) * 300,
                y: centerY + Math.sin(angle) * 300
              };
            }
          });
        }
        
        setNodes(newNodes);
      }
    } else {
      // Reset node positions if no node is selected
      setNodes(generateMapNodes());
    }
  }, [selectedElementId]);
  
  return (
    <div
      ref={containerRef}
      className="glass-card w-full h-[calc(100vh-12rem)] relative overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="w-full h-full"
      />
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground glass-card px-3 py-2">
        <p>Scroll to zoom, drag to pan, click nodes to explore</p>
      </div>
      <div className="absolute top-4 right-4 flex gap-3">
        <div className="glass-card p-2 flex items-center">
          <div className="w-3 h-3 rounded-full bg-chronoPurple mr-2"></div>
          <span className="text-xs">Person</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <div className="w-3 h-3 rounded-full bg-chronoBlue mr-2"></div>
          <span className="text-xs">Event</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <div className="w-3 h-3 rounded-full bg-chronoTeal mr-2"></div>
          <span className="text-xs">Document</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <div className="w-3 h-3 rounded-full bg-chronoGold mr-2"></div>
          <span className="text-xs">Concept</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryMap;
