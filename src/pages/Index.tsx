
import React from 'react';
import AuthForm from '@/components/AuthForm';
import Dashboard from './Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-emergency-red" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard 
      userId={user.id} 
      userName={user.user_metadata?.name || 'User'} 
      onLogout={signOut} 
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-emergency-red">Rapid Rescue</h1>
        <p className="text-gray-600 mt-2">Your emergency response platform</p>
      </div>
      
      <AuthForm onLogin={signIn} onSignup={signUp} />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>For demo purposes, you can create a new account or use:</p>
        <p className="font-mono mt-1">Email: user@example.com</p>
        <p className="font-mono">Password: password</p>
      </div>
    </div>
  );
};

export default Index;
