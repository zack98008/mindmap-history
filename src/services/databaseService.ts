
import { supabase } from "@/integrations/supabase/client";
import { 
  HistoricalElement, 
  Relationship, 
  MapNode, 
  MapLink 
} from '@/types';
import { toast } from 'sonner';

// HistoricalElements CRUD
export const fetchHistoricalElements = async (): Promise<HistoricalElement[]> => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as HistoricalElement['type'],
      date: item.date,
      description: item.description,
      tags: item.tags,
      imageUrl: item.image_url,
      year: item.year
    }));
  } catch (error: any) {
    console.error('Error fetching historical elements:', error);
    toast.error('Failed to load historical elements');
    return [];
  }
};

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
    
    return {
      id: data.id,
      name: data.name,
      type: data.type as HistoricalElement['type'],
      date: data.date,
      description: data.description,
      tags: data.tags,
      imageUrl: data.image_url,
      year: data.year
    };
  } catch (error: any) {
    console.error('Error creating historical element:', error);
    toast.error('Failed to create element');
    return null;
  }
};

export const updateHistoricalElement = async (id: string, updates: Partial<HistoricalElement>): Promise<HistoricalElement | null> => {
  try {
    const { data, error } = await supabase
      .from('historical_elements')
      .update({
        name: updates.name,
        type: updates.type,
        date: updates.date,
        description: updates.description,
        tags: updates.tags,
        image_url: updates.imageUrl,
        year: updates.year,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type as HistoricalElement['type'],
      date: data.date,
      description: data.description,
      tags: data.tags,
      imageUrl: data.image_url,
      year: data.year
    };
  } catch (error: any) {
    console.error('Error updating historical element:', error);
    toast.error('Failed to update element');
    return null;
  }
};

export const deleteHistoricalElement = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('historical_elements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error deleting historical element:', error);
    toast.error('Failed to delete element');
    return false;
  }
};

// Relationships CRUD
export const fetchRelationships = async (): Promise<Relationship[]> => {
  try {
    const { data, error } = await supabase
      .from('element_relationships')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      sourceId: item.source_id,
      targetId: item.target_id,
      description: item.description || '',
      type: item.type as Relationship['type']
    }));
  } catch (error: any) {
    console.error('Error fetching relationships:', error);
    toast.error('Failed to load relationships');
    return [];
  }
};

export const createRelationship = async (relationship: Omit<Relationship, 'id'>): Promise<Relationship | null> => {
  try {
    const { data, error } = await supabase
      .from('element_relationships')
      .insert({
        source_id: relationship.sourceId,
        target_id: relationship.targetId,
        description: relationship.description,
        type: relationship.type
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      sourceId: data.source_id,
      targetId: data.target_id,
      description: data.description || '',
      type: data.type as Relationship['type']
    };
  } catch (error: any) {
    console.error('Error creating relationship:', error);
    toast.error('Failed to create relationship');
    return null;
  }
};

export const updateRelationship = async (id: string, updates: Partial<Relationship>): Promise<Relationship | null> => {
  try {
    const { data, error } = await supabase
      .from('element_relationships')
      .update({
        source_id: updates.sourceId,
        target_id: updates.targetId,
        description: updates.description,
        type: updates.type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      sourceId: data.source_id,
      targetId: data.target_id,
      description: data.description || '',
      type: data.type as Relationship['type']
    };
  } catch (error: any) {
    console.error('Error updating relationship:', error);
    toast.error('Failed to update relationship');
    return null;
  }
};

export const deleteRelationship = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('element_relationships')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error deleting relationship:', error);
    toast.error('Failed to delete relationship');
    return false;
  }
};

// User Maps CRUD
export const fetchUserMaps = async (): Promise<{ id: string, name: string, description: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || ''
    }));
  } catch (error: any) {
    console.error('Error fetching user maps:', error);
    toast.error('Failed to load maps');
    return [];
  }
};

