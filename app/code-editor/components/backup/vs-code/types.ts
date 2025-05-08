import { ReactNode } from 'react';

// No duplicate definitions needed - they're defined below

/**
 * Interface for panel size configuration
 */
export interface PanelSizes {
  activityBar: number;
  sidebar: number;
  editor: number;
  panel: number;
}

/**
 * Activity bar item interface
 */
export interface ActivityBarItem {
  icon: ReactNode;
  name: string;
  showNotification?: boolean;
  activeIcon?: string;
}

/**
 * Panel tab interface
 */
export interface PanelTab {
  icon: ReactNode;
  name: string;
  id: string;
}

/**
 * Interface for VS Code layout props
 */
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
  menuBar?: React.ReactNode;
}

/**
 * Interface for file/folder item structure
 */
export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'folder' | 'error' | 'more-items';
  children?: FileSystemItem[];
  error?: string;
}

/**
 * Interface for explorer view props
 */
export interface ExplorerViewProps {
  refreshExplorerView: () => void;
}

/**
 * Interface for file tree item props
 */
export interface FileTreeItemProps {
  item: FileSystemItem;
  depth?: number;
  onDoubleClick: (item: FileSystemItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
}

/**
 * Default sizes based on VS Code
 */
export const DEFAULT_SIZES: PanelSizes = {
  activityBar: 48,
  sidebar: 240,
  editor: 0, // Flex grow
  panel: 200
};

/**
 * Toast message interface
 */
export interface ToastMessage {
  message: string;
  type: 'error' | 'success';
  duration: number;
}

/**
 * Context menu interface
 */
export interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  item?: FileSystemItem;
}
