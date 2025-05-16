
import React from 'react';
import { Marker } from 'react-leaflet';
import { getVehicleIcon } from './MapIcons';
import VehiclePopup from './VehiclePopup';
import { EmergencyVehicle } from '@/types/emergencyTypes';

interface VehicleMarkerProps {
  vehicle: EmergencyVehicle;
  position: [number, number];
  isAnimating: boolean;
}

const VehicleMarker: React.FC<VehicleMarkerProps> = ({ vehicle, position, isAnimating }) => {
  const icon = getVehicleIcon(vehicle.type);
  const vehicleTypeClass = `${vehicle.type}-vehicle`;
  const isAvailable = vehicle.status === 'available';
  
  return (
    <Marker 
      position={position}
      icon={icon}
      eventHandlers={{
        add: (e) => {
          const el = e.target.getElement();
          if (el) {
            el.classList.add(`vehicle-${vehicle.id}`);
            el.classList.add(vehicleTypeClass);
            if (isAvailable) {
              el.classList.add('status-available');
            }
            
            // Apply animation directly via DOM element
            if (isAnimating) {
              const imgElement = el.querySelector('img');
              if (imgElement) {
                imgElement.classList.add('leaflet-marker-animated');
                
                // Add status-based animation intensity
                if (isAvailable) {
                  imgElement.classList.add('status-available');
                }
              }
              // Add vehicle type class for type-specific animations
              el.classList.add(vehicleTypeClass);
            }
          }
        }
      }}
    >
      <VehiclePopup vehicle={vehicle} isAnimating={isAnimating} />
    </Marker>
  );
};

export default VehicleMarker;
