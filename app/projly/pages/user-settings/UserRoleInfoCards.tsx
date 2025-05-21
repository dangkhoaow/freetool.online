import React from "react";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

/**
 * Component for displaying information about different user roles
 */
const UserRoleInfoCards: React.FC = () => {
  console.log("[PROJLY:USER_SETTINGS:ROLE_CARDS] Rendering role information cards");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-md bg-purple-50 border border-purple-100">
        <div className="flex items-center mb-2">
          <ShieldCheck className="mr-2 h-5 w-5 text-purple-600" />
          <h3 className="font-medium">Site Owner</h3>
        </div>
        <p className="text-sm text-gray-600">
          Highest permission level. Can add new users, manage roles, reset passwords, and change user activation status including deletion.
        </p>
      </div>
      <div className="p-4 rounded-md bg-blue-50 border border-blue-100">
        <div className="flex items-center mb-2">
          <ShieldAlert className="mr-2 h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Admin</h3>
        </div>
        <p className="text-sm text-gray-600">
          Can manage user activation status (Active/Inactive/Deleted) and perform password resets. Cannot change user roles or add new users.
        </p>
      </div>
      <div className="p-4 rounded-md bg-gray-50 border border-gray-100">
        <div className="flex items-center mb-2">
          <Shield className="mr-2 h-5 w-5 text-gray-600" />
          <h3 className="font-medium">Regular User</h3>
        </div>
        <p className="text-sm text-gray-600">
          Standard access level. Can view and interact with assigned projects and tasks but cannot manage other users or system settings.
        </p>
      </div>
    </div>
  );
};

export default UserRoleInfoCards;
