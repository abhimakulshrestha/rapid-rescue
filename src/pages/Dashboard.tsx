
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CallModal from '@/components/CallModal';
import Profile from '@/components/Profile';
import EmergencyContacts from '@/components/EmergencyContacts';
import Settings from '@/components/Settings';
import DashboardMain from '@/components/dashboard/DashboardMain';
import { useEmergencyServices } from '@/hooks/useEmergencyServices';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useUserLocation } from '@/hooks/useUserLocation';

// Define view constants for dashboard sections
const VIEWS = {
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  CONTACTS: 'contacts',
  SETTINGS: 'settings',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);

  // Redirect to home if not logged in
  if (!user) {
    navigate('/');
    return null;
  }

  const userId = user.id;
  const userName = user?.user_metadata?.name || 'User';

  // Custom hooks for dashboard functionality
  const { location, handleLocationUpdate } = useUserLocation(userId);
  const { emergencyContacts, handleCallEmergencyContact } = useEmergencyContacts(userId);
  const {
    services,
    selectedCategory,
    callModalOpen,
    selectedService,
    handleSelectCategory,
    handleCallService,
    handleConfirmCall,
    setCallModalOpen
  } = useEmergencyServices(location);

  // Handle navigation between dashboard views
  const handleNavigationClick = useCallback((view: string) => {
    setCurrentView(view);
  }, []);

  // Handle confirming an emergency call
  const onConfirmCall = useCallback(() => {
    handleConfirmCall(userId, location);
  }, [handleConfirmCall, userId, location]);

  // Render the current view
  const renderCurrentView = () => {
    switch (currentView) {
      case VIEWS.PROFILE:
        return <Profile userId={userId} />;
      case VIEWS.CONTACTS:
        return <EmergencyContacts userId={userId} />;
      case VIEWS.SETTINGS:
        return <Settings userId={userId} />;
      case VIEWS.DASHBOARD:
      default:
        return (
          <DashboardMain
            location={location}
            services={services}
            selectedCategory={selectedCategory}
            emergencyContacts={emergencyContacts}
            onLocationUpdate={handleLocationUpdate}
            onSelectCategory={handleSelectCategory}
            onCallService={handleCallService}
            onCallEmergencyContact={handleCallEmergencyContact}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        userName={userName} 
        onLogout={signOut} 
        onNavigate={handleNavigationClick}
        currentView={currentView}
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </main>
      
      <CallModal 
        isOpen={callModalOpen}
        service={selectedService}
        onClose={() => setCallModalOpen(false)}
        onConfirmCall={onConfirmCall}
      />
    </div>
  );
};

export default Dashboard;
