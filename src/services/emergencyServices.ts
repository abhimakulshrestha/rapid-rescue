
import { EmergencyService, EmergencyEvent } from '@/types/emergencyTypes';
import { fetchNearbyPlaces, transformPlaceToEmergencyService } from './placesApi';
import { mockServices } from './mockServices';

/**
 * Function to get nearby services based on location
 */
export const getNearbyServices = async (
  latitude: number,
  longitude: number
): Promise<EmergencyService[]> => {
  try {
    // Use Google Places API with different types to get real emergency services
    const types = ['hospital', 'police', 'fire_station', 'pharmacy'];
    let allResults: EmergencyService[] = [];
    
    // Make parallel requests for different place types
    const promises = types.map(async (type) => {
      const places = await fetchNearbyPlaces(latitude, longitude, type);
      
      if (places && places.length > 0) {
        // Transform Google Places API data to our EmergencyService format
        return Promise.all(places.map(async (place: any) => {
          return transformPlaceToEmergencyService(place, type, latitude, longitude);
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

/**
 * Log emergency event function
 */
export const logEmergencyEvent = (event: EmergencyEvent): Promise<void> => {
  console.log('Emergency event logged:', event);
  return Promise.resolve();
};

/**
 * Function to actually initiate a phone call
 */
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
