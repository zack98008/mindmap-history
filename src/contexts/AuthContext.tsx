
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
  const [authChecked, setAuthChecked] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
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
        setLoading(true);
        console.log("AuthProvider: Fetching initial session");
        
        // Get session from local storage first
        const { data: { session } } = await supabase.auth.getSession();
        console.log("AuthProvider: Initial session", { exists: !!session, user: session?.user?.email });
        
        if (session && mounted) {
          setSession(session);
          setUser(session.user);
          
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed", { event, user: session?.user?.email });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
          setAuthChecked(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Ensure we reset loading state after a short timeout if it gets stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !authChecked) {
        console.log("AuthProvider: Loading state reset due to timeout");
        setLoading(false);
        setAuthChecked(true);
      }
    }, 5000); // 5 second safety timeout

    return () => clearTimeout(timer);
  }, [loading, authChecked]);

  const signOut = async () => {
    try {
      console.log("AuthProvider: Signing out");
      setLoading(true);
      await supabase.auth.signOut();
      // State will be updated by the onAuthStateChange event
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
