
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { loading, user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log("PrivateRoute: Auth state", { 
      loading, 
      isAuthenticated: !!user, 
      currentPath: location.pathname 
    });
  }, [loading, user, location]);
  
  // Show loading spinner only when we're actually loading
  if (loading) {
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
