
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import MapLocation from '@/components/MapLocation';
import EmergencyCategories, { EmergencyService } from '@/components/EmergencyCategories';
import NearbyServices from '@/components/NearbyServices';
import CallModal from '@/components/CallModal';
import Profile from '@/components/Profile';
import EmergencyContacts from '@/components/EmergencyContacts';
import Settings from '@/components/Settings';
import { getNearbyServices, logEmergencyEvent } from '@/services/emergencyServices';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

// Define view constants for dashboard sections
const VIEWS = {
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  CONTACTS: 'contacts',
  SETTINGS: 'settings',
};

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Debounced fetch to prevent flickering
  const fetchNearbyServices = useCallback(async () => {
    if (!location) return;
    
    setIsLoading(true);
    try {
      const data = await getNearbyServices(location.latitude, location.longitude);
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nearby services",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [location, toast]);

  // Fetch nearby services when location changes - with debounce
  useEffect(() => {
    if (location) {
      // Adding a small timeout to avoid rapid consecutive fetches
      const timerId = setTimeout(() => {
        fetchNearbyServices();
      }, 300);
      
      return () => clearTimeout(timerId);
    }
  }, [location, fetchNearbyServices]);

  const handleLocationUpdate = useCallback((latitude: number, longitude: number) => {
    setLocation(prev => {
      // Only update if location actually changed (reduces flickering)
      if (!prev || prev.latitude !== latitude || prev.longitude !== longitude) {
        return { latitude, longitude };
      }
      return prev;
    });
  }, []);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleCallService = useCallback((service: EmergencyService) => {
    setSelectedService(service);
    setCallModalOpen(true);
  }, []);

  const handleConfirmCall = useCallback(async () => {
    if (!selectedService || !location || !user) return;

    try {
      // Log the emergency event
      const emergencyEvent = {
        userId: user.id,
        type: selectedService.category,
        serviceId: selectedService.id,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      };
      
      // In a real app, this would be saved to a database
      await logEmergencyEvent(emergencyEvent);

      // Close the modal
      setCallModalOpen(false);

      // Show success toast
      toast({
        title: "Emergency Call Initiated",
        description: `Connecting to ${selectedService.name} (${selectedService.phone})`,
      });

      // In a real app, you would handle the actual phone call here
      // For demo purposes, we're just showing a toast
    } catch (error: any) {
      console.error('Error logging emergency event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate emergency call",
        variant: "destructive",
      });
    }
  }, [selectedService, location, user, toast]);

  const handleNavigationClick = useCallback((view: string) => {
    setCurrentView(view);
  }, []);

  // If not authenticated, don't render anything (will be redirected)
  if (!user) {
    return null;
  }

  const userName = user?.user_metadata?.name || 'User';
  const userId = user.id;

  // Memoize the dashboard view to reduce re-renders
  const dashboardView = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Emergency Dashboard</h2>
        <MapLocation onLocationUpdate={handleLocationUpdate} />
        <EmergencyCategories 
          onSelectCategory={handleSelectCategory}
          onCallService={handleCallService}
          nearbyServices={services}
        />
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold lg:opacity-0 hidden lg:block">Nearby Services</h2>
        <NearbyServices 
          services={services}
          selectedCategory={selectedCategory}
          onCallService={handleCallService}
        />
      </div>
    </div>
  ), [services, selectedCategory, handleLocationUpdate, handleSelectCategory, handleCallService]);

  // Render appropriate view based on currentView state
  const renderCurrentView = () => {
    switch (currentView) {
      case VIEWS.PROFILE:
        return <Profile userId={userId} />;
      case VIEWS.CONTACTS:
        return <EmergencyContacts userId={userId} />;
      case VIEWS.SETTINGS:
        return <Settings userId={userId} />;
      case VIEWS.DASHBOARD:
      default:
        return dashboardView;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        userName={userName} 
        onLogout={signOut} 
        onNavigate={handleNavigationClick}
        currentView={currentView}
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </main>
      
      <CallModal 
        isOpen={callModalOpen}
        service={selectedService}
        onClose={() => setCallModalOpen(false)}
        onConfirmCall={handleConfirmCall}
      />
    </div>
  );
};

export default Dashboard;
