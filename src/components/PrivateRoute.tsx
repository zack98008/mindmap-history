
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { loading, user } = useAuth();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    console.log("PrivateRoute: Auth state", { 
      loading, 
      isAuthenticated: !!user, 
      currentPath: location.pathname,
      initialLoadComplete
    });
    
    // Mark initial load as complete when loading finishes
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, user, location, initialLoadComplete]);
  
  // Show loading spinner only on initial page load, not on subsequent route changes
  // Also don't show spinner if we already know we're redirecting to auth page
  if (loading && !initialLoadComplete && !location.pathname.includes('/auth')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!user) {
    console.log("PrivateRoute: User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // User is authenticated, render children
  return <>{children}</>;
};

export default PrivateRoute;
