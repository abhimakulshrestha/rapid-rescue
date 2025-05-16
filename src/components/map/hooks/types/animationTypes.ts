
import { EmergencyVehicle } from '@/types/emergencyTypes';

/**
 * Defines a vehicle with animation state properties
 */
export type AnimatedVehicle = {
  vehicle: EmergencyVehicle;
  animating: boolean;
  originalPosition: [number, number];
  pathHistory: Array<[number, number]>;
  targetPosition?: [number, number]; 
  moveStartTime?: number; 
  moveDuration?: number;
};

/**
 * Maps vehicle IDs to their animation states
 */
export type AnimatedVehicleState = Record<string, AnimatedVehicle>;

/**
 * Movement parameters for vehicles
 */
export type VehicleMovementParams = {
  targetLat: number;
  targetLng: number;
  moveDuration: number;
  currentLat: number;
  currentLng: number;
};
