
import React, { useState, useEffect } from 'react';
import { Phone, Plus, Star, Trash, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EmergencyContact, getUserProfile, updateUserProfile } from '@/services/mockData';

interface EmergencyContactsProps {
  userId: string;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ userId }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    relation: '',
    phone: '',
    isICE: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const profile = await getUserProfile(userId);
        setContacts(profile.emergencyContacts || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Could not load emergency contacts',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [userId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact({
      ...newContact,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewContact({
      ...newContact,
      isICE: checked,
    });
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in at least name and phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newId = `contact-${Date.now()}`;
      const newContactWithId = {
        ...newContact,
        id: newId,
      } as EmergencyContact;

      const updatedContacts = [...contacts, newContactWithId];
      await updateUserProfile({ emergencyContacts: updatedContacts });
      setContacts(updatedContacts);
      
      toast({
        title: 'Contact Added',
        description: 'Emergency contact has been added successfully',
      });
      
      setDialogOpen(false);
      setNewContact({
        name: '',
        relation: '',
        phone: '',
        isICE: false,
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add emergency contact',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    setIsLoading(true);
    try {
      const updatedContacts = contacts.filter(contact => contact.id !== selectedContact.id);
      await updateUserProfile({ emergencyContacts: updatedContacts });
      setContacts(updatedContacts);
      
      toast({
        title: 'Contact Deleted',
        description: 'Emergency contact has been removed',
      });
      
      setDeleteDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete emergency contact',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && contacts.length === 0) {
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
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Emergency Contacts</CardTitle>
            <CardDescription>People to contact in case of emergency</CardDescription>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emergency-red hover:bg-emergency-red/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No emergency contacts added yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add contacts who should be notified in case of emergency
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 border border-gray-200 rounded-md flex justify-between items-center hover:bg-gray-50"
                >
                  <div className="flex items-start gap-2">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{contact.name}</h3>
                        {contact.isICE && (
                          <Badge className="ml-2 bg-amber-500" variant="default">
                            <Star className="h-3 w-3 mr-1" />
                            ICE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{contact.relation}</p>
                      <p className="text-sm font-medium">{contact.phone}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => {
                      setSelectedContact(contact);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Contact Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contact name"
                value={newContact.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relation">Relationship</Label>
              <Input
                id="relation"
                name="relation"
                placeholder="E.g. Spouse, Parent, Friend"
                value={newContact.relation}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Phone number"
                value={newContact.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ice"
                checked={newContact.isICE}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="ice" className="flex items-center">
                <span>Mark as ICE</span>
                <span className="ml-1 text-xs text-gray-500">(In Case of Emergency)</span>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddContact}
              className="bg-emergency-red hover:bg-emergency-red/90"
            >
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>Are you sure you want to delete this emergency contact?</p>
            {selectedContact && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{selectedContact.name}</p>
                <p className="text-sm text-gray-500">{selectedContact.phone}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDeleteContact}
              variant="destructive"
            >
              Delete Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyContacts;
