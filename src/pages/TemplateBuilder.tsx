
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash, DownloadCloud, Upload, FileText } from 'lucide-react';
import { TemplateComponent, TemplateStructure } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const defaultTemplates: TemplateStructure[] = [
  {
    id: "historical-events",
    name: "Historical Event Analysis",
    description: "A comprehensive framework for analyzing historical events, their causes, participants, and impacts.",
    components: [
      {
        id: "core-overview",
        title: "Overview & Background",
        description: "General context and background information",
        category: "core",
        prompt: "Provide a comprehensive overview of [topic], including its historical context, geographical setting, and time period. What were the social, economic, and political conditions that existed before this event/period?"
      },
      {
        id: "timeline-key-events",
        title: "Key Events Timeline",
        description: "Chronological sequence of main events",
        category: "timeline",
        prompt: "Create a detailed chronological timeline of [topic], highlighting the most significant events, turning points, and developments. Include specific dates where possible."
      },
      {
        id: "people-key-figures",
        title: "Key Figures",
        description: "Important individuals and their roles",
        category: "people",
        prompt: "Identify and analyze the key individuals involved in [topic]. What were their motivations, roles, contributions, and how did they influence outcomes? Include both primary actors and significant secondary figures."
      },
      {
        id: "concepts-ideologies",
        title: "Key Concepts & Ideologies",
        description: "Important ideas, philosophies, and theoretical frameworks",
        category: "concepts",
        prompt: "Explore the main ideologies, philosophies, or theoretical frameworks relevant to [topic]. How did these ideas shape events, motivate participants, or influence outcomes?"
      },
      {
        id: "relationships-connections",
        title: "Cause & Effect Relationships",
        description: "Connections between events, people, and concepts",
        category: "relationships",
        prompt: "Analyze the cause-and-effect relationships within [topic]. How did previous events lead to later developments? Map out connections between key figures, events, and concepts."
      }
    ]
  },
  {
    id: "course-breakdown",
    name: "Academic Course Breakdown",
    description: "Template for breaking down and mapping academic courses and their concepts.",
    components: [
      {
        id: "core-overview",
        title: "Course Overview",
        description: "General context and course objectives",
        category: "core",
        prompt: "Provide a comprehensive overview of the [course], including its objectives, target audience, prerequisites, and general approach. What foundational knowledge does this course build upon, and what outcomes is it designed to achieve?"
      },
      {
        id: "timeline-modules",
        title: "Module Progression",
        description: "Sequential breakdown of course modules",
        category: "timeline",
        prompt: "Create a logical progression of modules for [course], organizing topics in an optimal learning sequence. For each module, identify its purpose, key concepts, and how it builds on previous knowledge."
      },
      {
        id: "concepts-core",
        title: "Core Concepts",
        description: "Fundamental ideas and frameworks",
        category: "concepts",
        prompt: "Identify and explain the core concepts of [course]. What are the fundamental ideas, principles, theories, or frameworks that students must understand? How do these concepts interconnect?"
      },
      {
        id: "people-authorities",
        title: "Key Authorities & Sources",
        description: "Important scholars, researchers, or resources",
        category: "people",
        prompt: "Who are the key authorities, researchers, or scholars relevant to [course]? What seminal works, papers, or resources form the foundation of knowledge in this area?"
      },
      {
        id: "events-applications",
        title: "Practical Applications",
        description: "Real-world applications and case studies",
        category: "events",
        prompt: "Outline practical applications, case studies, or real-world scenarios where concepts from [course] are applied. How does theoretical knowledge translate to practice?"
      }
    ]
  }
];

