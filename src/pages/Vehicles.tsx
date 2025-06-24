
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import EmergencyVehicles from '@/components/EmergencyVehicles';
import { useUserLocation } from '@/hooks/useUserLocation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MapDisplay from '@/components/map/MapDisplay';

const Vehicles = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const userId = user?.id || '';
  const userName = user?.user_metadata?.name || 'User';
  const { location } = useUserLocation(userId);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleNavigationClick = (view: string) => {
    if (view === 'dashboard') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header 
        userName={userName} 
        onLogout={signOut} 
        onNavigate={handleNavigationClick}
        currentView="vehicles"
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Emergency Vehicles</h1>
            <p className="text-lg text-gray-600">Real-time tracking of emergency vehicles in your area</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Live Vehicle Tracking</h2>
              </div>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapDisplay 
                  location={location ? { lat: location.latitude, lng: location.longitude } : null}
                  loading={false}
                  onMapReady={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicles List */}
          <div>
            <EmergencyVehicles userLocation={location} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Vehicles;
