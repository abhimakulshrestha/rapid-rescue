
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { initiatePhoneCall } from '@/services/emergencyServices';

// Define a type for profile data that includes emergencyContacts
interface ProfileData {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  location_lat: number | null;
  location_lng: number | null;
  emergencyContacts?: any[];
}

export function useEmergencyContacts(userId: string) {
  const { toast } = useToast();
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchEmergencyContacts = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (data) {
          // Cast data to ProfileData to provide type safety
          const profileData = data as ProfileData;
          setEmergencyContacts(profileData.emergencyContacts || []);
        }
      } catch (error) {
        console.error('Error fetching emergency contacts:', error);
      }
    };

    if (userId) {
      fetchEmergencyContacts();
    }
  }, [userId]);

  const handleCallEmergencyContact = useCallback((contact: any) => {
    if (contact && contact.phone) {
      initiatePhoneCall(contact.phone);
      
      toast({
        title: "Emergency Call Initiated",
        description: `Calling emergency contact: ${contact.name}`,
      });
    }
  }, [toast]);

  return {
    emergencyContacts,
    handleCallEmergencyContact
  };
}
