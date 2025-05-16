'use client';

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, Users, Calendar, BarChart2, Settings, LogOut, FolderOpen, Database, UserCog, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { projlyAuthService } from '@/lib/services/projly';

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
      className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-project-primary hover:text-white", 
        active ? "bg-project-primary text-white" : "text-gray-700")}
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
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:SIDEBAR] ${message}`, data);
    } else {
      console.log(`[PROJLY:SIDEBAR] ${message}`);
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
        
        // Mock role assignment based on user data
        // In a real app, this would come from an API call
        const mockRole = userData?.email?.includes('admin') ? 'admin' : 
                         userData?.email?.includes('owner') ? 'site_owner' : 'user';
        setUserRole(mockRole);
        log('User role set:', mockRole);
        
        // Mock project ownership check
        // In a real app, this would come from an API call
        const mockProjectOwner = mockRole === 'site_owner' || mockRole === 'admin' || Math.random() > 0.5;
        setIsProjectOwner(mockProjectOwner);
        log('Project ownership set:', mockProjectOwner);
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
      const response = await projlyAuthService.signOut();
      
      if (response.success) {
        log('Logout successful');
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
        });
        router.push('/projly/login');
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
              <h2 className="mb-2 text-lg font-semibold tracking-tight">Team</h2>
              <div className="space-y-1">
                <SidebarItem icon={<Users className="h-4 w-4" />} label="Members" href="/projly/team" active={pathname === "/projly/team"} />
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
              {isSiteOwner && (
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
