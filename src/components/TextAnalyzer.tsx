
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Key } from 'lucide-react';
import { analyzeText, setApiKey } from '@/services/aiService';
import { MapNode, MapLink } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface TextAnalyzerProps {
  onAnalysisComplete: (result: { nodes: MapNode[], links: MapLink[] }) => void;
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();

  // Initialize with stored API key if available
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKeyState(storedKey);
    } else {
      // If no key is stored, show the input field
      setShowApiKeyInput(true);
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyState(e.target.value);
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setApiKey(apiKey);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved.",
      });
      setShowApiKeyInput(false);
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
        variant: "destructive"
      });
    }
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

    if (!apiKey && !localStorage.getItem('gemini_api_key')) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
        variant: "destructive"
      });
      setShowApiKeyInput(true);
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
        description: "There was an error analyzing the text. Please check your API key or try again later.",
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
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="text-slate-300 hover:text-white"
        >
          <Key className="mr-2 h-4 w-4" />
          {showApiKeyInput ? "Hide API Key" : "Set API Key"}
        </Button>
      </div>

      {showApiKeyInput && (
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Gemini API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm"
              placeholder="Enter your Gemini API key"
              defaultValue="AIzaSyClmQFOT0ce7uTlVjGs9_qQ8zQIL0ihBuY" // Pre-fill with the provided key
            />
            <Button onClick={handleSaveApiKey} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Save Key
            </Button>
          </div>
          <p className="text-xs text-slate-400">Get your API key from the <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></p>
        </div>
      )}

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
