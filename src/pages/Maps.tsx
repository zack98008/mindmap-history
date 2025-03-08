import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash, Map, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchUserMaps, createUserMap, updateUserMap, deleteUserMap } from '@/services/databaseService';

interface MapItem {
  id: string;
  name: string;
  description: string;
}

const Maps = () => {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [newMapDescription, setNewMapDescription] = useState('');
  const [editingMap, setEditingMap] = useState<MapItem | null>(null);
  
  const navigate = useNavigate();

  const loadMaps = async () => {
    setIsLoading(true);
    try {
      const userMaps = await fetchUserMaps();
      setMaps(userMaps);
    } catch (error) {
      console.error('Error loading maps:', error);
      toast.error('Failed to load your maps');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaps();
  }, []);

  const handleCreateMap = async () => {
    if (!newMapName.trim()) {
      toast.error('Please enter a map name');
      return;
    }

    try {
      const newMap = await createUserMap(newMapName, newMapDescription);
      if (newMap) {
        setMaps([...maps, newMap]);
        setNewMapName('');
        setNewMapDescription('');
        setIsCreateDialogOpen(false);
        toast.success('Map created successfully');
      }
    } catch (error) {
      console.error('Error creating map:', error);
      toast.error('Failed to create map');
    }
  };

  const handleEditMap = async () => {
    if (!editingMap || !editingMap.name.trim()) {
      toast.error('Please enter a map name');
      return;
    }

    try {
      const updatedMap = await updateUserMap(editingMap.id, editingMap.name, editingMap.description);
      if (updatedMap) {
        setMaps(maps.map(map => map.id === updatedMap.id ? updatedMap : map));
        setEditingMap(null);
        setIsEditDialogOpen(false);
        toast.success('Map updated successfully');
      }
    } catch (error) {
      console.error('Error updating map:', error);
      toast.error('Failed to update map');
    }
  };

  const handleDeleteMap = async (id: string) => {
    if (!confirm('Are you sure you want to delete this map?')) {
      return;
    }

    try {
      const success = await deleteUserMap(id);
      if (success) {
        setMaps(maps.filter(map => map.id !== id));
        toast.success('Map deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting map:', error);
      toast.error('Failed to delete map');
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">My Maps</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Map
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Map</DialogTitle>
              <DialogDescription>
                Create a new map to visualize historical connections.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Map Name
                </label>
                <Input
                  id="name"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="Enter map name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newMapDescription}
                  onChange={(e) => setNewMapDescription(e.target.value)}
                  placeholder="Enter map description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMap}>Create Map</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : maps.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-lg">
          <Map className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Maps Found</h2>
          <p className="text-gray-400 mb-6">
            Create your first map to start visualizing historical connections.
          </p>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Map
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <Card key={map.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{map.name}</CardTitle>
                {map.description && (
                  <CardDescription>{map.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-slate-700 rounded-md flex items-center justify-center">
                  <Map className="h-12 w-12 text-indigo-400" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingMap(map);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteMap(map.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={() => navigate(`/map/${map.id}`)}>
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Map</DialogTitle>
            <DialogDescription>
              Update the details of your map.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Map Name
              </label>
              <Input
                id="edit-name"
                value={editingMap?.name || ''}
                onChange={(e) => setEditingMap(editingMap ? { ...editingMap, name: e.target.value } : null)}
                placeholder="Enter map name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={editingMap?.description || ''}
                onChange={(e) => setEditingMap(editingMap ? { ...editingMap, description: e.target.value } : null)}
                placeholder="Enter map description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMap}>Update Map</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Maps;
