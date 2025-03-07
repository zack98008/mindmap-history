
import { MapNode, MapLink } from '@/types';
import { supabase } from "@/integrations/supabase/client";

// Generate a unique ID for nodes (legacy support)
const generateUniqueId = () => {
  return 'node_' + Math.random().toString(36).substr(2, 9);
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
