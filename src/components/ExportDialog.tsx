
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Download } from 'lucide-react';
import { HistoricalElement, MapNode, MapLink } from '@/types';

interface ExportDialogProps {
  containerRef: React.RefObject<HTMLElement>;
  onExport: (
    containerRef: React.RefObject<HTMLElement>,
    selectedElements?: HistoricalElement[],
    customNodes?: MapNode[] | null,
    customLinks?: MapLink[] | null,
    options?: {
      title: string;
      description: string;
      format: 'pdf' | 'png' | 'jpg';
      quality: number;
      scale: number;
      includeMetadata: boolean;
      fileName: string;
    }
  ) => Promise<void>;
  selectedElement?: HistoricalElement | null;
  customNodes?: MapNode[] | null;
  customLinks?: MapLink[] | null;
}

const ExportDialog = ({ 
  containerRef, 
  onExport, 
  selectedElement, 
  customNodes, 
  customLinks 
}: ExportDialogProps) => {
  const [title, setTitle] = useState('ChronoMind Visualization');
  const [description, setDescription] = useState(
    'An interactive visualization of historical connections and relationships created with ChronoMind.'
  );
  const [format, setFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf');
  const [quality, setQuality] = useState(95);
  const [scale, setScale] = useState(2);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [fileName, setFileName] = useState('chronomind-export');
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    await onExport(
      containerRef,
      selectedElement ? [selectedElement] : undefined,
      customNodes,
      customLinks,
      {
        title,
        description,
        format,
        quality: quality / 100,
        scale,
        includeMetadata,
        fileName,
      }
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Export Visualization</DialogTitle>
          <DialogDescription>
            Configure the export settings for your visualization
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as 'pdf' | 'png' | 'jpg')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="png">PNG Image</SelectItem>
                <SelectItem value="jpg">JPG Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileName" className="text-right">
              File Name
            </Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quality" className="text-right">
              Quality ({quality}%)
            </Label>
            <div className="col-span-3">
              <Slider
                id="quality"
                min={10}
                max={100}
                step={5}
                value={[quality]}
                onValueChange={(values) => setQuality(values[0])}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scale" className="text-right">
              Scale ({scale}x)
            </Label>
            <div className="col-span-3">
              <Slider
                id="scale"
                min={1}
                max={4}
                step={0.5}
                value={[scale]}
                onValueChange={(values) => setScale(values[0])}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="metadata" className="text-right">
              Include Metadata
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={setIncludeMetadata}
              />
              <Label htmlFor="metadata">
                Add element information to export
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
