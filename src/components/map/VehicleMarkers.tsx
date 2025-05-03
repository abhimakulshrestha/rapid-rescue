import React, { useEffect, useState } from 'react';
import { Marker, Popup, useMap, Polyline } from 'react-leaflet';
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
    originalPosition: [number, number],
    pathHistory: Array<[number, number]>
  }>>({});
  
  const map = useMap();
  
  useEffect(() => {
    const newAnimatedVehicles: Record<string, any> = {};
    
    vehicles.forEach(vehicle => {
      if (animatedVehicles[vehicle.id]) {
        // Keep animation state and path history when updating vehicle data
        newAnimatedVehicles[vehicle.id] = {
          ...animatedVehicles[vehicle.id],
          vehicle: vehicle,
          // Add current position to path history if it's different
          pathHistory: vehicle.latitude !== animatedVehicles[vehicle.id].vehicle.latitude || 
                      vehicle.longitude !== animatedVehicles[vehicle.id].vehicle.longitude
            ? [...animatedVehicles[vehicle.id].pathHistory.slice(-5), [vehicle.latitude, vehicle.longitude]]
            : animatedVehicles[vehicle.id].pathHistory
        };
      } else {
        newAnimatedVehicles[vehicle.id] = {
          vehicle: vehicle,
          animating: false,
          originalPosition: [vehicle.latitude, vehicle.longitude] as [number, number],
          pathHistory: [[vehicle.latitude, vehicle.longitude]]
        };
      }
    });
    
    setAnimatedVehicles(newAnimatedVehicles);
  }, [vehicles]);
  
  useEffect(() => {
    // More frequent animation updates for better dynamics
    const animationInterval = setInterval(() => {
      const vehicleIds = Object.keys(animatedVehicles);
      if (vehicleIds.length === 0) return;
      
      // Animate 1-3 vehicles at a time for a more dynamic effect
      const numToAnimate = Math.min(Math.floor(Math.random() * 3) + 1, vehicleIds.length);
      const shuffledIds = [...vehicleIds].sort(() => Math.random() - 0.5).slice(0, numToAnimate);
      
      shuffledIds.forEach(vehicleId => {
        if (animatedVehicles[vehicleId].animating) return;
        
        setAnimatedVehicles(prev => ({
          ...prev,
          [vehicleId]: {
            ...prev[vehicleId],
            animating: true
          }
        }));
        
        // Vary animation duration by vehicle type
        const animationDuration = 
          prev[vehicleId].vehicle.type === 'ambulance' ? 3000 :
          prev[vehicleId].vehicle.type === 'police' ? 2500 : 4000;
          
        setTimeout(() => {
          setAnimatedVehicles(prev => {
            if (!prev[vehicleId]) return prev;
            return {
              ...prev,
              [vehicleId]: {
                ...prev[vehicleId],
                animating: false,
                // Add a new point to path history when animation ends
                pathHistory: [
                  ...prev[vehicleId].pathHistory,
                  [
                    prev[vehicleId].vehicle.latitude + (Math.random() * 0.0003) * (Math.random() > 0.5 ? 1 : -1),
                    prev[vehicleId].vehicle.longitude + (Math.random() * 0.0003) * (Math.random() > 0.5 ? 1 : -1)
                  ]
                ].slice(-6) // Keep last 6 points
              }
            };
          });
        }, animationDuration);
      });
    }, 3000);
    
    return () => clearInterval(animationInterval);
  }, [animatedVehicles]);

  return (
    <>
      {Object.values(animatedVehicles).map(({ vehicle, animating, originalPosition, pathHistory }) => {
        let position: [number, number] = [vehicle.latitude, vehicle.longitude];
        
        if (animating) {
          // Create more varied movements based on vehicle type
          let offsetMultiplier = 1.0;
          if (vehicle.type === 'ambulance') offsetMultiplier = 1.5; // Ambulances move faster
          if (vehicle.type === 'police') offsetMultiplier = 1.2; // Police moves moderately fast
          
          const offsetLat = (Math.random() * 0.0005 * offsetMultiplier) * (Math.random() > 0.5 ? 1 : -1);
          const offsetLng = (Math.random() * 0.0005 * offsetMultiplier) * (Math.random() > 0.5 ? 1 : -1);
          
          position = [
            vehicle.latitude + offsetLat,
            vehicle.longitude + offsetLng
          ];
        }
        
        const icon = getVehicleIcon(vehicle.type);
        const vehicleTypeClass = `${vehicle.type}-vehicle`;
        
        // Apply animation directly via DOM element
        if (animating) {
          // Add to animated elements list with vehicle-specific animations
          setTimeout(() => {
            const elements = document.querySelectorAll(`.vehicle-${vehicle.id}`);
            elements.forEach(el => {
              const imgElement = el.querySelector('img');
              if (imgElement) {
                imgElement.classList.add('leaflet-marker-animated');
              }
              // Add vehicle type class for type-specific animations
              el.classList.add(vehicleTypeClass);
            });
          }, 0);
        }
        
        return (
          <React.Fragment key={vehicle.id}>
            {/* Show path lines for moving vehicles */}
            {pathHistory.length > 1 && (
              <Polyline 
                positions={pathHistory} 
                pathOptions={{
                  color: vehicle.type === 'ambulance' ? '#ea384c' : 
                         vehicle.type === 'police' ? '#1EAEDB' : '#F97316',
                  opacity: 0.6,
                  weight: 2,
                  className: 'vehicle-path'
                }}
              />
            )}
            
            <Marker 
              key={vehicle.id}
              position={position}
              icon={icon}
              eventHandlers={{
                add: (e) => {
                  const el = e.target.getElement();
                  if (el) {
                    el.classList.add(`vehicle-${vehicle.id}`);
                    el.classList.add(vehicleTypeClass);
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
          </React.Fragment>
        );
      })}
    </>
  );
};

export default VehicleMarkers;
