
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconAmbulance from '/ambulance-icon.png';
import iconPolice from '/police-icon.png';
import iconFire from '/fire-icon.png';

// Fix Leaflet default icon issue
export const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Create custom icons for emergency vehicles
export const AmbulanceIcon = L.icon({
  iconUrl: iconAmbulance || icon,
  shadowUrl: iconShadow,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export const PoliceIcon = L.icon({
  iconUrl: iconPolice || icon,
  shadowUrl: iconShadow,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export const FireIcon = L.icon({
  iconUrl: iconFire || icon,
  shadowUrl: iconShadow,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Set default icon for all markers
L.Marker.prototype.options.icon = DefaultIcon;

// Helper function to get the appropriate icon based on vehicle type
export const getVehicleIcon = (type: string): L.Icon => {
  switch (type) {
    case 'ambulance':
      return AmbulanceIcon;
    case 'police':
      return PoliceIcon;
    case 'fire':
      return FireIcon;
    default:
      return DefaultIcon;
  }
};
