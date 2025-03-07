import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user profile data from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const getInitialSession = async () => {
      try {
        // Start by setting loading to true
        setLoading(true);
        console.log("AuthProvider: Fetching initial session");
        
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Always set loading to false on error
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log("AuthProvider: Initial session", { 
          exists: !!session, 
          user: session?.user?.email 
        });
        
        // If we have a session, update state values
        if (session && mounted) {
          setSession(session);
          setUser(session.user);
          
          // Fetch additional profile data
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
          }
        }
        
        // CRITICAL: Always set loading to false regardless of session status
        // This ensures PrivateRoute can make an auth decision
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Always set loading to false on error
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Get initial session when component mounts
    getInitialSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("AuthProvider: Auth state changed", { 
          event, 
          user: newSession?.user?.email 
        });
        
        if (mounted) {
          // Update session and user state
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Fetch profile data if user is logged in
          if (newSession?.user) {
            const profile = await fetchUserProfile(newSession.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          } else {
            setUserProfile(null);
          }
          
          // Always ensure loading is set to false after auth state change
          setLoading(false);
        }
      }
    );

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Safety timeout to ensure loading state can't get stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("AuthProvider: Loading state reset due to timeout");
        setLoading(false);
      }
    }, 3000); // 3 second safety timeout

    return () => clearTimeout(timer);
  }, [loading]);

  // Sign out function
  const signOut = async () => {
    try {
      console.log("AuthProvider: Signing out");
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      // Auth state change will be handled by the onAuthStateChange event
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  // Context value to provide to consumers
  const value = {
    session,
    user,
    userProfile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
