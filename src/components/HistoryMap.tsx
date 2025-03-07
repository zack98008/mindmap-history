
import React, { useRef, useEffect, useState } from 'react';
import { generateMapNodes, generateMapLinks, getElementById } from '@/utils/dummyData';
import { HistoricalElement, MapNode, MapLink } from '@/types';
import * as d3 from 'd3';

interface HistoryMapProps {
  onElementSelect: (element: HistoricalElement) => void;
  selectedElementId?: string;
}

const HistoryMap: React.FC<HistoryMapProps> = ({ onElementSelect, selectedElementId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<MapNode[]>(generateMapNodes());
  const [links, setLinks] = useState<MapLink[]>(generateMapLinks());
  
  // D3 simulation reference
  const simulationRef = useRef<any>(null);
  
  // Function to get node color based on type
  const getNodeColor = (type: string) => {
    switch(type) {
      case 'person': return '#8B5CF6'; // purple
      case 'event': return '#0EA5E9';  // blue
      case 'document': return '#14B8A6'; // teal
      case 'concept': return '#F59E0B'; // gold
      default: return '#FFFFFF';
    }
  };

  // Function to get node shape data based on type
  const getNodeShapePath = (type: string, size = 30) => {
    switch(type) {
      case 'person': 
        // Hexagon for person
        return d3.symbol().type(d3.symbolHexagon).size(size * 40)();
      case 'event': 
        // Diamond for event
        return d3.symbol().type(d3.symbolDiamond).size(size * 40)();
      case 'document': 
        // Square for document
        return d3.symbol().type(d3.symbolSquare).size(size * 40)();
      case 'concept': 
        // Star for concept
        return d3.symbol().type(d3.symbolStar).size(size * 40)();
      default:
        // Circle as fallback
        return d3.symbol().type(d3.symbolCircle).size(size * 40)();
    }
  };

  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Clear previous elements
    svg.selectAll("*").remove();
    
    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });
    
    svg.call(zoom as any);
    
    // Add a background panel for catching events
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");
    
    // Create main group that will be transformed
    const mainGroup = svg.append("g")
      .attr("class", "main-group");
    
    // Define arrow markers for links
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "rgba(255, 255, 255, 0.5)")
      .attr("d", "M0,-5L10,0L0,5");
    
    // Create links
    const link = mainGroup.append("g")
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("stroke", d => {
        if (selectedElementId && (d.source === selectedElementId || d.target === selectedElementId)) {
          return "rgba(255, 255, 255, 0.8)";
        }
        return "rgba(255, 255, 255, 0.2)";
      })
      .attr("stroke-width", d => {
        if (selectedElementId && (d.source === selectedElementId || d.target === selectedElementId)) {
          return 2;
        }
        return 1;
      })
      .attr("fill", "none")
      .attr("marker-end", "url(#arrow)");
    
    // Create node containers
    const nodeContainer = mainGroup.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node-container")
      .call(d3.drag<SVGGElement, MapNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Create node shapes based on type
    nodeContainer.append("path")
      .attr("class", "node-shape")
      .attr("d", d => getNodeShapePath(d.element.type))
      .attr("fill", d => getNodeColor(d.element.type))
      .attr("stroke", d => d.id === selectedElementId ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)")
      .attr("stroke-width", d => d.id === selectedElementId ? 2 : 1)
      .attr("opacity", 0.9);
    
    // Add glow effects for selected and hovered nodes
    nodeContainer.append("path")
      .attr("class", "node-glow")
      .attr("d", d => getNodeShapePath(d.element.type, 40))
      .attr("fill", d => `${getNodeColor(d.element.type)}33`)
      .attr("opacity", d => (d.id === selectedElementId || d.id === hoveredNodeId) ? 0.7 : 0);
      
    // Add node labels
    const nodeLabels = nodeContainer.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", 40)
      .attr("fill", "#FFFFFF")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text(d => d.element.name)
      .attr("opacity", d => (d.id === selectedElementId || d.id === hoveredNodeId) ? 1 : 0);
    
    // Interactive events
    nodeContainer
      .on("mouseover", function(event, d) {
        setHoveredNodeId(d.id);
        d3.select(this).select(".node-glow").attr("opacity", 0.7);
        d3.select(this).select(".node-label").attr("opacity", 1);
      })
      .on("mouseout", function() {
        setHoveredNodeId(null);
        d3.select(this).select(".node-glow")
          .attr("opacity", d => d.id === selectedElementId ? 0.7 : 0);
        d3.select(this).select(".node-label")
          .attr("opacity", d => d.id === selectedElementId ? 1 : 0);
      })
      .on("click", function(event, d) {
        const element = getElementById(d.id);
        if (element) {
          onElementSelect(element);
        }
      });
    
    // Force simulation
    simulationRef.current = d3.forceSimulation(nodes)
      .force("link", d3.forceLink()
        .id((d: any) => d.id)
        .links(links)
        .distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50))
      .on("tick", ticked);
    
    // Position elements on tick
    function ticked() {
      link.attr("d", (d: any) => {
        const sourceNode = nodes.find(n => n.id === d.source.id || n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target.id || n.id === d.target);
        
        if (!sourceNode || !targetNode) return "";
        
        // Direct properties if already processed by d3, or use the original object
        const source = { 
          x: d.source.x !== undefined ? d.source.x : sourceNode.x, 
          y: d.source.y !== undefined ? d.source.y : sourceNode.y 
        };
        
        const target = { 
          x: d.target.x !== undefined ? d.target.x : targetNode.x, 
          y: d.target.y !== undefined ? d.target.y : targetNode.y 
        };
        
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        
        // Create curved paths
        return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
      });
      
      nodeContainer.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }
    
    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      svg
        .attr("width", containerRef.current.clientWidth)
        .attr("height", containerRef.current.clientHeight);
      
      simulationRef.current
        .force("center", d3.forceCenter(
          containerRef.current.clientWidth / 2, 
          containerRef.current.clientHeight / 2
        ));
      
      simulationRef.current.alpha(0.3).restart();
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodes, links, hoveredNodeId, selectedElementId, onElementSelect]);
  
  // Update node positions based on selected element
  useEffect(() => {
    if (selectedElementId) {
      const newNodes = [...nodes];
      const selectedNode = newNodes.find(n => n.id === selectedElementId);
      
      if (selectedNode) {
        // Get related links
        const relatedLinks = links.filter(
          link => link.source === selectedElementId || link.target === selectedElementId
        );
        
        // Get related node IDs
        const relatedNodeIds = new Set<string>();
        relatedLinks.forEach(link => {
          relatedNodeIds.add(typeof link.source === 'string' ? link.source : link.source.id);
          relatedNodeIds.add(typeof link.target === 'string' ? link.target : link.target.id);
        });
        
        // Filter out the selected node itself
        relatedNodeIds.delete(selectedElementId);
        
        // Restart simulation with selected node fixed at center
        if (simulationRef.current) {
          // Reset all fixed positions
          newNodes.forEach(node => {
            node.fx = null;
            node.fy = null;
          });
          
          // Fix selected node position at center
          const centerX = containerRef.current ? containerRef.current.clientWidth / 2 : 500;
          const centerY = containerRef.current ? containerRef.current.clientHeight / 2 : 300;
          
          const selectedIndex = newNodes.findIndex(n => n.id === selectedElementId);
          if (selectedIndex !== -1) {
            newNodes[selectedIndex].fx = centerX;
            newNodes[selectedIndex].fy = centerY;
          }
          
          // Strengthen links to related nodes
          simulationRef.current
            .force("link", d3.forceLink()
              .id((d: any) => d.id)
              .links(links)
              .distance(link => {
                const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
                const targetId = typeof link.target === 'string' ? link.target : link.target.id;
                
                if (sourceId === selectedElementId || targetId === selectedElementId) {
                  return 100; // Shorter distance for related nodes
                }
                return 200; // Default distance
              }))
            .alpha(1)
            .restart();
        }
      }
    }
  }, [selectedElementId, links]);

  return (
    <div
      ref={containerRef}
      className="glass-card w-full h-[calc(100vh-12rem)] relative overflow-hidden"
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
      />
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground glass-card px-3 py-2">
        <p>Scroll to zoom, drag to pan, click nodes to explore</p>
      </div>
      <div className="absolute top-4 right-4 flex gap-3">
        <div className="glass-card p-2 flex items-center">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M12 16.7L4.8 12l7.2-4.7 7.2 4.7z M12 2.3L4.8 7l7.2 4.7L19.2 7z M12 24l-7.2-4.7 7.2-4.7 7.2 4.7z" 
              fill="#8B5CF6" stroke="rgba(255, 255, 255, 0.5)" />
          </svg>
          <span className="text-xs ml-2">Person</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M12 2l12 12-12 12L0 14z" 
              fill="#0EA5E9" stroke="rgba(255, 255, 255, 0.5)" />
          </svg>
          <span className="text-xs ml-2">Event</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" 
              fill="#14B8A6" stroke="rgba(255, 255, 255, 0.5)" />
          </svg>
          <span className="text-xs ml-2">Document</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" 
              fill="#F59E0B" stroke="rgba(255, 255, 255, 0.5)" />
          </svg>
          <span className="text-xs ml-2">Concept</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryMap;
