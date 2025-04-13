
import { EmergencyService, EmergencyEvent } from '@/types/emergencyTypes';

// Enhanced mock emergency services data with more Indian hospitals
export const mockServices: EmergencyService[] = [
  // Hospitals in India
  {
    id: '1',
    category: 'ambulance',
    name: 'AIIMS Hospital Delhi',
    phone: '011-2658-8500',
    distance: '2.3 km',
  },
  {
    id: '2',
    category: 'ambulance',
    name: 'Fortis Hospital',
    phone: '011-4277-6222',
    distance: '3.5 km',
  },
  {
    id: '3',
    category: 'ambulance',
    name: 'Apollo Hospitals',
    phone: '1860-500-1066',
    distance: '4.2 km',
  },
  {
    id: '4',
    category: 'ambulance',
    name: 'Max Super Speciality Hospital',
    phone: '011-4055-4055',
    distance: '5.1 km',
  },
  {
    id: '5',
    category: 'ambulance',
    name: 'Medanta - The Medicity',
    phone: '0124-441-4141',
    distance: '8.7 km',
  },
  // Additional Indian hospitals
  {
    id: '11',
    category: 'ambulance',
    name: 'Safdarjung Hospital',
    phone: '011-2673-0000',
    distance: '3.9 km',
  },
  {
    id: '12',
    category: 'ambulance',
    name: 'Tata Memorial Hospital',
    phone: '022-2417-7000',
    distance: '7.2 km',
  },
  {
    id: '13',
    category: 'ambulance',
    name: 'Christian Medical College',
    phone: '0416-228-2010',
    distance: '9.5 km',
  },
  // Police stations in India
  {
    id: '6',
    category: 'police',
    name: 'Delhi Police Headquarters',
    phone: '100',
    distance: '3.2 km',
  },
  {
    id: '7',
    category: 'police',
    name: 'Local Police Station',
    phone: '112',
    distance: '1.8 km',
  },
  // Fire stations
  {
    id: '8',
    category: 'fire',
    name: 'Delhi Fire Service',
    phone: '101',
    distance: '4.5 km',
  },
  // Electricity emergency
  {
    id: '9',
    category: 'electric',
    name: 'BSES Rajdhani Power Ltd',
    phone: '1800-419-3333',
    distance: '5.3 km',
  },
  // Other emergency services
  {
    id: '10',
    category: 'other',
    name: 'Disaster Management Authority',
    phone: '1077',
    distance: '6.1 km',
  },
];

// Improved function to get emergency services by location
export const getNearbyServices = (
  latitude: number,
  longitude: number
): Promise<EmergencyService[]> => {
  // For India-specific locations, use hospitals in India
  // Simple distance calculation with slight randomization for demo
  const isIndiaLocation = (latitude >= 8 && latitude <= 37 && longitude >= 68 && longitude <= 97);
  
  const servicesWithUpdatedDistance = mockServices.map(service => {
    // Randomize the distance a bit for demo purposes, but keep it consistent for each location
    const randomFactor = Math.abs(Math.sin(latitude * longitude * parseInt(service.id))) * 0.5 + 0.5;
    let calculatedDistance;
    
    if (isIndiaLocation) {
      // Shorter distances for India locations to show nearby hospitals
      calculatedDistance = (randomFactor * 4).toFixed(1);
    } else {
      calculatedDistance = (randomFactor * 20).toFixed(1);
    }
    
    return {
      ...service,
      distance: `${calculatedDistance} km`
    };
  });
  
  // Sort by distance
  const sortedServices = servicesWithUpdatedDistance.sort((a, b) => {
    const distA = parseFloat(a.distance.split(' ')[0]);
    const distB = parseFloat(b.distance.split(' ')[0]);
    return distA - distB;
  });
  
  // Only return a few nearby services to reduce flickering
  return new Promise((resolve) => {
    // Add slight delay to simulate API call
    setTimeout(() => {
      resolve(sortedServices);
    }, 300);
  });
};

// Log emergency event function - keeping the same implementation
export const logEmergencyEvent = (event: EmergencyEvent): Promise<void> => {
  // In a real app, this would send the event to a backend API
  // Here we just log to console and return a resolved promise
  console.log('Emergency event logged:', event);
  return Promise.resolve();
};
