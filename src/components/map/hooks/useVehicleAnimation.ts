import { useState, useRef, useEffect } from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';

type AnimatedVehicle = {
  vehicle: EmergencyVehicle;
  animating: boolean;
  originalPosition: [number, number];
  pathHistory: Array<[number, number]>;
};

export type AnimatedVehicleState = Record<string, AnimatedVehicle>;

export const useVehicleAnimation = (vehicles: EmergencyVehicle[]) => {
  const [animatedVehicles, setAnimatedVehicles] = useState<AnimatedVehicleState>({});
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize and update animated vehicles when vehicle data changes
  useEffect(() => {
    const newAnimatedVehicles: AnimatedVehicleState = {};
    
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
  
  // Animation interval effect
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

  return { animatedVehicles };
};
