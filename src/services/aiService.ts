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
  language = 'ar'
}: {
  mapType: 'country' | 'continent' | 'historical' | 'geography' | 'economic';
  topic: string;
  details?: string;
  language?: string;
}) => {
  try {
    // Log parameters for debugging
    console.log('Generating map with params:', { mapType, topic, details, language });
    
    // Construct the URL with explicit string interpolation for validation
    const functionUrl = `https://bobmufpidfiukwphihmh.supabase.co/functions/v1/generate-map`;
    console.log('Function URL:', functionUrl);
    
    // Log auth token (just first few chars for security)
    const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYm11ZnBpZGZpdWt3cGhpaG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMzg3MjIsImV4cCI6MjA1NjkxNDcyMn0.rgnO1t5uj1mE8v83Xq8vWOHk6grDpmzHQOuTub5HxDM";
    console.log('Auth token (first 5 chars):', authToken?.substring(0, 5));
    
    // Make the request with improved error handling
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        mapType,
        topic,
        details,
        language
      })
    });
    
    // Clone the response to avoid consuming it more than once
    const responseClone = response.clone();
    
    // Get the raw response for debugging
    const rawResponse = await responseClone.text();
    console.log('Raw response status:', response.status, response.statusText);
    console.log('Raw response first 100 chars:', rawResponse.substring(0, 100));
    
    // Check if response starts with HTML doctype (the error case)
    if (rawResponse.trim().startsWith('<!DOCTYPE')) {
      console.error('Received HTML instead of JSON. Full response:', rawResponse);
      const errorMessage = language === 'ar'
        ? 'فشل في إنشاء الخريطة: استجابة غير صالحة من الخادم'
        : 'Failed to generate map: Invalid response from server';
      throw new Error(errorMessage);
    }
    
    // Check if response is not OK
    if (!response.ok) {
      try {
        // Try to parse the error as JSON
        const errorData = JSON.parse(rawResponse);
        const errorMessage = language === 'ar'
          ? errorData.error || 'فشل في إنشاء الخريطة'
          : errorData.error || 'Failed to generate map';
        throw new Error(errorMessage);
      } catch (parseError) {
        // If JSON parsing fails, use status text
        const errorMessage = language === 'ar'
          ? `فشل في إنشاء الخريطة: ${response.status} ${response.statusText}`
          : `Failed to generate map: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
    }
    
    // Parse the successful response
    try {
      const data = JSON.parse(rawResponse);
      return data;
    } catch (parseError) {
      console.error('Failed to parse successful response as JSON:', parseError);
      const errorMessage = language === 'ar'
        ? 'فشل في معالجة البيانات المستلمة'
        : 'Failed to process received data';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error generating map:', error);
    throw error;
  }
};

/**
 * Analyzes text and generates map nodes and links
 */
export const analyzeText = async (text: string, language = 'ar'): Promise<{ nodes: MapNode[], links: MapLink[] }> => {
  try {
    console.log('Analyzing text, length:', text.length);
    
    // Call the Supabase Edge Function directly with fetch instead of using the SDK
    // This helps isolate if the issue is with the SDK or the function itself
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-text`;
    const authToken = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ text, language })
    });
    
    // Clone the response to avoid consuming it more than once
    const responseClone = response.clone();
    
    // Get raw response for debugging
    const rawResponse = await responseClone.text();
    console.log('Raw analyze-text response status:', response.status, response.statusText);
    console.log('Raw analyze-text response first 100 chars:', rawResponse.substring(0, 100));
    
    // Check if response starts with HTML doctype (the error case)
    if (rawResponse.trim().startsWith('<!DOCTYPE')) {
      console.error('Received HTML instead of JSON in analyze-text. Response:', rawResponse);
      const errorMessage = language === 'ar'
        ? 'فشل في تحليل النص: استجابة غير صالحة من الخادم'
        : 'Failed to analyze text: Invalid response from server';
      throw new Error(errorMessage);
    }
    
    // If response is not OK, try to parse error
    if (!response.ok) {
      try {
        const errorData = JSON.parse(rawResponse);
        const errorMessage = language === 'ar'
          ? `فشل في تحليل النص: ${errorData.error || 'خطأ غير معروف'}`
          : `Failed to analyze text: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMessage);
      } catch (parseError) {
        const errorMessage = language === 'ar'
          ? `فشل في تحليل النص: ${response.status} ${response.statusText}`
          : `Failed to analyze text: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
    }
    
    // Parse successful response
    try {
      const data = JSON.parse(rawResponse);
      return {
        nodes: data.nodes || [],
        links: data.links || []
      };
    } catch (parseError) {
      console.error('Failed to parse analyze-text response as JSON:', parseError);
      const errorMessage = language === 'ar'
        ? 'فشل في معالجة بيانات التحليل'
        : 'Failed to process analysis data';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};

// Alternative implementation using the Supabase SDK
export const analyzeTextWithSDK = async (text: string, language = 'ar'): Promise<{ nodes: MapNode[], links: MapLink[] }> => {
  try {
    // Call the Supabase Edge Function using the SDK
    const { data, error } = await supabase.functions.invoke('analyze-text', {
      body: { text, language }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      const errorMessage = language === 'ar'
        ? `فشل في تحليل النص: ${error.message}`
        : `Failed to analyze text: ${error.message}`;
      throw new Error(errorMessage);
    }
    
    if (!data) {
      const errorMessage = language === 'ar'
        ? 'لم يتم إرجاع أي بيانات من التحليل'
        : 'No data returned from analysis';
      throw new Error(errorMessage);
    }
    
    return {
      nodes: data.nodes || [],
      links: data.links || []
    };
  } catch (error) {
    console.error('Error analyzing text with SDK:', error);
    throw error;
  }
};
