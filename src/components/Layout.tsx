
import React from "react";
import NavBar from "./NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types";

interface LayoutProps {
  children: React.ReactNode;
  activeView?: 'map' | 'timeline';
  onViewChange?: (view: 'map' | 'timeline') => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onViewChange 
}) => {
  const { userProfile } = useAuth();
  
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <NavBar 
        activeView={activeView} 
        onViewChange={onViewChange} 
        userProfile={userProfile as UserProfile}
      />
      {children}
    </div>
  );
};

export default Layout;
