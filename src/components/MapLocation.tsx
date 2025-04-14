
import React, { useRef, useState, useCallback } from 'react';
import { Loader, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapDisplay from '@/components/map/MapDisplay';
import LocationInfo from '@/components/LocationInfo';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useForm } from 'react-hook-form';

interface MapLocationProps {
  onLocationUpdate: (latitude: number, longitude: number) => void;
}

interface CoordinatesFormValues {
  latitude: string;
  longitude: string;
}

const MapLocation: React.FC<MapLocationProps> = ({ onLocationUpdate }) => {
  const markerRef = useRef<L.Marker | null>(null);
  // Reference to the map instance
  const mapRef = useRef<L.Map | null>(null);
  const { location, loading, startLocationTracking } = useGeolocation();
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Form for manual coordinates entry
  const form = useForm<CoordinatesFormValues>({
    defaultValues: {
      latitude: location?.lat.toString() || '',
      longitude: location?.lng.toString() || '',
    },
  });

  // Update form values when location changes
  React.useEffect(() => {
    if (location) {
      form.setValue('latitude', location.lat.toString());
      form.setValue('longitude', location.lng.toString());
    }
  }, [location, form]);

  // Update parent component with location changes - using useCallback to prevent unnecessary renders
  const updateParentLocation = useCallback(() => {
    if (location) {
      onLocationUpdate(location.lat, location.lng);
    }
  }, [location, onLocationUpdate]);

  // Use effect with callback dependency
  React.useEffect(() => {
    updateParentLocation();
  }, [updateParentLocation]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    // Get user location once map is loaded
    startLocationTracking();
  }, [startLocationTracking]);

  const handleManualSubmit = (values: CoordinatesFormValues) => {
    const lat = parseFloat(values.latitude);
    const lng = parseFloat(values.longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationUpdate(lat, lng);
      
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 14);
      }
      
      setShowManualEntry(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Your Location</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowManualEntry(!showManualEntry)} 
                className="text-xs"
              >
                <MapPin className="mr-1 h-3 w-3" />
                {showManualEntry ? "Hide Form" : "Manual Entry"}
              </Button>
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
          </div>
          
          {showManualEntry && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleManualSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 28.6139" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 77.2090" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" size="sm">
                    Update Location
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
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
