
/**
 * Utility functions for location-related calculations
 */

/**
 * Converts degrees to radians
 */
export function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers as a formatted string
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return "Unknown distance";
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  // Format distance nicely
  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters} m away`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} km away`;
  } else {
    return `${Math.round(distance)} km away`;
  }
}

/**
 * Get location address from coordinates using reverse geocoding
 */
export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Unable to determine address';
  }
}

/**
 * Helper function to update user coordinates in database
 */
export function storeUserCoordinates(userId: string, latitude: number, longitude: number): Promise<void> {
  // Implementation depends on your backend/database setup
  console.log(`Storing coordinates for user ${userId}: ${latitude}, ${longitude}`);
  return Promise.resolve();
}
