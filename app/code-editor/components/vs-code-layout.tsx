"use client"

import { useState, useEffect, ReactNode, useRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronUp, 
  FileText, 
  Terminal, 
  MessageCircle, 
  AlertCircle,
  Activity as ActivityIcon,
  Search,
  Settings,
  Github,
  Layers,
  Code,
  Bug,
  Cog,
  X,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Download,
  FilePlus,
  FolderPlus,
  Trash,
  Edit,
  Copy
} from 'lucide-react'
import { FolderSelector } from './folder-selector'
import ContextMenu from './context-menu'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

// Interface for panel size
interface PanelSizes {
  activityBar: number
  sidebar: number
  editor: number
  panel: number
}

// Activity bar item interface
export interface ActivityBarItem {
  icon: ReactNode
  name: string
  showNotification?: boolean
  activeIcon?: string
}

// Panel tab interface
export interface PanelTab {
  icon: ReactNode
  name: string
  id: string
}

// Interface for VS Code layout props
export interface VSCodeLayoutProps {
  children: ReactNode
  className?: string
  showPanel?: boolean
  showSidebar?: boolean
  defaultSizes?: PanelSizes
  sidebarContent?: ReactNode
  panelContent?: ReactNode
  activityBarItems?: ActivityBarItem[]
  activeBarItem?: string
  onToggleSidebar?: () => void
  onTogglePanel?: () => void
  panelTabs?: PanelTab[]
  activePanelTab?: string
  onSelectPanelTab?: (id: string) => void
  onSplitEditor?: () => void
  isSplitView?: boolean
  menuBar?: React.ReactNode
}

// Default sizes based on VS Code
const DEFAULT_SIZES: PanelSizes = {
  activityBar: 48,
  sidebar: 240,
  editor: 0, // Flex grow
  panel: 200
}

// Activity Bar icons similar to VS Code
const DEFAULT_ACTIVITY_BAR_ITEMS: ActivityBarItem[] = [
  { icon: <FileText size={24} />, name: 'Explorer', activeIcon: 'explorer' },
  { icon: <Search size={24} />, name: 'Search', activeIcon: 'search' },
]

// Bottom activity bar icons
const BOTTOM_ACTIVITY_ITEMS = [
  { icon: <Settings size={24} />, name: 'Settings', activeIcon: 'settings' }
]

// Default panel tabs
const DEFAULT_PANEL_TABS: PanelTab[] = [
  { icon: <Terminal size={16} />, name: 'Terminal', id: 'terminal' },
  { icon: <Bug size={16} />, name: 'Problems', id: 'problems' },
  { icon: <Code size={16} />, name: 'Output', id: 'output' },
]

