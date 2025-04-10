
import React, { useState, useEffect } from 'react';
import { Bell, Map, Moon, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/mockData';

interface SettingsProps {
  userId: string;
}

const Settings: React.FC<SettingsProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    notifications: true,
    locationSharing: true,
    darkMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(userId);
        if (profile.preferences) {
          setPreferences(profile.preferences);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Could not load settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, toast]);

  const handleToggleChange = (
    setting: 'notifications' | 'locationSharing' | 'darkMode',
    checked: boolean
  ) => {
    setPreferences({
      ...preferences,
      [setting]: checked,
    });
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile({
        preferences,
      });
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Settings</CardTitle>
          <CardDescription>Manage your app preferences</CardDescription>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={!hasChanges || isLoading}
          variant={hasChanges ? "default" : "outline"}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">Notifications</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="notifications" className="font-medium">
                  Emergency Alerts
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications about emergency alerts in your area
                </p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={(checked) => handleToggleChange('notifications', checked)}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">Location</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-green-100">
                <Map className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <Label htmlFor="location" className="font-medium">
                  Location Sharing
                </Label>
                <p className="text-sm text-gray-500">
                  Allow the app to access your location for emergency services
                </p>
              </div>
            </div>
            <Switch
              id="location"
              checked={preferences.locationSharing}
              onCheckedChange={(checked) => handleToggleChange('locationSharing', checked)}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">Display</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-purple-100">
                <Moon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <Label htmlFor="darkMode" className="font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-gray-500">
                  Toggle dark mode for better visibility at night
                </p>
              </div>
            </div>
            <Switch
              id="darkMode"
              checked={preferences.darkMode}
              onCheckedChange={(checked) => handleToggleChange('darkMode', checked)}
            />
          </div>
        </div>

        <div className="pt-4">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h3 className="font-medium">About Rapid Rescue</h3>
                <p className="text-sm text-gray-500">
                  Version 1.0.0
                </p>
                <p className="text-xs text-gray-400">
                  © 2025 Rapid Rescue. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
