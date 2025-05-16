
// Google Maps API configuration

// Google Maps API key - kept here as it's a publishable frontend key
export const GOOGLE_API_KEY = 'AIzaSyDLYn9FCZpKkkGlMNTaTaZYfIa61FQQ2OI';

// CORS proxy to avoid CORS issues with Google APIs
export const CORS_PROXY = 'https://corsproxy.io/?';

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
