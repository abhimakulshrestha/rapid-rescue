
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapInitializerProps {
  onMapReady: (map: L.Map) => void;
}

const MapInitializer: React.FC<MapInitializerProps> = ({ onMapReady }) => {
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

export default MapInitializer;
