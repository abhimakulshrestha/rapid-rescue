
import React, { useEffect, useState } from 'react';
import { Car, Ambulance, Police, Flame, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/services/locationUtils';
import { initiatePhoneCall } from '@/services/emergencyServices';
import { useToast } from '@/hooks/use-toast';

interface EmergencyVehicle {
  id: string;
  type: string;
  name: string;
  phone: string | null;
  status: string | null;
  latitude: number;
  longitude: number;
  last_updated: string | null;
  distance?: string;
}

interface EmergencyVehiclesProps {
  userLocation: { latitude: number; longitude: number } | null;
}

const EmergencyVehicles: React.FC<EmergencyVehiclesProps> = ({ userLocation }) => {
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('emergency_vehicles')
          .select('*');

        if (error) throw error;

        let processedVehicles = data || [];
        
        // Calculate distance if user location is available
        if (userLocation) {
          processedVehicles = processedVehicles.map(vehicle => ({
            ...vehicle,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              vehicle.latitude,
              vehicle.longitude
            )
          }));
          
          // Sort by distance
          processedVehicles.sort((a, b) => {
            const distA = parseFloat(a.distance?.split(' ')[0] || '999');
            const distB = parseFloat(b.distance?.split(' ')[0] || '999');
            return distA - distB;
          });
        }
        
        setVehicles(processedVehicles);
      } catch (error) {
        console.error('Error fetching emergency vehicles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load emergency vehicles data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('emergency-vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_vehicles',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVehicles(prev => {
              const newVehicle = payload.new as EmergencyVehicle;
              if (userLocation) {
                newVehicle.distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  newVehicle.latitude,
                  newVehicle.longitude
                );
              }
              return [...prev, newVehicle];
            });
          } else if (payload.eventType === 'UPDATE') {
            setVehicles(prev => prev.map(vehicle => 
              vehicle.id === payload.new.id ? { 
                ...payload.new as EmergencyVehicle,
                distance: userLocation ? calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  (payload.new as EmergencyVehicle).latitude,
                  (payload.new as EmergencyVehicle).longitude
                ) : undefined
              } : vehicle
            ));
          } else if (payload.eventType === 'DELETE') {
            setVehicles(prev => prev.filter(vehicle => vehicle.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation, toast]);

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

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return <Ambulance className="h-5 w-5 text-emergency-red" />;
      case 'police':
        return <Police className="h-5 w-5 text-emergency-blue" />;
      case 'fire':
        return <Flame className="h-5 w-5 text-emergency-orange" />;
      default:
        return <Car className="h-5 w-5 text-gray-600" />;
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
              <div 
                key={vehicle.id}
                className="border border-gray-200 rounded-md p-3 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    {getVehicleIcon(vehicle.type)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{vehicle.name}</h3>
                      <Badge 
                        className={`ml-2 ${
                          vehicle.status === 'available' 
                            ? 'bg-green-500' 
                            : vehicle.status === 'busy' 
                              ? 'bg-orange-500' 
                              : 'bg-gray-500'
                        }`}
                      >
                        {vehicle.status || 'unknown'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                      {vehicle.distance && <span> · {vehicle.distance}</span>}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="success" 
                  size="sm" 
                  className="text-white"
                  onClick={() => handleCallVehicle(vehicle.phone || '')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyVehicles;
