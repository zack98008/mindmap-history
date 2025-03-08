
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type MapType = 'country' | 'continent' | 'historical' | 'geography' | 'economic';

interface MapGenerationRequest {
  type: MapType;
  region?: string;
  language?: string;
  era?: string; // For historical maps
  dataPoints?: string[]; // For economic maps
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, region, language = 'ar', era, dataPoints } = await req.json() as MapGenerationRequest;
    
    console.log(`Generating ${type} map for ${region || 'global'} in ${language} language`);
    
    // In a real implementation, you would use a mapping service API or similar
    // This is a simplified response with placeholder data
    let mapData;
    
    switch (type) {
      case 'country':
        mapData = generateCountryMap(region || '', language);
        break;
      case 'continent':
        mapData = generateContinentMap(region || '', language);
        break;
      case 'historical':
        mapData = generateHistoricalMap(region || '', era || '', language);
        break;
      case 'geography':
        mapData = generateGeographyMap(region || '', language);
        break;
      case 'economic':
        mapData = generateEconomicMap(region || '', dataPoints || [], language);
        break;
      default:
        throw new Error(`Unsupported map type: ${type}`);
    }

    return new Response(JSON.stringify({
      success: true,
      mapData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating map:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Placeholder functions for generating different map types
function generateCountryMap(country: string, language: string) {
  return {
    type: 'country',
    name: country,
    language,
    nodes: generatePlaceholderNodes(10, country),
    links: generatePlaceholderLinks(7),
    mapConfig: {
      projection: 'mercator',
      center: [0, 0],
      zoom: 3
    }
  };
}

function generateContinentMap(continent: string, language: string) {
  return {
    type: 'continent',
    name: continent,
    language,
    nodes: generatePlaceholderNodes(15, continent),
    links: generatePlaceholderLinks(12),
    mapConfig: {
      projection: 'mercator',
      center: [0, 0],
      zoom: 2
    }
  };
}

function generateHistoricalMap(region: string, era: string, language: string) {
  return {
    type: 'historical',
    name: `${region} - ${era}`,
    language,
    era,
    nodes: generatePlaceholderNodes(20, `${region} (${era})`),
    links: generatePlaceholderLinks(15),
    mapConfig: {
      projection: 'mercator',
      center: [0, 0],
      zoom: 4,
      time: era
    }
  };
}

function generateGeographyMap(region: string, language: string) {
  return {
    type: 'geography',
    name: region,
    language,
    nodes: generatePlaceholderNodes(12, region),
    links: generatePlaceholderLinks(8),
    features: [
      { type: 'river', name: 'نهر النيل', coordinates: [[31.2, 30.0], [31.5, 30.5]] },
      { type: 'mountain', name: 'جبل', coordinates: [35.0, 32.0] },
      { type: 'desert', name: 'صحراء', coordinates: [25.0, 28.0] }
    ],
    mapConfig: {
      projection: 'mercator',
      center: [0, 0],
      zoom: 3
    }
  };
}

function generateEconomicMap(region: string, dataPoints: string[], language: string) {
  return {
    type: 'economic',
    name: region,
    language,
    nodes: generatePlaceholderNodes(8, region),
    links: generatePlaceholderLinks(5),
    econData: {
      gdp: { value: 350, unit: 'billion USD' },
      resources: ['oil', 'gas', 'agriculture'],
      tradeRoutes: [
        { from: 'City A', to: 'City B', value: 120 },
        { from: 'City A', to: 'City C', value: 85 }
      ]
    },
    mapConfig: {
      projection: 'mercator',
      center: [0, 0],
      zoom: 3
    }
  };
}

// Helper functions to generate placeholder data
function generatePlaceholderNodes(count: number, prefix: string) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      id: `node_${i}`,
      name: `${prefix}_${i}`,
      type: i % 2 === 0 ? 'city' : 'landmark',
      x: Math.random() * 500,
      y: Math.random() * 300,
      data: {
        population: Math.floor(Math.random() * 1000000),
        description: `Description for ${prefix}_${i}`
      }
    });
  }
  return nodes;
}

function generatePlaceholderLinks(count: number) {
  const links = [];
  for (let i = 0; i < count; i++) {
    links.push({
      id: `link_${i}`,
      source: `node_${i % 5}`,
      target: `node_${(i + 1) % 5}`,
      type: i % 3 === 0 ? 'road' : 'border',
      data: {
        distance: Math.floor(Math.random() * 1000),
        description: `Link description ${i}`
      }
    });
  }
  return links;
}
