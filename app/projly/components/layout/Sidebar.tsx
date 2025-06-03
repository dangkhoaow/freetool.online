'use client';

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, Users, Calendar, BarChart2, Settings, LogOut, FolderOpen, Database, UserCog, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { projlyAuthService } from "@/lib/services/projly";
import { useProjectOwnership } from "@/lib/services/projly/use-project-ownership";
import apiClient from "@/lib/api-client";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({
  icon,
  label,
  href,
  active,
  onClick
}: SidebarItemProps) => {
  // Function to handle logging
  const log = (message: string) => {
    console.log(`[PROJLY:SIDEBAR_ITEM] ${message}`);
  };
  
  const handleClick = () => {
    if (onClick) {
      log(`Clicked item with custom handler: ${label}`);
      onClick();
    } else {
      log(`Clicked navigation item: ${label}, navigating to ${href}`);
    }
  };
  
  return (
    <Link 
      href={href} 
      className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-primary hover:text-white", 
        active ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white" : "text-gray-700")}
      onClick={handleClick}
    >
      <div className="flex h-5 w-5 items-center justify-center">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

interface SidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

export function Sidebar({ isOpen = true, toggleSidebar }: SidebarProps) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [isProjectOwner, setIsProjectOwner] = useState<boolean>(false);
  
  // Use the dedicated hook for project ownership
  const projectOwnership = useProjectOwnership();
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:SIDEBAR] ${message}`, data);
    } else {
      console.log(`[PROJLY:SIDEBAR] ${message}`);
    }
  };

  // Helper functions for user role cache
  const getUserRoleCache = () => {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        log('Not in browser environment, skipping cache check');
        return null;
      }

      const cachedData = sessionStorage.getItem('projly_user_role_cache');
      if (!cachedData) {
        log('No user role cache found');
        return null;
      }
      
      const { value, expiry } = JSON.parse(cachedData);
      const expiryDate = new Date(expiry);
      const timeUntilExpiry = Math.round((expiry - Date.now()) / 1000);
      
      log(`Found user role cache (${value}), expires at: ${expiryDate.toISOString()} (in ${timeUntilExpiry} seconds)`);
      
      // Check if cache is expired (configurable via env var, default 1 minute)
      if (expiry < Date.now()) {
        log(`User role cache expired at ${expiryDate.toISOString()}, removing`);
        sessionStorage.removeItem('projly_user_role_cache');
        return null;
      }
      
      log(`Using cached user role: ${value}, valid for ${timeUntilExpiry} more seconds`);
      return value;
    } catch (error) {
      log('Error reading user role cache:', error);
      return null;
    }
  };
  
  const setUserRoleCache = (value: string) => {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        log('Not in browser environment, skipping cache setting');
        return;
      }

      // Get cache expiry from environment variable (default 1 minute)
      let envExpiryMinutes: number;
      
      // In Next.js, client-side environment variables are injected at build time
      // and are accessible directly via process.env if they start with NEXT_PUBLIC_
      if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USER_ROLE_CACHE_EXPIRY_MINUTES) {
        envExpiryMinutes = parseInt(process.env.NEXT_PUBLIC_USER_ROLE_CACHE_EXPIRY_MINUTES, 10);
        log(`Using NEXT_PUBLIC_USER_ROLE_CACHE_EXPIRY_MINUTES: ${envExpiryMinutes} minutes`);
      }
      // Fallback to default
      else {
        envExpiryMinutes = 1; // Default to 1 minute
        log(`Using default expiry: ${envExpiryMinutes} minute`);
      }
      
      const expiryMs = envExpiryMinutes * 60 * 1000;
      const expiry = Date.now() + expiryMs;
      const expiryDate = new Date(expiry);
      const cacheData = JSON.stringify({ value, expiry });
      
      log(`Setting user role cache for '${value}', expires at: ${expiryDate.toISOString()}`);
      sessionStorage.setItem('projly_user_role_cache', cacheData);
      log(`Successfully cached user role '${value}' for ${envExpiryMinutes} minute(s)`);
    } catch (error) {
      log('Error setting user role cache:', error);
    }
  };
  
  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const isAuth = await projlyAuthService.isAuthenticated();
        if (!isAuth) {
          log('User not authenticated, redirecting to login');
          router.push('/projly/login');
          return;
        }
        
        const userData = await projlyAuthService.getCurrentUser();
        log('User data loaded:', userData);
        setUser(userData);
        
        // Check for cached user role first
        const cachedUserRole = getUserRoleCache();
        if (cachedUserRole) {
          log('Using cached user role instead of API call:', cachedUserRole);
          setUserRole(cachedUserRole);
        } else {
          // No valid cache, fetch user role from the API
          log('No valid cache found, fetching user role from API...');
          try {
            const apiUrl = '/api/projly/user-roles/current';
            log(`Making API call to: ${apiUrl}`);
            
            const roleResponse = await apiClient.get(apiUrl);
            
            if (roleResponse.error) {
              log('API error when fetching user role:', roleResponse.error);
              const userRoleFromApi = 'user'; // Default to regular user on error
              setUserRole(userRoleFromApi);
              log(`Setting default user role due to API error: ${userRoleFromApi}`);
              
              // Still cache the default role to prevent repeated API calls on error
              setUserRoleCache(userRoleFromApi);
            } else {
              const userRoleFromApi = roleResponse.data;
              log(`Successfully fetched user role from API: ${userRoleFromApi}`);
              
              // Cache the user role for future use
              setUserRoleCache(userRoleFromApi);
              
              setUserRole(userRoleFromApi);
              log(`User role set from API: ${userRoleFromApi}`);
            }
          } catch (roleError) {
            console.error('[PROJLY:SIDEBAR] Error fetching user role:', roleError);
            log('Setting default user role due to exception');
            
            // Set default role on error
            const defaultRole = 'user';
            setUserRole(defaultRole);
            
            // Cache the default role to prevent repeated API calls on error
            setUserRoleCache(defaultRole);
          }
        }
        
        // Separately fetch project ownership status
        // This should be determined by project-specific logic, not site roles
        try {
          // First check if the user has any owned projects directly
          // Handle the case when ownedProjects might be missing
          const hasOwnedProjects = Array.isArray(userData?.ownedProjects) && userData.ownedProjects.length > 0;
          
          // Log the owned projects data for debugging
          log('Owned projects data:', {
            hasOwnedProjects,
            ownedProjectsExists: !!userData?.ownedProjects,
            ownedProjectsCount: Array.isArray(userData?.ownedProjects) ? userData.ownedProjects.length : 'N/A'
          });
          
          // Then check if the user is a member of any teams with projects
          // Handle the case when teamMembers might be missing
          const hasTeamProjects = Array.isArray(userData?.teamMembers) && userData.teamMembers.some((member: { team?: { projects?: any[] } }) => 
            !!member?.team?.projects && member.team.projects.length > 0
          ) || false;
          
          // Log the team projects data for debugging
          log('Team projects data:', {
            hasTeamProjects,
            teamMembersExists: !!userData?.teamMembers,
            teamMembersCount: Array.isArray(userData?.teamMembers) ? userData.teamMembers.length : 'N/A'
          });
          
          // Use the result from the useProjectOwnership hook
          // This makes a dedicated API call to check project access
          const hasProjectAccess = projectOwnership.data || false;
          
          // Log user ID for debugging
          log('User ID information:', {
            userId: userData?.id,
            email: userData?.email,
            projectOwnershipStatus: hasProjectAccess
          });
          
          // Always set to true for site_owner role to ensure access
          // Use strict comparison and also check for string value to handle different formats
          const isSiteOwner = userRole === 'site_owner' || String(userRole).toLowerCase() === 'site_owner';
          
          console.log('[PROJLY:SIDEBAR] Site owner check:', {
            userRole,
            isSiteOwnerResult: isSiteOwner,
            userRoleType: typeof userRole,
            userRoleStringCompare: String(userRole).toLowerCase() === 'site_owner'
          });
          
          // Force project ownership to true for site owners
          // This is critical because the user ID in the frontend might not match the project owner ID in the backend
          const finalOwnershipStatus = isSiteOwner ? true : (hasOwnedProjects || hasTeamProjects || hasProjectAccess);
          
          setIsProjectOwner(finalOwnershipStatus);
          log('Project ownership determination:', {
            userId: userData?.id,
            hasOwnedProjects,
            hasTeamProjects,
            hasProjectAccess,
            isSiteOwner,
            finalStatus: finalOwnershipStatus
          });
        } catch (projectError) {
          console.error('[PROJLY:SIDEBAR] Error determining project ownership:', projectError);
          // Fall back to the useProjectOwnership hook result if there's an error
          setIsProjectOwner(projectOwnership.data || false);
        }
      } catch (error) {
        console.error('[PROJLY:SIDEBAR] Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [router]);
  
  const isSiteOwner = userRole === 'site_owner';
  const isAdmin = userRole === 'admin';
  
  // Allow project owners to also see analytics
  const hasAnalyticsAccess = isSiteOwner || isAdmin || isProjectOwner;
  
  log('User access check:', {
    email: user?.email,
    role: userRole,
    isProjectOwner,
    hasAnalyticsAccess
  });

  const handleLogout = async () => {
    log('Initiating logout');
    try {
      // Call the service's signOut method
      const response = await projlyAuthService.signOut();
      
      if (response.success) {
        log('Logout successful');
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
        });
        
        // Manually redirect to login page using window.location.replace
        // This is more reliable than router.push for auth redirects
        log('Redirecting to login page');
        window.location.replace('/projly/login');
      } else {
        log('Logout failed:', response.message);
        toast({
          title: 'Logout failed',
          description: response.message || 'An error occurred during logout.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[PROJLY:SIDEBAR] Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      
      // Force redirect to login page even if there's an error
      log('Error occurred, forcing redirect to login page');
      window.location.replace('/projly/login');
    }
  };

  // Only show Team section if the user is a project owner
  const showTeamSection = isProjectOwner;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Mobile close button */}
      <div className="flex h-14 items-center justify-end border-b px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Close sidebar">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Dashboard</h2>
            <div className="space-y-1">
              <SidebarItem icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" href="/projly/dashboard" active={pathname === "/projly/dashboard"} />
              {hasAnalyticsAccess && (
                <SidebarItem icon={<BarChart2 className="h-4 w-4" />} label="Analytics" href="/projly/dashboard/analytics" active={pathname === "/projly/dashboard/analytics"} />
              )}
            </div>
          </div>
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Projects</h2>
            <div className="space-y-1">
              <SidebarItem icon={<FolderOpen className="h-4 w-4" />} label="All Projects" href="/projly/projects" active={pathname === "/projly/projects"} />
              <SidebarItem icon={<ClipboardList className="h-4 w-4" />} label="Tasks" href="/projly/tasks" active={pathname === "/projly/tasks"} />
            </div>
          </div>
          {showTeamSection && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-lg font-semibold tracking-tight">Teams</h2>
              <div className="space-y-1">
                <SidebarItem icon={<Users className="h-4 w-4" />} label="Members" href="/projly/teams" active={pathname === "/projly/teams"} />
              </div>
            </div>
          )}
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Resources</h2>
            <div className="space-y-1">
              <SidebarItem icon={<Database className="h-4 w-4" />} label="All Resources" href="/projly/resources" active={pathname === "/projly/resources"} />
              <SidebarItem icon={<Calendar className="h-4 w-4" />} label="Calendar" href="/projly/calendar" active={pathname === "/projly/calendar"} />
            </div>
          </div>
          <div className="px-3 py-2">
            <h2 className="mb-2 text-lg font-semibold tracking-tight">Settings</h2>
            <div className="space-y-1">
              <SidebarItem icon={<Settings className="h-4 w-4" />} label="Account Settings" href="/projly/settings" active={pathname === "/projly/settings"} />
              {(isSiteOwner || isAdmin) && (
                <SidebarItem icon={<UserCog className="h-4 w-4" />} label="User Settings" href="/projly/user-settings" active={pathname === "/projly/user-settings"} />
              )}
            </div>
          </div>
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start text-gray-700 hover:text-project-primary hover:bg-transparent hover:border-project-primary" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