const TemplateBuilder = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateStructure[]>(defaultTemplates);
  const [activeTemplate, setActiveTemplate] = useState<TemplateStructure | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [showComponentDialog, setShowComponentDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [newComponent, setNewComponent] = useState<Partial<TemplateComponent>>({
    title: "",
    description: "",
    category: "core",
    prompt: ""
  });
  const [newTemplate, setNewTemplate] = useState<Partial<TemplateStructure>>({
    name: "",
    description: "",
    components: []
  });
  const [analysisResults, setAnalysisResults] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle template selection
  const handleSelectTemplate = (template: TemplateStructure) => {
    setActiveTemplate(template);
    setActiveTab("analyze");
    
    // Reset any previous analysis
    setAnalysisResults({});
    setTopicName("");
    setTopicDescription("");
  };

  // Add component to the current template being created
  const handleAddComponent = () => {
    if (!newComponent.title || !newComponent.prompt) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and prompt for the component.",
        variant: "destructive"
      });
      return;
    }

    const component: TemplateComponent = {
      id: `comp-${Date.now()}`,
      title: newComponent.title!,
      description: newComponent.description || "",
      category: newComponent.category as any || "core",
      prompt: newComponent.prompt!
    };

    setNewTemplate({
      ...newTemplate,
      components: [...(newTemplate.components || []), component]
    });

    setNewComponent({
      title: "",
      description: "",
      category: "core",
      prompt: ""
    });

    setShowComponentDialog(false);
  };

  // Save the new template
  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.components || newTemplate.components.length === 0) {
      toast({
        title: "Incomplete Template",
        description: "Please provide a name and at least one component.",
        variant: "destructive"
      });
      return;
    }

    const template: TemplateStructure = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description || "",
      components: newTemplate.components
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: "",
      description: "",
      components: []
    });
    
    toast({
      title: "Template Created",
      description: `"${template.name}" has been added to your templates.`
    });
  };

  // Simulate AI analysis for topic components
  const simulateAIAnalysis = async () => {
    if (!activeTemplate || !topicName) {
      toast({
        title: "Missing Information",
        description: "Please select a template and provide a topic name.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    const results: Record<string, string> = {};

    // Simulate API call to AI service for each component
    for (const component of activeTemplate.components) {
      // Replace placeholder with actual topic
      const processedPrompt = component.prompt.replace("[topic]", topicName).replace("[course]", topicName);
      
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a simulated response for this component
      results[component.id] = generateSimulatedResponse(component.category, topicName, component.title);
    }
    
    setAnalysisResults(results);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `"${topicName}" has been analyzed using the "${activeTemplate.name}" template.`
    });
  };

  // Export analysis as JSON
  const handleExportAnalysis = () => {
    if (!activeTemplate || Object.keys(analysisResults).length === 0) {
      toast({
        title: "Nothing to Export",
        description: "Please complete an analysis first."
      });
      return;
    }

    const exportData = {
      topic: {
        name: topicName,
        description: topicDescription
      },
      template: activeTemplate.name,
      results: analysisResults,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${topicName.replace(/\s+/g, '-').toLowerCase()}-analysis.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Complete",
      description: `Analysis exported as "${exportFileDefaultName}"`
    });
  };

  // Generate a simulated AI response based on category and topic
  const generateSimulatedResponse = (category: string, topic: string, title: string): string => {
    const responses: Record<string, string[]> = {
      core: [
        `${topic} emerged in the late 20th century as a response to increasing needs for structured approaches to complex problems. It encompasses methodologies from various disciplines and has evolved significantly over time.`,
        `${topic} can be understood as a multifaceted domain that combines theoretical principles with practical applications. Its development has been influenced by historical, economic, and social factors.`
      ],
      timeline: [
        `The evolution of ${topic} can be traced through several distinct phases:\n\n1. Early development (1950s-1960s)\n2. Formalization period (1970s-1980s)\n3. Expansion and application (1990s-2000s)\n4. Modern integration (2010s-present)`,
        `Key milestones in the development of ${topic} include:\n\n• Initial theoretical framework (1967)\n• First practical application (1982)\n• Widespread adoption (1995)\n• Integration with digital technologies (2008)`
      ],
      people: [
        `Several influential figures have shaped ${topic}:\n\n• Dr. James Miller - Pioneer who established foundational principles\n• Dr. Sarah Chen - Developed the modern framework in the 1990s\n• Prof. Michael Johnson - Responsible for practical applications\n• Dr. Aisha Patel - Leading current research and innovation`,
        `The development of ${topic} has been driven by a diverse group of researchers and practitioners including Robert Thompson (theoretical foundations), Maria Gonzalez (practical methodologies), and David Kim (contemporary applications).`
      ],
      concepts: [
        `Core concepts within ${topic} include:\n\n• Structural integration - How components interact within a system\n• Functional analysis - Understanding operational dynamics\n• Adaptive mechanisms - Responses to environmental changes\n• Optimization principles - Achieving maximum efficiency`,
        `The theoretical framework of ${topic} rests on several key principles:\n\n1. Systematic organization\n2. Hierarchical structures\n3. Feedback mechanisms\n4. Emergent properties`
      ],
      relationships: [
        `${topic} demonstrates several important relationships:\n\n• Between theory and practice\n• Across disciplinary boundaries\n• Through historical development\n• In various application contexts`,
        `The interconnections within ${topic} reveal a complex network of influences, where theoretical developments inform practical applications, which in turn generate new research questions.`
      ]
    };

    // Select a random response from the appropriate category
    const categoryResponses = responses[category] || responses.core;
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-chronoPurple to-chronoBlue bg-clip-text text-transparent">
        Knowledge Template Builder
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analyze" disabled={!activeTemplate}>Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Templates</h2>
            <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="glass-card">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2 text-muted-foreground">
                    {template.components.length} components
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(template.components.map(c => c.category))).map(category => (
                      <span 
                        key={category} 
                        className="px-2 py-1 text-xs rounded-full bg-chronoPurple/20"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analyze" className="space-y-6">
          {activeTemplate && (
            <>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Analyzing with: {activeTemplate.name}</CardTitle>
                  <CardDescription>{activeTemplate.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic-name">Topic Name</Label>
                    <Input 
                      id="topic-name" 
                      value={topicName} 
                      onChange={(e) => setTopicName(e.target.value)} 
                      placeholder="Enter your topic (e.g., World War II, Machine Learning)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topic-description">Topic Description</Label>
                    <Textarea 
                      id="topic-description" 
                      value={topicDescription} 
                      onChange={(e) => setTopicDescription(e.target.value)} 
                      placeholder="Brief description of the topic"
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("templates")}>
                    Back to Templates
                  </Button>
                  <Button 
                    onClick={simulateAIAnalysis} 
                    disabled={isAnalyzing || !topicName} 
                    className="ml-2"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Topic"}
                  </Button>
                </CardFooter>
              </Card>
              
              {Object.keys(analysisResults).length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Analysis Results</h2>
                    <Button variant="outline" onClick={handleExportAnalysis}>
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  {activeTemplate.components.map(component => (
                    <Card key={component.id} className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{component.title}</CardTitle>
                        <CardDescription>{component.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md p-3 bg-secondary/10">
                          <p className="text-xs text-muted-foreground mb-2">Prompt:</p>
                          <p className="text-sm mb-4">{component.prompt.replace("[topic]", topicName).replace("[course]", topicName)}</p>
                          
                          <div className="border-t pt-3 mt-3">
                            <p className="text-xs text-muted-foreground mb-2">Analysis:</p>
                            {analysisResults[component.id] ? (
                              <p className="text-sm whitespace-pre-line">{analysisResults[component.id]}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Processing...</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog for adding a component to a new template */}
      <Dialog open={showComponentDialog} onOpenChange={setShowComponentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Template Component</DialogTitle>
            <DialogDescription>
              Define a component that will be used to break down the topic.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="component-title">Component Title</Label>
              <Input
                id="component-title"
                value={newComponent.title}
                onChange={(e) => setNewComponent({...newComponent, title: e.target.value})}
                placeholder="e.g., Key Events Timeline"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="component-description">Description</Label>
              <Input
                id="component-description"
                value={newComponent.description}
                onChange={(e) => setNewComponent({...newComponent, description: e.target.value})}
                placeholder="e.g., Chronological sequence of main events"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="component-category">Category</Label>
              <Select
                value={newComponent.category}
                onValueChange={(value) => setNewComponent({...newComponent, category: value as any})}
              >
                <SelectTrigger id="component-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core/Overview</SelectItem>
                  <SelectItem value="timeline">Timeline/Chronology</SelectItem>
                  <SelectItem value="people">People/Figures</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="concepts">Concepts/Ideas</SelectItem>
                  <SelectItem value="relationships">Relationships/Connections</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="component-prompt">AI Analysis Prompt</Label>
              <Textarea
                id="component-prompt"
                value={newComponent.prompt}
                onChange={(e) => setNewComponent({...newComponent, prompt: e.target.value})}
                placeholder="Use [topic] as a placeholder for the user's topic"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use [topic] or [course] as placeholders which will be replaced with the user's input.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComponentDialog(false)}>Cancel</Button>
            <Button onClick={handleAddComponent}>Add Component</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for creating a new template */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Design a template structure for breaking down topics.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="e.g., Historical Event Analysis"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="e.g., A comprehensive framework for analyzing historical events"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Components ({newTemplate.components?.length || 0})</Label>
                <Button size="sm" variant="outline" onClick={() => setShowComponentDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Component
                </Button>
              </div>
              
              {newTemplate.components && newTemplate.components.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {newTemplate.components.map((component, index) => (
                    <div key={index} className="border rounded-md p-3 flex justify-between items-start">
                      <div>
                        <p className="font-medium">{component.title}</p>
                        <p className="text-sm text-muted-foreground">{component.category}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewTemplate({
                            ...newTemplate,
                            components: newTemplate.components?.filter((_, i) => i !== index) || []
                          });
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-6 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No components added yet</p>
                  <p className="text-sm mt-1">Add components to build your template structure</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={!newTemplate.name || !newTemplate.components || newTemplate.components.length === 0}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateBuilder;
