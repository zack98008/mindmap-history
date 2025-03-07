
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { HistoricalElement, MapNode, MapLink } from '@/types';

interface ExportOptions {
  title: string;
  description: string;
  format: 'pdf' | 'png' | 'jpg';
  quality?: number;
  scale?: number;
  includeMetadata?: boolean;
  fileName?: string;
}

const defaultOptions: ExportOptions = {
  title: 'ChronoMind Visualization',
  description: 'An interactive visualization of historical connections and relationships.',
  format: 'pdf',
  quality: 0.95,
  scale: 2,
  includeMetadata: true,
  fileName: 'chronomind-export'
};

export const exportVisualization = async (
  containerRef: React.RefObject<HTMLElement>,
  selectedElements?: HistoricalElement[],
  customNodes?: MapNode[] | null,
  customLinks?: MapLink[] | null,
  options?: Partial<ExportOptions>
) => {
  const exportOptions = { ...defaultOptions, ...options };
  const { title, description, format, quality, scale, includeMetadata, fileName } = exportOptions;

  try {
    // Show loading toast
    toast.loading('Preparing export...');

    if (!containerRef.current) {
      throw new Error('No visualization container found');
    }

    // Prepare container for export by temporarily hiding buttons and controls
    const buttonsAndControls = containerRef.current.querySelectorAll('button, .control-element');
    const hiddenElements: { element: Element, display: string }[] = [];
    
    buttonsAndControls.forEach(element => {
      hiddenElements.push({ 
        element, 
        display: (element as HTMLElement).style.display 
      });
      (element as HTMLElement).style.display = 'none';
    });

    // Ensure node titles are visible
    const nodeElements = containerRef.current.querySelectorAll('.node-element');
    const nodeLabels: { element: Element, visibility: string }[] = [];
    
    nodeElements.forEach(element => {
      const labelElement = element.querySelector('.node-label');
      if (labelElement) {
        nodeLabels.push({ 
          element: labelElement, 
          visibility: (labelElement as HTMLElement).style.visibility 
        });
        (labelElement as HTMLElement).style.visibility = 'visible';
      }
    });

    // Generate image from the visualization
    const dataUrl = await toPng(containerRef.current, {
      quality,
      pixelRatio: scale,
      cacheBust: true,
      skipFonts: true, // Improves performance
    });

    // Restore hidden elements
    hiddenElements.forEach(({ element, display }) => {
      (element as HTMLElement).style.display = display;
    });

    // Restore node labels
    nodeLabels.forEach(({ element, visibility }) => {
      (element as HTMLElement).style.visibility = visibility;
    });

    // Handle different export formats
    if (format === 'png' || format === 'jpg') {
      // Create a download link for the image
      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      link.href = dataUrl;
      link.click();
      toast.dismiss();
      toast.success(`Exported as ${format.toUpperCase()}`);
      return;
    }

    // For PDF export, calculate optimal dimensions based on visualization size
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    });

    // Add title and description
    pdf.setFontSize(24);
    pdf.text(title, 15, 15);
    
    pdf.setFontSize(12);
    const descriptionLines = pdf.splitTextToSize(description, 260);
    pdf.text(descriptionLines, 15, 25);

    // Add the visualization image with proper sizing
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 30; // Account for margins
    
    // Calculate height while maintaining aspect ratio
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Check if we need to add a new page for very tall visualizations
    const availablePageHeight = pdf.internal.pageSize.getHeight() - 40; // Account for margins and title
    
    if (pdfHeight > availablePageHeight) {
      // Add the visualization to a new page to give it more room
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 15, 15, pdfWidth, pdfHeight);
    } else {
      // Add the visualization to the current page
      pdf.addImage(dataUrl, 'PNG', 15, 35, pdfWidth, pdfHeight);
    }

    // Add metadata if enabled
    if (includeMetadata && (selectedElements?.length || customNodes?.length)) {
      // Calculate position for metadata (either on first page after visualization or on a new page)
      let metadataY;
      
      if (pdfHeight > availablePageHeight) {
        // If visualization is on a new page, add metadata to a third page
        pdf.addPage();
        metadataY = 15;
      } else {
        // If visualization fits on first page, add metadata below it
        metadataY = 35 + pdfHeight + 10;
        
        // If metadata would go off the page, add a new page
        if (metadataY > availablePageHeight - 20) {
          pdf.addPage();
          metadataY = 15;
        }
      }
      
      pdf.setFontSize(14);
      pdf.text('Elements in this visualization:', 15, metadataY);
      
      pdf.setFontSize(10);
      let elementText = '';
      
      if (selectedElements?.length) {
        elementText += selectedElements.map(elem => `${elem.name} (${elem.type})`).join(', ');
      }
      
      if (customNodes?.length) {
        if (elementText) elementText += ', ';
        elementText += customNodes.map(node => node.element.name || 'Unnamed node').join(', ');
      }
      
      const metadataLines = pdf.splitTextToSize(elementText, 260);
      pdf.text(metadataLines, 15, metadataY + 7);
    }

    // Save the PDF
    pdf.save(`${fileName}.pdf`);
    toast.dismiss();
    toast.success('Exported as PDF');
  } catch (error) {
    console.error('Export failed:', error);
    toast.dismiss();
    toast.error('Export failed, please try again');
  }
};
