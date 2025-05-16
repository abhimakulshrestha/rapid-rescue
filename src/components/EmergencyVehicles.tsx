
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initiatePhoneCall } from '@/services/emergencyServices';
import { useToast } from '@/hooks/use-toast';
import { useEmergencyVehicles } from '@/hooks/useEmergencyVehicles';
import VehicleCard from './emergency/VehicleCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter } from 'lucide-react';

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
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Emergency Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-none shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-white">Nearby Emergency Vehicles</CardTitle>
          <div className="flex items-center space-x-2">
            <Filter size={16} />
            <span className="text-sm">Filter:</span>
          </div>
        </div>
        <Tabs defaultValue="all" className="mt-2" onValueChange={setVehicleType}>
          <TabsList className="bg-slate-700/50 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
              All
            </TabsTrigger>
            <TabsTrigger value="ambulance" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Ambulance
            </TabsTrigger>
            <TabsTrigger value="police" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Police
            </TabsTrigger>
            <TabsTrigger value="fire" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Fire
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-3 lg:p-4 bg-gradient-to-b from-gray-50 to-white">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No {vehicleType !== 'all' ? vehicleType : 'emergency'} vehicles found in your area</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredVehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <VehicleCard 
                    key={vehicle.id} 
                    vehicle={vehicle} 
                    onCallVehicle={handleCallVehicle} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyVehicles;
