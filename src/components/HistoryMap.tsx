
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { generateMapNodes, generateMapLinks, getElementById, getTimelineItems, generateExtendedMapData } from '@/utils/dummyData';
import { HistoricalElement, MapNode, MapLink, TimelineItem, HistoricalElementType, NodeFormData } from '@/types';
import * as d3 from 'd3';
import { Circle, Square, Diamond, Star, Clock, Play, Pause, Layers, Plus, Pencil, Trash, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface HistoryMapProps {
  onElementSelect: (element: HistoricalElement) => void;
  selectedElementId?: string;
}

const HistoryMap: React.FC<HistoryMapProps> = ({ onElementSelect, selectedElementId }) => {
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<MapNode[]>(generateMapNodes());
  const [links, setLinks] = useState<MapLink[]>(generateMapLinks());
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(getTimelineItems());
  
  // Node creation, editing, and deletion states
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [nodeFormData, setNodeFormData] = useState<NodeFormData>({
    name: '',
    type: 'person',
    date: '',
    description: '',
    tags: '',
    imageUrl: '',
  });
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  
  // Relationship depth visualization
  const [maxRelationshipDepth, setMaxRelationshipDepth] = useState<number>(3);
  const [showExtendedRelationships, setShowExtendedRelationships] = useState<boolean>(true);
  
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
      case 'person': return '#9b87f5'; 
      case 'event': return '#0EA5E9';  
      case 'document': return '#14B8A6'; 
      case 'concept': return '#F59E0B'; 
      default: return '#FFFFFF';
    }
  };

  // Generate a unique ID
  const generateUniqueId = () => {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNodeFormData({
      ...nodeFormData,
      [name]: value
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNodeFormData({
      ...nodeFormData,
      [name]: value
    });
  };

  // Create a new node
  const createNode = (x: number, y: number) => {
    setNodeFormData({
      name: '',
      type: 'person',
      date: '',
      description: '',
      tags: '',
      imageUrl: '',
    });
    setEditingNodeId(null);
    setShowNodeForm(true);
    // Store the position for the new node
    setNodeFormData(prev => ({
      ...prev,
      x,
      y
    }));
  };

  // Edit existing node
  const editNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNodeId(nodeId);
      setNodeFormData({
        name: node.element.name,
        type: node.element.type,
        date: node.element.date || '',
        description: node.element.description,
        tags: node.element.tags.join(', '),
        imageUrl: node.element.imageUrl || '',
      });
      setShowNodeForm(true);
    }
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    // Remove the node
    setNodes(nodes.filter(node => node.id !== nodeId));
    
    // Remove any links connected to this node
    setLinks(links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return sourceId !== nodeId && targetId !== nodeId;
    }));
    
    toast({
      title: "Node Deleted",
      description: "The node has been successfully removed.",
    });
  };

  // Save node form data
  const saveNodeForm = () => {
    const { name, type, date, description, tags, imageUrl, x, y } = nodeFormData;
    
    // Basic validation
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (editingNodeId) {
      // Update existing node
      setNodes(nodes.map(node => {
        if (node.id === editingNodeId) {
          return {
            ...node,
            element: {
              ...node.element,
              name,
              type: type as HistoricalElementType,
              date,
              description,
              tags: tagsArray,
              imageUrl: imageUrl || undefined,
              year: date ? parseInt(date.split('-')[0]) : undefined
            },
            isEditing: false
          };
        }
        return node;
      }));
      
      toast({
        title: "Node Updated",
        description: "The node has been successfully updated.",
      });
    } else {
      // Create new node
      const newNodeId = generateUniqueId();
      const newNode: MapNode = {
        id: newNodeId,
        x: x as number || (containerRef.current?.clientWidth || 500) / 2,
        y: y as number || (containerRef.current?.clientHeight || 300) / 2,
        element: {
          id: newNodeId,
          name,
          type: type as HistoricalElementType,
          date,
          description,
          tags: tagsArray,
          imageUrl: imageUrl || undefined,
          year: date ? parseInt(date.split('-')[0]) : undefined
        }
      };
      
      setNodes([...nodes, newNode]);
      
      // If we're creating a connection, create the link too
      if (isCreatingConnection && connectionSourceId) {
        const newLinkId = `link_${generateUniqueId()}`;
        const newLink: MapLink = {
          id: newLinkId,
          source: connectionSourceId,
          target: newNodeId,
          relationship: {
            id: newLinkId,
            sourceId: connectionSourceId,
            targetId: newNodeId,
            description: "Connected to",
            type: "custom"
          }
        };
        
        setLinks([...links, newLink]);
        setIsCreatingConnection(false);
        setConnectionSourceId(null);
      }
      
      toast({
        title: "Node Created",
        description: "A new node has been successfully created.",
      });
    }
    
    setShowNodeForm(false);
    setNodeFormData({
      name: '',
      type: 'person',
      date: '',
      description: '',
      tags: '',
      imageUrl: '',
    });
    setEditingNodeId(null);
    
    // Restart simulation
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  };

  // Start connection creation
  const startConnection = (nodeId: string) => {
    setIsCreatingConnection(true);
    setConnectionSourceId(nodeId);
    toast({
      title: "Creating Connection",
      description: "Click on another node or empty space to connect",
    });
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
        return <Circle {...iconProps} />;
      case 'event': 
        return <Diamond {...iconProps} />;
      case 'document': 
        return <Square {...iconProps} />;
      case 'concept': 
        return <Star {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
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
      if (currentYear >= targetYear) {
        setCurrentYear(yearRange.min);
      }
      animationRef.current = requestAnimationFrame(animateStep);
    }
  };
  
  // Update data when selected element or relationship depth changes
  useEffect(() => {
    if (showExtendedRelationships && selectedElementId) {
      const { nodes: extendedNodes, links: extendedLinks } = generateExtendedMapData(selectedElementId, maxRelationshipDepth);
      setNodes(extendedNodes);
      setLinks(extendedLinks);
    } else {
      setNodes(generateMapNodes());
      setLinks(generateMapLinks());
    }
  }, [selectedElementId, maxRelationshipDepth, showExtendedRelationships]);
  
  // Handle background click for node creation
  const handleBackgroundClick = (event: React.MouseEvent<SVGRectElement>) => {
    if (isCreatingNode) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        createNode(x, y);
      }
      setIsCreatingNode(false);
    } else if (isCreatingConnection) {
      // If clicking on background while creating connection, cancel connection
      setIsCreatingConnection(false);
      setConnectionSourceId(null);
      toast({
        title: "Connection Cancelled",
        description: "Connection creation has been cancelled",
      });
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
      .attr("fill", "transparent")
      .on("click", function(event) {
        // Convert D3 event to React event
        const reactEvent = { clientX: event.clientX, clientY: event.clientY } as React.MouseEvent<SVGRectElement>;
        handleBackgroundClick(reactEvent);
      });
    
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
    
    // Create links with elegant gradients and layer-based opacity
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
        // Set thicker stroke for direct connections, thinner for secondary/tertiary
        if (d.layer === 1) return 2;
        if (d.layer === 2) return 1.5;
        if (d.layer === 3) return 1;
        return 0.75;
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
      .style("opacity", d => d.opacity !== undefined ? d.opacity : 0); // Use layer-based opacity

    // Create node containers with layer information
    const nodeContainer = mainGroup.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node-container")
      .attr("opacity", d => d.opacity !== undefined ? d.opacity : 0) // Layer-based opacity
      .call(d3.drag<SVGGElement, MapNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Add glow effects for nodes with layer-based intensity
    nodeContainer.append("circle")
      .attr("class", "node-glow")
      .attr("r", d => (d.id === selectedElementId || d.id === hoveredNodeId) ? 30 : 25)
      .attr("fill", d => `${getNodeColor(d.element.type)}${d.layer === 1 ? '33' : d.layer === 2 ? '22' : '11'}`) // Adjust transparency based on layer
      .attr("filter", "url(#glow)")
      .attr("opacity", d => {
        const baseOpacity = (d.id === selectedElementId || d.id === hoveredNodeId) ? 0.7 : 0.3;
        // Reduce opacity for extended relationship layers
        if (d.layer === 1) return baseOpacity;
        if (d.layer === 2) return baseOpacity * 0.75;
        if (d.layer === 3) return baseOpacity * 0.5;
        return baseOpacity * 0.3;
      });
    
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
        
        // Add the image with layer-based opacity
        node.append("image")
          .attr("xlink:href", d.element.imageUrl)
          .attr("width", 50)
          .attr("height", 50)
          .attr("x", -25)
          .attr("y", -25)
          .attr("clip-path", `url(#${clipPathId})`)
          .attr("filter", "url(#image-fade)")
          .attr("class", "node-image")
          .attr("opacity", d.layer === 1 ? 1 : d.layer === 2 ? 0.8 : 0.6); // Adjust image opacity based on layer
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
      .attr("font-weight", d => d.layer === 1 ? "500" : "400") // Lighter weight for extended layers
      .attr("font-size", d => d.layer === 1 ? "12px" : d.layer === 2 ? "11px" : "10px") // Smaller text for extended layers
      .attr("text-shadow", "0 0 4px rgba(0, 0, 0, 0.5)")
      .text(d => d.element.name)
      .attr("opacity", d => {
        if (d.id === selectedElementId || d.id === hoveredNodeId) return 1;
        if (d.layer === 1) return 0; // Hide labels for non-selected nodes by default
        if (d.layer === 2) return 0;
        return 0;
      });
    
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
    
    // Add node controls (edit, delete, connect)
    nodeContainer.each(function(d) {
      if (d.id === hoveredNodeId) {
        const node = d3.select(this);
        
        // Add a controls group
        const controlsGroup = node.append("g")
          .attr("class", "node-controls")
          .attr("transform", "translate(0, -50)");
        
        // Edit button
        const editButton = controlsGroup.append("circle")
          .attr("cx", -25)
          .attr("cy", 0)
          .attr("r", 12)
          .attr("fill", "rgba(255, 255, 255, 0.9)")
          .attr("stroke", "#9b87f5")
          .attr("cursor", "pointer")
          .on("click", function(event) {
            event.stopPropagation();
            editNode(d.id);
          });
        
        // Edit icon
        const editFO = controlsGroup.append("foreignObject")
          .attr("width", 24)
          .attr("height", 24)
          .attr("x", -37)
          .attr("y", -12)
          .style("pointer-events", "none");
        
        const editIconContainer = editFO.append("xhtml:div")
          .style("width", "100%")
          .style("height", "100%")
          .style("display", "flex")
          .style("justify-content", "center")
          .style("align-items", "center");
        
        const editIconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        editIconSvg.setAttribute("width", "16");
        editIconSvg.setAttribute("height", "16");
        editIconSvg.setAttribute("viewBox", "0 0 24 24");
        
        const editIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        editIconPath.setAttribute("d", "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7");
        editIconPath.setAttribute("fill", "none");
        editIconPath.setAttribute("stroke", "#9b87f5");
        editIconPath.setAttribute("stroke-width", "2");
        
        const editIconPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        editIconPath2.setAttribute("d", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z");
        editIconPath2.setAttribute("fill", "none");
        editIconPath2.setAttribute("stroke", "#9b87f5");
        editIconPath2.setAttribute("stroke-width", "2");
        
        editIconSvg.appendChild(editIconPath);
        editIconSvg.appendChild(editIconPath2);
        editIconContainer.node()!.appendChild(editIconSvg);
        
        // Connect button
        const connectButton = controlsGroup.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 12)
          .attr("fill", "rgba(255, 255, 255, 0.9)")
          .attr("stroke", "#0EA5E9")
          .attr("cursor", "pointer")
          .on("click", function(event) {
            event.stopPropagation();
            startConnection(d.id);
          });
        
        // Connect icon
        const connectFO = controlsGroup.append("foreignObject")
          .attr("width", 24)
          .attr("height", 24)
          .attr("x", -12)
          .attr("y", -12)
          .style("pointer-events", "none");
        
        const connectIconContainer = connectFO.append("xhtml:div")
          .style("width", "100%")
          .style("height", "100%")
          .style("display", "flex")
          .style("justify-content", "center")
          .style("align-items", "center");
        
        const connectIconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        connectIconSvg.setAttribute("width", "16");
        connectIconSvg.setAttribute("height", "16");
        connectIconSvg.setAttribute("viewBox", "0 0 24 24");
        
        const connectIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        connectIconPath.setAttribute("d", "M8 12h8M12 8v8");
        connectIconPath.setAttribute("fill", "none");
        connectIconPath.setAttribute("stroke", "#0EA5E9");
        connectIconPath.setAttribute("stroke-width", "2");
        connectIconPath.setAttribute("stroke-linecap", "round");
        
        connectIconSvg.appendChild(connectIconPath);
        connectIconContainer.node()!.appendChild(connectIconSvg);
        
        // Delete button
        const deleteButton = controlsGroup.append("circle")
          .attr("cx", 25)
          .attr("cy", 0)
          .attr("r", 12)
          .attr("fill", "rgba(255, 255, 255, 0.9)")
          .attr("stroke", "#ef4444")
          .attr("cursor", "pointer")
          .on("click", function(event) {
            event.stopPropagation();
            deleteNode(d.id);
          });
        
        // Delete icon
        const deleteFO = controlsGroup.append("foreignObject")
          .attr("width", 24)
          .attr("height", 24)
          .attr("x", 13)
          .attr("y", -12)
          .style("pointer-events", "none");
        
        const deleteIconContainer = deleteFO.append("xhtml:div")
          .style("width", "100%")
          .style("height", "100%")
          .style("display", "flex")
          .style("justify-content", "center")
          .style("align-items", "center");
        
        const deleteIconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        deleteIconSvg.setAttribute("width", "16");
        deleteIconSvg.setAttribute("height", "16");
        deleteIconSvg.setAttribute("viewBox", "0 0 24 24");
        
        const deleteIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        deleteIconPath.setAttribute("d", "M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6");
        deleteIconPath.setAttribute("fill", "none");
        deleteIconPath.setAttribute("stroke", "#ef4444");
        deleteIconPath.setAttribute("stroke-width", "2");
        deleteIconPath.setAttribute("stroke-linecap", "round");
        
        deleteIconSvg.appendChild(deleteIconPath);
        deleteIconContainer.node()!.appendChild(deleteIconSvg);
      }
    });
    
    // Create a force simulation
    const simulation = d3.forceSimulation<MapNode, MapLink>(nodes)
      .force("link", d3.forceLink<MapNode, MapLink>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50).strength(0.2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .on("tick", ticked);
    
    simulationRef.current = simulation;
    
    // Update node and link positions on each simulation tick
    function ticked() {
      // Create a curved path for each link
      link.attr("d", function(d) {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;
        
        // Find source and target nodes
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        
        if (!sourceNode || !targetNode) return "";
        
        const sourceX = sourceNode.x || 0;
        const sourceY = sourceNode.y || 0;
        const targetX = targetNode.x || 0;
        const targetY = targetNode.y || 0;
        
        // Create a slight curve for all paths
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        
        return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
      });
      
      // Position nodes
      nodeContainer.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
      
      // Update node opacities based on the current year for animation
      if (isAnimating) {
        const nodesMap = new Map<string, MapNode>();
        nodes.forEach(node => nodesMap.set(node.id, node));
        
        nodeContainer.attr("opacity", d => {
          const baseOpacity = d.opacity !== undefined ? d.opacity : 1;
          const visibilityOpacity = calculateNodeVisibility(d, currentYear);
          return baseOpacity * visibilityOpacity;
        });
        
        link.style("opacity", d => {
          const baseOpacity = d.opacity !== undefined ? d.opacity : 1;
          const visibilityOpacity = calculateLinkVisibility(d, currentYear, nodesMap);
          return baseOpacity * visibilityOpacity;
        });
      }
    }
    
    // Drag functions for nodes
    function dragstarted(event: d3.D3DragEvent<SVGGElement, MapNode, MapNode>, d: MapNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      
      // Show the node's label while dragging
      d3.select(event.sourceEvent.currentTarget)
        .select(".node-label")
        .attr("opacity", 1);
    }
    
    function dragged(event: d3.D3DragEvent<SVGGElement, MapNode, MapNode>, d: MapNode) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGGElement, MapNode, MapNode>, d: MapNode) {
      if (!event.active) simulation.alphaTarget(0);
      
      // Reset label opacity if not selected or hovered
      if (d.id !== selectedElementId && d.id !== hoveredNodeId) {
        d3.select(event.sourceEvent.currentTarget)
          .select(".node-label")
          .attr("opacity", 0);
      }
      
      // If we're in connection creation mode, don't unset fx and fy
      if (!isCreatingConnection) {
        d.fx = null;
        d.fy = null;
      }
    }
    
    // Handle node hover and click events
    nodeContainer.on("mouseover", function(event, d) {
      setHoveredNodeId(d.id);
      // Show the label
      d3.select(this).select(".node-label").attr("opacity", 1);
    })
    .on("mouseout", function(event, d) {
      setHoveredNodeId(null);
      // Hide the label if not selected
      if (d.id !== selectedElementId) {
        d3.select(this).select(".node-label").attr("opacity", 0);
      }
    })
    .on("click", function(event, d) {
      event.stopPropagation();
      
      // If we're in connection creation mode
      if (isCreatingConnection && connectionSourceId && connectionSourceId !== d.id) {
        // Create a new link
        const newLinkId = `link_${generateUniqueId()}`;
        const newLink: MapLink = {
          id: newLinkId,
          source: connectionSourceId,
          target: d.id,
          relationship: {
            id: newLinkId,
            sourceId: connectionSourceId,
            targetId: d.id,
            description: "Connected to",
            type: "custom"
          }
        };
        
        setLinks([...links, newLink]);
        setIsCreatingConnection(false);
        setConnectionSourceId(null);
        
        toast({
          title: "Connection Created",
          description: "A new connection has been established.",
        });
        
        // Restart simulation
        simulation.alpha(0.3).restart();
      } else {
        // Handle node selection
        onElementSelect(d.element);
      }
    });
    
    // Add glow filter
    const glowFilter = defs.append("filter")
      .attr("id", "glow");
    
    glowFilter.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "5")
      .attr("result", "blur");
    
    glowFilter.append("feColorMatrix")
      .attr("in", "blur")
      .attr("type", "matrix")
      .attr("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7")
      .attr("result", "glow");
    
    glowFilter.append("feBlend")
      .attr("in", "SourceGraphic")
      .attr("in2", "glow")
      .attr("mode", "normal");
    
    // Cleanup on unmount
    return () => {
      if (simulation) simulation.stop();
    };
  }, [nodes, links, selectedElementId, hoveredNodeId, isAnimating, currentYear, isCreatingConnection, connectionSourceId, onElementSelect]);
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900">
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600"
                onClick={() => setIsCreatingNode(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Add new node</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600"
                onClick={toggleAnimation}
              >
                {isAnimating ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isAnimating ? "Pause" : "Play"} timeline animation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showExtendedRelationships ? "default" : "outline"}
                size="icon" 
                className={`${showExtendedRelationships ? "bg-indigo-600" : "bg-slate-800"} text-white hover:bg-indigo-700 border-slate-600`}
                onClick={() => setShowExtendedRelationships(!showExtendedRelationships)}
              >
                <Layers className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{showExtendedRelationships ? "Hide" : "Show"} extended relationships</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Year indicator for animation */}
      {isAnimating && (
        <div className="absolute top-4 left-4 bg-slate-800 text-white px-3 py-1 rounded-md flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-mono">{currentYear}</span>
        </div>
      )}
      
      {/* Relationship depth control */}
      {showExtendedRelationships && (
        <div className="absolute bottom-4 right-4 bg-slate-800 text-white px-3 py-2 rounded-md">
          <label className="block text-xs text-slate-400">Relationship Depth</label>
          <div className="flex items-center space-x-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 bg-slate-700 hover:bg-slate-600 border-slate-600"
              onClick={() => setMaxRelationshipDepth(Math.max(1, maxRelationshipDepth - 1))}
              disabled={maxRelationshipDepth <= 1}
            >
              -
            </Button>
            <span className="w-4 text-center">{maxRelationshipDepth}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 bg-slate-700 hover:bg-slate-600 border-slate-600"
              onClick={() => setMaxRelationshipDepth(Math.min(5, maxRelationshipDepth + 1))}
              disabled={maxRelationshipDepth >= 5}
            >
              +
            </Button>
          </div>
        </div>
      )}
      
      {/* Main SVG container */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
      
      {/* Node Form Dialog */}
      <Dialog open={showNodeForm} onOpenChange={setShowNodeForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingNodeId ? "Edit Node" : "Create New Node"}</DialogTitle>
            <DialogDescription>
              {editingNodeId 
                ? "Update the details of this historical element" 
                : "Add a new historical element to the knowledge graph"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={nodeFormData.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter entity name"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={nodeFormData.type} 
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">Person</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="concept">Concept</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  value={nodeFormData.date} 
                  onChange={handleInputChange} 
                  placeholder="YYYY-MM-DD"
                />
              </div>
              
              <div className="col-span-4">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={nodeFormData.description} 
                  onChange={handleInputChange} 
                  placeholder="Enter a description"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="col-span-4">
                <Label htmlFor="tags">Tags</Label>
                <Input 
                  id="tags" 
                  name="tags" 
                  value={nodeFormData.tags} 
                  onChange={handleInputChange} 
                  placeholder="Comma separated tags"
                />
              </div>
              
              <div className="col-span-4">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input 
                  id="imageUrl" 
                  name="imageUrl" 
                  value={nodeFormData.imageUrl} 
                  onChange={handleInputChange} 
                  placeholder="Optional: URL to an image"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNodeForm(false)}>Cancel</Button>
            <Button onClick={saveNodeForm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryMap;
