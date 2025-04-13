
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader } from 'lucide-react';

interface MapDisplayProps {
  location: { lat: number; lng: number } | null;
  loading: boolean;
  onMapReady: (map: mapboxgl.Map) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ location, loading, onMapReady }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

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
    
    // Notify parent when map is loaded
    map.on('load', () => {
      onMapReady(map);
    });
    
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapReady]);

  return (
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
  );
};

export default MapDisplay;
