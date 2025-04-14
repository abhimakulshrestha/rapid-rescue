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
  },
  // Additional Indian hospitals
  {
    id: '11',
    category: 'ambulance',
    name: 'Safdarjung Hospital',
    phone: '011-2673-0000',
    distance: '3.9 km',
  },
  {
    id: '12',
    category: 'ambulance',
    name: 'Tata Memorial Hospital',
    phone: '022-2417-7000',
    distance: '7.2 km',
  },
  {
    id: '13',
    category: 'ambulance',
    name: 'Christian Medical College',
    phone: '0416-228-2010',
    distance: '9.5 km',
  },
  // Police stations in India
  {
    id: '6',
    category: 'police',
    name: 'Delhi Police Headquarters',
    phone: '100',
    distance: '3.2 km',
  },
  {
    id: '7',
    category: 'police',
    name: 'Local Police Station',
    phone: '112',
    distance: '1.8 km',
  },
  // Fire stations
  {
    id: '8',
    category: 'fire',
    name: 'Delhi Fire Service',
    phone: '101',
    distance: '4.5 km',
  },
  // Electricity emergency
  {
    id: '9',
    category: 'electric',
    name: 'BSES Rajdhani Power Ltd',
    phone: '1800-419-3333',
    distance: '5.3 km',
  },
  // Other emergency services
  {
    id: '10',
    category: 'other',
    name: 'Disaster Management Authority',
    phone: '1077',
    distance: '6.1 km',
  },
];
