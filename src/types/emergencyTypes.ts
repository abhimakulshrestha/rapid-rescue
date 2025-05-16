
// Types for emergency services
export interface EmergencyService {
  id: string;
  category: string;
  name: string;
  phone: string;
  distance: string;
  vicinity?: string;
  rating?: number;
  place_id?: string;
  open_now?: boolean;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  address?: string;
  latitude: number; // Required property
  longitude: number; // Required property
}

// Update the EmergencyVehicle interface to include distance
export interface EmergencyVehicle {
  id: string;
  type: string;
  name: string;
  phone: string | null;
  status: string | null;
  latitude: number;
  longitude: number;
  last_updated: string | null;
  distance?: string; // Add optional distance property
}

// Type for emergency events
export interface EmergencyEvent {
  userId: string;
  type: string;
  serviceId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// User profile types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  emergencyContacts?: EmergencyContact[];
  medicalInfo?: {
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    bloodType?: string;
  };
  preferences?: {
    notifications: boolean;
    locationSharing: boolean;
    darkMode: boolean;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isICE: boolean; // In Case of Emergency
}
