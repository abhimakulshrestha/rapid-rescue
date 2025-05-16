
import { useEffect } from 'react';
import { AnimatedVehicleState } from './types/animationTypes';

/**
 * Hook to handle continuous animation frame updates for smooth movement
 */
export const useAnimationFrame = (
  animatedVehicles: AnimatedVehicleState,
  setAnimatedVehicles: React.Dispatch<React.SetStateAction<AnimatedVehicleState>>
) => {
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
    
    const frameRef = { current: requestAnimationFrame(updatePositions) };
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [setAnimatedVehicles]);
};
