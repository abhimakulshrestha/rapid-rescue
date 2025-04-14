
import React, { useState } from 'react';
import { Phone, X, Shield, AlertCircle, MapPin, Globe, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmergencyService } from '@/types/emergencyTypes';
import { initiatePhoneCall } from '@/services/emergencyServices';

interface CallModalProps {
  isOpen: boolean;
  service: EmergencyService | null;
  onClose: () => void;
  onConfirmCall: () => void;
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  service,
  onClose,
  onConfirmCall,
}) => {
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  
  if (!service) return null;
  
  const handleConfirmCall = () => {
    if (!confirmationStep) {
      setConfirmationStep(true);
      return;
    }
    
    // Call the actual service
    initiatePhoneCall(service.phone);
    
    // Also call the onConfirmCall handler for logging
    onConfirmCall();
    
    // Reset states after call is confirmed
    setConfirmationStep(false);
    setIsPriority(false);
  };
  
  const handleClose = () => {
    onClose();
    // Reset states when modal is closed
    setConfirmationStep(false);
    setIsPriority(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Shield className={`h-5 w-5 ${isPriority ? "text-orange-500" : "text-emergency-red"}`} />
            <span>{confirmationStep ? "Confirm Emergency Call" : "Emergency Call"}</span>
            {isPriority && <Badge variant="destructive" className="animate-pulse">Priority</Badge>}
          </DialogTitle>
          <DialogDescription className="text-center">
            {confirmationStep 
              ? "Please confirm that you want to make this emergency call" 
              : "You are about to call the following emergency service"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <div 
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 transform hover:scale-110 ${
              isPriority 
                ? "bg-gradient-to-r from-orange-500 to-red-600 animate-pulse" 
                : "bg-emergency-red animate-pulse-gentle"
            }`}
          >
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold">{service.name}</h2>
          <p className="text-2xl font-bold mt-2">{service.phone}</p>
          
          {!confirmationStep && service.vicinity && (
            <div className="mt-2 flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{service.vicinity}</span>
            </div>
          )}
          
          {!confirmationStep && service.open_now !== undefined && (
            <div className="mt-1 flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">{service.open_now ? "Open now" : "Closed"}</span>
            </div>
          )}

          {!confirmationStep && service.website && (
            <div className="mt-1 flex items-center text-gray-600">
              <Globe className="h-4 w-4 mr-1" />
              <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate max-w-[200px]">
                {service.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          
          {confirmationStep && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                This will initiate a real phone call to {service.name}. Only proceed if you have a genuine emergency.
              </p>
            </div>
          )}
          
          {!confirmationStep && (
            <div className="mt-4 w-full">
              <Toggle 
                className="w-full flex justify-between items-center p-2 data-[state=on]:bg-orange-100 rounded-md"
                pressed={isPriority}
                onPressedChange={setIsPriority}
              >
                <span className="font-medium">Mark as High Priority</span>
                <Badge variant={isPriority ? "destructive" : "secondary"} className="ml-2 transition-colors">
                  {isPriority ? "Priority" : "Standard"}
                </Badge>
              </Toggle>
            </div>
          )}
        </div>
        
        <Separator />
        
        <DialogFooter className="flex sm:flex-row flex-col gap-2 mt-2">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="sm:w-1/2 w-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmCall} 
            className={`sm:w-1/2 w-full transition-all duration-300 hover:shadow-lg ${
              confirmationStep
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-emergency-red hover:bg-emergency-red/90"
            }`}
          >
            <Phone className="mr-2 h-4 w-4" />
            {confirmationStep ? "Call Now" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;
