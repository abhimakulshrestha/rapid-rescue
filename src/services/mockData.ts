
import { EmergencyService } from '@/components/EmergencyCategories';

// Mock emergency services data
export const mockServices: EmergencyService[] = [
  {
    id: '1',
    category: 'ambulance',
    name: 'City General Hospital',
    phone: '555-123-4567',
    distance: '0.8 miles',
  },
  {
    id: '2',
    category: 'ambulance',
    name: 'St. Mary\'s Medical Center',
    phone: '555-234-5678',
    distance: '1.2 miles',
  },
  {
    id: '3',
    category: 'police',
    name: 'Downtown Police Station',
    phone: '555-345-6789',
    distance: '0.5 miles',
  },
  {
    id: '4',
    category: 'police',
    name: 'Westside Police Department',
    phone: '555-456-7890',
    distance: '1.7 miles',
  },
  {
    id: '5',
    category: 'fire',
    name: 'Central Fire Station',
    phone: '555-567-8901',
    distance: '1.1 miles',
  },
  {
    id: '6',
    category: 'fire',
    name: 'North District Fire Department',
    phone: '555-678-9012',
    distance: '2.3 miles',
  },
  {
    id: '7',
    category: 'electric',
    name: 'City Power & Electric Co.',
    phone: '555-789-0123',
    distance: '1.5 miles',
  },
  {
    id: '8',
    category: 'other',
    name: 'Emergency Management Office',
    phone: '555-890-1234',
    distance: '0.9 miles',
  },
];

// Mock function to get emergency services by location
export const getNearbyServices = (
  latitude: number,
  longitude: number
): Promise<EmergencyService[]> => {
  // In a real app, this would filter based on actual coordinates
  // Here we just return the mock data with a delay to simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockServices);
    }, 1000);
  });
};

// Mock function to log emergency event
export interface EmergencyEvent {
  userId: string;
  type: string;
  serviceId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const logEmergencyEvent = (event: EmergencyEvent): Promise<void> => {
  // In a real app, this would send the event to a backend API
  // Here we just log to console and return a resolved promise
  console.log('Emergency event logged:', event);
  return Promise.resolve();
};

// Mock authentication functions
export const mockLogin = (email: string, password: string): Promise<{ user: { id: string; name: string; email: string } }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple validation - in a real app this would verify against a database
      if ((email === "user@example.com" || email === "user@gmail.com") && password === "password") {
        resolve({
          user: {
            id: "user-123",
            name: "Demo User",
            email: email,
          },
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 800);
  });
};

export const mockSignup = (name: string, email: string, password: string): Promise<{ user: { id: string; name: string; email: string } }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would create a new user in the database
      resolve({
        user: {
          id: "new-user-" + Math.random().toString(36).substring(2, 9),
          name,
          email,
        },
      });
    }, 800);
  });
};
