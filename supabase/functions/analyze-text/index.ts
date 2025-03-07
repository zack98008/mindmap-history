
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EntityData {
  name: string;
  type: string;
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
const convertToMapNodes = (results: AnalysisResult) => {
  const nodeMap = new Map();
  
  // Create nodes from entities
  results.entities.forEach(entity => {
    const id = generateUniqueId();
    const node = {
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
  const links = results.relationships.map(rel => {
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
  }).filter(Boolean);
  
  return {
    nodes: Array.from(nodeMap.values()),
    links
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: "No text provided for analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize the Gemini API with the API key stored in environment variable
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY environment variable is not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      Analyze the following text and extract historical entities (people, events, documents, concepts) and their relationships.
      Return the results in JSON format with two arrays:
      1. "entities" - Each entity should have: name, type (one of: person, event, document, concept), description, date (if applicable), year (numeric), tags (array of strings)
      2. "relationships" - Each relationship should have: source (entity name), target (entity name), description, type (one of: influenced, created, participated, documented, custom)
      
      Format the response ONLY as valid parseable JSON with no other text.
      
      Here's the text to analyze:
      ${text}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Find the JSON part using regex (Gemini sometimes adds explanatory text)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : textResponse;
    
    try {
      // Parse the JSON response
      const analysisResult = JSON.parse(jsonStr) as AnalysisResult;
      
      // Convert to our map nodes and links
      const mapData = convertToMapNodes(analysisResult);
      
      return new Response(
        JSON.stringify(mapData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse model response", 
          rawResponse: textResponse 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
