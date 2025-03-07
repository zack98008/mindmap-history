import React, { useRef, useEffect, useState, useMemo } from 'react';
import { generateMapNodes, generateMapLinks, getElementById, getTimelineItems, generateExtendedMapData } from '@/utils/dummyData';
import { HistoricalElement, MapNode, MapLink, TimelineItem, HistoricalElementType, NodeFormData } from '@/types';
import * as d3 from 'd3';
import { Circle, Square, Diamond, Star, Clock, Play, Pause, Layers, Plus, Pencil, Trash, X, Check, Lock } from 'lucide-react';
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
  
  const [maxRelationshipDepth, setMaxRelationshipDepth] = useState<number>(3);
  const [showExtendedRelationships, setShowExtendedRelationships] = useState<boolean>(true);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentYear, setCurrentYear] = useState(1400);
  const [targetYear, setTargetYear] = useState(2000);
  const animationSpeedRef = useRef(50);
  const animationRef = useRef<number | null>(null);
  
  const simulationRef = useRef<any>(null);
  
  const yearRange = useMemo(() => {
    const years = timelineItems.map(item => item.year);
    return {
      min: Math.min(...years),
      max: Math.max(...years)
    };
  }, [timelineItems]);
  
  const getNodeColor = (type: string) => {
    switch(type) {
      case 'person': return '#9b87f5'; 
      case 'event': return '#0EA5E9';  
      case 'document': return '#14B8A6'; 
      case 'concept': return '#F59E0B'; 
      default: return '#FFFFFF';
    }
  };

  const generateUniqueId = () => {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNodeFormData({
      ...nodeFormData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNodeFormData({
      ...nodeFormData,
      [name]: value
    });
  };

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
    setNodeFormData(prev => ({
      ...prev,
      x,
      y
    }));
  };

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

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
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

  const saveNodeForm = () => {
    const { name, type, date, description, tags, imageUrl, x, y } = nodeFormData;
    
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
    
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  };

  const startConnection = (nodeId: string) => {
    setIsCreatingConnection(true);
    setConnectionSourceId(nodeId);
    toast({
      title: "Creating Connection",
      description: "Click on another node or empty space to connect",
    });
  };

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

  const calculateNodeVisibility = (node: MapNode, year: number): number => {
    const nodeYear = node.element.year || parseInt(node.element.date?.split('-')[0] || '0');
    
    if (nodeYear === 0) return 1;
    if (nodeYear > year) return 0;
    
    const fadeInPeriod = 10;
    if (year - nodeYear < fadeInPeriod) {
      return (year - nodeYear) / fadeInPeriod;
    }
    
    return 1;
  };

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

  useEffect(() => {
    if (showExtendedRelationships && selectedElementId) {
      const { nodes: extendedNodes, links: extendedLinks } = generateExtendedMapData(selectedElementId, maxRelationshipDepth);
      
      const updatedNodes = extendedNodes.map(node => {
        if (node.id === selectedElementId) {
          return {
            ...node,
            isLocked: true,
            fx: node.x,
            fy: node.y,
          };
        }
        return node;
      });
      
      setNodes(updatedNodes);
      setLinks(extendedLinks);
    } else {
      const basicNodes = generateMapNodes();
      
      if (selectedElementId) {
        const updatedNodes = basicNodes.map(node => {
          if (node.id === selectedElementId) {
            return {
              ...node,
              isLocked: true,
              fx: node.x,
              fy: node.y,
            };
          }
          return node;
        });
        setNodes(updatedNodes);
      } else {
        setNodes(basicNodes);
      }
      
      setLinks(generateMapLinks());
    }
  }, [selectedElementId, maxRelationshipDepth, showExtendedRelationships]);

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
      setIsCreatingConnection(false);
      setConnectionSourceId(null);
      toast({
        title: "Connection Cancelled",
        description: "Connection creation has been cancelled",
      });
    }
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    svg.selectAll("*").remove();
    
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });
    
    svg.call(zoom as any);
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("click", function(event) {
        const reactEvent = { clientX: event.clientX, clientY: event.clientY } as React.MouseEvent<SVGRectElement>;
        handleBackgroundClick(reactEvent);
      });
    
    const mainGroup = svg.append("g")
      .attr("class", "main-group");
    
    const defs = svg.append("defs");
    
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
    
    const filter = defs.append("filter")
      .attr("id", "image-fade")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "blur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
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
    
    const link = mainGroup.append("g")
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("stroke", d => {
        if (d.relationship.type === "influenced") return "url(#linkGradient-influenced)";
        if (d.relationship.type === "created") return "url(#linkGradient-created)";
        if (d.relationship.type === "participated") return "url(#linkGradient-participated)";
        if (d.relationship.type === "documented") return "url(#linkGradient-documented)";
        return "url(#linkGradient-default)";
      })
      .attr("stroke-width", d => {
        if (d.layer === 1) return 2;
        if (d.layer === 2) return 1.5;
        if (d.layer === 3) return 1;
        return 0.75;
      })
      .attr("fill", "none")
      .attr("marker-end", d => {
        if (d.relationship.type === "influenced") return "url(#arrow-influenced)";
        if (d.relationship.type === "created") return "url(#arrow-created)";
        if (d.relationship.type === "participated") return "url(#arrow-participated)";
        if (d.relationship.type === "documented") return "url(#arrow-documented)";
        return "url(#arrow-default)";
      })
      .style("stroke-dasharray", d => {
        if (d.relationship.type === "influenced") return "1, 0";
        if (d.relationship.type === "created") return "1, 0";
        if (d.relationship.type === "participated") return "5, 5";
        if (d.relationship.type === "documented") return "10, 2";
        return "1, 0";
      })
      .style("opacity", d => d.opacity !== undefined ? d.opacity : 0);
    
    const nodeContainer = mainGroup.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node-container")
      .attr("opacity", d => d.opacity !== undefined ? d.opacity : 0)
      .call(d3.drag<SVGGElement, MapNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    nodeContainer.append("circle")
      .attr("class", "node-glow")
      .attr("r", d => (d.id === selectedElementId || d.id === hoveredNodeId) ? 30 : 25)
      .attr("fill", d => `${getNodeColor(d.element.type)}${d.layer === 1 ? '33' : d.layer === 2 ? '22' : '11'}`)
      .attr("filter", "url(#glow)")
      .attr("opacity", d => {
        const baseOpacity = (d.id === selectedElementId || d.id === hoveredNodeId) ? 0.7 : 0.3;
        if (d.layer === 1) return baseOpacity;
        if (d.layer === 2) return baseOpacity * 0.75;
        if (d.layer === 3) return baseOpacity * 0.5;
        return baseOpacity * 0.3;
      });
    
    nodeContainer.each(function(d) {
      if (d.element.imageUrl) {
        const node = d3.select(this);
        
        const clipPathId = `clip-${d.id}`;
        defs.append("clipPath")
          .attr("id", clipPathId)
          .append("circle")
          .attr("r", 24);
        
        node.append("image")
          .attr("xlink:href", d.element.imageUrl)
          .attr("width", 50)
          .attr("height", 50)
          .attr("x", -25)
          .attr("y", -25)
          .attr("clip-path", `url(#${clipPathId})`)
          .attr("filter", "url(#image-fade)")
          .attr("class", "node-image")
          .attr("opacity", d.layer === 1 ? 1 : d.layer === 2 ? 0.8 : 0.6);
      }
    });
    
    const nodeIcons = nodeContainer.append("foreignObject")
      .attr("width", 50)
      .attr("height", 50)
      .attr("x", -25)
      .attr("y", -25)
      .attr("class", "node-icon")
      .style("pointer-events", "none");
      
    nodeContainer.each(function(d) {
      const fo = d3.select(this).select("foreignObject");
      const iconColor = getNodeColor(d.element.type);
      const iconSize = (d.id === selectedElementId || d.id === hoveredNodeId) ? 28 : 24;
      
      const iconContainer = fo.append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center");
      
      const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      iconSvg.setAttribute("width", `${iconSize}`);
      iconSvg.setAttribute("height", `${iconSize}`);
      iconSvg.setAttribute("viewBox", "0 0 24 24");
      iconSvg.style.filter = "drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.4))";
      
      let pathD = "";
      switch(d.element.type) {
        case 'person':
          pathD = "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z";
          break;
        case 'event':
          pathD = "M12 2l10 10-10 10L2 12z";
          break;
        case 'document':
          pathD = "M4 4h16v16H4z";
          break;
        case 'concept':
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
      
    const nodeLabels = nodeContainer.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", 40)
      .attr("fill", "#FFFFFF")
      .attr("font-weight", d => d.layer === 1 ? "500" : "400")
      .attr("font-size", d => d.layer === 1 ? "12px" : d.layer === 2 ? "11px" : "10px")
      .attr("text-shadow", "0 0 4px rgba(0, 0, 0, 0.5)")
      .text(d => d.element.name)
      .attr("opacity", d => {
        if (d.id === selectedElementId || d.id === hoveredNodeId) return 1;
        if (d.layer === 1) return 0;
        if (d.layer === 2) return 0;
        return 0;
      });
    
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
      
      const lockFO = selectedNode.append("foreignObject")
        .attr("width", 24)
        .attr("height", 24)
        .attr("x", 15)
        .attr("y", -35)
        .style("pointer-events", "none");
      
      const lockIconContainer = lockFO.append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center");
      
      const lockIconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      lockIconSvg.setAttribute("width", "18");
      lockIconSvg.setAttribute("height", "18");
      lockIconSvg.setAttribute("viewBox", "0 0 24 24");
      
      const lockIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      lockIconPath.setAttribute("d", "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z");
      lockIconPath.setAttribute("fill", "#FFFFFF");
      lockIconPath.setAttribute("stroke", "#FFFFFF");
      lockIconPath.setAttribute("stroke-width", "1.5");
      
      const lockIconPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      lockIconPath2.setAttribute("d", "M7 11V7a5 5 0 0 1 10 0v4");
      lockIconPath2.setAttribute("fill", "none");
      lockIconPath2.setAttribute("stroke", "#FFFFFF");
      lockIconPath2.setAttribute("stroke-width", "1.5");
      
      lockIconSvg.appendChild(lockIconPath);
      lockIconSvg.appendChild(lockIconPath2);
      lockIconContainer.node()!.appendChild(lockIconSvg);
      
      selectedNode.append("circle")
        .attr("class", "node-locked-border")
        .attr("r", 33)
        .attr("fill", "none")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,2")
        .attr("opacity", 0.7);
      
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
    
    nodeContainer.each(function(d) {
      if (d.id === hoveredNodeId) {
        const node = d3.select(this);
        
        const controlsGroup = node.append("g")
          .attr("class", "node-controls")
          .attr("transform", "translate(0, -50)");
        
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
    
    return () => {
      if (simulation) simulation.stop();
    };
  }, [nodes, links, selectedElementId, hoveredNodeId, isAnimating, currentYear, isCreatingConnection, connectionSourceId, onElementSelect]);
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900">
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
      
      {isAnimating && (
        <div className="absolute top-4 left-4 bg-slate-800 text-white px-3 py-1 rounded-md flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span className="font-mono">{currentYear}</span>
        </div>
      )}
      
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
      
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
      
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

