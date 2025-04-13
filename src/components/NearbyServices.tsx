
import React, { memo } from 'react';
import { Building, Clock, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmergencyService } from '@/types/emergencyTypes';

interface NearbyServicesProps {
  services: EmergencyService[];
  selectedCategory: string | null;
  onCallService: (service: EmergencyService) => void;
}

const NearbyServices: React.FC<NearbyServicesProps> = ({
  services,
  selectedCategory,
  onCallService,
}) => {
  // Filter services by selected category
  const filteredServices = selectedCategory
    ? services.filter(service => service.category === selectedCategory)
    : services;

  if (filteredServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Nearby Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              {selectedCategory
                ? `No ${selectedCategory} services found nearby`
                : "Select a category to see nearby services"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Nearby Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredServices.map((service) => (
          <div key={service.id} className="emergency-card">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{service.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{service.distance ? `${service.distance} away` : "Nearby"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Open 24/7</span>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Phone className="h-3 w-3 mr-1 text-emergency-red" />
                  <span className="font-medium">{service.phone}</span>
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <div className="p-2 rounded-full bg-gray-100">
                  <Building className="h-6 w-6 text-gray-600" />
                </div>
                <Button 
                  size="sm" 
                  className="mt-2 bg-emergency-red hover:bg-emergency-red/90" 
                  onClick={() => onCallService(service)}
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(NearbyServices);
