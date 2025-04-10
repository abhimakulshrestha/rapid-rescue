
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import MapLocation from '@/components/MapLocation';
import EmergencyCategories, { EmergencyService } from '@/components/EmergencyCategories';
import NearbyServices from '@/components/NearbyServices';
import CallModal from '@/components/CallModal';
import { getNearbyServices } from '@/services/mockData';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch nearby services when location changes
  useEffect(() => {
    if (location) {
      setIsLoading(true);
      getNearbyServices(location.latitude, location.longitude)
        .then((data) => {
          setServices(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching services:', error);
          toast({
            title: "Error",
            description: "Failed to fetch nearby services",
            variant: "destructive",
          });
          setIsLoading(false);
        });
    }
  }, [location, toast]);

  const handleLocationUpdate = (latitude: number, longitude: number) => {
    setLocation({ latitude, longitude });
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const handleCallService = (service: EmergencyService) => {
    setSelectedService(service);
    setCallModalOpen(true);
  };

  const handleConfirmCall = async () => {
    if (!selectedService || !location || !user) return;

    try {
      // Log the emergency event to Supabase
      const { error } = await supabase
        .from('emergency_events')
        .insert({
          user_id: user.id,
          type: selectedService.category,
          service_id: selectedService.id,
          latitude: location.latitude,
          longitude: location.longitude
        } as Database['public']['Tables']['emergency_events']['Insert']);

      if (error) throw error;

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
  };

  // If not authenticated, don't render anything (will be redirected)
  if (!user) {
    return null;
  }

  const userName = user?.user_metadata?.name || 'User';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header userName={userName} onLogout={signOut} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
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
