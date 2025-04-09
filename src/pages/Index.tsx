
import React, { useState } from 'react';
import AuthForm from '@/components/AuthForm';
import Dashboard from './Dashboard';
import { mockLogin, mockSignup } from '@/services/mockData';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await mockLogin(email, password);
      setUser(response.user);
      setAuthenticated(true);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to be caught by the form
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const response = await mockSignup(name, email, password);
      setUser(response.user);
      setAuthenticated(true);
      
      toast({
        title: "Account Created",
        description: `Welcome to Rapid Rescue, ${response.user.name}!`,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error; // Re-throw to be caught by the form
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  if (authenticated && user) {
    return <Dashboard userId={user.id} userName={user.name} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-emergency-red">Rapid Rescue</h1>
        <p className="text-gray-600 mt-2">Your emergency response platform</p>
      </div>
      
      <AuthForm onLogin={handleLogin} onSignup={handleSignup} />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>For demo purposes, use the following credentials:</p>
        <p className="font-mono mt-1">Email: user@example.com</p>
        <p className="font-mono">Password: password</p>
      </div>
    </div>
  );
};

export default Index;
