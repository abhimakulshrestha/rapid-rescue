
import React, { useState } from 'react';
import { Phone, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmergencyVehicle } from '@/types/emergencyTypes';
import VehicleIcon from './VehicleIcon';
import Vehicle3DView from './Vehicle3DView';

interface VehicleCardProps {
  vehicle: EmergencyVehicle;
  onCallVehicle: (phone: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onCallVehicle }) => {
  const [expanded, setExpanded] = useState(false);
  const isAvailable = vehicle.status === 'available';
  
  // Determine gradient colors based on vehicle type
  const gradientClass = vehicle.type === 'ambulance' 
    ? 'from-rose-50 to-rose-100 border-rose-200' 
    : vehicle.type === 'police'
    ? 'from-blue-50 to-blue-100 border-blue-200'
    : 'from-orange-50 to-orange-100 border-orange-200';

  const handleDirectCall = (phoneNumber: string) => {
    if (phoneNumber) {
      // Direct phone call without modal
      window.location.href = `tel:${phoneNumber}`;
      onCallVehicle(phoneNumber);
    }
  };
    
  return (
    <div className={`border ${isAvailable ? 'border-2' : 'border'} rounded-lg overflow-hidden hover:shadow-md transition-shadow ${gradientClass}`}>
      <div className="bg-gradient-to-r p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            vehicle.type === 'ambulance' ? 'bg-rose-100' : 
            vehicle.type === 'police' ? 'bg-blue-100' : 'bg-orange-100'
          }`}>
            <VehicleIcon type={vehicle.type} />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{vehicle.name}</h3>
              <Badge 
                className={`ml-2 ${
                  vehicle.status === 'available' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : vehicle.status === 'busy' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}
              >
                {vehicle.status || 'unknown'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
              {vehicle.distance && (
                <span className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> {vehicle.distance}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className={`text-white ${
              vehicle.type === 'ambulance' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
              vehicle.type === 'police' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              'bg-gradient-to-r from-orange-500 to-amber-600'
            }`}
            onClick={() => handleDirectCall(vehicle.phone || '')}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-gray-500"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="overflow-hidden">
          <Vehicle3DView 
            vehicleType={vehicle.type} 
            isAvailable={isAvailable} 
          />
          
          <div className="p-3 pt-0">
            <div className="mt-2 space-y-2">
              <p className="text-sm">
                <strong>Status:</strong> {isAvailable ? 
                  <span className="text-green-600">Available for dispatch</span> : 
                  <span className="text-orange-600">Currently on duty</span>
                }
              </p>
              {vehicle.phone && (
                <div className="text-sm">
                  <strong>Emergency Contact:</strong> 
                  <button 
                    onClick={() => handleDirectCall(vehicle.phone)}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    {vehicle.phone}
                  </button>
                </div>
              )}
              <p className="text-sm">
                <strong>Last Updated:</strong> {new Date(vehicle.last_updated || '').toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
