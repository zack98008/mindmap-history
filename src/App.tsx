
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Maps from "./pages/Maps";
import MapView from "./pages/MapView";
import TemplateBuilder from "./pages/TemplateBuilder";
import Memorization from "./pages/Memorization";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Index />
              </PrivateRoute>
            } />
            
            <Route path="/maps" element={
              <PrivateRoute>
                <Maps />
              </PrivateRoute>
            } />
            
            <Route path="/map/:mapId" element={
              <PrivateRoute>
                <MapView />
              </PrivateRoute>
            } />
            
            <Route path="/templates" element={
              <PrivateRoute>
                <TemplateBuilder />
              </PrivateRoute>
            } />
            
            <Route path="/memorization" element={
              <PrivateRoute>
                <Memorization />
              </PrivateRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
