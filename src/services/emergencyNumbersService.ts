
/**
 * Get emergency phone number based on service category
 */
export function getEmergencyNumberByCategory(category: string): string {
  switch (category) {
    case 'ambulance':
      return '108';
    case 'police':
      return '100';
    case 'fire':
      return '101';
    case 'electric':
      return '1912';
    default:
      return '112'; // India's unified emergency number
  }
}
