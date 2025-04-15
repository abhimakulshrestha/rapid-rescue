
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserLocation(userId: string | undefined) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update user location in the database with throttling
  useEffect(() => {
    if (userId && location) {
      // Throttle database updates to prevent too many requests
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 5000) {
        // If less than 5 seconds have passed since last update, schedule an update
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        updateTimeoutRef.current = setTimeout(() => {
          updateUserLocationInDb(userId, location);
          lastUpdateTimeRef.current = Date.now();
        }, 5000 - (now - lastUpdateTimeRef.current));
      } else {
        // Immediate update if enough time has passed
        updateUserLocationInDb(userId, location);
        lastUpdateTimeRef.current = now;
      }
    }
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [userId, location]);

  const updateUserLocationInDb = async (userId: string, location: { latitude: number; longitude: number }) => {
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

  const handleLocationUpdate = useCallback((latitude: number, longitude: number) => {
    setLocation(prev => {
      // Only update if location has changed significantly (at least 0.0001 degrees ~ 11 meters)
      const hasChanged = !prev || 
        Math.abs(prev.latitude - latitude) > 0.0001 || 
        Math.abs(prev.longitude - longitude) > 0.0001;
        
      if (hasChanged) {
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
