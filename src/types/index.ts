
export type HistoricalElementType = 'person' | 'event' | 'document' | 'concept' | 'term';

export interface HistoricalElement {
  id: string;
  name: string;
  type: HistoricalElementType;
  date?: string; // YYYY-MM-DD or YYYY or YYYY-MM format
  description: string;
  tags: string[];
  imageUrl?: string;
  year?: number; // Extracted year for timeline/animation
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  description: string;
  type: 'influenced' | 'created' | 'participated' | 'documented' | 'custom';
}

export interface TimelineItem extends HistoricalElement {
  year: number;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  element: HistoricalElement;
  isLocked?: boolean;
  fx?: number | null;
  fy?: number | null;
  isEditing?: boolean;
  layer?: number;
  opacity?: number;
}

export interface MapLink {
  id: string;
  source: string | MapNode;
  target: string | MapNode;
  relationship: Relationship;
  layer?: number;
  opacity?: number;
}

export interface NodeFormData {
  name: string;
  type: HistoricalElementType;
  date: string;
  description: string;
  tags: string;
  imageUrl: string;
  x?: number;
  y?: number;
}

// New template-related types

export interface TemplateComponent {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'timeline' | 'people' | 'events' | 'concepts' | 'relationships';
  prompt: string;
}

export interface TemplateStructure {
  id: string;
  name: string;
  description: string;
  components: TemplateComponent[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  template: TemplateStructure;
  elements: HistoricalElement[];
  relationships: Relationship[];
}

// Add network analysis return type
export interface NetworkAnalysisResult {
  nodes: Set<string>;
  nodeDepths: Map<string, number>;
}
