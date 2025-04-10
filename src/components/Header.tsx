
import React, { useState } from 'react';
import { LogOut, Menu, User, Bell, X, ChevronDown, Shield, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Header: React.FC<HeaderProps> = ({ userName, onLogout, onNavigate, currentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleNavigation = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-emergency-red hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center">
              <h1 
                className="text-xl font-bold text-emergency-red flex items-center cursor-pointer"
                onClick={() => handleNavigation('dashboard')}
              >
                <div className="mr-2 bg-emergency-red/10 p-1 rounded-full">
                  <Shield className="h-6 w-6 text-emergency-red" />
                </div>
                <span className="bg-gradient-to-r from-emergency-red to-red-600 bg-clip-text text-transparent">
                  Rapid Rescue
                </span>
              </h1>
              <Badge variant="outline" className="ml-2 hidden md:flex">Emergency Response</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-emergency-red rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                  <div className="bg-gray-100 p-1 rounded-full">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="hidden md:inline-block font-medium">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start p-2 mb-1 md:hidden">
                  <div className="bg-gray-100 p-1 rounded-full mr-2">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium">{userName}</span>
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-gray-100 focus:text-foreground"
                  onClick={() => handleNavigation('profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-gray-100 focus:text-foreground"
                  onClick={() => handleNavigation('contacts')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Emergency Contacts
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-gray-100 focus:text-foreground"
                  onClick={() => handleNavigation('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onLogout} 
                  className="text-emergency-red cursor-pointer focus:bg-emergency-red/10 focus:text-emergency-red"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 py-3 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation('dashboard')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              My Profile
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation('contacts')}
            >
              <Users className="h-4 w-4 mr-2" />
              Emergency Contacts
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleNavigation('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-emergency-red border-emergency-red/30 hover:bg-emergency-red/10"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
