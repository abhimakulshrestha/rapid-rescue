
import { useState, useEffect } from 'react';
import { EmergencyVehicle } from '@/types/emergencyTypes';

interface TrackedVehicle {
  pathHistory: [number, number][];
  lastUpdate: number;
  estimatedArrival?: string;
}

interface TrackedVehicles {
  [vehicleId: string]: TrackedVehicle;
}

export const useVehicleTracking = (vehicles: EmergencyVehicle[]) => {
  const [trackedVehicles, setTrackedVehicles] = useState<TrackedVehicles>({});

  useEffect(() => {
    vehicles.forEach(vehicle => {
      setTrackedVehicles(prev => {
        const existing = prev[vehicle.id];
        const currentPosition: [number, number] = [vehicle.latitude, vehicle.longitude];
        
        if (!existing) {
          // New vehicle
          return {
            ...prev,
            [vehicle.id]: {
              pathHistory: [currentPosition],
              lastUpdate: Date.now()
            }
          };
        }
        
        // Check if position has changed
        const lastPosition = existing.pathHistory[existing.pathHistory.length - 1];
        const hasMovedSignificantly = 
          Math.abs(lastPosition[0] - currentPosition[0]) > 0.0001 ||
          Math.abs(lastPosition[1] - currentPosition[1]) > 0.0001;
        
        if (hasMovedSignificantly) {
          return {
            ...prev,
            [vehicle.id]: {
              ...existing,
              pathHistory: [...existing.pathHistory.slice(-10), currentPosition],
              lastUpdate: Date.now()
            }
          };
        }
        
        return prev;
      });
    });
  }, [vehicles]);

  return { trackedVehicles };
};
