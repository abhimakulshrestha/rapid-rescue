
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
 * Function to initiate a direct phone call with enhanced functionality
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
  
  console.log(`Initiating direct call to: ${cleanNumber}`);
};

/**
 * Enhanced emergency dialer with fallback options
 */
export const emergencyDialer = {
  call: (phoneNumber: string) => {
    try {
      initiatePhoneCall(phoneNumber);
    } catch (error) {
      console.error('Error initiating call:', error);
      // Fallback: Copy number to clipboard
      navigator.clipboard.writeText(phoneNumber).then(() => {
        console.log('Phone number copied to clipboard as fallback');
      });
    }
  },
  
  callWithConfirmation: (phoneNumber: string, serviceName: string) => {
    const confirmed = window.confirm(`Call ${serviceName} at ${phoneNumber}?`);
    if (confirmed) {
      initiatePhoneCall(phoneNumber);
    }
  }
};
