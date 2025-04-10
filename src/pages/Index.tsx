
import React, { useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

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

  // If user is authenticated, don't render the login form (will be redirected)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-emergency-red">Rapid Rescue</h1>
        <p className="text-gray-600 mt-2">Your emergency response platform</p>
      </div>
      
      <AuthForm onLogin={signIn} onSignup={signUp} />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p className="font-medium text-base">Please use these demo credentials:</p>
        <p className="font-mono mt-1">Email: user@example.com</p>
        <p className="font-mono">Password: password</p>
        <p className="mt-2 text-xs">Or create a new account using the Sign up tab</p>
      </div>
    </div>
  );
};

export default Index;
