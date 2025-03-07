
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
  // Added for D3 force simulation
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  // Added for animations
  originalX?: number;
  originalY?: number;
  targetX?: number;
  targetY?: number;
  animating?: boolean;
  // Added for relationship layers
  layer?: number; // 1 = direct, 2 = secondary, 3 = tertiary
  opacity?: number;
  // Added for node editing
  isEditing?: boolean;
}

export interface MapLink {
  id: string;
  source: string | MapNode;
  target: string | MapNode;
  relationship: Relationship;
  // Added for animations
  animating?: boolean;
  opacity?: number;
  // Added for relationship layers
  layer?: number; // 1 = direct, 2 = secondary, 3 = tertiary
}

export interface NodeFormData {
  name: string;
  type: HistoricalElementType;
  date: string;
  description: string;
  tags: string;
  imageUrl: string;
}
