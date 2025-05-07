"use client";

import { ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Sidebar component - Container for the sidebar content in VS Code layout
 * 
 * This component renders the sidebar with a title bar and content area,
 * supporting different views like Explorer, Search, etc.
 */
export function Sidebar({
  title = 'EXPLORER',
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  console.log('Sidebar rendering with title:', title);
  
  return (
    <div className="h-full flex flex-col bg-[#252526] border-r border-[#1e1e1e]">
      {/* Sidebar header */}
      <div className="p-2 flex justify-between items-center border-b border-[#1e1e1e]">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">{title}</h2>
        
        {onClose && (
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => {
              console.log('Closing sidebar');
              onClose();
            }}
            title="Close Sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Sidebar content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
