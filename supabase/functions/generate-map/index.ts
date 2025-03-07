
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3';

// Types for the function
type MapType = 'country' | 'continent' | 'historical' | 'geography' | 'economic';

interface MapRequest {
  mapType: MapType;
  topic: string;
  details?: string;
  language?: string;
}

interface MapNode {
  id: string;
  name: string;
  type: 'person' | 'event' | 'document' | 'concept' | 'term';
  date?: string;
  description: string;
  tags: string[];
  x: number;
  y: number;
}

interface MapLink {
  source: string;
  target: string;
  type: string;
  description: string;
}

interface GeneratedMap {
  title: string;
  description: string;
  nodes: MapNode[];
  links: MapLink[];
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Google AI
const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

serve(async (req) => {
  // Enable CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    });
  }

  try {
    // Parse request body
    const request: MapRequest = await req.json();
    const { mapType, topic, details = '', language = 'en' } = request;

    // Input validation
    if (!mapType || !topic) {
      return new Response(
        JSON.stringify({ error: 'Map type and topic are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate map using AI
    const generatedMap = await generateMap(mapType, topic, details, language);

    // Return the generated map
    return new Response(
      JSON.stringify(generatedMap),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});

async function generateMap(
  mapType: MapType, 
  topic: string, 
  details: string,
  language: string
): Promise<GeneratedMap> {
  // Prepare prompt based on map type
  let prompt = '';
  const langPrompt = language !== 'en' ? `Please respond in ${language}. ` : '';

  switch (mapType) {
    case 'country':
      prompt = `${langPrompt}Create a knowledge map about the country "${topic}". Include nodes for key cities, geographical features, cultural aspects, important historical events, political structure, economy, and relationships with neighboring countries.`;
      break;
    case 'continent':
      prompt = `${langPrompt}Create a knowledge map about the continent "${topic}". Include nodes for major countries, geographical features, cultural regions, historical periods, economic zones, and political alliances.`;
      break;
    case 'historical':
      prompt = `${langPrompt}Create a historical knowledge map about "${topic}". Include nodes for key events, influential people, important documents, major time periods, social movements, and cultural impacts.`;
      break;
    case 'geography':
      prompt = `${langPrompt}Create a geographical knowledge map about "${topic}". Include nodes for landforms, water bodies, climate zones, ecosystems, natural resources, and human settlements.`;
      break;
    case 'economic':
      prompt = `${langPrompt}Create an economic knowledge map about "${topic}". Include nodes for industries, trade relationships, resources, economic policies, financial institutions, and key market factors.`;
      break;
  }

  // Add user details if provided
  if (details) {
    prompt += ` Additional details to consider: ${details}.`;
  }

  // Format requirements
  prompt += ` 
  
  Format your response as a JSON object with the following structure:
  {
    "title": "Map title",
    "description": "Brief description of this map",
    "nodes": [
      {
        "id": "unique-id-1",
        "name": "Node Name",
        "type": "concept", // One of: person, event, document, concept, term
        "description": "Brief description",
        "tags": ["tag1", "tag2"],
        "date": "YYYY-MM-DD", // Optional, for historical elements
        "x": 100, // Random position between 0-1000
        "y": 200 // Random position between 0-1000
      }
      // More nodes...
    ],
    "links": [
      {
        "source": "unique-id-1", // ID of source node
        "target": "unique-id-2", // ID of target node
        "type": "influences", // Relationship type
        "description": "Brief description of relationship"
      }
      // More links...
    ]
  }
  
  Create at least 15 nodes and appropriate connections between them. Make sure all node IDs are unique and all links reference valid node IDs. Position nodes randomly between coordinates (0,0) and (1000,1000).`;

  try {
    // Generate content with Google Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/{[\s\S]*}/) || 
                      text.match(/\{[\s\S]*?\}/);
                      
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }

    const jsonString = jsonMatch[0].replace(/```json\n|```/g, '').trim();
    const mapData = JSON.parse(jsonString) as GeneratedMap;

    return mapData;
  } catch (error) {
    console.error('Error generating map:', error);
    throw new Error(`Failed to generate map: ${error.message}`);
  }
}
