
import React from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import VehicleMarker from './VehicleMarker';

interface VehicleMarkersProps {
  vehicles: EmergencyVehicle[];
}

const VehicleMarkers: React.FC<VehicleMarkersProps> = ({ vehicles }) => {
  return (
    <>
      {vehicles.map((vehicle) => {
        const position: [number, number] = [vehicle.latitude, vehicle.longitude];
        
        return (
          <VehicleMarker 
            key={vehicle.id}
            vehicle={vehicle} 
            position={position} 
            isAnimating={false}
          />
        );
      })}
    </>
  );
};

export default VehicleMarkers;
