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
    // Use Google Places API with different types to get real emergency services
    const types = ['hospital', 'police', 'fire_station', 'pharmacy'];
    const radius = 5000; // 5km radius
    
    let allResults: EmergencyService[] = [];
    
    // Make parallel requests for different place types
    const promises = types.map(async (type) => {
      const response = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=AIzaSyDLYn9FCZpKkkGlMNTaTaZYfIa61FQQ2OI`
        )}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} services`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Transform Google Places API data to our EmergencyService format
        return Promise.all(data.results.slice(0, 5).map(async (place: any) => {
          // Calculate distance in a simplified way (in km)
          const distance = place.geometry?.location 
            ? calculateDistance(
                latitude, 
                longitude, 
                place.geometry.location.lat, 
                place.geometry.location.lng
              )
            : '5.0';
            
          // Determine category based on type
          let category;
          switch (type) {
            case 'hospital':
              category = 'ambulance';
              break;
            case 'police':
              category = 'police';
              break;
            case 'fire_station':
              category = 'fire';
              break;
            case 'pharmacy':
              category = 'other';
              break;
            default:
              category = 'other';
          }
          
          // Get additional place details using place_id
          let phoneNumber = '';
          let formattedPhoneNumber = '';
          let internationalPhoneNumber = '';
          let website = '';
          let address = place.vicinity || '';
          
          if (place.place_id) {
            try {
              const detailsResponse = await fetch(
                `https://corsproxy.io/?${encodeURIComponent(
                  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,international_phone_number,website,formatted_address&key=AIzaSyDLYn9FCZpKkkGlMNTaTaZYfIa61FQQ2OI`
                )}`
              );
              
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                if (detailsData.status === 'OK' && detailsData.result) {
                  formattedPhoneNumber = detailsData.result.formatted_phone_number || '';
                  internationalPhoneNumber = detailsData.result.international_phone_number || '';
                  website = detailsData.result.website || '';
                  address = detailsData.result.formatted_address || address;
                  
                  // Use any available phone number
                  phoneNumber = internationalPhoneNumber || formattedPhoneNumber;
                }
              }
            } catch (error) {
              console.error('Error fetching place details:', error);
            }
          }
            
          return {
            id: place.place_id || `place-${Math.random().toString(36).substring(2, 9)}`,
            category: category,
            name: place.name,
            phone: phoneNumber || getEmergencyNumberByCategory(category), // Fallback to emergency number
            distance: `${parseFloat(distance).toFixed(1)} km`,
            vicinity: place.vicinity,
            rating: place.rating,
            place_id: place.place_id,
            open_now: place.opening_hours?.open_now,
            formatted_phone_number: formattedPhoneNumber,
            international_phone_number: internationalPhoneNumber, 
            website: website,
            address: address
          };
        }));
      }
      return [];
    });
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    
    // Flatten the results array and remove empty arrays
    allResults = results.flat().filter(Boolean);
    
    if (allResults.length > 0) {
      return allResults;
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

// Function to get emergency numbers by category
function getEmergencyNumberByCategory(category: string): string {
  switch (category) {
    case 'ambulance':
      return '108';
    case 'police':
      return '100';
    case 'fire':
      return '101';
    case 'electric':
      return '1912';
    default:
      return '112'; // India's unified emergency number
  }
}

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

// Log emergency event function
export const logEmergencyEvent = (event: EmergencyEvent): Promise<void> => {
  console.log('Emergency event logged:', event);
  return Promise.resolve();
};

// Function to actually initiate a phone call
export const initiatePhoneCall = (phoneNumber: string): void => {
  if (!phoneNumber) {
    console.error('No phone number provided');
    return;
  }
  
  // Remove any non-numeric characters from the phone number
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Use the tel: protocol to initiate a call
  window.location.href = `tel:${cleanNumber}`;
  
  console.log(`Initiating call to: ${cleanNumber}`);
};
