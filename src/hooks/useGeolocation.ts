
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeolocationState {
  location: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
  watchId: number | null;
}

interface UseGeolocationReturn extends GeolocationState {
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const { toast } = useToast();
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    watchId: null
  });

  const startLocationTracking = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: "Geolocation is not supported by your browser"
      }));
      
      return;
    }
    
    // Clear any existing watch
    if (state.watchId !== null) {
      stopLocationTracking();
    }
    
    // Get current position immediately first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Initial location:", latitude, longitude);
        setState(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude },
          loading: false,
          error: null
        }));
        
        // Then start watching for changes
        startWatchingPosition();
      },
      (error) => {
        handleLocationError(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const startWatchingPosition = () => {
    // Start watching location for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Location update:", latitude, longitude);
        setState(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude },
          loading: false,
          error: null
        }));
      },
      (error) => {
        handleLocationError(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    
    setState(prev => ({ ...prev, watchId }));
  };
  
  const handleLocationError = (error: GeolocationPositionError) => {
    let message = "Unknown error occurred";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = "Location access denied. Please enable location services in your browser settings";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Location information is unavailable";
        break;
      case error.TIMEOUT:
        message = "The request to get user location timed out";
        break;
    }
    
    toast({
      title: "Location Error",
      description: message,
      variant: "destructive",
    });
    
    setState(prev => ({
      ...prev,
      loading: false,
      error: message
    }));
  };

  const stopLocationTracking = () => {
    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId);
      setState(prev => ({ ...prev, watchId: null }));
    }
  };

  // Start location tracking automatically when the hook is used
  useEffect(() => {
    startLocationTracking();
    
    // Clean up location watch when component unmounts
    return () => {
      stopLocationTracking();
    };
  }, []);

  return {
    ...state,
    startLocationTracking,
    stopLocationTracking
  };
}
