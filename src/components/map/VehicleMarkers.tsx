
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import { getVehicleIcon } from './MapIcons';

interface VehicleMarkersProps {
  vehicles: EmergencyVehicle[];
}

const VehicleMarkers: React.FC<VehicleMarkersProps> = ({ vehicles }) => {
  return (
    <>
      {vehicles.map((vehicle) => (
        <Marker 
          key={vehicle.id}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={getVehicleIcon(vehicle.type)}
        >
          <Popup>
            <div>
              <h3 className="font-bold text-sm">{vehicle.name}</h3>
              <p className="text-xs capitalize">{vehicle.type}</p>
              {vehicle.phone && (
                <p className="text-xs mt-1">
                  <a 
                    href={`tel:${vehicle.phone}`} 
                    className="text-blue-600 hover:underline"
                  >
                    Call: {vehicle.phone}
                  </a>
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default VehicleMarkers;
