"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Settings,
  Terminal,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  VSCodeLayoutProps,
  DEFAULT_SIZES,
  ActivityBarItem,
  PanelTab
} from './types';
import { ActivityBar } from './ActivityBar';
import { Sidebar } from './Sidebar';
import { Panel } from './Panel';
import { ExplorerView } from './explorer/ExplorerView';

// Activity Bar icons similar to VS Code with proper colorful styling
const DEFAULT_ACTIVITY_BAR_ITEMS: ActivityBarItem[] = [
  { icon: <FileText size={24} stroke="#64D2FF" />, name: 'Explorer', activeIcon: 'explorer' },
  { icon: <Search size={24} stroke="#F8C275" />, name: 'Search', activeIcon: 'search' },
];

// Bottom activity bar icons
const BOTTOM_ACTIVITY_ITEMS: ActivityBarItem[] = [
  { icon: <Settings size={24} stroke="#64D2FF" />, name: 'Settings', activeIcon: 'settings' }
];

// Default panel tabs
const DEFAULT_PANEL_TABS: PanelTab[] = [
  { icon: <Terminal size={16} stroke="#64D2FF" />, name: 'Terminal', id: 'terminal' },
  { icon: <MessageCircle size={16} stroke="#A277FF" />, name: 'Output', id: 'output' },
  { icon: <AlertCircle size={16} stroke="#F8C275" />, name: 'Problems', id: 'problems' },
];

/**
 * VSCodeLayout component - Main layout for the VS Code editor
 * 
 * This is the parent container that handles:
 * - Overall layout with resizable panels
 * - Activity bar and sidebar integration
 * - Panel integration
 * - State management for active views
 */
