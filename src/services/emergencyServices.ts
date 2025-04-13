import { EmergencyService, EmergencyEvent } from '@/types/emergencyTypes';

// Backup mock services in case the API fails
const mockServices: EmergencyService[] = [
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

// Function to get nearby services based on location
export const getNearbyServices = async (
  latitude: number,
  longitude: number
): Promise<EmergencyService[]> => {
  try {
    // Use Google Places API to get real hospitals/emergency services nearby
    // For simplicity and privacy, we're using a proxy to make the request
    const response = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=hospital&key=AIzaSyDLYn9FCZpKkkGlMNTaTaZYfIa61FQQ2OI`
      )}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch nearby services');
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Transform Google Places API data to our EmergencyService format
      const services: EmergencyService[] = data.results.slice(0, 10).map((place: any, index: number) => {
        // Calculate distance in a simplified way (in meters)
        const distance = place.geometry?.location 
          ? calculateDistance(
              latitude, 
              longitude, 
              place.geometry.location.lat, 
              place.geometry.location.lng
            )
          : '5.0';
          
        return {
          id: place.place_id || `place-${index}`,
          category: 'ambulance', // Default to ambulance for hospitals
          name: place.name,
          phone: place.international_phone_number || '+91 Emergency', // Phone may not be available in this API
          distance: `${parseFloat(distance).toFixed(1)} km`,
          vicinity: place.vicinity,
          rating: place.rating,
          place_id: place.place_id,
        };
      });
      
      return services;
    }
    
    // Fallback to mock data when the API doesn't return results
    console.log('No results from Places API, using mock data');
    return mockServices;
  } catch (error) {
    console.error('Error fetching nearby services:', error);
    // Return mock data as fallback
    return mockServices;
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toString();
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Log emergency event function - keeping the same implementation
export const logEmergencyEvent = (event: EmergencyEvent): Promise<void> => {
  // In a real app, this would send the event to a backend API
  // Here we just log to console and return a resolved promise
  console.log('Emergency event logged:', event);
  return Promise.resolve();
};
