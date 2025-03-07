import { MapNode, MapLink } from '@/types';
import { supabase } from "@/integrations/supabase/client";

// Generate a unique ID for nodes (legacy support)
const generateUniqueId = () => {
  return 'node_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Generates a map based on the provided parameters
 */
export const generateMap = async ({
  mapType,
  topic,
  details,
  language = 'en'
}: {
  mapType: 'country' | 'continent' | 'historical' | 'geography' | 'economic';
  topic: string;
  details?: string;
  language?: string;
}) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        mapType,
        topic,
        details,
        language
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate map');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating map:', error);
    throw error;
  }
};

export const analyzeText = async (text: string): Promise<{ nodes: MapNode[], links: MapLink[] }> => {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-text', {
      body: { text }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to analyze text: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from analysis');
    }

    return {
      nodes: data.nodes || [],
      links: data.links || []
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};
