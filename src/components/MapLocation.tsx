
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MapLocationProps {
  onLocationUpdate: (latitude: number, longitude: number) => void;
}

const MapLocation: React.FC<MapLocationProps> = ({ onLocationUpdate }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
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
        setLocation({ lat: latitude, lng: longitude });
        onLocationUpdate(latitude, longitude);
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

  // Initialize map once location is available
  useEffect(() => {
    if (location && mapRef.current && !mapInitialized) {
      // This is a placeholder for map initialization
      // In a real implementation, you would initialize your map library here
      const mapElement = mapRef.current;
      mapElement.innerHTML = `
        <div class="p-4 text-center bg-gray-100 rounded-lg h-full flex items-center justify-center">
          <div>
            <p class="font-medium">Map would display here</p>
            <p class="text-sm text-gray-500 mt-2">Your location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
            <div class="mt-3 bg-green-100 text-green-700 p-2 rounded text-xs">
              In a production app, this would show an actual map with your location
            </div>
          </div>
        </div>
      `;
      setMapInitialized(true);
    }
  }, [location, mapInitialized]);

  // Clean up location watch when component unmounts
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  // Get location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

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
            ref={mapRef} 
            className="w-full h-64 bg-gray-100 rounded-md overflow-hidden"
          >
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader className="h-8 w-8 animate-spin text-emergency-red" />
                  <p className="mt-2 text-sm text-gray-500">Detecting your location...</p>
                </div>
              </div>
            ) : !location ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Location unavailable</p>
              </div>
            ) : null}
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
