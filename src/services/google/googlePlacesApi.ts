
import { CORS_PROXY, GOOGLE_API_KEY } from './googlePlacesConfig';

/**
 * Fetch nearby places from Google Places API using a more reliable approach
 */
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  type: string,
  radius: number = 5000
): Promise<any[]> {
  try {
    // First try with CORS proxy
    try {
      const response = await fetch(
        `${CORS_PROXY}${encodeURIComponent(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`
        )}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          console.log(`Fetched ${type} services:`, data.results.length);
          return data.results.slice(0, 5); // Limit to 5 results per type
        }
      }
    } catch (error) {
      console.warn(`CORS proxy approach failed for ${type}:`, error);
    }
    
    // If CORS proxy fails, try direct fetch (might still fail due to CORS)
    try {
      const directResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`,
        { mode: 'cors' }
      );
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          return data.results.slice(0, 5);
        }
      }
    } catch (error) {
      console.warn(`Direct API call failed for ${type}:`, error);
    }
    
    // Return empty array if both approaches fail
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
    // First try with CORS proxy
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
    } catch (error) {
      console.warn('CORS proxy approach failed for place details:', error);
    }
    
    // If CORS proxy fails, try direct fetch
    try {
      const directResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number,website,formatted_address&key=${GOOGLE_API_KEY}`,
        { mode: 'cors' }
      );
      
      if (directResponse.ok) {
        const detailsData = await directResponse.json();
        if (detailsData.status === 'OK' && detailsData.result) {
          return detailsData.result;
        }
      }
    } catch (error) {
      console.warn('Direct API call failed for place details:', error);
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching place details:', error);
    return {};
  }
}
