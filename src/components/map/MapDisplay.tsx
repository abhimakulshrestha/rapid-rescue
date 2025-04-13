
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader } from 'lucide-react';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapDisplayProps {
  location: { lat: number; lng: number } | null;
  loading: boolean;
  onMapReady: (map: L.Map) => void;
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

const MapDisplay: React.FC<MapDisplayProps> = ({ location, loading, onMapReady }) => {
  // Default location (centered on India)
  const defaultLocation: [number, number] = [20.5937, 78.9629];
  const zoomLevel = 5;

  return (
    <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden relative">
      {location || !loading ? (
        <MapContainer 
          center={location ? [location.lat, location.lng] : defaultLocation}
          zoom={location ? 14 : zoomLevel}
          style={{ height: '100%', width: '100%' }}
          whenReady={(map) => onMapReady(map.target)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {location && <Marker position={[location.lat, location.lng]} />}
          
          {/* Map updater component to handle location changes */}
          <MapUpdater location={location} />
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
