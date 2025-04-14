
import React, { memo } from 'react';
import { Building, Clock, MapPin, Phone, Star, Wifi, Globe, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmergencyService } from '@/types/emergencyTypes';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
          <div key={service.id} className="emergency-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <div className="p-2 rounded-full bg-gray-100">
                    {service.category === 'ambulance' ? (
                      <Building className="h-6 w-6 text-emergency-red" />
                    ) : service.category === 'police' ? (
                      <Building className="h-6 w-6 text-emergency-blue" />
                    ) : service.category === 'fire' ? (
                      <Building className="h-6 w-6 text-emergency-orange" />
                    ) : (
                      <Building className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                </div>
                
                {service.vicinity && (
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="line-clamp-2">{service.vicinity}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-x-3 mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{service.distance}</span>
                  </div>
                  
                  {service.rating && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span>{service.rating}</span>
                    </div>
                  )}
                  
                  {service.open_now !== undefined && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>{service.open_now ? "Open now" : "Closed"}</span>
                    </div>
                  )}
                </div>
                
                {service.website && (
                  <div className="flex items-center text-sm mt-2">
                    <Globe className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />
                    <a 
                      href={service.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      <span className="truncate max-w-[200px]">
                        {service.website.replace(/^https?:\/\//, '')}
                      </span>
                      <ExternalLink className="h-2 w-2 ml-1" />
                    </a>
                  </div>
                )}
                
                <div className="flex items-center text-sm mt-2">
                  <Phone className="h-3 w-3 mr-1 text-emergency-red flex-shrink-0" />
                  <span className="font-medium">{service.phone || "No phone available"}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                className="bg-emergency-red hover:bg-emergency-red/90" 
                onClick={() => onCallService(service)}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call Service
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(NearbyServices);
