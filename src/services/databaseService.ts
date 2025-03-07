
import { supabase } from '@/integrations/supabase/client';
import { MapNode, MapLink } from '@/types';

/**
 * Fetches maps for the current user
 */
export const getUserMaps = async () => {
  try {
    const { data, error } = await supabase
      .from('maps')
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
      .from('maps')
      .insert([mapData])
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
      .from('map_nodes')
      .delete()
      .eq('map_id', mapId);

    await supabase
      .from('map_links')
      .delete()
      .eq('map_id', mapId);

    // Then delete the map itself
    const { error } = await supabase
      .from('maps')
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
      .from('maps')
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
      .from('map_nodes')
      .select('*')
      .eq('map_id', mapId);

    if (error) throw error;
    return data || [];
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
      .from('map_links')
      .select('*')
      .eq('map_id', mapId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching map links:', error);
    throw error;
  }
};

/**
 * Saves node positions for a map
 */
export const saveMapPositions = async (mapId: string, nodes: any[]) => {
  try {
    // For each node, update its position
    const updates = nodes.map(node => ({
      id: node.id,
      map_id: mapId,
      x: node.x,
      y: node.y,
      // Include other node properties as needed
      name: node.label || node.name,
      type: node.type || 'concept',
      description: node.description || '',
      tags: node.tags || [],
      date: node.date || null
    }));

    // Use upsert to handle both new and existing nodes
    const { error } = await supabase
      .from('map_nodes')
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
export const saveMapLinks = async (mapId: string, links: any[]) => {
  try {
    // For each link, update or create
    const updates = links.map(link => ({
      id: link.id,
      map_id: mapId,
      source: link.source,
      target: link.target,
      type: link.type || 'related',
      description: link.description || ''
    }));

    // Use upsert to handle both new and existing links
    const { error } = await supabase
      .from('map_links')
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
    const { data, error } = await supabase
      .from('map_nodes')
      .insert([{ ...entityData, map_id: mapId }])
      .select()
      .single();

    if (error) throw error;
    return data;
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
      .from('map_nodes')
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
      .from('map_links')
      .delete()
      .or(`source.eq.${entityId},target.eq.${entityId}`);

    // Then delete the entity itself
    const { error } = await supabase
      .from('map_nodes')
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
export const createRelationship = async (mapId: string, relationship: any) => {
  try {
    const { data, error } = await supabase
      .from('map_links')
      .insert([{ ...relationship, map_id: mapId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating relationship:', error);
    throw error;
  }
};

/**
 * Updates a relationship (link) between entities
 */
export const updateRelationship = async (relationshipId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('map_links')
      .update(updates)
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
      .from('map_links')
      .delete()
      .eq('id', relationshipId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting relationship:', error);
    throw error;
  }
};

// Aliases for backward compatibility
export const fetchUserMaps = getUserMaps;
export const createUserMap = createMap;
export const updateUserMap = updateEntity;
export const deleteUserMap = deleteMap;
