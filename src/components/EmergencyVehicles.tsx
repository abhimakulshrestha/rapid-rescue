
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initiatePhoneCall } from '@/services/emergencyServices';
import { useToast } from '@/hooks/use-toast';
import { useEmergencyVehicles } from '@/hooks/useEmergencyVehicles';
import VehicleCard from './emergency/VehicleCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Truck, MapPin } from 'lucide-react';

interface EmergencyVehiclesProps {
  userLocation: { latitude: number; longitude: number } | null;
}

const EmergencyVehicles: React.FC<EmergencyVehiclesProps> = ({ userLocation }) => {
  const { vehicles, isLoading } = useEmergencyVehicles(userLocation);
  const { toast } = useToast();
  const [vehicleType, setVehicleType] = useState<string>('all');

  const handleCallVehicle = (phone: string) => {
    if (phone) {
      initiatePhoneCall(phone);
      toast({
        title: 'Calling Emergency Vehicle',
        description: `Initiating call to ${phone}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'No phone number available for this vehicle',
        variant: 'destructive',
      });
    }
  };

  const filteredVehicles = vehicleType === 'all'
    ? vehicles
    : vehicles.filter(v => v.type === vehicleType);

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 glass-effect">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Emergency Vehicles Nearby
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 glass-effect">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Emergency Vehicles Nearby
          </CardTitle>
          <div className="flex items-center space-x-2 text-blue-100">
            <Filter size={16} />
            <span className="text-sm">Filter by type</span>
          </div>
        </div>
        {userLocation && (
          <p className="text-blue-100 text-sm mt-2 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Showing vehicles near your location
          </p>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="all" className="mb-4" onValueChange={setVehicleType}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              All ({vehicles.length})
            </TabsTrigger>
            <TabsTrigger 
              value="ambulance" 
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Ambulance ({vehicles.filter(v => v.type === 'ambulance').length})
            </TabsTrigger>
            <TabsTrigger 
              value="police" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Police ({vehicles.filter(v => v.type === 'police').length})
            </TabsTrigger>
            <TabsTrigger 
              value="fire" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Fire ({vehicles.filter(v => v.type === 'fire').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No {vehicleType !== 'all' ? vehicleType : 'emergency'} vehicles found nearby
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Emergency vehicles will appear here when they're in your area
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onCallVehicle={handleCallVehicle} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyVehicles;
