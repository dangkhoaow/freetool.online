"use client";

import { ActivityBarItem } from './types';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

/**
 * ActivityBar component - Renders the left sidebar activity icons like VS Code
 * 
 * This component displays the Explorer, Search and other activity icons
 * that control which panel is shown in the sidebar.
 */
export function ActivityBar({
  items = [],
  bottomItems = [],
  activeItem = '',
  onItemClick,
}: {
  items: ActivityBarItem[];
  bottomItems: ActivityBarItem[];
  activeItem: string;
  onItemClick: (name: string) => void;
}) {
  console.log('ActivityBar rendering with activeItem:', activeItem);
  
  return (
    <div className="h-full flex flex-col bg-[#333333] border-r border-[#252525]">
      <TooltipProvider>
        <div className="flex-1">
          {items.map((item, index) => (
            <Tooltip key={`activity-${index}`}>
              <TooltipTrigger asChild>
                <button
                  className={`w-full p-3 flex justify-center items-center relative ${
                    activeItem === item.activeIcon 
                      ? 'bg-[#252525] border-l-2 border-blue-500' 
                      : 'hover:bg-[#2a2a2a]'
                  }`}
                  onClick={() => {
                    console.log('Activity item clicked:', item.name);
                    onItemClick(item.activeIcon || item.name.toLowerCase());
                  }}
                >
                  <div className={activeItem === item.activeIcon ? 'text-white' : 'text-gray-400'}>
                    {item.icon}
                  </div>
                  
                  {item.showNotification && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <div className="mt-auto">
          {bottomItems.map((item, index) => (
            <Tooltip key={`bottom-activity-${index}`}>
              <TooltipTrigger asChild>
                <button
                  className={`w-full p-3 flex justify-center items-center relative ${
                    activeItem === item.activeIcon 
                      ? 'bg-[#252525] border-l-2 border-blue-500' 
                      : 'hover:bg-[#2a2a2a]'
                  }`}
                  onClick={() => {
                    console.log('Bottom activity item clicked:', item.name);
                    onItemClick(item.activeIcon || item.name.toLowerCase());
                  }}
                >
                  <div className={activeItem === item.activeIcon ? 'text-white' : 'text-gray-400'}>
                    {item.icon}
                  </div>
                  
                  {item.showNotification && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
