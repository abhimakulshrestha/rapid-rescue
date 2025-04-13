
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapDisplay from '@/components/map/MapDisplay';
import LocationInfo from '@/components/LocationInfo';
import { useGeolocation } from '@/hooks/useGeolocation';

interface MapLocationProps {
  onLocationUpdate: (latitude: number, longitude: number) => void;
}

const MapLocation: React.FC<MapLocationProps> = ({ onLocationUpdate }) => {
  const markerRef = useRef<L.Marker | null>(null);
  // Reference to the map instance
  const mapRef = useRef<L.Map | null>(null);
  const { location, loading, startLocationTracking } = useGeolocation();

  // Update parent component with location changes - using useCallback to prevent unnecessary renders
  const updateParentLocation = useCallback(() => {
    if (location) {
      onLocationUpdate(location.lat, location.lng);
    }
  }, [location, onLocationUpdate]);

  // Use effect with callback dependency
  useEffect(() => {
    updateParentLocation();
  }, [updateParentLocation]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    // Get user location once map is loaded
    startLocationTracking();
  }, [startLocationTracking]);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Your Location</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startLocationTracking} 
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
          
          <MapDisplay 
            location={location} 
            loading={loading} 
            onMapReady={handleMapReady} 
          />
          
          <LocationInfo location={location} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLocation;
