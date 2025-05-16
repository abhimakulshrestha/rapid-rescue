
import { useState, useEffect } from 'react';
import { EmergencyService } from '@/types/emergencyTypes';
import { toast } from 'sonner';
import { calculateDistance } from '@/services/locationUtils';
import { transformPlaceToEmergencyService, fetchNearbyPlaces } from '@/services/placesApi';
import { mockServices } from '@/services/mockServices';

export function useRealEmergencyServices(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      if (!latitude || !longitude) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Types of emergency services to fetch
        const serviceTypes = ['hospital', 'police', 'fire_station', 'pharmacy'];
        let allServices: EmergencyService[] = [];
        
        // Make parallel requests for different service types
        const servicePromises = serviceTypes.map(async (type) => {
          try {
            const places = await fetchNearbyPlaces(latitude, longitude, type);
            
            if (places && places.length > 0) {
              // Transform Google Places data to our service format
              return Promise.all(places.map((place: any) => 
                transformPlaceToEmergencyService(place, type, latitude, longitude)
              ));
            }
            return [];
          } catch (error) {
            console.error(`Error fetching ${type} services:`, error);
            return [];
          }
        });

        // Wait for all requests to complete
        const servicesArrays = await Promise.all(servicePromises);
        
        // Combine all service types into a single array
        allServices = servicesArrays.flat().filter(Boolean);
        
        if (allServices.length > 0) {
          // Sort services by distance
          allServices.sort((a, b) => {
            const distA = parseFloat(a.distance?.split(' ')[0] || '999');
            const distB = parseFloat(b.distance?.split(' ')[0] || '999');
            return distA - distB;
          });
          
          console.log('Fetched real emergency services:', allServices);
          setServices(allServices);
        } else {
          console.log('No real services found, using mock data');
          // Use mock data if API returns empty results
          const mockedServices = mockServices.map(service => {
            service.distance = calculateDistance(
              latitude, 
              longitude, 
              parseFloat(service.latitude?.toString() || '0'), 
              parseFloat(service.longitude?.toString() || '0')
            );
            return service;
          });
          
          setServices(mockedServices);
          toast.info('Using mock emergency service data for demonstration', {
            duration: 3000
          });
        }
      } catch (err) {
        console.error('Error fetching emergency services:', err);
        setError('Failed to fetch emergency services');
        
        // Fallback to mock data
        const mockedServices = mockServices.map(service => {
          service.distance = calculateDistance(
            latitude, 
            longitude, 
            parseFloat(service.latitude?.toString() || '0'), 
            parseFloat(service.longitude?.toString() || '0')
          );
          return service;
        });
        
        setServices(mockedServices);
        toast.error('Could not fetch real emergency services, using demo data', {
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce the API call to prevent too many requests
    const timeoutId = setTimeout(() => {
      fetchServices();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [latitude, longitude]);

  return { services, isLoading, error };
}
