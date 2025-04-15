
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initiatePhoneCall } from '@/services/emergencyServices';
import { useToast } from '@/hooks/use-toast';
import { useEmergencyVehicles } from '@/hooks/useEmergencyVehicles';
import VehicleCard from './emergency/VehicleCard';

interface EmergencyVehiclesProps {
  userLocation: { latitude: number; longitude: number } | null;
}

const EmergencyVehicles: React.FC<EmergencyVehiclesProps> = ({ userLocation }) => {
  const { vehicles, isLoading } = useEmergencyVehicles(userLocation);
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Emergency Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Nearby Emergency Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No emergency vehicles found in your area</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
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
