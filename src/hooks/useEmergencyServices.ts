
import { useState, useEffect, useCallback } from 'react';
import { EmergencyService } from '@/types/emergencyTypes';
import { getNearbyServices, logEmergencyEvent, initiatePhoneCall } from '@/services/emergencyServices';
import { useToast } from '@/hooks/use-toast';

export function useEmergencyServices(location: { latitude: number; longitude: number } | null) {
  const { toast } = useToast();
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);

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

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleCallService = useCallback((service: EmergencyService) => {
    setSelectedService(service);
    setCallModalOpen(true);
  }, []);

  const handleConfirmCall = useCallback(async (userId: string, userLocation: { latitude: number; longitude: number } | null) => {
    if (!selectedService || !userLocation || !userId) return;

    try {
      const emergencyEvent = {
        userId,
        type: selectedService.category,
        serviceId: selectedService.id,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
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
  }, [selectedService, toast]);

  return {
    services,
    isLoading,
    selectedCategory,
    selectedService,
    callModalOpen,
    handleSelectCategory,
    handleCallService,
    handleConfirmCall,
    setCallModalOpen
  };
}
