
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { mockLogin, mockSignup } from '@/services/mockData';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // For demo purposes, we'll just check localStorage
    const storedUser = localStorage.getItem('demo_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser as User);
        // Create a fake session for UI purposes
        setSession({
          access_token: 'fake-token',
          refresh_token: 'fake-refresh-token',
          user: parsedUser as User,
          expires_at: Date.now() + 3600
        } as Session);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // For demo purposes, use mockSignup instead of Supabase
      const { user } = await mockSignup(name, email, password);
      
      // Store user in localStorage for persistence
      localStorage.setItem('demo_user', JSON.stringify(user));
      
      // Set user state
      setUser(user as unknown as User);
      
      // Create a fake session for UI purposes
      setSession({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh-token',
        user: user as unknown as User,
        expires_at: Date.now() + 3600
      } as Session);

      toast({
        title: "Signup Successful",
        description: `Welcome, ${name}!`,
      });

    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // For demo purposes, use mockLogin instead of Supabase
      const { user } = await mockLogin(email, password);
      
      // Store user in localStorage for persistence
      localStorage.setItem('demo_user', JSON.stringify(user));
      
      // Set user state
      setUser(user as unknown as User);
      
      // Create a fake session for UI purposes
      setSession({
        access_token: 'fake-token',
        refresh_token: 'fake-refresh-token',
        user: user as unknown as User,
        expires_at: Date.now() + 3600
      } as Session);

      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Please use the demo credentials shown below the form",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // For demo purposes, just clear localStorage
      localStorage.removeItem('demo_user');
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