export const createUserMap = async (name: string, description: string = ''): Promise<{ id: string, name: string, description: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .insert({
        name,
        description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || ''
    };
  } catch (error: any) {
    console.error('Error creating user map:', error);
    toast.error('Failed to create map');
    return null;
  }
};

export const updateUserMap = async (id: string, name: string, description: string = ''): Promise<{ id: string, name: string, description: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('user_maps')
      .update({
        name,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || ''
    };
  } catch (error: any) {
    console.error('Error updating user map:', error);
    toast.error('Failed to update map');
    return null;
  }
};

export const deleteUserMap = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_maps')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error deleting user map:', error);
    toast.error('Failed to delete map');
    return false;
  }
};

// Map Elements operations
export const saveMapPositions = async (mapId: string, nodes: MapNode[]): Promise<boolean> => {
  try {
    // First, delete existing map elements to avoid duplicates
    const { error: deleteError } = await supabase
      .from('map_elements')
      .delete()
      .eq('map_id', mapId);
    
    if (deleteError) throw deleteError;
    
    // Insert all nodes with their positions
    const elementsToInsert = nodes.map(node => ({
      map_id: mapId,
      element_id: node.element.id,
      x_position: node.x,
      y_position: node.y,
      layer: node.layer || 1
    }));
    
    const { error } = await supabase
      .from('map_elements')
      .insert(elementsToInsert);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error saving map positions:', error);
    toast.error('Failed to save map positions');
    return false;
  }
};

export const fetchMapNodes = async (mapId: string): Promise<MapNode[]> => {
  try {
    const { data: mapElements, error: elementsError } = await supabase
      .from('map_elements')
      .select(`
        x_position,
        y_position,
        layer,
        element_id,
        historical_elements (*)
      `)
      .eq('map_id', mapId);
    
    if (elementsError) throw elementsError;
    
    return mapElements.map(item => {
      const element = item.historical_elements;
      
      return {
        id: element.id,
        x: item.x_position,
        y: item.y_position,
        layer: item.layer || 1,
        element: {
          id: element.id,
          name: element.name,
          type: element.type as HistoricalElement['type'],
          date: element.date,
          description: element.description,
          tags: element.tags,
          imageUrl: element.image_url,
          year: element.year
        }
      };
    });
  } catch (error: any) {
    console.error('Error fetching map nodes:', error);
    toast.error('Failed to load map nodes');
    return [];
  }
};

export const fetchMapLinks = async (mapId: string): Promise<MapLink[]> => {
  try {
    const { data: mapRelationships, error: relationshipsError } = await supabase
      .from('map_relationships')
      .select(`
        relationship_id,
        element_relationships (*)
      `)
      .eq('map_id', mapId);
    
    if (relationshipsError) throw relationshipsError;
    
    return mapRelationships.map(item => {
      const relationship = item.element_relationships;
      
      return {
        id: relationship.id,
        source: relationship.source_id,
        target: relationship.target_id,
        relationship: {
          id: relationship.id,
          sourceId: relationship.source_id,
          targetId: relationship.target_id,
          description: relationship.description || '',
          type: relationship.type as Relationship['type']
        }
      };
    });
  } catch (error: any) {
    console.error('Error fetching map links:', error);
    toast.error('Failed to load map links');
    return [];
  }
};

export const saveMapLinks = async (mapId: string, links: MapLink[]): Promise<boolean> => {
  try {
    // First, delete existing map relationships to avoid duplicates
    const { error: deleteError } = await supabase
      .from('map_relationships')
      .delete()
      .eq('map_id', mapId);
    
    if (deleteError) throw deleteError;
    
    // Insert all relationships
    const relationshipsToInsert = links.map(link => ({
      map_id: mapId,
      relationship_id: typeof link.relationship === 'object' ? link.relationship.id : link.relationship
    }));
    
    const { error } = await supabase
      .from('map_relationships')
      .insert(relationshipsToInsert);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error saving map links:', error);
    toast.error('Failed to save map links');
    return false;
  }
};

// Session management
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    toast.error('Failed to log out');
  }
};
