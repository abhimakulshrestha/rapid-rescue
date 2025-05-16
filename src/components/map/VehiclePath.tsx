
import React from 'react';
import { Polyline } from 'react-leaflet';

interface VehiclePathProps {
  pathHistory: Array<[number, number]>;
  vehicleType: string;
  isAvailable: boolean;
}

const VehiclePath: React.FC<VehiclePathProps> = ({ pathHistory, vehicleType, isAvailable }) => {
  if (pathHistory.length <= 1) {
    return null;
  }
  
  const getPathColor = () => {
    switch (vehicleType) {
      case 'ambulance':
        return 'rgba(234, 56, 76, 0.7)';
      case 'police':
        return 'rgba(30, 174, 219, 0.7)';
      case 'fire':
        return 'rgba(249, 115, 22, 0.7)';
      default:
        return 'rgba(75, 85, 99, 0.7)';
    }
  };

  return (
    <Polyline 
      positions={pathHistory} 
      pathOptions={{
        color: getPathColor(),
        opacity: isAvailable ? 0.8 : 0.5,
        weight: isAvailable ? 3 : 2,
        dashArray: isAvailable ? '' : '5,5',
        className: `vehicle-path ${vehicleType}-path ${isAvailable ? 'path-available' : 'path-busy'}`
      }}
    />
  );
};

export default VehiclePath;
