
import React from "react";
import NavBar from "./NavBar";

interface LayoutProps {
  children: React.ReactNode;
  activeView?: 'map' | 'timeline';
  onViewChange?: (view: 'map' | 'timeline') => void;
  language?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onViewChange,
  language = 'ar' // Default to Arabic
}) => {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <NavBar 
        activeView={activeView} 
        onViewChange={onViewChange}
        language={language}
      />
      {children}
    </div>
  );
};

export default Layout;
