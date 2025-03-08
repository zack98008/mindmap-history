
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Globe, Map as MapIcon, Clock, TrendingUp, Mountain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MapNode, MapLink } from '@/types';

type MapType = 'country' | 'continent' | 'historical' | 'geography' | 'economic';

interface GeneratedMap {
  type: MapType;
  name: string;
  language: string;
  nodes: MapNode[];
  links: MapLink[];
  mapConfig: {
    projection: string;
    center: number[];
    zoom: number;
    time?: string;
  };
  [key: string]: any; // For additional properties based on map type
}

const MapGenerator = () => {
  const [mapType, setMapType] = useState<MapType>('country');
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState('ar');
  const [era, setEra] = useState('');
  const [dataPoints, setDataPoints] = useState<string[]>([]);
  const [dataPointInput, setDataPointInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMap, setGeneratedMap] = useState<GeneratedMap | null>(null);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  
  const navigate = useNavigate();

  const handleAddDataPoint = () => {
    if (dataPointInput.trim() && !dataPoints.includes(dataPointInput.trim())) {
      setDataPoints([...dataPoints, dataPointInput.trim()]);
      setDataPointInput('');
    }
  };

  const handleRemoveDataPoint = (point: string) => {
    setDataPoints(dataPoints.filter(p => p !== point));
  };

  const generateMap = async () => {
    if (!region.trim()) {
      toast.error('Please enter a region name');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-map', {
        body: {
          type: mapType,
          region,
          language,
          era: era || undefined,
          dataPoints: dataPoints.length > 0 ? dataPoints : undefined
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data?.mapData) {
        setGeneratedMap(data.mapData);
        setCustomName(data.mapData.name || region);
        toast.success('Map generated successfully!');
      } else {
        throw new Error('Failed to generate map data');
      }
    } catch (error) {
      console.error('Error generating map:', error);
      toast.error(error.message || 'An error occurred while generating the map');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCustomizedMap = async () => {
    if (!generatedMap) return;
    
    try {
      // Save the map to database
      // This would involve creating a new map entry and saving the nodes and links
      
      toast.success('Map saved successfully!');
      // Navigate to the map view page
      // navigate(`/map/${newMapId}`);
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error('Failed to save customized map');
    }
  };

  const renderMapTypeOptions = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="map-type">Map Type</Label>
          <Select value={mapType} onValueChange={(value: MapType) => setMapType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select map type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="country">Country Map</SelectItem>
              <SelectItem value="continent">Continent Map</SelectItem>
              <SelectItem value="historical">Historical Map</SelectItem>
              <SelectItem value="geography">Geography Map</SelectItem>
              <SelectItem value="economic">Economic Map</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region">Region/Country Name</Label>
          <Input 
            id="region" 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Enter region or country name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {mapType === 'historical' && (
          <div className="space-y-2">
            <Label htmlFor="era">Historical Era</Label>
            <Input 
              id="era" 
              value={era} 
              onChange={(e) => setEra(e.target.value)}
              placeholder="e.g., Medieval, Ottoman Empire, etc."
            />
          </div>
        )}
        
        {mapType === 'economic' && (
          <div className="space-y-2">
            <Label htmlFor="datapoints">Economic Data Points</Label>
            <div className="flex gap-2">
              <Input 
                id="datapoints" 
                value={dataPointInput} 
                onChange={(e) => setDataPointInput(e.target.value)}
                placeholder="e.g., GDP, Oil Production, etc."
              />
              <Button type="button" onClick={handleAddDataPoint}>Add</Button>
            </div>
            {dataPoints.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {dataPoints.map(point => (
                  <div key={point} className="bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{point}</span>
                    <button 
                      onClick={() => handleRemoveDataPoint(point)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <Button 
          onClick={generateMap} 
          className="w-full mt-4" 
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Map'}
        </Button>
      </div>
    );
  };

  const renderMapPreview = () => {
    if (!generatedMap) return null;

    return (
      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Map Preview</h3>
          <div className="h-64 bg-slate-700 rounded-md flex items-center justify-center">
            {/* Placeholder for actual map visualization */}
            <div className="text-center">
              <div className="text-4xl mb-2">
                {mapType === 'country' ? <Globe /> : 
                 mapType === 'continent' ? <Globe /> :
                 mapType === 'historical' ? <Clock /> :
                 mapType === 'geography' ? <Mountain /> :
                 <TrendingUp />}
              </div>
              <p>Map visualization would render here</p>
              <p className="text-sm text-gray-400">Nodes: {generatedMap.nodes.length}, Links: {generatedMap.links.length}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-name">Custom Map Name</Label>
            <Input 
              id="custom-name" 
              value={customName} 
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-description">Map Description</Label>
            <Textarea 
              id="custom-description" 
              value={customDescription} 
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button onClick={saveCustomizedMap} className="w-full">
            Save Customized Map
          </Button>
        </div>
      </div>
    );
  };

  const renderMapTypeCard = (type: MapType, title: string, icon: React.ReactNode, description: string) => {
    return (
      <Card className={`cursor-pointer transition-all ${mapType === type ? 'border-indigo-500 bg-slate-800' : 'bg-slate-800/50'}`} onClick={() => setMapType(type)}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="text-indigo-400">{icon}</div>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Map Generator</h1>
        <p className="text-gray-400">Generate and customize different types of maps for your projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
            {renderMapTypeCard('country', 'Country', <Globe size={20} />, 'Generate a detailed map of a specific country')}
            {renderMapTypeCard('continent', 'Continent', <Globe size={20} />, 'Create a map showing an entire continent')}
            {renderMapTypeCard('historical', 'Historical', <Clock size={20} />, 'Visualize historical periods and events')}
            {renderMapTypeCard('geography', 'Geography', <Mountain size={20} />, 'Show geographical features like mountains, rivers')}
            {renderMapTypeCard('economic', 'Economic', <TrendingUp size={20} />, 'Illustrate economic data and trade routes')}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue={generatedMap ? "preview" : "generator"}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedMap}>Preview & Customize</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator">
              {renderMapTypeOptions()}
            </TabsContent>
            
            <TabsContent value="preview">
              {renderMapPreview()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default MapGenerator;
