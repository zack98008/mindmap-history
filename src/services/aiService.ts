
import { HistoricalElement, HistoricalElementType, MapNode, MapLink, Relationship } from '@/types';

// This would be safer to store in an environment variable
// For demo purposes, this is a placeholder - users should replace with their actual key
const API_KEY = "YOUR_GEMINI_API_KEY"; 

interface EntityData {
  name: string;
  type: HistoricalElementType;
  description: string;
  date?: string;
  year?: number;
  tags: string[];
  imageUrl?: string;
}

interface RelationshipData {
  source: string;
  target: string;
  description: string;
  type: "influenced" | "created" | "participated" | "documented" | "custom";
}

interface AnalysisResult {
  entities: EntityData[];
  relationships: RelationshipData[];
}

// Generate a unique ID for nodes
const generateUniqueId = () => {
  return 'node_' + Math.random().toString(36).substr(2, 9);
};

// Convert analysis results into map nodes
export const convertToMapNodes = (results: AnalysisResult): { nodes: MapNode[], links: MapLink[] } => {
  const nodeMap = new Map<string, MapNode>();
  
  // Create nodes from entities
  results.entities.forEach(entity => {
    const id = generateUniqueId();
    const node: MapNode = {
      id,
      x: 100 + Math.random() * 500,  // Random initial positions
      y: 100 + Math.random() * 300,
      element: {
        id,
        name: entity.name,
        type: entity.type,
        description: entity.description,
        date: entity.date,
        year: entity.year,
        tags: entity.tags,
        imageUrl: entity.imageUrl,
      },
      layer: 1,  // Primary layer
      opacity: 1
    };
    nodeMap.set(entity.name, node);
  });
  
  // Create links from relationships
  const links: MapLink[] = results.relationships.map(rel => {
    const sourceNode = nodeMap.get(rel.source);
    const targetNode = nodeMap.get(rel.target);
    
    if (!sourceNode || !targetNode) {
      return null;
    }
    
    const id = `link_${generateUniqueId()}`;
    return {
      id,
      source: sourceNode.id,
      target: targetNode.id,
      relationship: {
        id,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        description: rel.description,
        type: rel.type
      },
      layer: 1,
      opacity: 1
    };
  }).filter(Boolean) as MapLink[];
  
  return {
    nodes: Array.from(nodeMap.values()),
    links
  };
};

export const analyzeText = async (text: string): Promise<{ nodes: MapNode[], links: MapLink[] }> => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: `
          Analyze the following text and extract historical entities (people, events, documents, concepts) and their relationships.
          Return the results in JSON format with two arrays:
          1. "entities" - Each entity should have: name, type (one of: person, event, document, concept), description, date (if applicable), year (numeric), tags (array of strings)
          2. "relationships" - Each relationship should have: source (entity name), target (entity name), description, type (one of: influenced, created, participated, documented, custom)
          
          Format the response ONLY as valid parseable JSON with no other text.
          
          Here's the text to analyze:
          ${text}
          `
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from the AI');
    }
    
    // Find the JSON part using regex (Gemini sometimes adds explanatory text)
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : generatedText;
    
    // Parse the JSON response
    const analysisResult = JSON.parse(jsonStr) as AnalysisResult;
    
    // Convert to our map nodes and links
    return convertToMapNodes(analysisResult);
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};
