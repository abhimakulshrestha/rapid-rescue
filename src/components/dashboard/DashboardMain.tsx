
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import MapLocation from '@/components/MapLocation';
import EmergencyCategories from '@/components/EmergencyCategories';
import NearbyServices from '@/components/NearbyServices';
import EmergencyVehicles from '@/components/EmergencyVehicles';
import { EmergencyService } from '@/types/emergencyTypes';

interface DashboardMainProps {
  location: { latitude: number; longitude: number } | null;
  services: EmergencyService[];
  selectedCategory: string | null;
  emergencyContacts: any[];
  onLocationUpdate: (latitude: number, longitude: number) => void;
  onSelectCategory: (category: string) => void;
  onCallService: (service: EmergencyService) => void;
  onCallEmergencyContact: (contact: any) => void;
}

const DashboardMain: React.FC<DashboardMainProps> = ({
  location,
  services,
  selectedCategory,
  emergencyContacts,
  onLocationUpdate,
  onSelectCategory,
  onCallService,
  onCallEmergencyContact
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Emergency Dashboard</h2>
        <MapLocation onLocationUpdate={onLocationUpdate} />
        <EmergencyCategories 
          onSelectCategory={onSelectCategory}
          onCallService={onCallService}
          nearbyServices={services}
        />
        
        {/* Emergency Contacts Quick Call Section */}
        {emergencyContacts && emergencyContacts.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-3">Quick Call Emergency Contacts</h3>
            <div className="flex flex-wrap gap-2">
              {emergencyContacts.slice(0, 3).map((contact) => (
                <Button 
                  key={contact.id}
                  variant="outline" 
                  className="flex items-center border-emergency-red text-emergency-red hover:bg-emergency-red/10"
                  onClick={() => onCallEmergencyContact(contact)}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call {contact.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold lg:opacity-0 hidden lg:block">Nearby Services</h2>
        <NearbyServices 
          services={services}
          selectedCategory={selectedCategory}
          onCallService={onCallService}
        />
        
        {/* Display Emergency Vehicles */}
        <EmergencyVehicles userLocation={location} />
      </div>
    </div>
  );
};

export default DashboardMain;
