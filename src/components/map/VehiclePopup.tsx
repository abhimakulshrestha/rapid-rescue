
import React from 'react';
import { Popup } from 'react-leaflet';
import { EmergencyVehicle } from '@/types/emergencyTypes';

interface VehiclePopupProps {
  vehicle: EmergencyVehicle;
  isAnimating: boolean;
}

const VehiclePopup: React.FC<VehiclePopupProps> = ({ vehicle, isAnimating }) => {
  return (
    <Popup>
      <div className="vehicle-popup">
        <h3 className="font-bold text-sm bg-gradient-to-r from-slate-700 to-slate-900 text-white p-2 rounded-t-md">
          {vehicle.name}
        </h3>
        <div className="p-3 bg-gradient-to-b from-white to-gray-50">
          <p className="text-xs capitalize flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
              vehicle.type === 'ambulance' ? 'bg-emergency-red' : 
              vehicle.type === 'police' ? 'bg-emergency-blue' : 'bg-emergency-orange'
            }`}></span>
            {vehicle.type}
          </p>
          {isAnimating && (
            <p className="text-xs text-green-600 font-medium mt-1">
              Currently active
            </p>
          )}
          {vehicle.status && (
            <p className="text-xs mt-1 flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                vehicle.status === 'available' ? 'bg-green-500' : 'bg-orange-500'
              }`}></span>
              Status: <span className="font-medium ml-1">{vehicle.status}</span>
            </p>
          )}
          {vehicle.phone && (
            <p className="text-xs mt-2 bg-blue-50 p-1 rounded">
              <a 
                href={`tel:${vehicle.phone}`} 
                className="text-blue-600 hover:underline flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call: {vehicle.phone}
              </a>
            </p>
          )}
        </div>
      </div>
    </Popup>
  );
};

export default VehiclePopup;
