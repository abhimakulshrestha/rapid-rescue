
import React from 'react';
import { Car, Ambulance, Shield, Flame } from 'lucide-react';

interface VehicleIconProps {
  type: string;
  className?: string;
}

const VehicleIcon: React.FC<VehicleIconProps> = ({ type, className = "h-5 w-5" }) => {
  switch (type) {
    case 'ambulance':
      return <Ambulance className={`${className} text-emergency-red`} />;
    case 'police':
      return <Shield className={`${className} text-emergency-blue`} />;
    case 'fire':
      return <Flame className={`${className} text-emergency-orange`} />;
    default:
      return <Car className={`${className} text-gray-600`} />;
  }
};

export default VehicleIcon;
