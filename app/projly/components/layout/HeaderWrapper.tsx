
import React, { ReactNode } from 'react';
import { HeaderActions } from './HeaderActions';
import { ModeToggle } from '../ui/mode-toggle';

interface HeaderWrapperProps {
  children?: ReactNode;
}

export const HeaderWrapper: React.FC<HeaderWrapperProps> = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 flex items-center">
          {children}
        </div>
        
        <div className="flex items-center gap-2 mr-4">
          <ModeToggle />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
};
