
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { analyzeText } from '@/services/aiService';
import { MapNode, MapLink } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface TextAnalyzerProps {
  onAnalysisComplete: (result: { nodes: MapNode[], links: MapLink[] }) => void;
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter some text to analyze.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const result = await analyzeText(text);
      
      if (result.nodes.length === 0) {
        toast({
          title: "No entities found",
          description: "The AI couldn't identify any entities in the text. Try providing more detailed content.",
          variant: "destructive"
        });
        return;
      }
      
      onAnalysisComplete(result);
      
      toast({
        title: "Analysis complete",
        description: `Found ${result.nodes.length} entities and ${result.links.length} relationships.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the text. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">AI Text Analysis</h3>
      </div>

      <Textarea
        placeholder="Enter historical text, descriptions, or narratives for AI analysis..."
        value={text}
        onChange={handleTextChange}
        className="min-h-[200px] bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
      />

      <div className="flex justify-end">
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Visualization
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TextAnalyzer;
