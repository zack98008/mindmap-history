
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
import { generateMap } from '@/services/aiService';
import { MapNode, MapLink } from '@/types';

type MapType = 'country' | 'continent' | 'historical' | 'geography' | 'economic';

interface GeneratedMap {
  title: string;
  description: string;
  nodes: MapNode[];
  links: MapLink[];
}

const MapGenerator = () => {
  const [mapType, setMapType] = useState<MapType>('country');
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState('ar');
  const [details, setDetails] = useState('');
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

  const generateMapData = async () => {
    if (!region.trim()) {
      toast.error(language === 'ar' ? 'الرجاء إدخال اسم المنطقة' : 'Please enter a region name');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMap({
        mapType,
        topic: region,
        details: details || dataPoints.join(', '),
        language
      });

      if (result) {
        setGeneratedMap(result);
        setCustomName(result.title || region);
        setCustomDescription(result.description || '');
        toast.success(language === 'ar' ? 'تم إنشاء الخريطة بنجاح!' : 'Map generated successfully!');
      } else {
        throw new Error(language === 'ar' ? 'فشل في إنشاء بيانات الخريطة' : 'Failed to generate map data');
      }
    } catch (error) {
      console.error('Error generating map:', error);
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ أثناء إنشاء الخريطة' : 'An error occurred while generating the map'));
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCustomizedMap = async () => {
    if (!generatedMap) return;
    
    try {
      // Save the map to database - to be implemented
      toast.success(language === 'ar' ? 'تم حفظ الخريطة بنجاح!' : 'Map saved successfully!');
      // Navigate to the map view page - to be implemented
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error(language === 'ar' ? 'فشل في حفظ الخريطة المخصصة' : 'Failed to save customized map');
    }
  };

  const renderMapTypeOptions = () => {
    const mapTypes = [
      { value: 'country', label: language === 'ar' ? 'خريطة الدولة' : 'Country Map', icon: <Globe size={20} />, description: language === 'ar' ? 'إنشاء خريطة مفصلة لدولة معينة' : 'Generate a detailed map of a specific country' },
      { value: 'continent', label: language === 'ar' ? 'خريطة القارة' : 'Continent Map', icon: <Globe size={20} />, description: language === 'ar' ? 'إنشاء خريطة تعرض قارة كاملة' : 'Create a map showing an entire continent' },
      { value: 'historical', label: language === 'ar' ? 'خريطة تاريخية' : 'Historical Map', icon: <Clock size={20} />, description: language === 'ar' ? 'تصور الفترات والأحداث التاريخية' : 'Visualize historical periods and events' },
      { value: 'geography', label: language === 'ar' ? 'خريطة جغرافية' : 'Geography Map', icon: <Mountain size={20} />, description: language === 'ar' ? 'عرض المعالم الجغرافية مثل الجبال والأنهار' : 'Show geographical features like mountains, rivers' },
      { value: 'economic', label: language === 'ar' ? 'خريطة اقتصادية' : 'Economic Map', icon: <TrendingUp size={20} />, description: language === 'ar' ? 'توضيح البيانات الاقتصادية وطرق التجارة' : 'Illustrate economic data and trade routes' },
    ];
    
    return (
      <div className="space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="space-y-2">
          <Label htmlFor="map-type">{language === 'ar' ? 'نوع الخريطة' : 'Map Type'}</Label>
          <Select value={mapType} onValueChange={(value: MapType) => setMapType(value)}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'ar' ? 'اختر نوع الخريطة' : 'Select map type'} />
            </SelectTrigger>
            <SelectContent>
              {mapTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region">{language === 'ar' ? 'اسم المنطقة/الدولة' : 'Region/Country Name'}</Label>
          <Input 
            id="region" 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل اسم المنطقة أو الدولة' : 'Enter region or country name'}
            className={language === 'ar' ? 'text-right' : ''}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">{language === 'ar' ? 'اللغة' : 'Language'}</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'ar' ? 'اختر اللغة' : 'Select language'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {mapType === 'historical' && (
          <div className="space-y-2">
            <Label htmlFor="era">{language === 'ar' ? 'الحقبة التاريخية' : 'Historical Era'}</Label>
            <Input 
              id="era" 
              value={details} 
              onChange={(e) => setDetails(e.target.value)}
              placeholder={language === 'ar' ? 'مثل: العصور الوسطى، الامبراطورية العثمانية، إلخ' : 'e.g., Medieval, Ottoman Empire, etc.'}
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
        )}

        {mapType !== 'historical' && mapType !== 'economic' && (
          <div className="space-y-2">
            <Label htmlFor="details">{language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details'}</Label>
            <Textarea 
              id="details" 
              value={details} 
              onChange={(e) => setDetails(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل أي تفاصيل إضافية لإثراء الخريطة' : 'Enter any additional details to enrich the map'}
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
        )}
        
        {mapType === 'economic' && (
          <div className="space-y-2">
            <Label htmlFor="datapoints">{language === 'ar' ? 'نقاط البيانات الاقتصادية' : 'Economic Data Points'}</Label>
            <div className="flex gap-2">
              <Input 
                id="datapoints" 
                value={dataPointInput} 
                onChange={(e) => setDataPointInput(e.target.value)}
                placeholder={language === 'ar' ? 'مثل: الناتج المحلي، إنتاج النفط، إلخ' : 'e.g., GDP, Oil Production, etc.'}
                className={language === 'ar' ? 'text-right' : ''}
              />
              <Button type="button" onClick={handleAddDataPoint}>
                {language === 'ar' ? 'إضافة' : 'Add'}
              </Button>
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
          onClick={generateMapData} 
          className="w-full mt-4" 
          disabled={isGenerating}
        >
          {isGenerating 
            ? (language === 'ar' ? 'جاري الإنشاء...' : 'Generating...') 
            : (language === 'ar' ? 'إنشاء الخريطة' : 'Generate Map')}
        </Button>
      </div>
    );
  };

  const renderMapPreview = () => {
    if (!generatedMap) return null;

    return (
      <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">{language === 'ar' ? 'معاينة الخريطة' : 'Map Preview'}</h3>
          <div className="h-64 bg-slate-700 rounded-md flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {mapType === 'country' ? <Globe /> : 
                 mapType === 'continent' ? <Globe /> :
                 mapType === 'historical' ? <Clock /> :
                 mapType === 'geography' ? <Mountain /> :
                 <TrendingUp />}
              </div>
              <p>{language === 'ar' ? 'ستظهر هنا الخريطة المرئية' : 'Map visualization would render here'}</p>
              <p className="text-sm text-gray-400">
                {language === 'ar' 
                  ? `العناصر: ${generatedMap.nodes.length}، الروابط: ${generatedMap.links.length}`
                  : `Nodes: ${generatedMap.nodes.length}, Links: ${generatedMap.links.length}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-name">{language === 'ar' ? 'اسم الخريطة المخصص' : 'Custom Map Name'}</Label>
            <Input 
              id="custom-name" 
              value={customName} 
              onChange={(e) => setCustomName(e.target.value)}
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-description">{language === 'ar' ? 'وصف الخريطة' : 'Map Description'}</Label>
            <Textarea 
              id="custom-description" 
              value={customDescription} 
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={3}
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
          
          <Button onClick={saveCustomizedMap} className="w-full">
            {language === 'ar' ? 'حفظ الخريطة المخصصة' : 'Save Customized Map'}
          </Button>
        </div>
      </div>
    );
  };

  const renderMapTypeCard = (type: MapType, title: string, icon: React.ReactNode, description: string) => {
    return (
      <Card 
        className={`cursor-pointer transition-all ${mapType === type ? 'border-indigo-500 bg-slate-800' : 'bg-slate-800/50'}`} 
        onClick={() => setMapType(type)}
      >
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
      <div className="mb-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-white mb-2">
          {language === 'ar' ? 'منشئ الخرائط' : 'Map Generator'}
        </h1>
        <p className="text-gray-400">
          {language === 'ar' 
            ? 'إنشاء وتخصيص أنواع مختلفة من الخرائط لمشاريعك' 
            : 'Generate and customize different types of maps for your projects'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {renderMapTypeCard(
              'country', 
              language === 'ar' ? 'خريطة الدولة' : 'Country', 
              <Globe size={20} />, 
              language === 'ar' ? 'إنشاء خريطة مفصلة لدولة معينة' : 'Generate a detailed map of a specific country'
            )}
            {renderMapTypeCard(
              'continent', 
              language === 'ar' ? 'خريطة القارة' : 'Continent', 
              <Globe size={20} />, 
              language === 'ar' ? 'إنشاء خريطة تعرض قارة كاملة' : 'Create a map showing an entire continent'
            )}
            {renderMapTypeCard(
              'historical', 
              language === 'ar' ? 'خريطة تاريخية' : 'Historical', 
              <Clock size={20} />, 
              language === 'ar' ? 'تصور الفترات والأحداث التاريخية' : 'Visualize historical periods and events'
            )}
            {renderMapTypeCard(
              'geography', 
              language === 'ar' ? 'خريطة جغرافية' : 'Geography', 
              <Mountain size={20} />, 
              language === 'ar' ? 'عرض المعالم الجغرافية مثل الجبال والأنهار' : 'Show geographical features like mountains, rivers'
            )}
            {renderMapTypeCard(
              'economic', 
              language === 'ar' ? 'خريطة اقتصادية' : 'Economic', 
              <TrendingUp size={20} />, 
              language === 'ar' ? 'توضيح البيانات الاقتصادية وطرق التجارة' : 'Illustrate economic data and trade routes'
            )}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue={generatedMap ? "preview" : "generator"}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="generator">{language === 'ar' ? 'المُنشئ' : 'Generator'}</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedMap}>
                {language === 'ar' ? 'معاينة وتخصيص' : 'Preview & Customize'}
              </TabsTrigger>
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
