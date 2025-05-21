import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, Activity, Trash } from "lucide-react";
import { UserRole } from "@/lib/services/projly/types";

/**
 * Returns a badge component for a given user role
 * @param role - The user role
 * @returns A Badge component with appropriate styling
 */
export const getRoleBadge = (role: UserRole | string) => {
  console.log(`[PROJLY:USER_SETTINGS:UTILS] Rendering badge for role:`, {
    originalRole: role,
    normalizedRole: typeof role === 'string' ? role.toLowerCase() : 'regular_user',
    roleType: typeof role
  });
  
  // Check if role is undefined or null and provide a default
  if (!role) {
    console.log(`[PROJLY:USER_SETTINGS:UTILS] Role is undefined or null, defaulting to 'regular_user'`);
    role = 'regular_user';
  }
  
  // Normalize the role to lowercase for case-insensitive comparison
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : 'regular_user';
  
  switch (normalizedRole) {
    case 'site_owner':
      return <Badge className="bg-purple-600"><ShieldCheck className="mr-1 h-3 w-3" /> Site Owner</Badge>;
    case 'admin':
      return <Badge className="bg-blue-600"><ShieldAlert className="mr-1 h-3 w-3" /> Admin</Badge>;
    case 'regular_user':
      return <Badge className="bg-gray-500"><Shield className="mr-1 h-3 w-3" /> Regular User</Badge>;
    default:
      // If we get an unexpected role, log it and show with a fallback style
      console.log(`[PROJLY:USER_SETTINGS:UTILS] Unexpected role value: ${role}`);
      return <Badge className="bg-gray-500"><Shield className="mr-1 h-3 w-3" /> {role || 'Regular User'}</Badge>;
  }
};

/**
 * Returns a badge component for a given user activation status
 * @param status - The user activation status
 * @returns A Badge component with appropriate styling
 */
export const getActivationBadge = (status: string) => {
  console.log(`[PROJLY:USER_SETTINGS:UTILS] Rendering badge for status: ${status}`);
  const lowerStatus = (status || '').toLowerCase();
  
  switch (lowerStatus) {
    case 'active':
      return <Badge className="bg-green-600"><Activity className="mr-1 h-3 w-3" /> Active</Badge>;
    case 'inactive':
      return <Badge className="bg-red-600"><Activity className="mr-1 h-3 w-3" /> Inactive</Badge>;
    case 'deleted':
      return <Badge className="bg-gray-800"><Trash className="mr-1 h-3 w-3" /> Deleted</Badge>;
    default:
      return <Badge className="bg-amber-500"><Activity className="mr-1 h-3 w-3" /> Unverified</Badge>;
  }
};
