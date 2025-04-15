
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css'; // Import our custom CSS
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import MapUpdater from './MapUpdater';
import MapInitializer from './MapInitializer';
import MapLoading from './MapLoading';
import VehicleMarkers from './VehicleMarkers';
import { DefaultIcon } from './MapIcons';

interface MapDisplayProps {
  location: { lat: number; lng: number } | null;
  loading: boolean;
  onMapReady: (map: L.Map) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ location, loading, onMapReady }) => {
  // Default location (centered on India)
  const defaultLocation: [number, number] = [20.5937, 78.9629];
  const zoomLevel = 5;
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);
  const [mapKey, setMapKey] = useState<number>(0);
  
  // Memoize the center location to prevent unnecessary re-renders
  const centerLocation = useMemo(() => 
    location ? [location.lat, location.lng] : defaultLocation,
  [location]);

  // Fetch emergency vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from('emergency_vehicles')
          .select('*');

        if (error) throw error;
        
        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching emergency vehicles:', error);
      }
    };

    fetchVehicles();

    // Set up real-time subscription
    const channel = supabase
      .channel('emergency-vehicles-map')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_vehicles',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVehicles(prev => [...prev, payload.new as EmergencyVehicle]);
          } else if (payload.eventType === 'UPDATE') {
            setVehicles(prev => prev.map(vehicle => 
              vehicle.id === payload.new.id ? payload.new as EmergencyVehicle : vehicle
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
  }, []);

  // Memoize onMapReady to prevent unnecessary re-renders
  const handleMapReady = useCallback((map: L.Map) => {
    onMapReady(map);
  }, [onMapReady]);
  
  // Force a re-mount of the map container when location changes significantly
  useEffect(() => {
    if (location) {
      setMapKey(prev => prev + 1);
    }
  }, [location?.lat?.toFixed(3), location?.lng?.toFixed(3)]);

  // Early return pattern to simplify the component
  if (loading && !location) {
    return <MapLoading />;
  }

  return (
    <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden relative">
      <MapContainer 
        key={mapKey}
        center={centerLocation as [number, number]}
        zoom={location ? 14 : zoomLevel}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {location && <Marker position={[location.lat, location.lng]} icon={DefaultIcon}>
          <Popup>Your Location</Popup>
        </Marker>}
        
        {/* Emergency vehicle markers with animation */}
        <VehicleMarkers vehicles={vehicles} />
        
        {/* Map updater component to handle location changes */}
        <MapUpdater location={location} />
        
        {/* Map initializer component to handle map ready event */}
        <MapInitializer onMapReady={handleMapReady} />
      </MapContainer>
    </div>
  );
};

export default React.memo(MapDisplay);
