
import React, { useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapDisplay from '@/components/map/MapDisplay';
import LocationInfo from '@/components/LocationInfo';
import { useGeolocation } from '@/hooks/useGeolocation';

// Initialize Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1haS1kZW1vIiwiYSI6ImNsczBiMXZqcTF0ZTgycW9jNjRseDRrdG0ifQ.OUOzd0eGjXyq47C2J_zTQQ';

interface MapLocationProps {
  onLocationUpdate: (latitude: number, longitude: number) => void;
}

const MapLocation: React.FC<MapLocationProps> = ({ onLocationUpdate }) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  // Reference to the map instance
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { location, loading, startLocationTracking } = useGeolocation();

  // Update parent component with location changes
  useEffect(() => {
    if (location) {
      onLocationUpdate(location.lat, location.lng);
    }
  }, [location, onLocationUpdate]);

  const handleMapReady = (map: mapboxgl.Map) => {
    // Get user location once map is loaded
    startLocationTracking();
  };

  // Update map when location changes
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 14,
        speed: 1.5,
        essential: true
      });

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLngLat([location.lng, location.lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#FF4A4A' })
          .setLngLat([location.lng, location.lat])
          .addTo(mapRef.current);
      }
    }
  }, [location]);

  const onMapReadyCallback = (map: mapboxgl.Map) => {
    mapRef.current = map;
    handleMapReady(map);
  };

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
            onMapReady={onMapReadyCallback} 
          />
          
          <LocationInfo location={location} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapLocation;
