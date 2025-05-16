
import { useState, useRef, useEffect } from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';

type AnimatedVehicle = {
  vehicle: EmergencyVehicle;
  animating: boolean;
  originalPosition: [number, number];
  pathHistory: Array<[number, number]>; // Ensure this is strictly a tuple array
  targetPosition?: [number, number]; 
  moveStartTime?: number; 
  moveDuration?: number;
};

export type AnimatedVehicleState = Record<string, AnimatedVehicle>;

export const useVehicleAnimation = (vehicles: EmergencyVehicle[]) => {
  const [animatedVehicles, setAnimatedVehicles] = useState<AnimatedVehicleState>({});
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number | null>(null);
  
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
            ? [...animatedVehicles[vehicle.id].pathHistory.slice(-8), [vehicle.latitude, vehicle.longitude] as [number, number]]
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
  
  // Continuous animation frame for smooth movement
  useEffect(() => {
    const updatePositions = () => {
      const now = Date.now();
      let needsUpdate = false;
      
      setAnimatedVehicles(prevState => {
        const newState = { ...prevState };
        
        Object.keys(newState).forEach(vehicleId => {
          const vehicle = newState[vehicleId];
          
          // If vehicle is moving towards a target position
          if (vehicle.targetPosition && vehicle.moveStartTime && vehicle.moveDuration) {
            const elapsedTime = now - vehicle.moveStartTime;
            const progress = Math.min(elapsedTime / vehicle.moveDuration, 1);
            
            if (progress < 1) {
              // Vehicle still moving
              needsUpdate = true;
              
              // Calculate new position with easing (ease-out cubic)
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const currentLat = vehicle.originalPosition[0] + 
                (vehicle.targetPosition[0] - vehicle.originalPosition[0]) * easeProgress;
              const currentLng = vehicle.originalPosition[1] + 
                (vehicle.targetPosition[1] - vehicle.originalPosition[1]) * easeProgress;
              
              // Update current vehicle position
              newState[vehicleId] = {
                ...vehicle,
                vehicle: {
                  ...vehicle.vehicle,
                  latitude: currentLat,
                  longitude: currentLng
                }
              };
            } else {
              // Movement complete - update final position and clear animation properties
              newState[vehicleId] = {
                ...vehicle,
                vehicle: {
                  ...vehicle.vehicle,
                  latitude: vehicle.targetPosition[0],
                  longitude: vehicle.targetPosition[1]
                },
                animating: false,
                targetPosition: undefined,
                moveStartTime: undefined,
                moveDuration: undefined
              };
            }
          }
        });
        
        return newState;
      });
      
      if (needsUpdate) {
        frameRef.current = requestAnimationFrame(updatePositions);
      }
    };
    
    frameRef.current = requestAnimationFrame(updatePositions);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
  
  // Animation interval effect to start new movements
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
      const numToAnimate = Math.min(Math.max(2, Math.floor(availableVehicles.length * 0.7)), 5);
      const vehiclesToAnimate = [...availableVehicles].sort(() => Math.random() - 0.5).slice(0, numToAnimate);
      
      vehiclesToAnimate.forEach(vehicleId => {
        if (animatedVehicles[vehicleId].animating) return;
        
        // Create dynamic movement patterns based on vehicle type
        const vehicleType = animatedVehicles[vehicleId].vehicle.type;
        const currentLat = animatedVehicles[vehicleId].vehicle.latitude;
        const currentLng = animatedVehicles[vehicleId].vehicle.longitude;
        
        // Vary movement distances by vehicle type
        let moveDistance = 0.0015; // Base movement distance
        
        if (vehicleType === 'ambulance') {
          moveDistance = 0.0025; // Ambulances move faster/farther
        } else if (vehicleType === 'police') {
          moveDistance = 0.002; // Police move at medium speed
        } else if (vehicleType === 'fire') {
          moveDistance = 0.0015; // Fire trucks move slower
        }
        
        // Create semi-realistic movement patterns
        // 1. Sometimes follow roads (prefer cardinal directions)
        // 2. Sometimes make turns (change one coordinate significantly)
        // 3. Occasionally make diagonal movements (change both coordinates)
        const movementType = Math.random();
        
        let targetLat = currentLat;
        let targetLng = currentLng;
        
        if (movementType < 0.4) {
          // Horizontal movement (east-west)
          targetLng = currentLng + (moveDistance * (Math.random() > 0.5 ? 1 : -1));
        } else if (movementType < 0.8) {
          // Vertical movement (north-south)
          targetLat = currentLat + (moveDistance * (Math.random() > 0.5 ? 1 : -1));
        } else {
          // Diagonal movement
          targetLat = currentLat + (moveDistance * 0.7 * (Math.random() > 0.5 ? 1 : -1));
          targetLng = currentLng + (moveDistance * 0.7 * (Math.random() > 0.5 ? 1 : -1));
        }
        
        // Calculate movement duration based on distance and vehicle type
        // This creates different speeds for different vehicle types
        const distance = Math.sqrt(
          Math.pow(targetLat - currentLat, 2) + Math.pow(targetLng - currentLng, 2)
        );
        
        let baseDuration = 3000; // Base duration in milliseconds
        if (vehicleType === 'ambulance') baseDuration = 2000; // Ambulances are faster
        if (vehicleType === 'police') baseDuration = 2500; // Police is moderately fast
        
        const moveDuration = baseDuration * (distance / moveDistance) + (Math.random() * 500);
        
        // Create a new object to ensure type compatibility
        const updatedVehicle: AnimatedVehicle = {
          ...animatedVehicles[vehicleId],
          animating: true,
          originalPosition: [currentLat, currentLng] as [number, number],
          targetPosition: [targetLat, targetLng] as [number, number],
          moveStartTime: Date.now(),
          moveDuration: moveDuration,
          pathHistory: [
            ...animatedVehicles[vehicleId].pathHistory,
            [currentLat, currentLng] as [number, number]
          ].slice(-8) as [number, number][]
        };
        
        setAnimatedVehicles(prev => ({
          ...prev,
          [vehicleId]: updatedVehicle
        }));
      });
    }, 3000); // Start new movements every 3 seconds
    
    animationRef.current = animationInterval;
    
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [animatedVehicles]);

  return { animatedVehicles };
};
