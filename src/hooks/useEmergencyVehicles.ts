
import { useState, useEffect } from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/services/locationUtils';
import { useToast } from '@/hooks/use-toast';

export function useEmergencyVehicles(userLocation: { latitude: number; longitude: number } | null) {
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('emergency_vehicles')
          .select('*');

        if (error) throw error;

        let processedVehicles = data || [];
        
        if (userLocation) {
          processedVehicles = processedVehicles.map(vehicle => ({
            ...vehicle,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              vehicle.latitude,
              vehicle.longitude
            )
          }));
          
          processedVehicles.sort((a, b) => {
            const distA = parseFloat(a.distance?.split(' ')[0] || '999');
            const distB = parseFloat(b.distance?.split(' ')[0] || '999');
            return distA - distB;
          });
        }
        
        setVehicles(processedVehicles);
      } catch (error) {
        console.error('Error fetching emergency vehicles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load emergency vehicles data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();

    const channel = supabase
      .channel('emergency-vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_vehicles',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVehicles(prev => {
              const newVehicle = payload.new as EmergencyVehicle;
              if (userLocation) {
                newVehicle.distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  newVehicle.latitude,
                  newVehicle.longitude
                );
              }
              return [...prev, newVehicle];
            });
          } else if (payload.eventType === 'UPDATE') {
            setVehicles(prev => prev.map(vehicle => 
              vehicle.id === payload.new.id ? { 
                ...payload.new as EmergencyVehicle,
                distance: userLocation ? calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  (payload.new as EmergencyVehicle).latitude,
                  (payload.new as EmergencyVehicle).longitude
                ) : undefined
              } : vehicle
            ));
          } else if (payload.eventType === 'DELETE') {
            setVehicles(prev => prev.filter(vehicle => vehicle.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation, toast]);

  return { vehicles, isLoading };
}
