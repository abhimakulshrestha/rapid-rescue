
import React, { useState, useEffect } from 'react';
import { Edit, Save, User, MapPin, Phone, Mail, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/mockData';

interface ProfileProps {
  userId: string;
}

const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
        setFormValues(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedProfile = await updateUserProfile(formValues);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
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

  if (!profile) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <p>Could not load profile data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">My Profile</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-500" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 mb-1">Name</label>
              {isEditing ? (
                <Input 
                  name="name" 
                  value={formValues.name || ''} 
                  onChange={handleInputChange} 
                  className="border-gray-300"
                />
              ) : (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">{profile.name}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 mb-1">Email</label>
              {isEditing ? (
                <Input 
                  name="email" 
                  value={formValues.email || ''} 
                  onChange={handleInputChange} 
                  className="border-gray-300"
                />
              ) : (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 mb-1">Phone</label>
              {isEditing ? (
                <Input 
                  name="phone" 
                  value={formValues.phone || ''} 
                  onChange={handleInputChange} 
                  className="border-gray-300"
                />
              ) : (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 mb-1">Address</label>
              {isEditing ? (
                <Input 
                  name="address" 
                  value={formValues.address || ''} 
                  onChange={handleInputChange} 
                  className="border-gray-300"
                />
              ) : (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col pt-2">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 mr-2 text-emergency-red" />
                <span className="text-sm font-medium">Medical Information</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">Blood Type:</span>
                  <span>{profile.medicalInfo?.bloodType || 'Not specified'}</span>
                  
                  <span className="font-medium">Allergies:</span>
                  <span>{profile.medicalInfo?.allergies?.join(', ') || 'None'}</span>
                  
                  <span className="font-medium">Conditions:</span>
                  <span>{profile.medicalInfo?.conditions?.join(', ') || 'None'}</span>
                  
                  <span className="font-medium">Medications:</span>
                  <span>{profile.medicalInfo?.medications?.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
