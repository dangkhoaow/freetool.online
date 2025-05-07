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

// Import the modular components from the vs-code directory
import { 
  VSCodeLayout as ModularVSCodeLayout,
  ActivityBarItem,
  PanelTab,
  PanelSizes,
} from './vs-code';

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
  editor: 0, // Flex grow
  panel: 200
};

// Interface for VS Code layout props
export interface VSCodeLayoutProps {
  children: ReactNode;
  className?: string;
  showPanel?: boolean;
  showSidebar?: boolean;
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
  menuBar?: ReactNode;
}

/**
 * VSCodeLayout - Main layout component for VS Code-like editor
 * 
 * This is a wrapper component that delegates to the modular VSCodeLayout implementation.
 * It provides the default configuration values and passes all props to the implementation.
 */
export function VSCodeLayout(props: VSCodeLayoutProps) {
  console.log('VSCodeLayout rendering (wrapper component)');
  
  // Pass all props to the ModularVSCodeLayout component with defaults
  return (
    <ModularVSCodeLayout
      defaultSizes={DEFAULT_SIZES}
      activityBarItems={DEFAULT_ACTIVITY_BAR_ITEMS}
      panelTabs={DEFAULT_PANEL_TABS}
      {...props}
    />
  );
}
