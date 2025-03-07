
import React from 'react';
import { X, User, Calendar, FileText, Lightbulb, Link, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HistoricalElement } from '@/types';
import { getRelatedElements, getRelationshipsByElementId, getRelationshipsByDepth } from '@/utils/dummyData';

interface DetailCardProps {
  element: HistoricalElement;
  onClose: () => void;
  onElementSelect: (element: HistoricalElement) => void;
}

const DetailCard: React.FC<DetailCardProps> = ({ element, onClose, onElementSelect }) => {
  const [showExtendedRelationships, setShowExtendedRelationships] = React.useState(false);
  const directRelationships = getRelationshipsByElementId(element.id);
  const directRelatedElements = getRelatedElements(element.id);
  
  // Get extended relationship data
  const { nodes: extendedNodeIds, nodeDepths } = getRelationshipsByDepth(element.id, 3);
  
  // Filter out the current element and direct connections to get 2nd and 3rd degree connections
  const extendedElements = Array.from(extendedNodeIds)
    .filter(id => id !== element.id && !directRelatedElements.some(rel => rel.id === id))
    .map(id => {
      const foundElement = directRelatedElements.find(el => el.id === id);
      return foundElement ? { element: foundElement, depth: nodeDepths.get(id) || 0 } : null;
    })
    .filter((item): item is { element: HistoricalElement, depth: number } => item !== null)
    .sort((a, b) => a.depth - b.depth);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'person':
        return <User className="h-4 w-4 text-chronoPurple" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-chronoBlue" />;
      case 'document':
        return <FileText className="h-4 w-4 text-chronoTeal" />;
      case 'concept':
        return <Lightbulb className="h-4 w-4 text-chronoGold" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="glass-card overflow-hidden max-w-lg w-full animate-fade-in">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="text-xl font-bold">{element.name}</h2>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-4 text-sm text-muted-foreground">
          <div className="flex items-center mr-4">
            {getTypeIcon(element.type)}
            <span className="ml-1 capitalize">{element.type}</span>
          </div>
          {element.date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{element.date}</span>
            </div>
          )}
        </div>
        
        {element.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img src={element.imageUrl} alt={element.name} className="w-full h-56 object-cover" />
          </div>
        )}
        
        <p className="mb-4 text-sm leading-relaxed">{element.description}</p>
        
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Tags:</p>
          <div className="flex flex-wrap gap-2">
            {element.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-muted/30">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Direct connections */}
        {directRelatedElements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Direct Connections:</p>
            <div className="space-y-2">
              {directRelationships.map((rel) => {
                const relatedElement = directRelatedElements.find(
                  e => e.id === (rel.sourceId === element.id ? rel.targetId : rel.sourceId)
                );
                if (!relatedElement) return null;
                
                return (
                  <div 
                    key={rel.id}
                    className="p-2 border border-white/10 rounded-md hover:bg-chronoPurple/20 cursor-pointer transition-colors"
                    onClick={() => onElementSelect(relatedElement)}
                  >
                    <div className="flex items-center">
                      {getTypeIcon(relatedElement.type)}
                      <span className="ml-2 font-medium">{relatedElement.name}</span>
                    </div>
                    <div className="mt-1 text-xs flex items-center text-muted-foreground">
                      <Link className="h-3 w-3 mr-1" />
                      <span>{rel.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Extended connections section */}
        {extendedElements.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Extended Network:</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowExtendedRelationships(!showExtendedRelationships)}
                className="h-7 text-xs"
              >
                <Layers className="h-3 w-3 mr-1" />
                {showExtendedRelationships ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showExtendedRelationships && (
              <div className="space-y-2 mt-2">
                {extendedElements.map(({ element: extElement, depth }) => (
                  <div 
                    key={extElement.id}
                    className="p-2 border border-white/10 rounded-md hover:bg-chronoBlue/20 cursor-pointer transition-colors"
                    onClick={() => onElementSelect(extElement)}
                    style={{opacity: depth === 1 ? 0.85 : depth === 2 ? 0.7 : 0.55}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getTypeIcon(extElement.type)}
                        <span className="ml-2 font-medium">{extElement.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {depth === 1 ? '2nd' : depth === 2 ? '3rd' : '4th'} degree
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailCard;
