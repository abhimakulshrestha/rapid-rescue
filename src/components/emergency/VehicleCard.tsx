
import React from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import VehicleIcon from './VehicleIcon';

interface VehicleCardProps {
  vehicle: EmergencyVehicle;
  onCallVehicle: (phone: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onCallVehicle }) => {
  return (
    <div 
      className="border border-gray-200 rounded-md p-3 flex justify-between items-center hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gray-100">
          <VehicleIcon type={vehicle.type} />
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
        onClick={() => onCallVehicle(vehicle.phone || '')}
      >
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VehicleCard;
