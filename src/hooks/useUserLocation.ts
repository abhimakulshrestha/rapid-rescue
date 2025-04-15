
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserLocation(userId: string | undefined) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Update user location in the database
  useEffect(() => {
    if (userId && location) {
      const updateUserLocation = async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              location_lat: location.latitude,
              location_lng: location.longitude,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) throw error;
          console.log('User location updated in database');
        } catch (error) {
          console.error('Error updating user location:', error);
        }
      };

      updateUserLocation();
    }
  }, [userId, location]);

  const handleLocationUpdate = useCallback((latitude: number, longitude: number) => {
    setLocation(prev => {
      if (!prev || prev.latitude !== latitude || prev.longitude !== longitude) {
        return { latitude, longitude };
      }
      return prev;
    });
  }, []);

  return {
    location,
    handleLocationUpdate
  };
}
