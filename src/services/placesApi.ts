
import { EmergencyService } from '@/types/emergencyTypes';
import { calculateDistance } from './locationUtils';

// Google Maps API key - kept here as it's a publishable frontend key
const GOOGLE_API_KEY = 'AIzaSyDLYn9FCZpKkkGlMNTaTaZYfIa61FQQ2OI';

// CORS proxy to avoid CORS issues with Google APIs
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Maps Google Places types to our internal emergency categories
 */
export function mapPlaceTypeToCategory(type: string): string {
  switch (type) {
    case 'hospital':
      return 'ambulance';
    case 'police':
      return 'police';
    case 'fire_station':
      return 'fire';
    case 'pharmacy':
      return 'other';
    default:
      return 'other';
  }
}

/**
 * Get emergency phone number based on service category
 */
export function getEmergencyNumberByCategory(category: string): string {
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

/**
 * Fetch nearby places from Google Places API
 */
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  type: string,
  radius: number = 5000
): Promise<any[]> {
  try {
    // Use actual location to get real nearby places
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`
      )}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} services`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${type} services:`, data);
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results.slice(0, 5); // Limit to 5 results per type
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching ${type} places:`, error);
    return [];
  }
}

/**
 * Fetch additional details for a place using place_id
 */
export async function fetchPlaceDetails(placeId: string): Promise<any> {
  try {
    const detailsResponse = await fetch(
      `${CORS_PROXY}${encodeURIComponent(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number,website,formatted_address&key=${GOOGLE_API_KEY}`
      )}`
    );
    
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      if (detailsData.status === 'OK' && detailsData.result) {
        return detailsData.result;
      }
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching place details:', error);
    return {};
  }
}

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
}
