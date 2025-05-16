
import React from 'react';
import { HeaderWrapper } from './HeaderWrapper';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = ({ toggleSidebar, sidebarOpen }: { toggleSidebar: () => void; sidebarOpen: boolean }) => {
  return (
    <HeaderWrapper>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="mr-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:block">
          <span className="text-lg font-semibold text-project-primary">Projly</span>
        </div>
      </div>
    </HeaderWrapper>
  );
};

export default Header;
