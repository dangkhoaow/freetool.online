
import React from 'react';
import { AuthStatus } from './AuthStatus';
import { NotificationsMenu } from './NotificationsMenu';
import { ProjectActivityTracker } from './ProjectActivityTracker';

export const HeaderActions = () => {
  return (
    <div className="flex items-center gap-4">
      <ProjectActivityTracker />
      <NotificationsMenu />
      <AuthStatus />
    </div>
  );
};
