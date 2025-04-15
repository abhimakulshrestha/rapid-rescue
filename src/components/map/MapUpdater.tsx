
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapUpdaterProps {
  location: { lat: number; lng: number } | null;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ location }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 14);
    }
  }, [location, map]);
  
  return null;
};

export default MapUpdater;
