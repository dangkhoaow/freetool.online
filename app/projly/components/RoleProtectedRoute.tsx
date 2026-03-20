
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useUserRoles } from "@/hooks/use-user-roles";
import { UserRole } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = "/projly/dashboard" 
}: RoleProtectedRouteProps) {
  const { currentUserRole } = useUserRoles();
  const { refreshSession, user, isEditMode } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [editModeChecked, setEditModeChecked] = useState(false);
  const [localEditMode, setLocalEditMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("RoleProtectedRoute: Initial render", { 
    currentUserRole: currentUserRole.data, 
    isEditMode, 
    hasAccess, 
    isRefreshing,
    allowedRoles,
    user: user?.email,
    pathname: location.pathname,
    href: window.location.href, // Fixed TypeScript error: changed location.href to window.location.href
    sessionValidated,
    editModeChecked,
    localEditMode,
    timestamp: new Date().toISOString()
  });
  
  // Check for edit mode using multiple indicators
  useEffect(() => {
    // Enhanced edit mode detection logic
    const url = window.location.href;
    const isLovableDomain = url.includes('lovable.dev') || 
                           url.includes('lovableproject.com');
                           
    const editPatterns = ['/edit', '?editMode=true', '/edit/'];
    const hasEditPattern = editPatterns.some(pattern => url.includes(pattern));
    
    const storedEditMode = localStorage.getItem('lovable_edit_mode') === 'true';
    const queryParams = new URLSearchParams(window.location.search);
    const queryEditMode = queryParams.get('editMode') === 'true';
    
    const detectedEditMode = (isLovableDomain && (hasEditPattern || queryEditMode)) || 
                            storedEditMode || 
                            isEditMode;
    
    console.log("RoleProtectedRoute: Checking for edit mode indicators", {
      url,
      isLovableDomain,
      hasEditPattern,
      storedEditMode,
      queryEditMode,
      detectedEditMode,
      contextIsEditMode: isEditMode,
      localStorage: localStorage.getItem('lovable_edit_mode'),
      timestamp: new Date().toISOString()
    });
      
    if (detectedEditMode && !localEditMode) {
      console.log("RoleProtectedRoute: Edit mode detected! Setting flags", {
        timestamp: new Date().toISOString()
      });
      
      // Store for consistent detection
      localStorage.setItem('lovable_edit_mode', 'true');
      setLocalEditMode(true);
      setEditModeChecked(true);
      setHasAccess(true); // Always grant access in edit mode
      setSessionValidated(true); // Skip validation in edit mode
    }
  }, [isEditMode, editModeChecked, location]);
  
  // Effect for role checking
  useEffect(() => {
    console.log("RoleProtectedRoute: Role check effect triggered", { 
      currentUserRole: currentUserRole.data, 
      isEditMode, 
      localEditMode,
      editModeChecked,
      isRefreshing,
      roleError: currentUserRole.error,
      timestamp: new Date().toISOString() 
    });
    
    // Skip role checking in edit mode
    if (isEditMode || localEditMode || editModeChecked) {
      console.log("RoleProtectedRoute: Edit mode detected, granting access without checking role", {
        timestamp: new Date().toISOString()
      });
      setHasAccess(true);
      return;
    }

    // Only check roles when not in edit mode
    if (currentUserRole.data) {
      const userHasRole = allowedRoles.includes(currentUserRole.data);
      console.log("RoleProtectedRoute: User has required role?", userHasRole, {
        userRole: currentUserRole.data,
        requiredRoles: allowedRoles,
        timestamp: new Date().toISOString()
      });
      setHasAccess(userHasRole);
    } else if (currentUserRole.error) {
      console.error("RoleProtectedRoute: Error fetching user role:", currentUserRole.error, {
        errorMessage: currentUserRole.error.message,
        timestamp: new Date().toISOString()
      });
      
      // If we have an auth error, try to refresh the session
      handleRoleError();
    }
  }, [currentUserRole.data, currentUserRole.error, allowedRoles, isEditMode, localEditMode, editModeChecked]);
  
  // Special handling for edit mode
  useEffect(() => {
    // If in edit mode and not validated yet, perform validation
    const effectiveEditMode = isEditMode || localEditMode || editModeChecked;
    
    if (effectiveEditMode && !sessionValidated && !isRefreshing) {
      console.log("RoleProtectedRoute: Edit mode detected, validating session", {
        user: user?.email,
        timestamp: new Date().toISOString()
      });
      
      if (user) {
        validateSession();
      } else {
        console.log("RoleProtectedRoute: No user in edit mode, setting validated", {
          timestamp: new Date().toISOString()
        });
        setSessionValidated(true);
      }
    }
  }, [isEditMode, localEditMode, editModeChecked, sessionValidated, user]);
  
  const validateSession = async () => {
    console.log("RoleProtectedRoute: Validating session for edit mode", {
      isEditMode,
      localEditMode,
      userExists: !!user,
      sessionValidated,
      href: window.location.href,
      timestamp: new Date().toISOString()
    });
    setIsRefreshing(true);
    
    try {
      // If in edit mode, don't actually try to refresh - just pretend it worked
      if (isEditMode || localEditMode || editModeChecked) {
        console.log("RoleProtectedRoute: In edit mode, skipping actual refresh", {
          timestamp: new Date().toISOString()
        });
        setSessionValidated(true);
        setIsRefreshing(false);
        return;
      }
      
      const refreshed = await refreshSession();
      console.log("RoleProtectedRoute: Session validation result:", refreshed, {
        timestamp: new Date().toISOString()
      });
      setSessionValidated(true);
    } catch (error) {
      console.error("RoleProtectedRoute: Error during session validation:", error);
      
      // In edit mode, ignore errors
      if (isEditMode || localEditMode || editModeChecked) {
        setSessionValidated(true);
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleRoleError = async () => {
    if (isRefreshing || isEditMode || localEditMode || editModeChecked) {
      console.log("RoleProtectedRoute: Skipping role error handling in edit mode", {
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    console.log("RoleProtectedRoute: Role fetch error detected, attempting to refresh session", {
      isEditMode,
      localEditMode,
      isRefreshing,
      timestamp: new Date().toISOString()
    });
    setIsRefreshing(true);
    
    try {
      const refreshed = await refreshSession();
      console.log("RoleProtectedRoute: Session refresh result:", refreshed, {
        timestamp: new Date().toISOString()
      });
      
      if (!refreshed) {
        console.log("RoleProtectedRoute: Session refresh failed, redirecting to login", {
          timestamp: new Date().toISOString()
        });
        toast({
          variant: "destructive",
          title: "Session expired",
          description: "Your session has expired. Please log in again.",
        });
        
        setTimeout(() => {
          navigate('/projly/login', { state: { from: location.pathname } });
        }, 100);
      }
    } catch (error) {
      const errorObj = error as Error;
      console.error("RoleProtectedRoute: Error refreshing session:", {
        message: errorObj.message,
        errorObject: errorObj,
        timestamp: new Date().toISOString()
      });
      
      // Don't redirect if in edit mode
      if (!(isEditMode || localEditMode || editModeChecked)) {
        navigate('/projly/login', { state: { from: location.pathname } });
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Immediate grant access in edit mode
  const effectiveEditMode = isEditMode || localEditMode || editModeChecked;
  if (effectiveEditMode) {
    console.log("RoleProtectedRoute: Edit mode detected, granting immediate access", {
      localEditMode,
      isEditMode,
      editModeChecked,
      timestamp: new Date().toISOString()
    });
    
    // Still show spinner if refreshing, unless bypassed
    if (isRefreshing && !sessionValidated) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
          <Spinner size="lg" />
          <div className="ml-4 text-gray-500">Loading in edit mode...</div>
        </div>
      );
    }
    
    return <>{children}</>;
  }
  
  // Show loading spinner while checking role or refreshing session
  if (currentUserRole.isLoading || hasAccess === null || isRefreshing) {
    console.log("RoleProtectedRoute: Still loading role information or refreshing session", {
      isLoading: currentUserRole.isLoading,
      hasAccess,
      isRefreshing,
      timestamp: new Date().toISOString()
    });
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Redirect if user doesn't have required role
  if (!hasAccess) {
    console.log("RoleProtectedRoute: Access denied, redirecting to", redirectTo, {
      requiredRoles: allowedRoles,
      userRole: currentUserRole.data,
      timestamp: new Date().toISOString()
    });
    return <Navigate to={redirectTo} replace />;
  }
  
  // Allow access if user has required role
  console.log("RoleProtectedRoute: Access granted for user with role:", currentUserRole.data, {
    timestamp: new Date().toISOString()
  });
  return <>{children}</>;
}