// VS Code Layout Component
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
  const [activeBarItemState, setActiveBarItemState] = useState(activeBarItem);
  const [activePanelTabState, setActivePanelTabState] = useState(activePanelTab);
  const [panelSizes, setPanelSizes] = useState({ ...defaultSizes });
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(showSidebar);
  const [isPanelOpen, setIsPanelOpen] = useState(showPanel);
  const [explorerViewKey, setExplorerViewKey] = useState('explorer-view-initial');
  
  // Reference to the explorer view component for folder refresh
  const refreshExplorerView = () => {
    console.log('Refreshing explorer view...');
    setExplorerViewKey(`explorer-view-${Date.now()}`);
  };
  
  const selectBarItem = (name: string) => {
    setActiveBarItemState(name);
    if (name === 'explorer' && !isSidebarOpen) {
      setIsSidebarOpen(true);
      if (onToggleSidebar) onToggleSidebar();
    }
  };
  
  const selectPanelTab = (id: string) => {
    setActivePanelTabState(id);
    if (onSelectPanelTab) onSelectPanelTab(id);
  };
  
  // State for panel sizes
  const [sizes, setSizes] = useState<PanelSizes>(defaultSizes)
  
  // State for active tab (sidebar)
  const [activeTab, setActiveSidebarTab] = useState(activeBarItem)
  
  // State for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(showSidebar)
  
  // State for panel visibility
  const [panelVisible, setPanelVisible] = useState(showPanel)
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    const newState = !sidebarVisible
    setSidebarVisible(newState)
    if (onToggleSidebar) onToggleSidebar()
  }
  
  // Handle panel toggle
  const togglePanel = () => {
    const newState = !panelVisible
    setPanelVisible(newState)
    if (onTogglePanel) onTogglePanel()
  }
  
  // Handle panel tab selection
  const selectPanelTabState = (id: string) => {
    setActivePanelTabState(id)
    if (onSelectPanelTab) onSelectPanelTab(id)
  }
  
  // Handle split editor
  const splitEditor = () => {
    if (onSplitEditor) onSplitEditor()
  }
  
  // Sync with props
  useEffect(() => {
    setSidebarVisible(showSidebar)
  }, [showSidebar])
  
  useEffect(() => {
    setPanelVisible(showPanel)
  }, [showPanel])
  
  useEffect(() => {
    setActivePanelTabState(activePanelTab)
  }, [activePanelTab])
  
  useEffect(() => {
    setActiveSidebarTab(activeBarItem)
  }, [activeBarItem])
  
  useEffect(() => {
    setSizes(defaultSizes)
  }, [defaultSizes])
  
  return (
    <div className={cn("flex flex-col h-full overflow-hidden bg-[#1e1e1e]", className)}>
      {/* Menu bar */}
      {menuBar}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Activity bar (leftmost vertical menu) */}
        <TooltipProvider>
          <div
            className="flex flex-col justify-between bg-[#333333] border-r border-[#252525] py-2"
            style={{ width: `${sizes.activityBar}px`, minWidth: `${sizes.activityBar}px` }}
          >
            {/* Top activity bar items */}
            <div className="flex flex-col items-center space-y-4">
              {activityBarItems.map((item, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white relative",
                        activeTab === item.activeIcon && sidebarVisible && "text-white"
                      )}
                      onClick={() => setActiveSidebarTab(item.activeIcon || `tab-${index}`)}
                    >
                      {item.icon}
                      {item.showNotification && (
                        <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {activeTab === item.activeIcon && sidebarVisible && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white"></div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            
            {/* Bottom activity bar items */}
            <div className="flex flex-col items-center space-y-4">
              {BOTTOM_ACTIVITY_ITEMS.map((item, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <button
                      className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white"
                      onClick={() => setActiveSidebarTab(item.activeIcon || `bottom-${index}`)}
                    >
                      {item.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </TooltipProvider>
        
        {/* Sidebar (explorer, search, etc.) */}
        {sidebarVisible && (
          <div 
            className="bg-[#252526] border-r border-[#1e1e1e] flex flex-col overflow-hidden"
            style={{ width: `${sizes.sidebar}px`, minWidth: `${sizes.sidebar}px` }}
          >
            {/* Sidebar Header */}
            <div className="px-4 h-[35px] flex items-center justify-between border-b border-[#1e1e1e]">
              <h3 className="text-sm uppercase tracking-wide text-gray-300">
                {activityBarItems.find(item => item.activeIcon === activeTab)?.name || 'Explorer'}
              </h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={toggleSidebar}
                title="Hide Sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-auto">
              {sidebarContent || (
                <ExplorerView key={explorerViewKey} refreshExplorerView={refreshExplorerView} />
              )}
            </div>
          </div>
        )}
        
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 relative overflow-hidden">
            {/* Editor content */}
            <div className="flex-1 h-full overflow-hidden">
              {children}
              
              {/* Split editor button (if provided) */}
              {onSplitEditor && (
                <div className="absolute top-2 right-2 z-10">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="w-6 h-6 flex items-center justify-center bg-[#333333] text-gray-300 hover:text-white rounded"
                        onClick={onSplitEditor}
                      >
                        {isSplitView ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isSplitView ? "Merge Editors" : "Split Editor"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
            
            {/* Panel (terminal, problems, output) */}
            {panelVisible && (
              <div 
                className="border-t border-[#3c3c3c] bg-[#1e1e1e] flex flex-col"
                style={{ height: `${sizes.panel}px`, minHeight: `${sizes.panel}px` }}
              >
                {/* Panel Tabs */}
                <div className="flex h-[35px] border-b border-[#3c3c3c]">
                  {panelTabs.map(tab => (
                    <button
                      key={tab.id}
                      className={cn(
                        "px-3 h-full flex items-center gap-1.5 text-xs",
                        activePanelTabState === tab.id
                          ? "bg-[#1e1e1e] text-white border-t border-t-[#007acc]"
                          : "bg-[#2d2d2d] text-gray-400 hover:text-white"
                      )}
                      onClick={() => selectPanelTab(tab.id)}
                    >
                      {tab.icon}
                      {tab.name}
                    </button>
                  ))}
                  
                  <div className="flex-1"></div>
                  
                  <button 
                    className="px-3 h-full flex items-center text-gray-400 hover:text-white"
                    onClick={togglePanel}
                    title="Hide Panel"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                
                {/* Panel Content */}
                <div className="flex-1 overflow-auto">
                  {panelContent || (
                    <div className="p-4 text-gray-400">
                      No panel content provided
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Explorer View component
function ExplorerView({ refreshExplorerView }: { refreshExplorerView: () => void }) {
  // Interface for file/folder item structure
  interface FileSystemItem {
    name: string;
    path: string;
    type: 'file' | 'folder' | 'error';
    children?: FileSystemItem[];
    error?: string;
  }
  
  const [folderStructure, setFolderStructure] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFolderSelectorOpen, setIsFolderSelectorOpen] = useState(false);
  const [openFileIds, setOpenFileIds] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success', duration: number } | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    item?: FileSystemItem;
  }>({
    show: false,
    x: 0,
    y: 0
  });
  
  // Dialog state for new file/folder creation
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newItemParentPath, setNewItemParentPath] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  
  // This will intentionally cause a hydration error because we're using 
  // different data on server vs client
  const [serverTime] = useState(() => {
    console.log('Setting server time with window check');
    return typeof window === 'undefined' 
      ? new Date().toISOString() 
      : '';
  });
  
  // Force different rendering on server vs client
  const forceHydrationMismatch = typeof window === 'undefined' 
    ? { name: 'server-file', type: 'file' as const, path: '/server-path' } 
    : { name: 'client-file', type: 'file' as const, path: '/client-path' };
  
  console.log('ExplorerView rendering with serverTime:', serverTime);
  console.log('Hydration mismatch object:', forceHydrationMismatch);
  
  // Fetch folder structure from API
  const fetchFileSystem = async (pathToFetch: string = '') => {
    try {
      console.log('Fetching filesystem structure...');
      setIsLoading(true);
      
      // Default to the project directory if no path is provided
      let projectPath = pathToFetch || '/Users/ktran/Documents/Code/NewCode/freetool/freetool.online';
      console.log('Initial project path:', projectPath);
      
      // Handle relative paths - if the path doesn't start with a slash, 
      // assume it's relative to /Users/ktran/Documents/Code/NewCode/
      if (pathToFetch && !pathToFetch.startsWith('/')) {
        projectPath = `/Users/ktran/Documents/Code/NewCode/${pathToFetch}`;
        console.log('Path was relative, converted to absolute path:', projectPath);
      }
      
      console.log('Using project path:', projectPath);
      
      const response = await fetch(`/api/filesystem?path=${encodeURIComponent(projectPath)}&maxDepth=3`);
      console.log('Filesystem API response received');
      
      if (!response.ok) {
        console.error('Error response from filesystem API:', response.status);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Filesystem data parsed:', data.success);
      
      if (data.success) {
        console.log(`Setting folder structure with ${data.structure.length} root items`);
        console.log('Current path set to:', data.path);
        setFolderStructure(data.structure);
        setCurrentPath(data.path);
        setError(null);
      } else {
        console.error('API returned error:', data.error);
        setError(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching filesystem:', error);
      setError((error as Error).message);
    } finally {
      console.log('Fetch complete, setting loading to false');
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    console.log('ExplorerView useEffect running to fetch filesystem');
    fetchFileSystem();
  }, []);
  
  // Auto dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle folder selection from the folder selector
  const handleFolderSelected = (folderPath: string) => {
    console.log('Folder selected:', folderPath);
    fetchFileSystem(folderPath);
  };
  
  // Handle "Open Folder" button click
  const handleOpenFolder = () => {
    console.log('Open folder button clicked');
    setIsFolderSelectorOpen(true);
  };
  
  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    console.log('Context menu opened for item:', item.name);
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };
  
  // Close context menu
  const closeContextMenu = () => {
    console.log('Closing context menu');
    setContextMenu({
      show: false,
      x: 0,
      y: 0
    });
  };
  
  // Handle new file creation
  const handleNewFile = (parentPath: string) => {
    console.log('Opening new file dialog with parent path:', parentPath);
    setNewItemParentPath(parentPath);
    setNewFileName('');
    setIsNewFileDialogOpen(true);
  };
  
  // Handle new folder creation
  const handleNewFolder = (parentPath: string) => {
    console.log('Opening new folder dialog with parent path:', parentPath);
    setNewItemParentPath(parentPath);
    setNewFolderName('');
    setIsNewFolderDialogOpen(true);
  };
  
  // Create a new file on disk
  const createNewFile = async () => {
    if (!newItemParentPath || !newFileName.trim()) {
      console.error('Parent path or file name is empty');
      return;
    }
    
    try {
      console.log(`Creating new file: ${newFileName} in ${newItemParentPath}`);
      const filePath = `${newItemParentPath}/${newFileName}`;
      
      // Create an empty file via fetch to avoid requiring fs module on client
      const response = await fetch('/api/file-operation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createFile',
          path: filePath,
          content: ''
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('File created successfully');
        setIsNewFileDialogOpen(false);
        // Refresh the file explorer
        fetchFileSystem(currentPath);
      } else {
        console.error('Error creating file:', data.error);
        // Could show an error toast here
      }
    } catch (error) {
      console.error('Error creating file:', error);
      // Could show an error toast here
    }
  };
  
  // Create a new folder on disk
  const createNewFolder = async () => {
    if (!newItemParentPath || !newFolderName.trim()) {
      console.error('Parent path or folder name is empty');
      return;
    }
    
    try {
      console.log(`Creating new folder: ${newFolderName} in ${newItemParentPath}`);
      const folderPath = `${newItemParentPath}/${newFolderName}`;
      
      // Create a folder via fetch to avoid requiring fs module on client
      const response = await fetch('/api/file-operation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createFolder',
          path: folderPath
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Folder created successfully');
        setIsNewFolderDialogOpen(false);
        // Refresh the file explorer
        fetchFileSystem(currentPath);
      } else {
        console.error('Error creating folder:', data.error);
        // Could show an error toast here
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      // Could show an error toast here
    }
  };
  
  // Download folder as zip
  const downloadFolder = async (folderPath: string) => {
    try {
      console.log('Downloading folder as zip:', folderPath);
      
      // Use window.open to trigger download
      window.open(`/api/download-folder?path=${encodeURIComponent(folderPath)}`, '_blank');
    } catch (error) {
      console.error('Error downloading folder:', error);
      // Could show an error toast here
    }
  };
  
  // Handle file double-click to open in editor
  const handleFileDoubleClick = async (item: FileSystemItem) => {
    console.log('File double-clicked:', item.path);
    
    try {
      // Check if we already have an ID for this file path
      if (openFileIds[item.path]) {
        console.log('File already opened with ID:', openFileIds[item.path]);
        
        // Use the stored file ID to open the file in the editor
        window.dispatchEvent(new CustomEvent('open-file-in-editor', {
          detail: { fileId: openFileIds[item.path] }
        }));
        return;
      }
      
      // Fetch file content from API
      console.log('Fetching file content from API:', item.path);
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(item.path)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching file content:', errorData.error || response.statusText);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('File content fetched:', data.success);
      
      if (data.success) {
        console.log('File content loaded, dispatching event to editor');
        
        // Generate a unique ID for this file
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log('Generated file ID:', fileId);
        
        // Store the file ID for this path
        setOpenFileIds(prev => ({
          ...prev,
          [item.path]: fileId
        }));
        
        // Dispatch an event to notify the editor to open this file
        window.dispatchEvent(new CustomEvent('open-file-in-editor', {
          detail: { 
            fileId,
            path: item.path,
            name: item.name || data.name,
            content: data.content,
            language: data.language
          }
        }));
      } else {
        console.error('API returned unsuccessful status:', data.error);
        throw new Error(data.error || 'Unknown error fetching file');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      // Show error in UI
      setToast({
        message: `Error opening file: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
        duration: 5000
      });
    }
  };
  
  // Recursive component to render folder structure
  const RenderTreeItem = ({ item, depth = 0 }: { item: FileSystemItem, depth?: number }) => {
    const [isOpen, setIsOpen] = useState(depth < 1);
    console.log(`Rendering tree item: ${item.name}, type: ${item.type}, depth: ${depth}, isOpen: ${isOpen}`);
    
    const toggleOpen = () => {
      console.log(`Toggling ${item.name} from ${isOpen} to ${!isOpen}`);
      setIsOpen(!isOpen);
    };
    
    // Color mapping based on file extension
    const getFileColor = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      console.log(`Getting color for file: ${fileName}, extension: ${extension}`);
      
      const colorMap: Record<string, string> = {
        js: '#dcb67a',
        jsx: '#dcb67a',
        ts: '#4d9fea',
        tsx: '#4d9fea',
        css: '#cc6633',
        scss: '#cc6633',
        html: '#e44d26',
        json: '#5d8700',
        md: '#8a8a8a',
        png: '#a074c4',
        jpg: '#a074c4',
        jpeg: '#a074c4',
        svg: '#a074c4',
        gitignore: '#8a8a8a',
        env: '#5d8700',
        lock: '#8a8a8a',
        txt: '#8a8a8a',
        yml: '#5d8700',
        yaml: '#5d8700'
      };
      
      const color = colorMap[extension || ''] || '#8a8a8a';
      console.log(`Color for file ${fileName}: ${color}`);
      return color;
    };
    
    // This will cause hydration mismatch by using Math.random for client-side keys
    const randomId = typeof window === 'undefined' ? 'server-id' : `client-id-${Math.random()}`;
    console.log(`Generated randomId: ${randomId}`);
    
    // For error items
    if (item.type === 'error') {
      return (
        <div 
          key={`error-${item.path}-${randomId}`}
          className="flex items-center text-red-400 py-1 cursor-pointer"
        >
          <FileText size={16} className="mr-2 text-red-400" />
          <span>{item.name} (Error: {item.error || 'Unknown error'})</span>
        </div>
      );
    }
    
    // For folders
    if (item.type === 'folder') {
      return (
        <div key={`folder-${item.path}-${randomId}`}>
          <div 
            className="flex items-center text-gray-300 hover:text-white py-1 cursor-pointer"
            onClick={toggleOpen}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            {isOpen ? (
              <ChevronDown size={16} className="mr-1" />
            ) : (
              <ChevronRight size={16} className="mr-1" />
            )}
            <Folder size={16} className="mr-2" style={{ color: "#dcb67a" }} />
            <span>{item.name}</span>
          </div>
          
          {isOpen && item.children && (
            <div className="pl-6">
              {item.children.length === 0 ? (
                <div className="text-gray-400 py-1">Empty folder</div>
              ) : (
                item.children.map((child: FileSystemItem) => (
                  <RenderTreeItem 
                    key={`child-${child.path}-${Math.random()}`} 
                    item={child} 
                    depth={depth + 1} 
                  />
                ))
              )}
            </div>
          )}
        </div>
      );
    }
    
    // For files
    return (
      <div 
        key={`file-${item.path}-${randomId}`}
        className="flex items-center text-gray-300 hover:text-white py-1 cursor-pointer"
        onDoubleClick={() => handleFileDoubleClick(item)}
        onContextMenu={(e) => handleContextMenu(e, item)}
      >
        <FileText size={16} className="mr-2" style={{ color: getFileColor(item.name) }} />
        <span>{item.name}</span>
      </div>
    );
  };
  
  // Add the server-rendered item that will cause hydration mismatch
  // This trick ensures we have a hydration error (intentional as requested)
  const hydratedOnce = useRef(false);
  
  useEffect(() => {
    // Critical fix: Only run this effect once
    if (typeof window === 'undefined' || hydratedOnce.current) {
      return;
    }
    
    console.log('Running hydration mismatch effect - creating intentional hydration error');
    hydratedOnce.current = true;
    
    // Use a longer timeout to ensure the component is fully mounted before modifying state
    // This prevents React 18's double-render from causing infinite loops
    setTimeout(() => {
      if (folderStructure.length > 0) {
        try {
          console.log('Creating intentional hydration mismatch');
          
          // Deep clone to avoid reference issues
          const newStructure = JSON.parse(JSON.stringify(folderStructure));
          
          if (newStructure[0] && newStructure[0].children) {
            // Use a stable name instead of random to prevent unnecessary re-renders
            const clientFile = { 
              name: 'client-only-file', 
              path: '/client-path', 
              type: 'file' as const 
            };
            
            // Add the file only if it doesn't already exist (prevents adding it multiple times)
            const fileExists = newStructure[0].children.some(
              (child: any) => child.name === clientFile.name && child.path === clientFile.path
            );
            
            if (!fileExists) {
              console.log('Adding intentional client-side only file');
              newStructure[0].children.push(clientFile);
              setFolderStructure(newStructure);
            }
          }
        } catch (error) {
          console.error('Error creating hydration mismatch:', error);
        }
      }
    }, 200);
  }, []);
  
  return (
    <div className="p-2">
      <div className="text-sm text-gray-300 mb-2 flex justify-between items-center">
        <span>WORKSPACE</span>
        <div className="flex items-center">
          <button 
            className="p-1 hover:bg-[#3c3c3c] rounded"
            onClick={() => handleNewFile(currentPath)}
            title="New File"
          >
            <FilePlus size={16} className="text-gray-300" />
          </button>
          <button 
            className="p-1 hover:bg-[#3c3c3c] rounded"
            onClick={() => handleNewFolder(currentPath)}
            title="New Folder"
          >
            <FolderPlus size={16} className="text-gray-300" />
          </button>
          <button 
            className="p-1 hover:bg-[#3c3c3c] rounded"
            onClick={handleOpenFolder}
            title="Open Folder"
          >
            <FolderOpen size={16} className="text-gray-300" />
          </button>
          <button 
            className="p-1 hover:bg-[#3c3c3c] rounded"
            onClick={() => fetchFileSystem(currentPath)}
            title="Refresh Explorer"
          >
            <ChevronDown size={16} className="text-gray-300 transform rotate-180" />
          </button>
        </div>
      </div>
      
      {/* Show current path */}
      {currentPath && (
        <div className="pl-2 mb-2">
          <div className="text-xs text-gray-400 truncate">
            {currentPath}
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="pl-2 text-gray-400">Loading...</div>
      ) : error ? (
        <div className="pl-2 text-red-400">Error: {error}</div>
      ) : folderStructure.length === 0 ? (
        <div className="pl-2 text-gray-400">No files found</div>
      ) : (
        <div className="pl-2">
          {folderStructure.map((item, index) => (
            <RenderTreeItem 
              key={`${item.path}-${index}-${typeof window === 'undefined' ? 'server' : 'client'}`} 
              item={item} 
            />
          ))}
          {/* This is intentionally different on client vs server */}
          <RenderTreeItem key={`hydration-mismatch-${Math.random()}`} item={forceHydrationMismatch} />
        </div>
      )}
      
      {/* Folder Selector Dialog */}
      <FolderSelector 
        isOpen={isFolderSelectorOpen}
        onClose={() => setIsFolderSelectorOpen(false)}
        onFolderSelected={handleFolderSelected}
      />
      
      {/* Context Menu */}
      {contextMenu.show && contextMenu.item && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
          items={
            contextMenu.item.type === 'folder'
              ? [
                  {
                    icon: <FilePlus size={16} />,
                    label: 'New File',
                    onClick: () => handleNewFile(contextMenu.item!.path)
                  },
                  {
                    icon: <FolderPlus size={16} />,
                    label: 'New Folder',
                    onClick: () => handleNewFolder(contextMenu.item!.path)
                  },
                  {
                    icon: <Download size={16} />,
                    label: 'Download Folder',
                    onClick: () => downloadFolder(contextMenu.item!.path)
                  }
                ]
              : [
                  {
                    icon: <Download size={16} />,
                    label: 'Download File',
                    onClick: () => {
                      // For files, we can directly download them using the browser
                      const a = document.createElement('a');
                      a.href = `/api/file-content?path=${encodeURIComponent(contextMenu.item!.path)}`;
                      a.download = contextMenu.item!.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }
                ]
          }
        />
      )}
      
      {/* New File Dialog */}
      {isNewFileDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252526] rounded-md p-4 w-80">
            <h3 className="text-white text-lg mb-4">New File</h3>
            <div className="mb-4">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name"
                className="w-full p-2 bg-[#3c3c3c] text-white border border-[#505050] rounded"
                autoFocus
              />
            </div>
            <div className="text-xs text-gray-400 mb-4">
              Parent folder: {newItemParentPath}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-[#3c3c3c] text-white rounded hover:bg-[#505050]"
                onClick={() => setIsNewFileDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-[#0e639c] text-white rounded hover:bg-[#1177bb]"
                onClick={createNewFile}
                disabled={!newFileName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Folder Dialog */}
      {isNewFolderDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252526] rounded-md p-4 w-80">
            <h3 className="text-white text-lg mb-4">New Folder</h3>
            <div className="mb-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full p-2 bg-[#3c3c3c] text-white border border-[#505050] rounded"
                autoFocus
              />
            </div>
            <div className="text-xs text-gray-400 mb-4">
              Parent folder: {newItemParentPath}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-[#3c3c3c] text-white rounded hover:bg-[#505050]"
                onClick={() => setIsNewFolderDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-[#0e639c] text-white rounded hover:bg-[#1177bb]"
                onClick={createNewFolder}
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 bg-${toast.type === 'error' ? 'red' : 'green'}-500 text-white p-2 rounded`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
