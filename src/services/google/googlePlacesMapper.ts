
import { EmergencyService } from '@/types/emergencyTypes';
import { calculateDistance } from '../locationUtils';
import { fetchPlaceDetails } from './googlePlacesApi';
import { mapPlaceTypeToCategory } from './googlePlacesConfig';
import { getEmergencyNumberByCategory } from '../emergencyNumbersService';

/**
 * Transform Google Places data to our EmergencyService format
 */
export async function transformPlaceToEmergencyService(
  place: any,
  type: string,
  userLat: number,
  userLng: number
): Promise<EmergencyService> {
  // Calculate distance
  const distance = place.geometry?.location 
    ? calculateDistance(
        userLat, 
        userLng, 
        place.geometry.location.lat, 
        place.geometry.location.lng
      )
    : '5.0';
    
  // Determine category based on type
  const category = mapPlaceTypeToCategory(type);
  
  // Default values
  let phoneNumber = '';
  let formattedPhoneNumber = '';
  let internationalPhoneNumber = '';
  let website = '';
  let address = place.vicinity || '';
  
  // Get additional details if place_id is available
  if (place.place_id) {
    try {
      const details = await fetchPlaceDetails(place.place_id);
      
      formattedPhoneNumber = details.formatted_phone_number || '';
      internationalPhoneNumber = details.international_phone_number || '';
      website = details.website || '';
      address = details.formatted_address || address;
      
      // Use any available phone number
      phoneNumber = internationalPhoneNumber || formattedPhoneNumber;
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  }
  
  // Add location coordinates
  const latitude = place.geometry?.location?.lat;
  const longitude = place.geometry?.location?.lng;
  
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
    address: address,
    latitude: latitude,
    longitude: longitude
  };
}
