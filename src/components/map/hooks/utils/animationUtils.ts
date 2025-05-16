
import { EmergencyVehicle } from '@/types/emergencyTypes';
import { AnimatedVehicle, VehicleMovementParams } from '../types/animationTypes';

/**
 * Initializes vehicle animation data structure
 */
export function initializeAnimatedVehicle(vehicle: EmergencyVehicle): AnimatedVehicle {
  return {
    vehicle: vehicle,
    animating: false,
    originalPosition: [vehicle.latitude, vehicle.longitude] as [number, number],
    pathHistory: [[vehicle.latitude, vehicle.longitude] as [number, number]]
  };
}

/**
 * Updates an existing animated vehicle with new vehicle data
 */
export function updateAnimatedVehicle(
  existingData: AnimatedVehicle, 
  vehicle: EmergencyVehicle
): AnimatedVehicle {
  const positionChanged = 
    vehicle.latitude !== existingData.vehicle.latitude || 
    vehicle.longitude !== existingData.vehicle.longitude;
    
  return {
    ...existingData,
    vehicle: vehicle,
    pathHistory: positionChanged
      ? [...existingData.pathHistory.slice(-8), [vehicle.latitude, vehicle.longitude] as [number, number]]
      : existingData.pathHistory
  };
}

/**
 * Calculates movement parameters based on vehicle type
 */
export function calculateMovementParams(
  vehicleId: string,
  vehicleType: string,
  currentLat: number,
  currentLng: number
): VehicleMovementParams {
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
  const distance = Math.sqrt(
    Math.pow(targetLat - currentLat, 2) + Math.pow(targetLng - currentLng, 2)
  );
  
  let baseDuration = 3000; // Base duration in milliseconds
  if (vehicleType === 'ambulance') baseDuration = 2000; // Ambulances are faster
  if (vehicleType === 'police') baseDuration = 2500; // Police is moderately fast
  
  const moveDuration = baseDuration * (distance / moveDistance) + (Math.random() * 500);

  return {
    targetLat,
    targetLng,
    moveDuration,
    currentLat,
    currentLng
  };
}
