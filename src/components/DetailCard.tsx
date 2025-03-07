
import React from 'react';
import { X, User, Calendar, FileText, Lightbulb, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HistoricalElement } from '@/types';
import { getRelatedElements, getRelationshipsByElementId } from '@/utils/dummyData';

interface DetailCardProps {
  element: HistoricalElement;
  onClose: () => void;
  onElementSelect: (element: HistoricalElement) => void;
}

const DetailCard: React.FC<DetailCardProps> = ({ element, onClose, onElementSelect }) => {
  const relatedElements = getRelatedElements(element.id);
  const relationships = getRelationshipsByElementId(element.id);

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
        
        {relatedElements.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Connections:</p>
            <div className="space-y-2">
              {relationships.map((rel) => {
                const relatedElement = relatedElements.find(
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
      </div>
    </div>
  );
};

export default DetailCard;
