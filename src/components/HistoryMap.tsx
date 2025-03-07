
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { generateMapNodes, generateMapLinks, getElementById, getTimelineItems } from '@/utils/dummyData';
import { HistoricalElement, MapNode, MapLink, TimelineItem } from '@/types';
import * as d3 from 'd3';
import { Circle, Square, Diamond, Star, Clock, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(getTimelineItems());
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentYear, setCurrentYear] = useState(1400);
  const [targetYear, setTargetYear] = useState(2000);
  const animationSpeedRef = useRef(50); // ms per year
  const animationRef = useRef<number | null>(null);
  
  // D3 simulation reference
  const simulationRef = useRef<any>(null);
  
  // Years for timeline
  const yearRange = useMemo(() => {
    const years = timelineItems.map(item => item.year);
    return {
      min: Math.min(...years),
      max: Math.max(...years)
    };
  }, [timelineItems]);
  
  // Function to get node color based on type with more meaningful associations
  const getNodeColor = (type: string) => {
    switch(type) {
      // Purple - associated with leadership, wisdom, creativity
      case 'person': return '#9b87f5'; 
      // Blue - associated with stability, truth, timeline events
      case 'event': return '#0EA5E9';  
      // Teal - associated with clarity, knowledge, communication
      case 'document': return '#14B8A6'; 
      // Gold - associated with ideas, inspiration, intellect
      case 'concept': return '#F59E0B'; 
      default: return '#FFFFFF';
    }
  };

  // Get node icon based on type
  const getNodeIcon = (type: string, size = 20, color: string) => {
    const iconProps = {
      size: size,
      fill: color,
      stroke: "rgba(255, 255, 255, 0.8)",
      strokeWidth: 1.5,
    };

    switch(type) {
      case 'person': 
        return <Circle {...iconProps} />; // Circle for person - represents individual identity
      case 'event': 
        return <Diamond {...iconProps} />; // Diamond for event - represents significant moments
      case 'document': 
        return <Square {...iconProps} />; // Square for document - represents structured information
      case 'concept': 
        return <Star {...iconProps} />; // Star for concept - represents ideas that shine bright
      default:
        return <Circle {...iconProps} />; // Default circle
    }
  };

  // Calculate node visibility based on the current year
  const calculateNodeVisibility = (node: MapNode, year: number): number => {
    const nodeYear = node.element.year || parseInt(node.element.date?.split('-')[0] || '0');
    
    if (nodeYear === 0) return 1; // Always show nodes without years
    if (nodeYear > year) return 0; // Hide future nodes
    
    // Fade in gradually for recently appeared nodes
    const fadeInPeriod = 10; // Years
    if (year - nodeYear < fadeInPeriod) {
      return (year - nodeYear) / fadeInPeriod;
    }
    
    return 1;
  };
  
  // Calculate link visibility based on the current year and connected nodes
  const calculateLinkVisibility = (link: MapLink, year: number, nodesMap: Map<string, MapNode>): number => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    const sourceNode = nodesMap.get(sourceId);
    const targetNode = nodesMap.get(targetId);
    
    if (!sourceNode || !targetNode) return 0;
    
    const sourceOpacity = calculateNodeVisibility(sourceNode, year);
    const targetOpacity = calculateNodeVisibility(targetNode, year);
    
    return Math.min(sourceOpacity, targetOpacity);
  };

  // Animation step
  const animateStep = () => {
    if (currentYear >= targetYear) {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    setCurrentYear(prev => Math.min(prev + 1, targetYear));
    animationRef.current = requestAnimationFrame(animateStep);
  };
  
  // Start/stop animation
  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      setIsAnimating(true);
      // Reset to beginning if we're at the end
      if (currentYear >= targetYear) {
        setCurrentYear(yearRange.min);
      }
      animationRef.current = requestAnimationFrame(animateStep);
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
    
    // Define gradient for links
    const defs = svg.append("defs");
    
    // Create multiple gradients for different relationship types
    const gradientTypes = [
      {id: "linkGradient-default", colors: [{offset: "0%", color: "rgba(255, 255, 255, 0.1)"}, {offset: "100%", color: "rgba(255, 255, 255, 0.4)"}]},
      {id: "linkGradient-influenced", colors: [{offset: "0%", color: "rgba(139, 92, 246, 0.1)"}, {offset: "100%", color: "rgba(139, 92, 246, 0.4)"}]},
      {id: "linkGradient-created", colors: [{offset: "0%", color: "rgba(14, 165, 233, 0.1)"}, {offset: "100%", color: "rgba(14, 165, 233, 0.4)"}]},
      {id: "linkGradient-participated", colors: [{offset: "0%", color: "rgba(20, 184, 166, 0.1)"}, {offset: "100%", color: "rgba(20, 184, 166, 0.4)"}]},
      {id: "linkGradient-documented", colors: [{offset: "0%", color: "rgba(245, 158, 11, 0.1)"}, {offset: "100%", color: "rgba(245, 158, 11, 0.4)"}]},
    ];
    
    gradientTypes.forEach(gradient => {
      const linkGradient = defs.append("linearGradient")
        .attr("id", gradient.id)
        .attr("gradientUnits", "userSpaceOnUse");
      
      gradient.colors.forEach(color => {
        linkGradient.append("stop")
          .attr("offset", color.offset)
          .attr("stop-color", color.color);
      });
    });
    
    // Create image filter for transparency with faded edges
    const filter = defs.append("filter")
      .attr("id", "image-fade")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    // Gaussian blur for faded edges
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
    
    // Create composite with original image
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "blur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
    // Define arrow markers with gradient fill
    defs.selectAll("marker")
      .data(["default", "influenced", "created", "participated", "documented"])
      .enter().append("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", d => {
        switch(d) {
          case "influenced": return "rgba(139, 92, 246, 0.6)";
          case "created": return "rgba(14, 165, 233, 0.6)";
          case "participated": return "rgba(20, 184, 166, 0.6)";
          case "documented": return "rgba(245, 158, 11, 0.6)";
          default: return "rgba(255, 255, 255, 0.6)";
        }
      })
      .attr("d", "M0,-5L10,0L0,5");
    
    // Create links with elegant gradients
    const link = mainGroup.append("g")
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("stroke", d => {
        // Use relationship type to determine gradient
        if (d.relationship.type === "influenced") return "url(#linkGradient-influenced)";
        if (d.relationship.type === "created") return "url(#linkGradient-created)";
        if (d.relationship.type === "participated") return "url(#linkGradient-participated)";
        if (d.relationship.type === "documented") return "url(#linkGradient-documented)";
        return "url(#linkGradient-default)";
      })
      .attr("stroke-width", d => {
        if (selectedElementId && (
          (typeof d.source === 'string' && d.source === selectedElementId) || 
          (typeof d.source !== 'string' && d.source.id === selectedElementId) ||
          (typeof d.target === 'string' && d.target === selectedElementId) ||
          (typeof d.target !== 'string' && d.target.id === selectedElementId)
        )) {
          return 2;
        }
        return 1;
      })
      .attr("fill", "none")
      .attr("marker-end", d => {
        // Use relationship type to determine marker
        if (d.relationship.type === "influenced") return "url(#arrow-influenced)";
        if (d.relationship.type === "created") return "url(#arrow-created)";
        if (d.relationship.type === "participated") return "url(#arrow-participated)";
        if (d.relationship.type === "documented") return "url(#arrow-documented)";
        return "url(#arrow-default)";
      })
      .style("stroke-dasharray", d => {
        // Different dash patterns for different relationship types
        if (d.relationship.type === "influenced") return "1, 0";
        if (d.relationship.type === "created") return "1, 0";
        if (d.relationship.type === "participated") return "5, 5";
        if (d.relationship.type === "documented") return "10, 2";
        return "1, 0";
      })
      .style("opacity", 0); // Start with 0 opacity for animation

    // Create node containers
    const nodeContainer = mainGroup.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node-container")
      .attr("opacity", 0) // Start with 0 opacity for animation
      .call(d3.drag<SVGGElement, MapNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Add glow effects for nodes
    nodeContainer.append("circle")
      .attr("class", "node-glow")
      .attr("r", d => (d.id === selectedElementId || d.id === hoveredNodeId) ? 30 : 25)
      .attr("fill", d => `${getNodeColor(d.element.type)}33`) // Transparent version of node color
      .attr("filter", "url(#glow)")
      .attr("opacity", d => (d.id === selectedElementId || d.id === hoveredNodeId) ? 0.7 : 0.3);
    
    // Add transparent images with faded edges
    nodeContainer.each(function(d) {
      if (d.element.imageUrl) {
        const node = d3.select(this);
        
        // Add a clipPath for circular images
        const clipPathId = `clip-${d.id}`;
        defs.append("clipPath")
          .attr("id", clipPathId)
          .append("circle")
          .attr("r", 24);
        
        // Add the image
        node.append("image")
          .attr("xlink:href", d.element.imageUrl)
          .attr("width", 50)
          .attr("height", 50)
          .attr("x", -25)
          .attr("y", -25)
          .attr("clip-path", `url(#${clipPathId})`)
          .attr("filter", "url(#image-fade)")
          .attr("class", "node-image");
      }
    });
    
    // Create SVG foreignObject to hold React components
    const nodeIcons = nodeContainer.append("foreignObject")
      .attr("width", 50)
      .attr("height", 50)
      .attr("x", -25)
      .attr("y", -25)
      .attr("class", "node-icon")
      .style("pointer-events", "none");
      
    // Render React icons to SVG
    nodeContainer.each(function(d) {
      const fo = d3.select(this).select("foreignObject");
      const iconColor = getNodeColor(d.element.type);
      const iconSize = (d.id === selectedElementId || d.id === hoveredNodeId) ? 28 : 24;
      
      // Create a div to render React components
      const iconContainer = fo.append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center");
      
      // Create icon element based on node type
      const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      iconSvg.setAttribute("width", `${iconSize}`);
      iconSvg.setAttribute("height", `${iconSize}`);
      iconSvg.setAttribute("viewBox", "0 0 24 24");
      iconSvg.style.filter = "drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.4))";
      
      let pathD = "";
      switch(d.element.type) {
        case 'person':
          // Circle for person
          pathD = "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z";
          break;
        case 'event':
          // Diamond for event
          pathD = "M12 2l10 10-10 10L2 12z";
          break;
        case 'document':
          // Square for document
          pathD = "M4 4h16v16H4z";
          break;
        case 'concept':
          // Star for concept
          pathD = "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z";
          break;
        default:
          pathD = "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z";
      }
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathD);
      path.setAttribute("fill", iconColor);
      path.setAttribute("stroke", "rgba(255, 255, 255, 0.8)");
      path.setAttribute("stroke-width", "1.5");
      
      iconSvg.appendChild(path);
      iconContainer.node()!.appendChild(iconSvg);
    });
      
    // Add node labels with nice styling
    const nodeLabels = nodeContainer.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", 40)
      .attr("fill", "#FFFFFF")
      .attr("font-weight", "500")
      .attr("font-size", "12px")
      .attr("text-shadow", "0 0 4px rgba(0, 0, 0, 0.5)")
      .text(d => d.element.name)
      .attr("opacity", d => (d.id === selectedElementId || d.id === hoveredNodeId) ? 1 : 0);
    
    // Add a subtle ripple effect on selected node
    if (selectedElementId) {
      const selectedNode = nodeContainer.filter(d => d.id === selectedElementId);
      
      selectedNode.append("circle")
        .attr("class", "ripple")
        .attr("r", 20)
        .attr("fill", "none")
        .attr("stroke", d => getNodeColor(d.element.type))
        .attr("stroke-width", 2)
        .attr("opacity", 0.5)
        .call(ripple);
      
      function ripple(selection: any) {
        selection
          .transition()
          .duration(2000)
          .attr("r", 50)
          .attr("opacity", 0)
          .on("end", function() {
            d3.select(this).attr("r", 20).attr("opacity", 0.5);
            ripple(d3.select(this));
          });
      }
    }
    
    // Create glow filter
    const glowFilter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
      
    const glowMerge = glowFilter.append("feMerge");
    glowMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    glowMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
    // Interactive events
    nodeContainer
      .on("mouseover", function(event, d) {
        setHoveredNodeId(d.id);
        d3.select(this).select(".node-glow").attr("opacity", 0.8).attr("r", 35);
        d3.select(this).select(".node-label").attr("opacity", 1);
        
        // Scale up the icon
        const iconContainer = d3.select(this).select("foreignObject");
        iconContainer.attr("width", 60).attr("height", 60).attr("x", -30).attr("y", -30);
      })
      .on("mouseout", function(event, d) {
        setHoveredNodeId(null);
        d3.select(this).select(".node-glow")
          .attr("opacity", d => d.id === selectedElementId ? 0.7 : 0.3)
          .attr("r", d => d.id === selectedElementId ? 30 : 25);
        d3.select(this).select(".node-label")
          .attr("opacity", d => d.id === selectedElementId ? 1 : 0);
          
        // Reset icon size
        const iconContainer = d3.select(this).select("foreignObject");
        iconContainer.attr("width", 50).attr("height", 50).attr("x", -25).attr("y", -25);
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
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // More curved path
        
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
  
  // Update the visualization based on current year
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    // Create a map of node IDs to nodes for easy lookup
    const nodesMap = new Map<string, MapNode>();
    nodes.forEach(node => nodesMap.set(node.id, node));
    
    // Update node visibility
    svg.selectAll(".node-container")
      .transition()
      .duration(500)
      .attr("opacity", d => calculateNodeVisibility(d, currentYear));
    
    // Update link visibility
    svg.selectAll(".link")
      .transition()
      .duration(500)
      .style("opacity", d => calculateLinkVisibility(d, currentYear, nodesMap));
  }, [currentYear, nodes]);

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
          <div className="w-4 h-4 rounded-full bg-[#9b87f5] border border-white/20"></div>
          <span className="text-xs ml-2">Person</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <div className="w-4 h-4 bg-[#0EA5E9] transform rotate-45 border border-white/20"></div>
          <span className="text-xs ml-2">Event</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <div className="w-4 h-4 bg-[#14B8A6] border border-white/20"></div>
          <span className="text-xs ml-2">Document</span>
        </div>
        <div className="glass-card p-2 flex items-center">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 bg-[#F59E0B] transform rotate-45 border border-white/20"></div>
              <div className="absolute inset-0 bg-[#F59E0B] transform rotate-[22.5deg] border border-white/20"></div>
            </div>
          </div>
          <span className="text-xs ml-2">Concept</span>
        </div>
      </div>
      
      {/* Time controls */}
      <div className="absolute bottom-4 right-4 glass-card p-2 flex flex-col items-center">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleAnimation}
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex items-center ml-2">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{currentYear}</span>
          </div>
        </div>
        <input
          type="range"
          min={yearRange.min}
          max={yearRange.max}
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default HistoryMap;
