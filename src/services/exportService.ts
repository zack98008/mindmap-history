
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
    const nodeLabels: { element: Element, visibility: string, opacity: string }[] = [];
    
    nodeElements.forEach(element => {
      const labelElement = element.querySelector('.node-label');
      if (labelElement) {
        nodeLabels.push({ 
          element: labelElement, 
          visibility: (labelElement as HTMLElement).style.visibility,
          opacity: (labelElement as HTMLElement).style.opacity 
        });
        (labelElement as HTMLElement).style.visibility = 'visible';
        (labelElement as HTMLElement).style.opacity = '1';
      }
    });

    // Generate image from the visualization
    const dataUrl = await toPng(containerRef.current, {
      quality,
      pixelRatio: scale,
      cacheBust: true,
      skipFonts: true, // Improves performance
    });

    // Get the actual dimensions of the visualization
    const img = new Image();
    img.src = dataUrl;
    await new Promise(resolve => {
      img.onload = resolve;
    });
    
    const aspectRatio = img.width / img.height;

    // Restore hidden elements
    hiddenElements.forEach(({ element, display }) => {
      (element as HTMLElement).style.display = display;
    });

    // Restore node labels
    nodeLabels.forEach(({ element, visibility, opacity }) => {
      (element as HTMLElement).style.visibility = visibility;
      (element as HTMLElement).style.opacity = opacity;
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
    // Instead of using standard A4, we'll calculate custom dimensions
    const maxWidth = 210; // Max width in mm (A4 width reference)
    const maxHeight = 297; // Max height in mm (A4 height reference)
    
    let pdfWidth, pdfHeight;
    
    if (aspectRatio > 1) {
      // Landscape orientation - wider than tall
      pdfWidth = Math.min(maxWidth * 1.5, img.width / 5); // Allow wider than A4 but with a limit
      pdfHeight = pdfWidth / aspectRatio;
      
      // If height is too small, adjust
      if (pdfHeight < 50) {
        pdfHeight = 50;
        pdfWidth = pdfHeight * aspectRatio;
      }
    } else {
      // Portrait orientation - taller than wide
      pdfHeight = Math.min(maxHeight * 1.5, img.height / 5); // Allow taller than A4 but with a limit
      pdfWidth = pdfHeight * aspectRatio;
      
      // If width is too small, adjust
      if (pdfWidth < 50) {
        pdfWidth = 50;
        pdfHeight = pdfWidth / aspectRatio;
      }
    }
    
    // Create PDF with custom dimensions
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth + 20, pdfHeight + 50] // Add margins
    });

    // Add title and description
    pdf.setFontSize(16);
    pdf.text(title, 10, 10);
    
    pdf.setFontSize(10);
    const descriptionLines = pdf.splitTextToSize(description, pdfWidth);
    pdf.text(descriptionLines, 10, 18);

    // Add the visualization image
    const contentPdfWidth = pdfWidth;
    const contentPdfHeight = pdfHeight;
    
    pdf.addImage(dataUrl, 'PNG', 10, 30, contentPdfWidth, contentPdfHeight);
    
    // Add metadata if enabled
    if (includeMetadata && (selectedElements?.length || customNodes?.length)) {
      const metadataY = 35 + contentPdfHeight;
      
      pdf.setFontSize(12);
      pdf.text('Elements in this visualization:', 10, metadataY);
      
      pdf.setFontSize(8);
      let elementText = '';
      
      if (selectedElements?.length) {
        elementText += selectedElements.map(elem => `${elem.name} (${elem.type})`).join(', ');
      }
      
      if (customNodes?.length) {
        if (elementText) elementText += ', ';
        elementText += customNodes.map(node => node.element.name || 'Unnamed node').join(', ');
      }
      
      const metadataLines = pdf.splitTextToSize(elementText, pdfWidth);
      pdf.text(metadataLines, 10, metadataY + 5);
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
