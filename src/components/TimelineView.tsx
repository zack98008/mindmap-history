
import React, { useEffect } from 'react';
import { getTimelineItems } from '@/utils/dummyData';
import { HistoricalElement, TimelineItem } from '@/types';

interface TimelineViewProps {
  onElementSelect: (element: HistoricalElement) => void;
  historicalElements?: HistoricalElement[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ onElementSelect, historicalElements }) => {
  const [timelineItems, setTimelineItems] = React.useState<TimelineItem[]>([]);

  useEffect(() => {
    if (historicalElements) {
      // Filter only elements with years
      const validTimelineItems: TimelineItem[] = historicalElements
        .filter(element => element.year !== undefined)
        .map(element => ({
          ...element,
          year: element.year as number
        }))
        .sort((a, b) => a.year - b.year);
      
      setTimelineItems(validTimelineItems);
    } else {
      // Fallback to dummy data
      setTimelineItems(getTimelineItems());
    }
  }, [historicalElements]);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'person': return 'bg-chronoPurple';
      case 'event': return 'bg-chronoBlue';
      case 'document': return 'bg-chronoTeal';
      case 'concept': return 'bg-chronoGold';
      default: return 'bg-white';
    }
  };

  const getTypeColorLight = (type: string) => {
    switch(type) {
      case 'person': return 'bg-chronoPurple/20';
      case 'event': return 'bg-chronoBlue/20';
      case 'document': return 'bg-chronoTeal/20';
      case 'concept': return 'bg-chronoGold/20';
      default: return 'bg-white/20';
    }
  };
  
  return (
    <div className="glass-card p-6 h-[calc(100vh-12rem)] overflow-y-auto">
      <div className="relative">
        <div className="timeline-line"></div>
        <div className="space-y-10">
          {timelineItems.map((item, index) => (
            <div 
              key={item.id}
              className={`relative ml-6 md:ml-0 ${index % 2 === 0 ? 'md:pr-[50%] text-right' : 'md:pl-[50%] md:text-left'}`}
            >
              <div 
                className={`absolute w-6 h-6 rounded-full ${getTypeColor(item.type)} left-[-30px] top-0 md:left-[50%] md:transform md:-translate-x-1/2 z-10 shadow-lg`}
              ></div>
              
              <div 
                className={`glass-card p-4 hover:scale-105 transition-transform cursor-pointer ${getTypeColorLight(item.type)}`}
                onClick={() => onElementSelect(item)}
              >
                <div className="font-bold mb-1">{item.name}</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {item.date} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </div>
                <p className="text-xs line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
