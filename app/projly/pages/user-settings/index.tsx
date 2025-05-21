import React from "react";
// Import the default export from UserSettingsPage
import UserSettingsPageComponent from "./UserSettingsPage";

// Export it as the default export of this file
export default UserSettingsPageComponent;

// Export all components for easy importing
export * from './UserFilterBar';
export * from './UserRoleInfoCards';
export * from './UserListTable';
export * from './AddUserDialog';
export * from './PasswordResetDialog';
export * from './DeleteUserDialog';
export * from './UserRoleUtils';

// Re-export everything from UserSettingsPage
export * from './UserSettingsPage';

// Add detailed logging for debugging export issues
console.log("[PROJLY:USER_SETTINGS] Exporting UserSettingsPage from index.tsx:", UserSettingsPageComponent);
