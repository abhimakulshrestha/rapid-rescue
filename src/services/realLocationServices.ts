
import { EmergencyService } from '@/types/emergencyTypes';
import { fetchNearbyPlaces, fetchPlaceDetails } from './google/googlePlacesApi';
import { calculateDistance } from './locationUtils';
import { getEmergencyNumberByCategory } from './emergencyNumbersService';

/**
 * Get real emergency services based on actual location using Google Maps API
 */
export const getRealLocationServices = async (
  latitude: number,
  longitude: number
): Promise<EmergencyService[]> => {
  try {
    const emergencyTypes = [
      { type: 'hospital', category: 'ambulance' },
      { type: 'police', category: 'police' },
      { type: 'fire_station', category: 'fire' }
    ];
    
    const allServices: EmergencyService[] = [];
    
    for (const { type, category } of emergencyTypes) {
      try {
        const places = await fetchNearbyPlaces(latitude, longitude, type, 10000);
        
        for (const place of places.slice(0, 3)) { // Limit to 3 per category
          const distance = calculateDistance(
            latitude,
            longitude,
            place.geometry?.location?.lat || 0,
            place.geometry?.location?.lng || 0
          );
          
          // Get additional details
          let phoneNumber = '';
          let address = place.vicinity || '';
          let website = '';
          
          if (place.place_id) {
            try {
              const details = await fetchPlaceDetails(place.place_id);
              phoneNumber = details.international_phone_number || details.formatted_phone_number || '';
              address = details.formatted_address || address;
              website = details.website || '';
            } catch (error) {
              console.warn('Failed to fetch place details:', error);
            }
          }
          
          const service: EmergencyService = {
            id: place.place_id || `${type}-${Math.random().toString(36).substr(2, 9)}`,
            category,
            name: place.name,
            phone: phoneNumber || getEmergencyNumberByCategory(category),
            distance: `${parseFloat(distance).toFixed(1)} km`,
            vicinity: place.vicinity,
            rating: place.rating,
            place_id: place.place_id,
            open_now: place.opening_hours?.open_now,
            formatted_phone_number: phoneNumber,
            website,
            address,
            latitude: place.geometry?.location?.lat || 0,
            longitude: place.geometry?.location?.lng || 0
          };
          
          allServices.push(service);
        }
      } catch (error) {
        console.error(`Error fetching ${type} services:`, error);
      }
    }
    
    // Sort by distance
    allServices.sort((a, b) => {
      const distA = parseFloat(a.distance.split(' ')[0]);
      const distB = parseFloat(b.distance.split(' ')[0]);
      return distA - distB;
    });
    
    return allServices;
  } catch (error) {
    console.error('Error fetching real location services:', error);
    return [];
  }
};
