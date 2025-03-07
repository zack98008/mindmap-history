
/**
 * Additional types used by components
 */

export interface ExtendedNetworkData {
  nodes: Set<string>;
  nodeDepths: Map<string, number>;
  centralNodes?: string[];
  bridgeNodes?: string[];
  peripheralNodes?: string[];
}

export type UpdateNodesFunction = (
  nodes: any[], 
  options?: { 
    animate?: boolean;
    updatePosition?: boolean;
    highlightIds?: string[];
  }
) => void;

export type UpdateLinksFunction = (
  links: any[], 
  options?: { 
    animate?: boolean;
    highlightIds?: string[];
  }
) => void;
