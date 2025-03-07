
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Maps from "./pages/Maps";
import MapView from "./pages/MapView";
import TemplateBuilder from "./pages/TemplateBuilder";
import Memorization from "./pages/Memorization";
import NotFound from "./pages/NotFound";
import MapGenerator from "./pages/MapGenerator";

// Create a query client
const queryClient = new QueryClient();

// Set default language for the application
const defaultLanguage = 'ar'; // Arabic is the default language

const App = () => {
  // Set the dir attribute on document for RTL support
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-left" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/map/:mapId" element={<MapView />} />
            <Route path="/templates" element={<TemplateBuilder />} />
            <Route path="/memorization" element={<Memorization />} />
            <Route path="/generate" element={<MapGenerator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
