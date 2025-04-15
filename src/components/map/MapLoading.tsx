
import React from 'react';
import { Loader } from 'lucide-react';

const MapLoading: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-white/80 z-10">
      <div className="flex flex-col items-center">
        <Loader className="h-8 w-8 animate-spin text-emergency-red" />
        <p className="mt-2 text-sm text-gray-500">Detecting your location...</p>
      </div>
    </div>
  );
};

export default MapLoading;
