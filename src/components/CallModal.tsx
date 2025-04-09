
import React from 'react';
import { Phone, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmergencyService } from './EmergencyCategories';

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
  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Emergency Call</DialogTitle>
          <DialogDescription className="text-center">
            You are about to call the following emergency service
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-16 h-16 rounded-full bg-emergency-red flex items-center justify-center mb-4 animate-pulse-gentle">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold">{service.name}</h2>
          <p className="text-2xl font-bold mt-2">{service.phone}</p>
        </div>
        
        <DialogFooter className="flex sm:flex-row flex-col gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="sm:w-1/2 w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={onConfirmCall} 
            className="sm:w-1/2 w-full bg-emergency-red hover:bg-emergency-red/90"
          >
            <Phone className="mr-2 h-4 w-4" />
            Call Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;
