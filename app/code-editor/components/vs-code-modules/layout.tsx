"use client";

import '@/app/code-editor/styles/dropdown-menu.css';
import { ReactNode } from 'react';
import { 
  FileText, 
  Terminal, 
  MessageCircle, 
  AlertCircle,
  Search,
  Settings,
} from 'lucide-react';

// Interface for activity bar items
export interface ActivityBarItem {
  icon: React.ReactNode;
  name: string;
  activeIcon: string;
  showNotification?: boolean;
}

// Interface for panel tabs
export interface PanelTab {
  icon: React.ReactNode;
  name: string;
  id: string;
}

// Interface for panel sizes
export interface PanelSizes {
  activityBar: number;
  sidebar: number;
  editor: number;
  panel: number;
}

// Interface for VS Code layout props
export interface VSCodeLayoutProps {
  children: ReactNode;
  className?: string;
  showPanel?: boolean;
  showSidebar?: boolean;
  menuBar?: ReactNode;
  defaultSizes?: PanelSizes;
  sidebarContent?: ReactNode;
  panelContent?: ReactNode;
  activityBarItems?: ActivityBarItem[];
  activeBarItem?: string;
  onToggleSidebar?: () => void;
  onTogglePanel?: () => void;
  panelTabs?: PanelTab[];
  activePanelTab?: string;
  onSelectPanelTab?: (id: string) => void;
  onSplitEditor?: () => void;
  isSplitView?: boolean;
}

// Define ModularVSCodeLayout component directly
function ModularVSCodeLayout(props: VSCodeLayoutProps) {
  // This is a comprehensive implementation that includes all the functionality from the original
  const {
    children,
    className,
    showPanel = true,
    showSidebar = true,
    menuBar,
    defaultSizes,
    sidebarContent,
    panelContent,
    activityBarItems = [],
    activeBarItem,
    onToggleSidebar,
    onTogglePanel,
    panelTabs = [],
    activePanelTab,
    onSelectPanelTab,
    onSplitEditor,
    isSplitView,
  } = props;
  
  console.log("Layout: Rendering with sidebarContent:", !!sidebarContent);
  console.log("Layout: Rendering with activeBarItem:", activeBarItem);
  console.log("Layout: showPanel:", showPanel, "showSidebar:", showSidebar);
  
  return (
    <div className={`vs-code-layout ${className || ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {menuBar && (
        <div className="vs-code-menubar" style={{ flexShrink: 0 }}>
          {menuBar}
        </div>
      )}
      
      <div className="vs-code-main" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {showSidebar && (
          <div className="vs-code-sidebar" style={{ display: 'flex', flexShrink: 0, width: `${defaultSizes?.sidebar || 240}px` }}>
            <div className="bg-[#3c3c3c]" style={{ width: `${defaultSizes?.activityBar || 48}px`, flexShrink: 0 }}>
              {activityBarItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`vs-code-activity-item ${activeBarItem === item.activeIcon ? 'active' : ''}`}
                  title={item.name}
                  onClick={() => {
                    // If clicking the active item, toggle sidebar
                    if (activeBarItem === item.activeIcon && onToggleSidebar) {
                      console.log(`Layout: Toggling sidebar from activity bar item: ${item.name}`);
                      onToggleSidebar();
                    }
                  }}
                  style={{
                    padding: '8px 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    borderLeft: activeBarItem === item.activeIcon ? '2px solid var(--vs-focused-border)' : 'none'
                  }}
                >
                  {item.icon}
                  {item.showNotification && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--vs-notification-color)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="vs-code-sidebar-content" style={{ flex: 1, overflow: 'auto', display: showSidebar ? 'block' : 'none' }}>
              {sidebarContent}
            </div>
          </div>
        )}
        
        <div className="vs-code-editor-area" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="vs-code-editor-container" style={{ flex: 1, overflow: 'auto' }}>
            {children}
          </div>
          
          {showPanel && (
            <div className="vs-code-panel" style={{ height: `${defaultSizes?.panel || 200}px`, flexShrink: 0, borderTop: '1px solid var(--vs-panel-border)', background: 'var(--vs-panel-background)' }}>
              {panelTabs && panelTabs.length > 0 && (
                <div className="vs-code-panel-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--vs-panel-border)' }}>
                  {panelTabs.map((tab) => (
                    <div 
                      key={tab.id} 
                      className={`vs-code-panel-tab ${activePanelTab === tab.id ? 'active' : ''}`}
                      onClick={() => {
                        if (onSelectPanelTab) {
                          console.log(`Layout: Selected panel tab: ${tab.name}`);
                          onSelectPanelTab(tab.id);
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        borderBottom: activePanelTab === tab.id ? '1px solid var(--vs-focused-border)' : 'none',
                        background: activePanelTab === tab.id ? 'var(--vs-panel-tab-active-background)' : 'transparent'
                      }}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                    </div>
                  ))}
                  
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    {onTogglePanel && (
                      <button 
                        onClick={() => {
                          console.log('Layout: Toggling panel visibility');
                          onTogglePanel();
                        }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                        title="Toggle Panel"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 12L8 7L13 12" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="vs-code-panel-content" style={{ padding: '8px', overflow: 'auto', height: 'calc(100% - 30px)' }}>
                {panelContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Activity Bar icons similar to VS Code with proper colorful styling
const DEFAULT_ACTIVITY_BAR_ITEMS: ActivityBarItem[] = [
  { icon: <FileText size={24} stroke="#64D2FF" />, name: 'Explorer', activeIcon: 'explorer' },
  // Search feature not yet implemented
  // { icon: <Search size={24} stroke="#F8C275" />, name: 'Search', activeIcon: 'search' },
];

// Bottom activity bar icons
const BOTTOM_ACTIVITY_ITEMS: ActivityBarItem[] = [
  { icon: <Settings size={24} stroke="#64D2FF" />, name: 'Settings', activeIcon: 'settings' }
];

// Default panel tabs
const DEFAULT_PANEL_TABS: PanelTab[] = [
  { icon: <Terminal size={16} stroke="#64D2FF" />, name: 'Terminal', id: 'terminal' },
  { icon: <AlertCircle size={16} stroke="#F8C275" />, name: 'Problems', id: 'problems' },
  { icon: <MessageCircle size={16} stroke="#A277FF" />, name: 'Output', id: 'output' },
];

// Default sizes based on VS Code
const DEFAULT_SIZES: PanelSizes = {
  activityBar: 48,
  sidebar: 240,
  editor: 0, // Flex
  panel: 200,
};

// VSCodeLayout - Main layout component for VS Code-like editor
// This is a wrapper component that delegates to the modular VSCodeLayout implementation.
// It provides the default configuration values and passes all props to the implementation.
export function VSCodeLayout(props: VSCodeLayoutProps) {
  console.log('Layout: VSCodeLayout wrapper called');
  
  // Merge with defaults
  const mergedProps = {
    activityBarItems: DEFAULT_ACTIVITY_BAR_ITEMS,
    defaultSizes: DEFAULT_SIZES,
    panelTabs: DEFAULT_PANEL_TABS,
    ...props
  };
  
  // Render the modular implementation with merged props
  return <ModularVSCodeLayout {...mergedProps} />;
}
