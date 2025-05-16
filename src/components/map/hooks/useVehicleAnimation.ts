import { useState, useEffect } from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import { AnimatedVehicleState } from './types/animationTypes';
import { initializeAnimatedVehicle, updateAnimatedVehicle } from './utils/animationUtils';
import { useAnimationFrame } from './useAnimationFrame';
import { useVehicleMovement } from './useVehicleMovement';

/**
 * Main hook that coordinates vehicle animations on the map
 * 
 * This hook is responsible for:
 * 1. Initializing and updating the animated vehicles state
 * 2. Handling continuous animation frames
 * 3. Managing periodic movement updates
 */
export const useVehicleAnimation = (vehicles: EmergencyVehicle[]) => {
  const [animatedVehicles, setAnimatedVehicles] = useState<AnimatedVehicleState>({});
  
  // Initialize and update animated vehicles when vehicle data changes
  useEffect(() => {
    const newAnimatedVehicles: AnimatedVehicleState = {};
    
    vehicles.forEach(vehicle => {
      if (animatedVehicles[vehicle.id]) {
        // Keep animation state and path history when updating vehicle data
        newAnimatedVehicles[vehicle.id] = updateAnimatedVehicle(
          animatedVehicles[vehicle.id],
          vehicle
        );
      } else {
        newAnimatedVehicles[vehicle.id] = initializeAnimatedVehicle(vehicle);
      }
    });
    
    setAnimatedVehicles(newAnimatedVehicles);
  }, [vehicles]);
  
  // Set up continuous animation frame for smooth movement
  useAnimationFrame(animatedVehicles, setAnimatedVehicles);
  
  // Set up interval for periodic movement updates
  useVehicleMovement(animatedVehicles, setAnimatedVehicles);

  return { animatedVehicles };
};
