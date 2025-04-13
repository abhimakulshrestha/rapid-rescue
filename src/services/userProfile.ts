
import { UserProfile } from '@/types/emergencyTypes';

// Mock user profile
export const mockUserProfile: UserProfile = {
  id: "user-123",
  name: "Demo User",
  email: "user@gmail.com",
  phone: "555-123-4567",
  address: "123 Main St, Anytown, USA",
  emergencyContacts: [
    {
      id: "contact-1",
      name: "Jane Doe",
      relation: "Spouse",
      phone: "555-987-6543",
      isICE: true,
    },
    {
      id: "contact-2",
      name: "John Smith",
      relation: "Parent",
      phone: "555-456-7890",
      isICE: false,
    }
  ],
  medicalInfo: {
    allergies: ["Penicillin", "Peanuts"],
    conditions: ["Asthma"],
    medications: ["Albuterol"],
    bloodType: "O+",
  },
  preferences: {
    notifications: true,
    locationSharing: true,
    darkMode: false,
  }
};

// Function to get user profile
export const getUserProfile = (userId: string): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserProfile);
    }, 500);
  });
};

// Function to update user profile
export const updateUserProfile = (profile: Partial<UserProfile>): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedProfile = { ...mockUserProfile, ...profile };
      resolve(updatedProfile);
    }, 500);
  });
};
