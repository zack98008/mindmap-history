import { supabase } from '@/integrations/supabase/client';
import { HistoricalElement, Relationship, MapNode, MapLink } from '@/types';

// Generate a unique ID for elements
const generateUniqueId = () => {
  return 'elem_' + Math.random().toString(36).substr(2, 9);
};

// Fetch all historical elements
export const fetchHistoricalElements = async (): Promise<HistoricalElement[]> => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .select('*');
    
    if (error) {
      console.error('Error fetching historical elements:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchHistoricalElements:', error);
    return [];
  }
};

// Fetch relationships between elements
export const fetchRelationships = async (): Promise<Relationship[]> => {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('*');
    
    if (error) {
      console.error('Error fetching relationships:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchRelationships:', error);
    return [];
  }
};

// Create a new historical element
export const createHistoricalElement = async (elementData: Omit<HistoricalElement, 'id'>): Promise<HistoricalElement | null> => {
  try {
    const newElement = {
      ...elementData,
      id: generateUniqueId()
    };
    
    const { data, error } = await supabase
      .from('historical_elements')
      .insert(newElement)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating historical element:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createHistoricalElement:', error);
    return null;
  }
};

// Update an existing historical element
export const updateHistoricalElement = async (id: string, updates: Partial<HistoricalElement>): Promise<HistoricalElement | null> => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating historical element:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateHistoricalElement:', error);
    return null;
  }
};

// Delete a historical element
export const deleteHistoricalElement = async (id: string): Promise<boolean> => {
  try {
    // First delete any relationships involving this element
    await supabase
      .from('relationships')
      .delete()
      .or(`sourceId.eq.${id},targetId.eq.${id}`);
    
    // Then delete the element itself
    const { error } = await supabase
      .from('historical_elements')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting historical element:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteHistoricalElement:', error);
    return false;
  }
};

// Create a relationship between elements
export const createRelationship = async (relationshipData: Omit<Relationship, 'id'>): Promise<Relationship | null> => {
  try {
    const newRelationship = {
      ...relationshipData,
      id: generateUniqueId()
    };
    
    const { data, error } = await supabase
      .from('relationships')
      .insert(newRelationship)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createRelationship:', error);
    return null;
  }
};

// Update an existing relationship
export const updateRelationship = async (id: string, updates: Partial<Relationship>): Promise<Relationship | null> => {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating relationship:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateRelationship:', error);
    return null;
  }
};

// Delete a relationship
export const deleteRelationship = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting relationship:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteRelationship:', error);
    return false;
  }
};

// Fetch user maps
export const fetchUserMaps = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select('*');
    
    if (error) {
      console.error('Error fetching maps:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchUserMaps:', error);
    return [];
  }
};

// Create a new map
export const createUserMap = async (name: string, description: string): Promise<any | null> => {
  try {
    const newMap = {
      id: generateUniqueId(),
      name,
      description,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('maps')
      .insert(newMap)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating map:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createUserMap:', error);
    return null;
  }
};

// Update an existing map
export const updateUserMap = async (id: string, name: string, description: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('maps')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating map:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateUserMap:', error);
    return null;
  }
};

// Delete a map
export const deleteUserMap = async (id: string): Promise<boolean> => {
  try {
    // First delete any map nodes and links
    await supabase.from('map_nodes').delete().eq('map_id', id);
    await supabase.from('map_links').delete().eq('map_id', id);
    
    // Then delete the map itself
    const { error } = await supabase
      .from('maps')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting map:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteUserMap:', error);
    return false;
  }
};

// Fetch nodes for a specific map
export const fetchMapNodes = async (mapId: string): Promise<MapNode[]> => {
  try {
    const { data, error } = await supabase
      .from('map_nodes')
      .select(`
        *,
        element:historical_elements(*)
      `)
      .eq('map_id', mapId);
    
    if (error) {
      console.error('Error fetching map nodes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchMapNodes:', error);
    return [];
  }
};

// Fetch links for a specific map
export const fetchMapLinks = async (mapId: string): Promise<MapLink[]> => {
  try {
    const { data, error } = await supabase
      .from('map_links')
      .select(`
        *,
        relationship:relationships(*)
      `)
      .eq('map_id', mapId);
    
    if (error) {
      console.error('Error fetching map links:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchMapLinks:', error);
    return [];
  }
};

// Save map node positions
export const saveMapPositions = async (mapId: string, nodes: MapNode[]): Promise<boolean> => {
  try {
    // First delete existing nodes for this map
    await supabase
      .from('map_nodes')
      .delete()
      .eq('map_id', mapId);
    
    // Then insert the new nodes
    const nodesToInsert = nodes.map(node => ({
      id: generateUniqueId(),
      map_id: mapId,
      element_id: node.element.id,
      x: node.x,
      y: node.y,
      is_locked: node.isLocked || false,
      layer: node.layer || 0,
      opacity: node.opacity || 1
    }));
    
    const { error } = await supabase
      .from('map_nodes')
      .insert(nodesToInsert);
    
    if (error) {
      console.error('Error saving map positions:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveMapPositions:', error);
    return false;
  }
};

// Save map links
export const saveMapLinks = async (mapId: string, links: MapLink[]): Promise<boolean> => {
  try {
    // First delete existing links for this map
    await supabase
      .from('map_links')
      .delete()
      .eq('map_id', mapId);
    
    // Then insert the new links
    const linksToInsert = links.map(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      return {
        id: generateUniqueId(),
        map_id: mapId,
        relationship_id: link.relationship.id,
        source_id: sourceId,
        target_id: targetId,
        layer: link.layer || 0,
        opacity: link.opacity || 1
      };
    });
    
    if (linksToInsert.length > 0) {
      const { error } = await supabase
        .from('map_links')
        .insert(linksToInsert);
      
      if (error) {
        console.error('Error saving map links:', error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveMapLinks:', error);
    return false;
  }
};

// Save a generated map
export const saveGeneratedMap = async (mapData: any): Promise<string | null> => {
  try {
    // Create the map entry
    const { data: mapEntry, error: mapError } = await supabase
      .from('maps')
      .insert({
        id: generateUniqueId(),
        name: mapData.name,
        description: mapData.description || '',
        type: mapData.type,
        config: mapData.mapConfig,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (mapError) {
      console.error('Error creating generated map:', mapError);
      throw mapError;
    }
    
    const mapId = mapEntry.id;
    
    // Process and save nodes
    if (mapData.nodes && mapData.nodes.length > 0) {
      const nodesToInsert = mapData.nodes.map((node: any) => ({
        id: generateUniqueId(),
        map_id: mapId,
        element_id: node.id,
        x: node.x,
        y: node.y,
        is_locked: false,
        layer: 0,
        opacity: 1
      }));
      
      const { error: nodesError } = await supabase
        .from('map_nodes')
        .insert(nodesToInsert);
      
      if (nodesError) {
        console.error('Error saving generated map nodes:', nodesError);
        throw nodesError;
      }
    }
    
    // Process and save links
    if (mapData.links && mapData.links.length > 0) {
      const linksToInsert = mapData.links.map((link: any) => ({
        id: generateUniqueId(),
        map_id: mapId,
        relationship_id: link.id,
        source_id: link.source,
        target_id: link.target,
        layer: 0,
        opacity: 1
      }));
      
      const { error: linksError } = await supabase
        .from('map_links')
        .insert(linksToInsert);
      
      if (linksError) {
        console.error('Error saving generated map links:', linksError);
        throw linksError;
      }
    }
    
    return mapId;
  } catch (error) {
    console.error('Error in saveGeneratedMap:', error);
    return null;
  }
};
