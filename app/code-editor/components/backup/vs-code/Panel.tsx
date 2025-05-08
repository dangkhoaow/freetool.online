"use client";

import { ReactNode } from 'react';
import { ChevronUp, X } from 'lucide-react';
import { PanelTab } from './types';

/**
 * Panel component - Bottom panel in VS Code layout
 * 
 * This component renders the bottom panel with tabs for Terminal, Problems, Output, etc.
 */
export function Panel({
  tabs = [],
  activeTab = '',
  children,
  onTabSelect,
  onClose,
}: {
  tabs: PanelTab[];
  activeTab: string;
  children: ReactNode;
  onTabSelect: (id: string) => void;
  onClose: () => void;
}) {
  console.log('Panel rendering with activeTab:', activeTab);
  
  return (
    <div className="flex flex-col bg-[#1e1e1e] border-t border-[#252526]">
      {/* Panel header with tabs */}
      <div className="flex items-center border-b border-[#252526]">
        <div className="flex-1 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-3 py-1 flex items-center space-x-2 text-xs ${
                activeTab === tab.id
                  ? 'text-white bg-[#252526] border-t border-l border-r border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                console.log('Panel tab selected:', tab.name);
                onTabSelect(tab.id);
              }}
            >
              <span className="text-xs">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        
        <div className="flex">
          <button 
            className="p-1 text-gray-400 hover:text-white"
            onClick={() => {
              console.log('Closing panel');
              onClose();
            }}
            title="Close Panel"
          >
            <X size={16} />
          </button>
          <button 
            className="p-1 text-gray-400 hover:text-white"
            onClick={() => {
              console.log('Maximizing panel');
              // Maximize panel logic would go here
            }}
            title="Maximize Panel"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
      
      {/* Panel content */}
      <div className="flex-1 overflow-auto p-2">
        {children}
      </div>
    </div>
  );
}
