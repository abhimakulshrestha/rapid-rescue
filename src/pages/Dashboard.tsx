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
import EmergencyVehicles from '@/components/EmergencyVehicles';
import Settings from '@/components/Settings';
import { getNearbyServices, logEmergencyEvent, initiatePhoneCall } from '@/services/emergencyServices';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define view constants for dashboard sections
const VIEWS = {
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  CONTACTS: 'contacts',
  SETTINGS: 'settings',
};

// Define a type for profile data that includes emergencyContacts
interface ProfileData {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  location_lat: number | null;
  location_lng: number | null;
  emergencyContacts?: any[];
}

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
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Fetch emergency contacts
    const fetchEmergencyContacts = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) {
          // Cast data to ProfileData to provide type safety
          const profileData = data as ProfileData;
          setEmergencyContacts(profileData.emergencyContacts || []);
        }
      } catch (error) {
        console.error('Error fetching emergency contacts:', error);
      }
    };

    fetchEmergencyContacts();
  }, [user, navigate]);

  // Update user location in the database
  useEffect(() => {
    if (user && location) {
      const updateUserLocation = async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              location_lat: location.latitude,
              location_lng: location.longitude,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (error) throw error;
          console.log('User location updated in database');
        } catch (error) {
          console.error('Error updating user location:', error);
        }
      };

      updateUserLocation();
    }
  }, [user, location]);

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

  useEffect(() => {
    if (location) {
      const timerId = setTimeout(() => {
        fetchNearbyServices();
      }, 300);
      
      return () => clearTimeout(timerId);
    }
  }, [location, fetchNearbyServices]);

  const handleLocationUpdate = useCallback((latitude: number, longitude: number) => {
    setLocation(prev => {
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
      const emergencyEvent = {
        userId: user.id,
        type: selectedService.category,
        serviceId: selectedService.id,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      };
      
      await logEmergencyEvent(emergencyEvent);

      setCallModalOpen(false);

      toast({
        title: "Emergency Call Initiated",
        description: `Connecting to ${selectedService.name} (${selectedService.phone})`,
      });

      await initiatePhoneCall(selectedService.phone);
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

  const handleCallEmergencyContact = useCallback((contact: any) => {
    if (contact && contact.phone) {
      initiatePhoneCall(contact.phone);
      
      toast({
        title: "Emergency Call Initiated",
        description: `Calling emergency contact: ${contact.name}`,
      });
    }
  }, [toast]);

  if (!user) {
    return null;
  }

  const userName = user?.user_metadata?.name || 'User';
  const userId = user.id;

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
        
        {/* Emergency Contacts Quick Call Section */}
        {emergencyContacts && emergencyContacts.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-3">Quick Call Emergency Contacts</h3>
            <div className="flex flex-wrap gap-2">
              {emergencyContacts.slice(0, 3).map((contact) => (
                <Button 
                  key={contact.id}
                  variant="outline" 
                  className="flex items-center border-emergency-red text-emergency-red hover:bg-emergency-red/10"
                  onClick={() => handleCallEmergencyContact(contact)}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call {contact.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold lg:opacity-0 hidden lg:block">Nearby Services</h2>
        <NearbyServices 
          services={services}
          selectedCategory={selectedCategory}
          onCallService={handleCallService}
        />
        
        {/* Display Emergency Vehicles */}
        <EmergencyVehicles userLocation={location} />
      </div>
    </div>
  ), [services, selectedCategory, location, handleLocationUpdate, handleSelectCategory, handleCallService, emergencyContacts, handleCallEmergencyContact]);

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
