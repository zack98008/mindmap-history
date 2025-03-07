import React from 'react';
import { getTimelineItems } from '@/utils/dummyData';
import { HistoricalElement } from '@/types';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TimelineViewProps {
  onElementSelect: (element: HistoricalElement) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ onElementSelect }) => {
  const timelineItems = getTimelineItems();
  const { toast } = useToast();
  const timelineRef = React.useRef<HTMLDivElement>(null);
  
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

  const exportToPDF = async () => {
    if (!timelineRef.current) return;
    
    toast({
      title: "Preparing PDF Export",
      description: "Please wait while we generate your timeline visualization...",
    });

    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(155, 135, 245);
      pdf.text("Historical Timeline Visualization", pdfWidth / 2, 20, { align: 'center' });
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);
      
      const descriptionText = 
        "This timeline presents a chronological visualization of significant historical elements " +
        "including people (purple), events (blue), documents (teal), and concepts (gold) that " +
        "have shaped history. The visualization allows you to explore connections between " +
        "different time periods and understand the progression of historical developments.";
      
      const splitDescription = pdf.splitTextToSize(descriptionText, pdfWidth - 40);
      pdf.text(splitDescription, pdfWidth / 2, 30, { align: 'center' });
      
      const canvas = await html2canvas(timelineRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);
      
      pdf.save('chronology-timeline.pdf');
      
      toast({
        title: "Export Successful",
        description: "Your timeline has been exported to PDF successfully.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your timeline. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="glass-card p-6 h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-chronoPurple to-chronoBlue bg-clip-text text-transparent">Historical Timeline</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={exportToPDF}
        >
          <FileDown className="h-4 w-4" />
          Export as PDF
        </Button>
      </div>
      
      <div className="overflow-y-auto flex-grow" ref={timelineRef}>
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
    </div>
  );
};

export default TimelineView;
