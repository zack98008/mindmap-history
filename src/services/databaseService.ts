
import { supabase } from '@/integrations/supabase/client';
import { MapNode, MapLink, HistoricalElement, Relationship } from '@/types';

/**
 * Fetches maps for the current user
 */
export const getUserMaps = async () => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching maps:', error);
    throw error;
  }
};

/**
 * Creates a new map
 */
export const createMap = async (mapData: { title: string; description: string; language?: string }) => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .insert([{ name: mapData.title, description: mapData.description }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating map:', error);
    throw error;
  }
};

/**
 * Deletes a map by ID
 */
export const deleteMap = async (mapId: string) => {
  try {
    // First delete all nodes and links associated with this map
    await supabase
      .from('map_elements')
      .delete()
      .eq('map_id', mapId);

    await supabase
      .from('map_relationships')
      .delete()
      .eq('map_id', mapId);

    // Then delete the map itself
    const { error } = await supabase
      .from('user_maps')
      .delete()
      .eq('id', mapId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting map:', error);
    throw error;
  }
};

/**
 * Fetches map details by ID
 */
export const getMapById = async (mapId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .select('*')
      .eq('id', mapId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching map:', error);
    throw error;
  }
};

/**
 * Fetches nodes for a specific map
 */
export const fetchMapNodes = async (mapId: string): Promise<MapNode[]> => {
  try {
    const { data, error } = await supabase
      .from('map_elements')
      .select('*, element_id(*)')
      .eq('map_id', mapId);

    if (error) throw error;
    
    // Transform the data to match the MapNode interface
    const mapNodes: MapNode[] = (data || []).map(item => ({
      id: item.id,
      x: item.x_position || 0,
      y: item.y_position || 0,
      element: item.element_id as unknown as HistoricalElement,
      layer: item.layer || 1
    }));
    
    return mapNodes;
  } catch (error) {
    console.error('Error fetching map nodes:', error);
    throw error;
  }
};

/**
 * Fetches links for a specific map
 */
export const fetchMapLinks = async (mapId: string): Promise<MapLink[]> => {
  try {
    const { data, error } = await supabase
      .from('map_relationships')
      .select('*, relationship_id(*)')
      .eq('map_id', mapId);

    if (error) throw error;
    
    // Transform the data to match the MapLink interface
    const mapLinks: MapLink[] = (data || []).map(item => ({
      id: item.id,
      source: item.relationship_id?.source_id || '',
      target: item.relationship_id?.target_id || '',
      relationship: {
        id: item.relationship_id?.id || '',
        sourceId: item.relationship_id?.source_id || '',
        targetId: item.relationship_id?.target_id || '',
        description: item.relationship_id?.description || '',
        type: (item.relationship_id?.type as 'influenced' | 'created' | 'participated' | 'documented' | 'custom') || 'custom'
      }
    }));
    
    return mapLinks;
  } catch (error) {
    console.error('Error fetching map links:', error);
    throw error;
  }
};

/**
 * Saves node positions for a map
 */
export const saveMapPositions = async (mapId: string, nodes: MapNode[]) => {
  try {
    // For each node, update its position
    const updates = nodes.map(node => ({
      id: node.id,
      map_id: mapId,
      x_position: node.x,
      y_position: node.y,
      element_id: node.element.id,
      layer: node.layer || 1
    }));

    // Use upsert to handle both new and existing nodes
    const { error } = await supabase
      .from('map_elements')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving map positions:', error);
    throw error;
  }
};

/**
 * Saves links for a map
 */
export const saveMapLinks = async (mapId: string, links: MapLink[]) => {
  try {
    // For each link, update or create
    const updates = links.map(link => ({
      id: link.id,
      map_id: mapId,
      relationship_id: typeof link.relationship === 'object' ? link.relationship.id : link.relationship
    }));

    // Use upsert to handle both new and existing links
    const { error } = await supabase
      .from('map_relationships')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving map links:', error);
    throw error;
  }
};

/**
 * Creates a new entity (node) for a map
 */
export const createEntity = async (mapId: string, entityData: any) => {
  try {
    // First create the historical element
    const { data: element, error: elementError } = await supabase
      .from('historical_elements')
      .insert([entityData])
      .select()
      .single();

    if (elementError) throw elementError;

    // Then create the map element
    const { data: mapElement, error: mapElementError } = await supabase
      .from('map_elements')
      .insert([{
        map_id: mapId,
        element_id: element.id,
        x_position: entityData.x || 0,
        y_position: entityData.y || 0
      }])
      .select()
      .single();

    if (mapElementError) throw mapElementError;

    return {
      ...element,
      id: mapElement.id,
      x: mapElement.x_position,
      y: mapElement.y_position,
      element: element
    };
  } catch (error) {
    console.error('Error creating entity:', error);
    throw error;
  }
};

/**
 * Updates an entity (node) in a map
 */
export const updateEntity = async (entityId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .update(updates)
      .eq('id', entityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating entity:', error);
    throw error;
  }
};

/**
 * Deletes an entity (node) from a map
 */
export const deleteEntity = async (entityId: string) => {
  try {
    // First delete any relationships involving this entity
    await supabase
      .from('element_relationships')
      .delete()
      .or(`source_id.eq.${entityId},target_id.eq.${entityId}`);

    // Delete map elements
    await supabase
      .from('map_elements')
      .delete()
      .eq('element_id', entityId);

    // Then delete the entity itself
    const { error } = await supabase
      .from('historical_elements')
      .delete()
      .eq('id', entityId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting entity:', error);
    throw error;
  }
};

/**
 * Creates a relationship (link) between entities
 */
export const createRelationship = async (relationship: { sourceId: string; targetId: string; type: string; description: string }) => {
  try {
    const { data, error } = await supabase
      .from('element_relationships')
      .insert([{ 
        source_id: relationship.sourceId, 
        target_id: relationship.targetId,
        type: relationship.type,
        description: relationship.description
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Transform to match Relationship interface
    const transformedData: Relationship = {
      id: data.id,
      sourceId: data.source_id,
      targetId: data.target_id,
      type: data.type as 'influenced' | 'created' | 'participated' | 'documented' | 'custom',
      description: data.description
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error creating relationship:', error);
    throw error;
  }
};

/**
 * Updates a relationship (link) between entities
 */
export const updateRelationship = async (relationshipId: string, updates: Partial<Relationship>) => {
  try {
    // Convert from our interface format to the database format
    const dbUpdates = {
      ...(updates.sourceId && { source_id: updates.sourceId }),
      ...(updates.targetId && { target_id: updates.targetId }),
      ...(updates.type && { type: updates.type }),
      ...(updates.description !== undefined && { description: updates.description })
    };
    
    const { data, error } = await supabase
      .from('element_relationships')
      .update(dbUpdates)
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) throw error;
    
    // Transform to match Relationship interface
    const transformedData: Relationship = {
      id: data.id,
      sourceId: data.source_id,
      targetId: data.target_id,
      type: data.type as 'influenced' | 'created' | 'participated' | 'documented' | 'custom',
      description: data.description
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error updating relationship:', error);
    throw error;
  }
};

/**
 * Deletes a relationship (link) between entities
 */
export const deleteRelationship = async (relationshipId: string) => {
  try {
    const { error } = await supabase
      .from('element_relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting relationship:', error);
    throw error;
  }
};

// Add these functions as aliases to match what's being imported
export const fetchHistoricalElements = async () => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching historical elements:', error);
    throw error;
  }
};

export const fetchRelationships = async () => {
  try {
    const { data, error } = await supabase
      .from('element_relationships')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching relationships:', error);
    throw error;
  }
};

export const createHistoricalElement = async (elementData: Omit<HistoricalElement, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .insert([elementData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating historical element:', error);
    throw error;
  }
};

export const updateHistoricalElement = async (id: string, updates: Partial<HistoricalElement>) => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating historical element:', error);
    throw error;
  }
};

export const deleteHistoricalElement = async (id: string) => {
  try {
    const { error } = await supabase
      .from('historical_elements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting historical element:', error);
    throw error;
  }
};

// Aliases for backward compatibility
export const fetchUserMaps = getUserMaps;
export const createUserMap = async (name: string, description: string) => {
  return createMap({ title: name, description });
};
export const updateUserMap = updateEntity;
export const deleteUserMap = deleteMap;
