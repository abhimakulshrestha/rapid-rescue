
import React from 'react';
import { AlertCircle, Stethoscope, Shield, Flame, Zap, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface EmergencyService {
  id: string;
  category: string;
  name: string;
  phone: string;
  distance?: string;
}

interface EmergencyCategoriesProps {
  onSelectCategory: (category: string) => void;
  onCallService: (service: EmergencyService) => void;
  nearbyServices: EmergencyService[];
}

const EmergencyCategories: React.FC<EmergencyCategoriesProps> = ({
  onSelectCategory,
  onCallService,
  nearbyServices,
}) => {
  const { toast } = useToast();

  const categories = [
    { id: 'ambulance', name: 'Ambulance', icon: Stethoscope, color: 'bg-emergency-red text-white' },
    { id: 'police', name: 'Police', icon: Shield, color: 'bg-emergency-blue text-white' },
    { id: 'fire', name: 'Fire Services', icon: Flame, color: 'bg-emergency-orange text-white' },
    { id: 'electric', name: 'Electric Emergency', icon: Zap, color: 'bg-yellow-500 text-white' },
    { id: 'other', name: 'Other Emergency', icon: AlertCircle, color: 'bg-emergency-purple text-white' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    
    const filteredServices = nearbyServices.filter(service => service.category === categoryId);
    
    if (filteredServices.length === 0) {
      toast({
        title: "No services found",
        description: `No ${categoryId} services found nearby. Try another category or call emergency.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Emergency Categories</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`emergency-button ${category.color} hover:opacity-90`}
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-white/20 mr-3">
                <category.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{category.name}</span>
            </div>
            <div className="text-xs bg-white/20 px-2 py-1 rounded">Select</div>
          </button>
        ))}
      </CardContent>

      <div className="mt-4 p-4 border-t">
        <h3 className="font-medium mb-2">Emergency Hotlines</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-emergency-red" />
              <span className="font-medium">General Emergency</span>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="bg-emergency-red hover:bg-emergency-red/90"
              onClick={() => {
                const emergencyService = {
                  id: 'emergency',
                  category: 'emergency',
                  name: 'Emergency Services',
                  phone: '911',
                };
                onCallService(emergencyService);
              }}
            >
              Call 911
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmergencyCategories;
