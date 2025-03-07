
import { HistoricalElement, HistoricalElementType, MapNode, MapLink, Relationship, NetworkAnalysisResult } from '@/types';
import { supabase } from "@/integrations/supabase/client";

// Generate a unique ID for nodes
const generateUniqueId = () => {
  return 'node_' + Math.random().toString(36).substr(2, 9);
};

// Set the API key in localStorage (legacy support)
export const setApiKey = (key: string): void => {
  localStorage.setItem('gemini_api_key', key);
};

// Get the API key from localStorage (legacy support)
export const getApiKey = (): string => {
  return localStorage.getItem('gemini_api_key') || "";
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
