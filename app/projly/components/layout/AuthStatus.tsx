
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { projlyAuthService } from '@/lib/services/projly';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';

// Implement getInitials function directly to avoid import issues
function getInitials(name?: string, fallback: string = 'U'): string {
  // Log the input for debugging
  console.log('[PROJLY:AUTH_STATUS] Getting initials for:', name);
  
  // Handle empty or undefined name
  if (!name) {
    console.log('[PROJLY:AUTH_STATUS] Using fallback for empty name:', fallback);
    return fallback;
  }
  
  // Split the name and get initials
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 0) {
    console.log('[PROJLY:AUTH_STATUS] No name parts found, using fallback:', fallback);
    return fallback;
  }
  
  if (parts.length === 1) {
    // Just get the first character of the single name
    const initial = parts[0].charAt(0).toUpperCase();
    console.log('[PROJLY:AUTH_STATUS] Single initial for:', name, initial);
    return initial;
  }
  
  // Get first initial + last initial
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  const initials = `${firstInitial}${lastInitial}`;
  
  console.log('[PROJLY:AUTH_STATUS] Initials for:', name, initials);
  return initials;
}

export const AuthStatus = () => {
  const [user, setUser] = React.useState<any>(null);
  const router = useRouter();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:AUTH_STATUS] ${message}`, data);
    } else {
      console.log(`[PROJLY:AUTH_STATUS] ${message}`);
    }
  };
  
  // Load user data on component mount
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = projlyAuthService.getCurrentUser();
        log('Current user:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('[PROJLY:AUTH_STATUS] Error loading user:', error);
      }
    };
    
    loadUser();
  }, []);

  const handleLogout = async () => {
    log('Initiating logout');
    try {
      // Call the signOut method
      const result = await projlyAuthService.signOut();
      
      if (result.success) {
        log('Logout successful, redirecting to login');
        // Use window.location.replace for more reliable redirection
        // This ensures a complete page reload and clears any cached state
        window.location.replace('/projly/login');
      } else {
        log('Logout failed:', result.error);
        // Fallback redirect if the signOut method fails
        window.location.replace('/projly/login');
      }
    } catch (error) {
      console.error('[PROJLY:AUTH_STATUS] Logout failed:', error);
      // Fallback redirect if an exception occurs
      window.location.replace('/projly/login');
    }
  };

  const handleSettings = () => {
    log('Navigating to settings');
    router.push('/projly/settings');
  };

  const handleProfile = () => {
    log('Navigating to profile');
    router.push('/projly/profile');
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push('/projly/login')}>
          Login
        </Button>
        <Button onClick={() => router.push('/projly/register')}>Sign Up</Button>
      </div>
    );
  }

  // Prepare user display name from user object
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = (firstName || lastName) ? 
    `${firstName} ${lastName}`.trim() : 
    user?.email || 'User';
    
  // Log user information for debugging
  console.log('[AUTH STATUS] User info:', { user, firstName, lastName, fullName, email: user?.email });
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
