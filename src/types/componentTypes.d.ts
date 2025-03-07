
declare type ExtendedNetworkData = {
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

declare function updateNodes(callback: (nodes: any[]) => any[]): void;
declare function updateLinks(callback: (links: any[]) => any[]): void;
