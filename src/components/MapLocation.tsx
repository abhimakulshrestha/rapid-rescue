
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1haS1kZW1vIiwiYSI6ImNsczBiMXZqcTF0ZTgycW9jNjRseDRrdG0ifQ.OUOzd0eGjXyq47C2J_zTQQ';

interface MapLocationProps {
  onLocationUpdate: (latitude: number, longitude: number) => void;
}

const MapLocation: React.FC<MapLocationProps> = ({ onLocationUpdate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Function to get user's location
  const getUserLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    // Clear any existing watch
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
    }
    
    // Start watching location for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Location update:", latitude, longitude);
        const newLocation = { lat: latitude, lng: longitude };
        setLocation(newLocation);
        onLocationUpdate(latitude, longitude);
        
        // Update map and marker when location changes
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            speed: 1.5,
            essential: true
          });

          // Update or create marker
          if (markerRef.current) {
            markerRef.current.setLngLat([longitude, latitude]);
          } else {
            markerRef.current = new mapboxgl.Marker({ color: '#FF4A4A' })
              .setLngLat([longitude, latitude])
              .addTo(mapRef.current);
          }
        }
        
        setLoading(false);
      },
      (error) => {
        let message = "Unknown error occurred";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location services";
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
        
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    
    setLocationWatchId(watchId);
  };

  // Initialize map once component mounts
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Create the map instance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0], // Default center, will be updated when location is acquired
      zoom: 2
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    mapRef.current = map;
    
    // Get user location once map is loaded
    map.on('load', () => {
      getUserLocation();
    });
    
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, []);

  // Clean up location watch when component unmounts
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Your Location</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getUserLocation} 
              disabled={loading}
              className="text-xs"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-3 w-3 animate-spin" />
                  Locating...
                </>
              ) : (
                "Refresh Location"
              )}
            </Button>
          </div>
          
          <div 
            ref={mapContainerRef} 
            className="w-full h-64 bg-gray-100 rounded-md overflow-hidden"
          >
            {loading && !location && (
              <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-white/80 z-10">
                <div className="flex flex-col items-center">
                  <Loader className="h-8 w-8 animate-spin text-emergency-red" />
                  <p className="mt-2 text-sm text-gray-500">Detecting your location...</p>
                </div>
              </div>
            )}
          </div>
          
          {location && (
            <div className="text-sm text-gray-500">
              <p>Latitude: {location.lat.toFixed(6)}</p>
              <p>Longitude: {location.lng.toFixed(6)}</p>
              <p className="mt-2 text-xs">
                <span className="inline-flex items-center text-green-600">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                  Live location tracking active
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLocation;
