
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconAmbulance from '/ambulance-icon.png';
import iconPolice from '/police-icon.png';
import iconFire from '/fire-icon.png';

// Fix Leaflet default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Create custom icons for emergency vehicles
const AmbulanceIcon = L.icon({
  iconUrl: iconAmbulance || icon,
  shadowUrl: iconShadow,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const PoliceIcon = L.icon({
  iconUrl: iconPolice || icon,
  shadowUrl: iconShadow,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const FireIcon = L.icon({
  iconUrl: iconFire || icon,
  shadowUrl: iconShadow,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Set default icon
L.Marker.prototype.options.icon = DefaultIcon;

interface MapDisplayProps {
  location: { lat: number; lng: number } | null;
  loading: boolean;
  onMapReady: (map: L.Map) => void;
}

interface EmergencyVehicle {
  id: string;
  type: string;
  name: string;
  phone: string | null;
  status: string | null;
  latitude: number;
  longitude: number;
  last_updated: string | null;
}

// Component to update map view when location changes
const MapUpdater = ({ location }: { location: { lat: number; lng: number } | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 14);
    }
  }, [location, map]);
  
  return null;
};

// Component to handle map initialization
const MapInitializer = ({ onMapReady }: { onMapReady: (map: L.Map) => void }) => {
  const map = useMap();
  const initRef = useRef(false);
  
  useEffect(() => {
    // Only call onMapReady once to prevent infinite loop
    if (!initRef.current) {
      initRef.current = true;
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({ location, loading, onMapReady }) => {
  // Default location (centered on India)
  const defaultLocation: [number, number] = [20.5937, 78.9629];
  const zoomLevel = 5;
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);

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

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return AmbulanceIcon;
      case 'police':
        return PoliceIcon;
      case 'fire':
        return FireIcon;
      default:
        return DefaultIcon;
    }
  };

  return (
    <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden relative">
      {location || !loading ? (
        <MapContainer 
          center={location ? [location.lat, location.lng] : defaultLocation}
          zoom={location ? 14 : zoomLevel}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          {location && <Marker position={[location.lat, location.lng]}>
            <Popup>Your Location</Popup>
          </Marker>}
          
          {/* Emergency vehicle markers */}
          {vehicles.map((vehicle) => (
            <Marker 
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={getVehicleIcon(vehicle.type)}
            >
              <Popup>
                <div>
                  <h3 className="font-bold text-sm">{vehicle.name}</h3>
                  <p className="text-xs capitalize">{vehicle.type}</p>
                  {vehicle.phone && (
                    <p className="text-xs mt-1">
                      <a 
                        href={`tel:${vehicle.phone}`} 
                        className="text-blue-600 hover:underline"
                      >
                        Call: {vehicle.phone}
                      </a>
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Map updater component to handle location changes */}
          <MapUpdater location={location} />
          
          {/* Map initializer component to handle map ready event */}
          <MapInitializer onMapReady={handleMapReady} />
        </MapContainer>
      ) : null}
      
      {loading && !location && (
        <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-white/80 z-10">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-emergency-red" />
            <p className="mt-2 text-sm text-gray-500">Detecting your location...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
