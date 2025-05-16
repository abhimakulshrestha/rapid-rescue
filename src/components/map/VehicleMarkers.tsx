
import React, { useEffect, useState, useRef } from 'react';
import { Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import { getVehicleIcon } from './MapIcons';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

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
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
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
            ? [...animatedVehicles[vehicle.id].pathHistory.slice(-5), [vehicle.latitude, vehicle.longitude] as [number, number]]
            : animatedVehicles[vehicle.id].pathHistory
        };
      } else {
        newAnimatedVehicles[vehicle.id] = {
          vehicle: vehicle,
          animating: false,
          originalPosition: [vehicle.latitude, vehicle.longitude] as [number, number],
          pathHistory: [[vehicle.latitude, vehicle.longitude] as [number, number]]
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
      
      // Animate available vehicles more frequently
      const availableVehicles = vehicleIds.filter(id => 
        animatedVehicles[id].vehicle.status === 'available'
      );
      
      // Determine how many vehicles to animate
      const numToAnimate = Math.min(Math.max(1, Math.floor(availableVehicles.length * 0.6)), 3);
      const vehiclesToAnimate = [...availableVehicles].sort(() => Math.random() - 0.5).slice(0, numToAnimate);
      
      vehiclesToAnimate.forEach(vehicleId => {
        if (animatedVehicles[vehicleId].animating) return;
        
        setAnimatedVehicles(prevState => ({
          ...prevState,
          [vehicleId]: {
            ...prevState[vehicleId],
            animating: true
          }
        }));
        
        // Vary animation duration by vehicle type with more dramatic variations
        const animationDuration = 
          animatedVehicles[vehicleId].vehicle.type === 'ambulance' ? 2000 + Math.random() * 1000 :
          animatedVehicles[vehicleId].vehicle.type === 'police' ? 1800 + Math.random() * 700 : 
          3000 + Math.random() * 1000;
          
        setTimeout(() => {
          setAnimatedVehicles(prevState => {
            if (!prevState[vehicleId]) return prevState;
            
            // Create new positions with more dynamic movement patterns
            const moveDistance = prevState[vehicleId].vehicle.status === 'available' ? 0.0006 : 0.0002;
            const directionBias = Math.random() > 0.7 ? 0.8 : 0.2; // Occasionally prefer specific directions
            
            const newLatLng: [number, number] = [
              prevState[vehicleId].vehicle.latitude + (moveDistance * (Math.random() > directionBias ? 1 : -1)),
              prevState[vehicleId].vehicle.longitude + (moveDistance * (Math.random() > directionBias ? 1 : -1))
            ];
            
            return {
              ...prevState,
              [vehicleId]: {
                ...prevState[vehicleId],
                animating: false,
                pathHistory: [
                  ...prevState[vehicleId].pathHistory,
                  newLatLng
                ].slice(-8) // Keep more history points for better trails
              }
            };
          });
        }, animationDuration);
      });
    }, 2000); // More frequent animations
    
    animationRef.current = animationInterval;
    
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [animatedVehicles]);

  return (
    <AnimatePresence>
      {Object.values(animatedVehicles).map(({ vehicle, animating, originalPosition, pathHistory }) => {
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
        
        const icon = getVehicleIcon(vehicle.type);
        const vehicleTypeClass = `${vehicle.type}-vehicle`;
        const isAvailable = vehicle.status === 'available';
        
        // Apply animation directly via DOM element
        if (animating) {
          // Add to animated elements list with vehicle-specific animations
          setTimeout(() => {
            const elements = document.querySelectorAll(`.vehicle-${vehicle.id}`);
            elements.forEach(el => {
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
            });
          }, 0);
        }
        
        return (
          <React.Fragment key={vehicle.id}>
            {/* Show path lines for moving vehicles with enhanced styling */}
            {pathHistory.length > 1 && (
              <Polyline 
                positions={pathHistory} 
                pathOptions={{
                  color: vehicle.type === 'ambulance' ? 'rgba(234, 56, 76, 0.7)' : 
                         vehicle.type === 'police' ? 'rgba(30, 174, 219, 0.7)' : 
                         'rgba(249, 115, 22, 0.7)',
                  opacity: isAvailable ? 0.8 : 0.5,
                  weight: isAvailable ? 3 : 2,
                  dashArray: isAvailable ? '' : '5,5',
                  className: `vehicle-path ${vehicle.type}-path ${isAvailable ? 'path-available' : 'path-busy'}`
                }}
              />
            )}
            
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
                  }
                }
              }}
            >
              <Popup>
                <div className="vehicle-popup">
                  <h3 className="font-bold text-sm bg-gradient-to-r from-slate-700 to-slate-900 text-white p-2 rounded-t-md">
                    {vehicle.name}
                  </h3>
                  <div className="p-3 bg-gradient-to-b from-white to-gray-50">
                    <p className="text-xs capitalize flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        vehicle.type === 'ambulance' ? 'bg-emergency-red' : 
                        vehicle.type === 'police' ? 'bg-emergency-blue' : 'bg-emergency-orange'
                      }`}></span>
                      {vehicle.type}
                    </p>
                    {animating && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Currently active
                      </p>
                    )}
                    {vehicle.status && (
                      <p className="text-xs mt-1 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          vehicle.status === 'available' ? 'bg-green-500' : 'bg-orange-500'
                        }`}></span>
                        Status: <span className="font-medium ml-1">{vehicle.status}</span>
                      </p>
                    )}
                    {vehicle.phone && (
                      <p className="text-xs mt-2 bg-blue-50 p-1 rounded">
                        <a 
                          href={`tel:${vehicle.phone}`} 
                          className="text-blue-600 hover:underline flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call: {vehicle.phone}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </AnimatePresence>
  );
};

export default VehicleMarkers;
