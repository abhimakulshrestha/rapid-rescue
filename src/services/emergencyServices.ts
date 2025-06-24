import { EmergencyService, EmergencyEvent } from '@/types/emergencyTypes';
import { getRealLocationServices } from './realLocationServices';
import { mockServices } from './mockServices';
import { supabase } from '@/integrations/supabase/client';

/**
 * Function to get nearby services based on location
 */
export const getNearbyServices = async (
  latitude: number,
  longitude: number
): Promise<EmergencyService[]> => {
  try {
    // Try to get real location-based services first
    const realServices = await getRealLocationServices(latitude, longitude);
    
    if (realServices.length > 0) {
      console.log('Using real location-based emergency services:', realServices);
      return realServices;
    }
    
    // Fallback to mock data if real services unavailable
    console.log('Real services unavailable, using mock data');
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
export const logEmergencyEvent = async (event: EmergencyEvent): Promise<void> => {
  try {
    // Log to Supabase if available
    const { error } = await supabase
      .from('emergency_events')
      .insert({
        user_id: event.userId,
        type: event.type,
        service_id: event.serviceId,
        latitude: event.latitude,
        longitude: event.longitude,
        timestamp: event.timestamp
      });
      
    if (error) throw error;
    console.log('Emergency event logged to Supabase:', event);
  } catch (e) {
    console.error('Error logging to Supabase, fallback to console log:', e);
    console.log('Emergency event logged (console fallback):', event);
  }
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
