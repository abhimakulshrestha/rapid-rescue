
import React from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import { AnimatePresence } from 'framer-motion';
import { useVehicleAnimation } from './hooks/useVehicleAnimation';
import VehiclePath from './VehiclePath';
import VehicleMarker from './VehicleMarker';

interface VehicleMarkersProps {
  vehicles: EmergencyVehicle[];
}

const VehicleMarkers: React.FC<VehicleMarkersProps> = ({ vehicles }) => {
  const { animatedVehicles } = useVehicleAnimation(vehicles);
  
  return (
    <AnimatePresence>
      {Object.values(animatedVehicles).map(({ vehicle, animating, pathHistory }) => {
        let position: [number, number] = [vehicle.latitude, vehicle.longitude];
        
        if (animating) {
          // Create more varied movements based on vehicle type
          let offsetMultiplier = 1.0;
          if (vehicle.type === 'ambulance') offsetMultiplier = 1.8; // Ambulances move faster
          if (vehicle.type === 'police') offsetMultiplier = 1.5; // Police moves moderately fast
          
          const offsetLat = (Math.random() * 0.0005 * offsetMultiplier) * (Math.random() > 0.5 ? 1 : -1);
          const offsetLng = (Math.random() * 0.0005 * offsetMultiplier) * (Math.random() > 0.5 ? 1 : -1);
          
          position = [
            vehicle.latitude + offsetLat,
            vehicle.longitude + offsetLng
          ];
        }
        
        const isAvailable = vehicle.status === 'available';
        
        return (
          <React.Fragment key={vehicle.id}>
            {/* Path visualization component */}
            <VehiclePath 
              pathHistory={pathHistory} 
              vehicleType={vehicle.type} 
              isAvailable={isAvailable} 
            />
            
            {/* Vehicle marker component */}
            <VehicleMarker 
              vehicle={vehicle} 
              position={position} 
              isAnimating={animating} 
            />
          </React.Fragment>
        );
      })}
    </AnimatePresence>
  );
};

export default VehicleMarkers;
