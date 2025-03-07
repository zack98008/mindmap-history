
// Extended network data type
export type ExtendedNetworkData = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: string;
  date?: string;
  description?: string;
  linkedNodes?: string[];
  color?: string;
  size?: number;
  image?: string;
  [key: string]: any;
};

// Network update function types
export type UpdateNodesFunction = (callback: (nodes: any[]) => any[]) => void;
export type UpdateLinksFunction = (callback: (links: any[]) => any[]) => void;

// Declare global functions for backwards compatibility
declare global {
  function updateNodes(callback: (nodes: any[]) => any[]): void;
  function updateLinks(callback: (links: any[]) => any[]): void;
}
