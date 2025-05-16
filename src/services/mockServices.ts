import { EmergencyService } from '@/types/emergencyTypes';

/**
 * Mock emergency services data to be used as fallback
 * when the API fails or no results are returned
 */
export const mockServices: EmergencyService[] = [
  // Hospitals in India
  {
    id: '1',
    category: 'ambulance',
    name: 'AIIMS Hospital Delhi',
    phone: '011-2658-8500',
    distance: '2.3 km',
    latitude: 28.6139, 
    longitude: 77.2090
  },
  // Additional Indian hospitals
  {
    id: '11',
    category: 'ambulance',
    name: 'Safdarjung Hospital',
    phone: '011-2673-0000',
    distance: '3.9 km',
    latitude: 28.5729,
    longitude: 77.2090
  },
  {
    id: '12',
    category: 'ambulance',
    name: 'Tata Memorial Hospital',
    phone: '022-2417-7000',
    distance: '7.2 km',
    latitude: 19.0048,
    longitude: 72.8435
  },
  {
    id: '13',
    category: 'ambulance',
    name: 'Christian Medical College',
    phone: '0416-228-2010',
    distance: '9.5 km',
    latitude: 12.9162,
    longitude: 79.1325
  },
  // Police stations in India
  {
    id: '6',
    category: 'police',
    name: 'Delhi Police Headquarters',
    phone: '100',
    distance: '3.2 km',
    latitude: 28.6129,
    longitude: 77.2295
  },
  {
    id: '7',
    category: 'police',
    name: 'Local Police Station',
    phone: '112',
    distance: '1.8 km',
    latitude: 28.6354,
    longitude: 77.2250
  },
  // Fire stations
  {
    id: '8',
    category: 'fire',
    name: 'Delhi Fire Service',
    phone: '101',
    distance: '4.5 km',
    latitude: 28.6466,
    longitude: 77.2073
  },
  // Electricity emergency
  {
    id: '9',
    category: 'electric',
    name: 'BSES Rajdhani Power Ltd',
    phone: '1800-419-3333',
    distance: '5.3 km',
    latitude: 28.5495,
    longitude: 77.2715
  },
  // Other emergency services
  {
    id: '10',
    category: 'other',
    name: 'Disaster Management Authority',
    phone: '1077',
    distance: '6.1 km',
    latitude: 28.6024,
    longitude: 77.2178
  },
];
