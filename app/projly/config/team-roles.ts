/**
 * Centralized configuration for team roles
 * 
 * This file defines the available roles for team members across the application.
 * Any changes to role names or additions should be made here to ensure consistency.
 */

// Define the role interface
export interface TeamRole {
  value: string;  // Value used in database and form submissions
  label: string;  // Display label shown to users
  description?: string; // Optional description of the role
}

// Define the available team roles
export const TEAM_ROLES: TeamRole[] = [
  {
    value: "Member",
    label: "Member",
    description: "Regular team member with basic access"
  },
  {
    value: "Leader",
    label: "Leader",
    description: "Team leader with additional permissions"
  },
  {
    value: "Project Manager",
    label: "Project Manager",
    description: "Manages specific projects within the team"
  },
  {
    value: "Team Manager",
    label: "Team Manager",
    description: "Manages the entire team and its members"
  },
  {
    value: "Director",
    label: "Director",
    description: "Executive oversight of multiple teams"
  },
  {
    value: "Admin",
    label: "Admin",
    description: "Administrative access with full permissions"
  }
];

// Export just the role values as a simple array for backward compatibility
export const TEAM_ROLE_VALUES = TEAM_ROLES.map(role => role.value);

// Log when this module is imported to help with debugging
console.log('[PROJLY:CONFIG] Team roles configuration loaded:', TEAM_ROLES.map(r => r.value).join(', '));
