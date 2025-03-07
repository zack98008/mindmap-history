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
    
    // Check if response is OK
    if (!response.ok) {
      // Try to get the text content first to see what's being returned
      const responseText = await response.text();
      console.error('Raw error response:', responseText);
      
      // Try to parse as JSON if possible
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = language === 'ar' 
          ? errorData.error || 'فشل في إنشاء الخريطة' 
          : errorData.error || 'Failed to generate map';
        throw new Error(errorMessage);
      } catch (parseError) {
        // If parsing fails, use the status text
        const errorMessage = language === 'ar'
          ? `فشل في إنشاء الخريطة: ${response.status} ${response.statusText}`
          : `Failed to generate map: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
    }
    
    // Parse the successful response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating map:', error);
    throw error;
  }
};
