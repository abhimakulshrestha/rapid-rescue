
import React from 'react';

interface LocationInfoProps {
  location: { lat: number; lng: number } | null;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ location }) => {
  if (!location) return null;
  
  return (
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
  );
};

export default LocationInfo;
