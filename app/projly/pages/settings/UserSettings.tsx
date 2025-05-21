import React from "react";
import { UserSettingsPage } from "@/app/projly/pages/user-settings";

// Add detailed logging for debugging import issues
console.log("[PROJLY:USER_SETTINGS] Importing UserSettingsPage:", UserSettingsPage);

/**
 * UserSettings component
 * 
 * This component has been refactored to use smaller, more maintainable components
 * located in the /app/projly/pages/user-settings directory.
 *
 * The original monolithic component has been split into multiple smaller components:
 * - UserSettingsPage: Main container component
 * - UserFilterBar: For search and filter functionality
 * - UserRoleInfoCards: For displaying role information cards
 * - UserListTable: For displaying the user table
 * - AddUserDialog: For the add user form and dialog
 * - PasswordResetDialog: For password reset functionality
 * - DeleteUserDialog: For user deletion confirmation
 * - UserRoleUtils: Utility functions for role badges and activation badges
 */

export default function UserSettings() {
  console.log("[PROJLY:USER_SETTINGS] Rendering UserSettings component - now using UserSettingsPage");
  
  return <UserSettingsPage />;
}
