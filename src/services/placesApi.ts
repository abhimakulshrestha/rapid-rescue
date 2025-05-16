
import { EmergencyService } from '@/types/emergencyTypes';
import { fetchNearbyPlaces } from './google/googlePlacesApi';
import { transformPlaceToEmergencyService } from './google/googlePlacesMapper';
import { mapPlaceTypeToCategory } from './google/googlePlacesConfig';
import { getEmergencyNumberByCategory } from './emergencyNumbersService';

// Export all the necessary functions to maintain compatibility with existing code
export { 
  fetchNearbyPlaces,
  transformPlaceToEmergencyService,
  mapPlaceTypeToCategory, 
  getEmergencyNumberByCategory 
};
