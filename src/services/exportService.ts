
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

    // Generate image from the visualization
    const dataUrl = await toPng(containerRef.current, {
      quality,
      pixelRatio: scale,
      cacheBust: true,
      skipFonts: true, // Improves performance
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

    // For PDF export
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

    // Add the visualization image
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, 'PNG', 15, 35, pdfWidth, pdfHeight);

    // Add metadata if enabled
    if (includeMetadata && (selectedElements?.length || customNodes?.length)) {
      const metadataY = 35 + pdfHeight + 10;
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
