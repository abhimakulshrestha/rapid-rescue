
import { useEffect, useRef } from 'react';
import { AnimatedVehicleState, AnimatedVehicle } from './types/animationTypes';
import { calculateMovementParams } from './utils/animationUtils';

/**
 * Hook to handle periodic vehicle movement updates
 */
export const useVehicleMovement = (
  animatedVehicles: AnimatedVehicleState,
  setAnimatedVehicles: React.Dispatch<React.SetStateAction<AnimatedVehicleState>>
) => {
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Animation interval effect to start new movements
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
        
        const vehicleType = animatedVehicles[vehicleId].vehicle.type;
        const currentLat = animatedVehicles[vehicleId].vehicle.latitude;
        const currentLng = animatedVehicles[vehicleId].vehicle.longitude;
        
        // Calculate movement parameters
        const { targetLat, targetLng, moveDuration } = calculateMovementParams(
          vehicleId,
          vehicleType,
          currentLat,
          currentLng
        );
        
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
  }, [animatedVehicles, setAnimatedVehicles]);
};
