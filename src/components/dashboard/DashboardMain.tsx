
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Activity } from 'lucide-react';
import MapLocation from '@/components/MapLocation';
import EmergencyCategories from '@/components/EmergencyCategories';
import NearbyServices from '@/components/NearbyServices';
import { EmergencyService } from '@/types/emergencyTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Actions */}
          <div className="xl:col-span-2 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Emergency Response Center</h1>
              <p className="text-lg text-gray-600">Quick access to emergency services and real-time assistance</p>
            </div>

            {/* Location Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Your Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MapLocation onLocationUpdate={onLocationUpdate} />
              </CardContent>
            </Card>

            {/* Emergency Categories */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Emergency Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <EmergencyCategories 
                  onSelectCategory={onSelectCategory}
                  onCallService={onCallService}
                  nearbyServices={services}
                />
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            {emergencyContacts && emergencyContacts.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Quick Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {emergencyContacts.slice(0, 6).map((contact) => (
                      <Button 
                        key={contact.id}
                        className="h-auto p-4 bg-white border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 shadow-sm"
                        onClick={() => onCallEmergencyContact(contact)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm font-medium">{contact.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Column - Nearby Services */}
          <div className="xl:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-fit sticky top-6">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle>Nearby Services</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <NearbyServices 
                  services={services}
                  selectedCategory={selectedCategory}
                  onCallService={onCallService}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;
