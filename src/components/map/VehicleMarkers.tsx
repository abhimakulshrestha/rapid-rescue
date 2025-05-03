
import React, { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import { getVehicleIcon } from './MapIcons';
import L from 'leaflet';

interface VehicleMarkersProps {
  vehicles: EmergencyVehicle[];
}

const VehicleMarkers: React.FC<VehicleMarkersProps> = ({ vehicles }) => {
  const [animatedVehicles, setAnimatedVehicles] = useState<Record<string, { 
    vehicle: EmergencyVehicle, 
    animating: boolean,
    originalPosition: [number, number]
  }>>({});
  
  const map = useMap();
  
  useEffect(() => {
    const newAnimatedVehicles: Record<string, any> = {};
    
    vehicles.forEach(vehicle => {
      if (animatedVehicles[vehicle.id]) {
        newAnimatedVehicles[vehicle.id] = {
          ...animatedVehicles[vehicle.id],
          vehicle: vehicle,
        };
      } else {
        newAnimatedVehicles[vehicle.id] = {
          vehicle: vehicle,
          animating: false,
          originalPosition: [vehicle.latitude, vehicle.longitude] as [number, number]
        };
      }
    });
    
    setAnimatedVehicles(newAnimatedVehicles);
  }, [vehicles]);
  
  useEffect(() => {
    const animationInterval = setInterval(() => {
      const vehicleIds = Object.keys(animatedVehicles);
      if (vehicleIds.length === 0) return;
      
      const randomIndex = Math.floor(Math.random() * vehicleIds.length);
      const vehicleId = vehicleIds[randomIndex];
      
      if (animatedVehicles[vehicleId].animating) return;
      
      setAnimatedVehicles(prev => ({
        ...prev,
        [vehicleId]: {
          ...prev[vehicleId],
          animating: true
        }
      }));
      
      setTimeout(() => {
        setAnimatedVehicles(prev => {
          if (!prev[vehicleId]) return prev;
          return {
            ...prev,
            [vehicleId]: {
              ...prev[vehicleId],
              animating: false
            }
          };
        });
      }, 3000);
    }, 5000);
    
    return () => clearInterval(animationInterval);
  }, [animatedVehicles]);

  return (
    <>
      {Object.values(animatedVehicles).map(({ vehicle, animating, originalPosition }) => {
        let position: [number, number] = [vehicle.latitude, vehicle.longitude];
        
        if (animating) {
          const offsetLat = (Math.random() * 0.0005) * (Math.random() > 0.5 ? 1 : -1);
          const offsetLng = (Math.random() * 0.0005) * (Math.random() > 0.5 ? 1 : -1);
          position = [
            vehicle.latitude + offsetLat,
            vehicle.longitude + offsetLng
          ];
        }
        
        const icon = getVehicleIcon(vehicle.type);
        
        // Apply animation directly via DOM element
        if (animating) {
          // Add to animated elements list - it will get the CSS animation from map.css
          setTimeout(() => {
            const elements = document.querySelectorAll(`.vehicle-${vehicle.id}`);
            elements.forEach(el => {
              const imgElement = el.querySelector('img');
              if (imgElement) {
                imgElement.classList.add('leaflet-marker-animated');
              }
            });
          }, 0);
        }
        
        return (
          <Marker 
            key={vehicle.id}
            position={position}
            icon={icon}
            eventHandlers={{
              add: (e) => {
                const el = e.target.getElement();
                if (el) {
                  el.classList.add(`vehicle-${vehicle.id}`);
                }
              }
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold text-sm">{vehicle.name}</h3>
                <p className="text-xs capitalize">{vehicle.type}</p>
                {animating && (
                  <p className="text-xs text-green-600 font-medium">
                    Currently active
                  </p>
                )}
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
        );
      })}
    </>
  );
};

export default VehicleMarkers;