export function VSCodeLayout({
  children,
  className,
  showPanel = true,
  showSidebar = true,
  defaultSizes = DEFAULT_SIZES,
  sidebarContent,
  panelContent,
  activityBarItems = DEFAULT_ACTIVITY_BAR_ITEMS,
  activeBarItem = 'explorer',
  onToggleSidebar,
  onTogglePanel,
  panelTabs = DEFAULT_PANEL_TABS,
  activePanelTab = 'terminal',
  onSelectPanelTab,
  onSplitEditor,
  isSplitView = false,
  menuBar
}: VSCodeLayoutProps) {
  console.log('VSCodeLayout rendering with activeBarItem:', activeBarItem);
  
  // State for panel sizes (with default values)
  const [sizes, setSizes] = useState(defaultSizes);
  console.log('Initial sizes:', sizes);
  
  // State for activity bar and panel
  const [currentActiveItem, setCurrentActiveItem] = useState(activeBarItem);
  console.log('Initial currentActiveItem:', currentActiveItem);
  
  const [currentPanelTab, setCurrentPanelTab] = useState(activePanelTab);
  console.log('Initial currentPanelTab:', currentPanelTab);
  
  const [isResizing, setIsResizing] = useState(false);
  console.log('Initial isResizing:', isResizing);
  
  // Panel visibility states
  const [isSidebarVisible, setIsSidebarVisible] = useState(showSidebar);
  console.log('Initial isSidebarVisible:', isSidebarVisible);
  
  const [isPanelVisible, setIsPanelVisible] = useState(showPanel);
  console.log('Initial isPanelVisible:', isPanelVisible);
  
  // State for the explorer view refresh
  const [explorerRefreshTrigger, setExplorerRefreshTrigger] = useState(0);
  
  // References for resizable elements
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sidebarResizerRef = useRef<HTMLDivElement>(null);
  const panelResizerRef = useRef<HTMLDivElement>(null);
  
  // Handle activity bar item click
  const handleActivityItemClick = (name: string) => {
    console.log('Activity item clicked:', name);
    
    if (name === currentActiveItem) {
      // Toggle sidebar if clicking on the active item
      const newVisibility = !isSidebarVisible;
      setIsSidebarVisible(newVisibility);
      console.log('Toggling sidebar visibility to:', newVisibility);
      
      if (onToggleSidebar) {
        onToggleSidebar();
      }
    } else {
      // Switch to the new item and ensure sidebar is visible
      setCurrentActiveItem(name);
      console.log('Switched active item to:', name);
      
      if (!isSidebarVisible) {
        setIsSidebarVisible(true);
        console.log('Made sidebar visible');
        
        if (onToggleSidebar) {
          onToggleSidebar();
        }
      }
    }
  };
  
  // Handle panel tab selection
  const handlePanelTabSelect = (id: string) => {
    console.log('Panel tab selected:', id);
    setCurrentPanelTab(id);
    
    if (onSelectPanelTab) {
      onSelectPanelTab(id);
    }
  };
  
  // Toggle panel visibility
  const handleTogglePanel = () => {
    const newVisibility = !isPanelVisible;
    console.log('Toggling panel visibility to:', newVisibility);
    setIsPanelVisible(newVisibility);
    
    if (onTogglePanel) {
      onTogglePanel();
    }
  };
  
  // Refresh the explorer view
  const refreshExplorerView = () => {
    console.log('Triggering explorer view refresh');
    setExplorerRefreshTrigger(prev => prev + 1);
  };
  
  // Setup resize handlers
  useEffect(() => {
    const handleSidebarResize = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newSidebarWidth = Math.max(
        100, // Min width
        Math.min(500, e.clientX - containerRect.left) // Max width
      );
      
      setSizes(prev => ({
        ...prev,
        sidebar: newSidebarWidth
      }));
      console.log('Resized sidebar to:', newSidebarWidth);
    };
    
    const handlePanelResize = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPanelHeight = Math.max(
        100, // Min height
        Math.min(500, containerRect.bottom - e.clientY) // Max height
      );
      
      setSizes(prev => ({
        ...prev,
        panel: newPanelHeight
      }));
      console.log('Resized panel to:', newPanelHeight);
    };
    
    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        console.log('Stopped resizing');
      }
    };
    
    if (isResizing) {
      window.addEventListener('mousemove', handleSidebarResize);
      window.addEventListener('mousemove', handlePanelResize);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleSidebarResize);
      window.removeEventListener('mousemove', handlePanelResize);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  // Render sidebar content based on active item
  const renderSidebarContent = () => {
    console.log('Rendering sidebar content for:', currentActiveItem);
    
    switch (currentActiveItem) {
      case 'explorer':
        return <ExplorerView refreshExplorerView={refreshExplorerView} />;
        
      case 'search':
        return (
          <div className="p-4 text-gray-300">
            Search functionality would be implemented here
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-4 text-gray-300">
            Settings panel would be implemented here
          </div>
        );
        
      default:
        // Custom sidebar content from props
        return sidebarContent || (
          <div className="p-4 text-gray-300">
            No content for this view
          </div>
        );
    }
  };
  
  // Render panel content based on active tab
  const renderPanelContent = () => {
    console.log('Rendering panel content for tab:', currentPanelTab);
    
    switch (currentPanelTab) {
      case 'terminal':
        return (
          <div className="font-mono text-sm text-gray-300 bg-[#1e1e1e] p-2">
            <div className="text-green-400">$ </div>
          </div>
        );
        
      case 'problems':
        return (
          <div className="p-2 text-sm text-gray-300">
            No problems found in workspace
          </div>
        );
        
      case 'output':
        return (
          <div className="p-2 text-sm text-gray-300">
            No output to display
          </div>
        );
        
      default:
        // Custom panel content from props
        return panelContent || (
          <div className="p-2 text-sm text-gray-300">
            No content for this panel
          </div>
        );
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "h-full flex flex-col bg-[#1e1e1e] text-white overflow-hidden",
        className
      )}
    >
      {/* Menu bar (optional) */}
      {menuBar && (
        <div className="border-b border-[#2d2d2d]">
          {menuBar}
        </div>
      )}
      
      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity bar */}
        <div style={{ width: sizes.activityBar }}>
          <ActivityBar
            items={activityBarItems}
            bottomItems={BOTTOM_ACTIVITY_ITEMS}
            activeItem={currentActiveItem}
            onItemClick={handleActivityItemClick}
          />
        </div>
        
        {/* Sidebar (Explorer, Search, etc.) */}
        {isSidebarVisible && (
          <>
            <div 
              ref={sidebarRef}
              style={{ width: sizes.sidebar }}
              className="h-full overflow-hidden"
            >
              <Sidebar 
                title={currentActiveItem.toUpperCase()}
                onClose={() => {
                  setIsSidebarVisible(false);
                  console.log('Closed sidebar');
                  
                  if (onToggleSidebar) {
                    onToggleSidebar();
                  }
                }}
              >
                {renderSidebarContent()}
              </Sidebar>
            </div>
            
            {/* Sidebar resizer */}
            <div
              ref={sidebarResizerRef}
              className="w-1 h-full cursor-col-resize hover:bg-blue-500"
              onMouseDown={() => {
                setIsResizing(true);
                console.log('Started resizing sidebar');
              }}
            />
          </>
        )}
        
        {/* Editor area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Main content area (editor) */}
          <div className={`flex-1 overflow-auto ${isPanelVisible ? '' : 'pb-0'}`}>
            {children}
          </div>
          
          {/* Panel (Terminal, Problems, etc.) */}
          {isPanelVisible && (
            <>
              {/* Panel resizer */}
              <div
                ref={panelResizerRef}
                className="h-1 w-full cursor-row-resize hover:bg-blue-500"
                onMouseDown={() => {
                  setIsResizing(true);
                  console.log('Started resizing panel');
                }}
              />
              
              <div 
                ref={panelRef}
                style={{ height: sizes.panel }}
                className="overflow-hidden"
              >
                <Panel
                  tabs={panelTabs}
                  activeTab={currentPanelTab}
                  onTabSelect={handlePanelTabSelect}
                  onClose={handleTogglePanel}
                >
                  {renderPanelContent()}
                </Panel>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
