
import React from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import VehicleMarker from './VehicleMarker';
import VehiclePath from './VehiclePath';
import { useVehicleTracking } from './hooks/useVehicleTracking';

interface VehicleMarkersProps {
  vehicles: EmergencyVehicle[];
}

const VehicleMarkers: React.FC<VehicleMarkersProps> = ({ vehicles }) => {
  const { trackedVehicles } = useVehicleTracking(vehicles);
  
  return (
    <>
      {vehicles.map((vehicle) => {
        const position: [number, number] = [vehicle.latitude, vehicle.longitude];
        const trackedData = trackedVehicles[vehicle.id];
        
        return (
          <React.Fragment key={vehicle.id}>
            {/* Show path history for tracked vehicles */}
            {trackedData?.pathHistory && trackedData.pathHistory.length > 1 && (
              <VehiclePath 
                pathHistory={trackedData.pathHistory}
                vehicleType={vehicle.type}
                isAvailable={vehicle.status === 'available'}
              />
            )}
            
            <VehicleMarker 
              vehicle={vehicle} 
              position={position} 
              isAnimating={false}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default VehicleMarkers;
