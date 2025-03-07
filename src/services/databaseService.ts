
import { supabase } from '@/integrations/supabase/client';
import { HistoricalElement, MapNode, MapLink, Relationship, HistoricalElementType } from '@/types';

// Helper functions for type casting
const castToHistoricalElement = (element: any): HistoricalElement => {
  return {
    id: element.id,
    name: element.name,
    type: element.type as HistoricalElementType,
    date: element.date,
    description: element.description || '',
    tags: element.tags || [],
    imageUrl: element.image_url,
    year: element.year
  };
};

const castToRelationship = (relation: any): Relationship => {
  return {
    id: relation.id,
    sourceId: relation.source_id,
    targetId: relation.target_id,
    description: relation.description || '',
    type: relation.type as 'influenced' | 'created' | 'participated' | 'documented' | 'custom'
  };
};

// Fetch all historical elements
export const fetchHistoricalElements = async (): Promise<HistoricalElement[]> => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .select('*');

    if (error) throw error;

    return (data || []).map(castToHistoricalElement);
  } catch (error) {
    console.error('Error fetching historical elements:', error);
    return [];
  }
};

// Fetch relationships
export const fetchRelationships = async (): Promise<Relationship[]> => {
  try {
    const { data, error } = await supabase
      .from('element_relationships')
      .select('*');

    if (error) throw error;

    return (data || []).map(castToRelationship);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return [];
  }
};

// Create a new historical element
export const createHistoricalElement = async (element: Omit<HistoricalElement, 'id'>): Promise<HistoricalElement | null> => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .insert({
        name: element.name,
        type: element.type,
        date: element.date,
        description: element.description,
        tags: element.tags,
        image_url: element.imageUrl,
        year: element.year
      })
      .select()
      .single();

    if (error) throw error;

    return castToHistoricalElement(data);
  } catch (error) {
    console.error('Error creating historical element:', error);
    return null;
  }
};

// Update a historical element
export const updateHistoricalElement = async (id: string, updates: Partial<HistoricalElement>): Promise<HistoricalElement | null> => {
  try {
    const updateData: any = {
      name: updates.name,
      description: updates.description,
      date: updates.date,
      tags: updates.tags
    };

    if (updates.type) updateData.type = updates.type;
    if (updates.imageUrl) updateData.image_url = updates.imageUrl;
    if (updates.year) updateData.year = updates.year;

    const { data, error } = await supabase
      .from('historical_elements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return castToHistoricalElement(data);
  } catch (error) {
    console.error('Error updating historical element:', error);
    return null;
  }
};

// Delete a historical element
export const deleteHistoricalElement = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('historical_elements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting historical element:', error);
    return false;
  }
};

// Create a relationship between two elements
export const createRelationship = async (relationship: Omit<Relationship, 'id'>): Promise<Relationship | null> => {
  try {
    const { data, error } = await supabase
      .from('element_relationships')
      .insert({
        source_id: relationship.sourceId,
        target_id: relationship.targetId,
        type: relationship.type,
        description: relationship.description
      })
      .select()
      .single();

    if (error) throw error;

    return castToRelationship(data);
  } catch (error) {
    console.error('Error creating relationship:', error);
    return null;
  }
};

// Delete a relationship
export const deleteRelationship = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('element_relationships')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return false;
  }
};

// Get user maps
export const getUserMaps = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .select('*');

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user maps:', error);
    return [];
  }
};

// Create a new map
export const createMap = async (map: { name: string; description?: string }): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .insert({
        name: map.name,
        description: map.description || ''
      })
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating map:', error);
    return null;
  }
};

// Delete a map
export const deleteMap = async (mapId: string): Promise<boolean> => {
  try {
    // First delete all relationships and nodes associated with this map
    await Promise.all([
      supabase.from('map_elements').delete().eq('map_id', mapId),
      supabase.from('map_relationships').delete().eq('map_id', mapId)
    ]);

    // Then delete the map itself
    const { error } = await supabase
      .from('user_maps')
      .delete()
      .eq('id', mapId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting map:', error);
    return false;
  }
};

// Get map details
export const getMapById = async (mapId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .select('*')
      .eq('id', mapId)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching map details:', error);
    return null;
  }
};

// Get map nodes and links
export const getMapData = async (mapId: string): Promise<{ nodes: MapNode[], links: MapLink[] }> => {
  try {
    // Fetch map elements
    const { data: elementsData, error: elementsError } = await supabase
      .from('map_elements')
      .select(`
        id,
        x_position,
        y_position,
        layer,
        element_id,
        element:historical_elements(*)
      `)
      .eq('map_id', mapId);

    if (elementsError) throw elementsError;

    const mapNodes: MapNode[] = (elementsData || []).map((node: any) => ({
      id: node.id,
      x: node.x_position,
      y: node.y_position,
      element: castToHistoricalElement(node.element),
      layer: node.layer || 1
    }));

    // Fetch map relationships
    const { data: relationsData, error: relationsError } = await supabase
      .from('map_relationships')
      .select(`
        id,
        relationship_id,
        relationship:element_relationships(*)
      `)
      .eq('map_id', mapId);

    if (relationsError) throw relationsError;

    const mapLinks: MapLink[] = (relationsData || []).map((link: any) => {
      const relationship = castToRelationship(link.relationship);
      return {
        id: link.id,
        source: relationship.sourceId,
        target: relationship.targetId,
        relationship: relationship
      };
    });

    return { nodes: mapNodes, links: mapLinks };
  } catch (error) {
    console.error('Error fetching map data:', error);
    return { nodes: [], links: [] };
  }
};

// Add node to map
export const addNodeToMap = async (mapId: string, node: {
  element_id: string;
  x_position: number;
  y_position: number;
  layer?: number;
}): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('map_elements')
      .insert({
        map_id: mapId,
        element_id: node.element_id,
        x_position: node.x_position,
        y_position: node.y_position,
        layer: node.layer || 1
      })
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error adding node to map:', error);
    return null;
  }
};

// Update node position
export const updateNodePosition = async (nodeId: string, position: { x: number; y: number }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('map_elements')
      .update({
        x_position: position.x,
        y_position: position.y
      })
      .eq('id', nodeId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating node position:', error);
    return false;
  }
};

// Add link to map
export const addLinkToMap = async (mapId: string, relationshipId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('map_relationships')
      .insert({
        map_id: mapId,
        relationship_id: relationshipId
      })
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error adding link to map:', error);
    return null;
  }
};

// Remove node from map
export const removeNodeFromMap = async (nodeId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('map_elements')
      .delete()
      .eq('id', nodeId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing node from map:', error);
    return false;
  }
};

// Remove link from map
export const removeLinkFromMap = async (linkId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('map_relationships')
      .delete()
      .eq('id', linkId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing link from map:', error);
    return false;
  }
};

// Update the supabase/functions/generate-map/index.ts file to support map generation
