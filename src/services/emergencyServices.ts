
import { EmergencyService, EmergencyEvent } from '@/types/emergencyTypes';

// Mock emergency services data
export const mockServices: EmergencyService[] = [
  {
    id: '1',
    category: 'ambulance',
    name: 'City General Hospital',
    phone: '555-123-4567',
    distance: '0.8 miles',
  },
  {
    id: '2',
    category: 'ambulance',
    name: 'St. Mary\'s Medical Center',
    phone: '555-234-5678',
    distance: '1.2 miles',
  },
  {
    id: '3',
    category: 'police',
    name: 'Downtown Police Station',
    phone: '555-345-6789',
    distance: '0.5 miles',
  },
  {
    id: '4',
    category: 'police',
    name: 'Westside Police Department',
    phone: '555-456-7890',
    distance: '1.7 miles',
  },
  {
    id: '5',
    category: 'fire',
    name: 'Central Fire Station',
    phone: '555-567-8901',
    distance: '1.1 miles',
  },
  {
    id: '6',
    category: 'fire',
    name: 'North District Fire Department',
    phone: '555-678-9012',
    distance: '2.3 miles',
  },
  {
    id: '7',
    category: 'electric',
    name: 'City Power & Electric Co.',
    phone: '555-789-0123',
    distance: '1.5 miles',
  },
  {
    id: '8',
    category: 'other',
    name: 'Emergency Management Office',
    phone: '555-890-1234',
    distance: '0.9 miles',
  },
];

// Mock function to get emergency services by location
export const getNearbyServices = (
  latitude: number,
  longitude: number
): Promise<EmergencyService[]> => {
  // Calculate distances based on coordinates (simplified calculation)
  const servicesWithUpdatedDistance = mockServices.map(service => {
    // Simple distance calculation (not accurate but good for demo)
    const randomDistanceFactor = Math.random() * 0.5 + 0.5; // between 0.5 and 1
    const calculatedDistance = (Math.abs(Math.sin(latitude) + Math.cos(longitude)) * 2 * randomDistanceFactor).toFixed(1);
    
    return {
      ...service,
      distance: `${calculatedDistance} miles`
    };
  });
  
  // Sort by distance
  servicesWithUpdatedDistance.sort((a, b) => {
    const distA = parseFloat(a.distance.split(' ')[0]);
    const distB = parseFloat(b.distance.split(' ')[0]);
    return distA - distB;
  });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(servicesWithUpdatedDistance);
    }, 1000);
  });
};

// Mock function to log emergency event
export const logEmergencyEvent = (event: EmergencyEvent): Promise<void> => {
  // In a real app, this would send the event to a backend API
  // Here we just log to console and return a resolved promise
  console.log('Emergency event logged:', event);
  return Promise.resolve();
};
