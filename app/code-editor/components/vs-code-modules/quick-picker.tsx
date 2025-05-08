import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, FileText } from 'lucide-react';
import { FileNode } from '@/lib/services/vs-code-file-system';

// File icon mapping based on file extension
const getFileIcon = (fileName: string): React.ReactNode => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Map extensions to colors
  const extensionColorMap: Record<string, string> = {
    js: '#f1c40f',   // JavaScript - yellow
    ts: '#3498db',   // TypeScript - blue
    jsx: '#f1c40f',  // React JS - yellow
    tsx: '#3498db',  // React TS - blue
    html: '#e74c3c', // HTML - red
    css: '#9b59b6',  // CSS - purple
    json: '#27ae60', // JSON - green
    md: '#7f8c8d',   // Markdown - gray
    py: '#2ecc71',   // Python - green
    java: '#e67e22', // Java - orange
    // Add more as needed
  };
  
  const color = extensionColorMap[extension] || '#95a5a6'; // Default gray
  console.log(`QuickPicker: File icon for ${fileName} using color ${color}`);
  return <FileText className="h-4 w-4 mr-1.5" style={{ stroke: color }} />;
};

// Helper to get file path parts for display
const getFilePathParts = (node: FileNode, rootNode: FileNode): { name: string; path: string } => {
  // Find path by traversing up the tree
  const getPath = (
    current: FileNode, 
    targetId: string, 
    path: string[] = []
  ): string[] | null => {
    if (current.id === targetId) {
      return path;
    }
    
    if (current.children) {
      for (const child of current.children) {
        const result = getPath(
          child, 
          targetId, 
          [...path, child.name]
        );
        if (result) return result;
      }
    }
    
    return null;
  };
  
  // Get path excluding root and file itself
  const pathParts = getPath(rootNode, node.id, []) || [];
  if (pathParts.length > 0) {
    // Remove the file name (last part)
    pathParts.pop();
  }
  
  console.log(`QuickPicker: Path parts for ${node.name}: ${pathParts.join('/')}`);
  return {
    name: node.name,
    path: pathParts.length > 0 ? pathParts.join('/') : ''
  };
};

interface QuickPickerProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  rootNode: FileNode;
  onSelectFile: (fileId: string) => void;
  recentFiles?: FileNode[];
}

export function VSCodeQuickPicker({
  isOpen,
  onClose,
  files,
  rootNode,
  onSelectFile,
  recentFiles = []
}: QuickPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileNode[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showingRecent, setShowingRecent] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);
  
  console.log('QuickPicker: Rendering quick picker with search query:', searchQuery);
  console.log('QuickPicker: isOpen:', isOpen);
  console.log('QuickPicker: Total files count:', files?.length || 0);
  console.log('QuickPicker: Recent files count:', recentFiles?.length || 0);
  
  // Memoize files array to prevent unnecessary re-renders
  const safeFiles = useMemo(() => {
    console.log('QuickPicker: Memoizing files array with length:', files?.length || 0);
    return Array.isArray(files) ? [...files] : [];
  }, [files]);
  
  // Memoize recent files array to prevent unnecessary re-renders
  const safeRecentFiles = useMemo(() => {
    console.log('QuickPicker: Memoizing recent files array with length:', recentFiles?.length || 0);
    return Array.isArray(recentFiles) ? [...recentFiles] : [];
  }, [recentFiles]);
  
  // Focus input when opened - using a stable callback
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      console.log('QuickPicker: Input focused');
    }
  }, []);
  
  useEffect(() => {
    if (isOpen && !processingRef.current) {
      console.log('QuickPicker: Picker opened, focusing input');
      processingRef.current = true;
      
      // Reset state when opening
      setSearchQuery('');
      setSelectedIndex(0);
      setShowingRecent(true);
      
      // Small delay to avoid the focus getting lost during transition
      setTimeout(() => {
        focusInput();
        processingRef.current = false;
      }, 50);
    }
  }, [isOpen, focusInput]);
  
  // Filter files based on search query with debounce to avoid excessive filtering
  const filterFiles = useCallback(() => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    try {
      console.log('QuickPicker: Filtering files with query:', searchQuery);
      if (!searchQuery) {
        console.log('QuickPicker: Empty query, showing recent files:', safeRecentFiles.length);
        setFilteredFiles(safeRecentFiles);
        setShowingRecent(true);
        processingRef.current = false;
        return;
      }
      
      setShowingRecent(false);
      
      const query = searchQuery.toLowerCase();
      
      // Use the memoized safe files copy
      const filtered = safeFiles
        .filter(file => file && file.name && file.name.toLowerCase().includes(query))
        .sort((a, b) => {
          if (!a || !a.name) return 1;
          if (!b || !b.name) return -1;
          
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          // Exact match highest priority
          if (aName === query) return -1;
          if (bName === query) return 1;
          
          // StartsWith next highest
          if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
          if (!aName.startsWith(query) && bName.startsWith(query)) return 1;
          
          // Contains anywhere
          return aName.localeCompare(bName);
        });
      
      console.log('QuickPicker: Filter completed, found matches:', filtered.length);
      setFilteredFiles(filtered);
      
      // Reset selection only when the filtered list changes
      setSelectedIndex(0);
    } catch (error) {
      console.error('QuickPicker: Error while filtering files:', error);
      setFilteredFiles([]);
    }
    
    processingRef.current = false;
  }, [searchQuery, safeFiles, safeRecentFiles]);
  
  useEffect(() => {
    // Use debounce to prevent excessive filtering
    const handler = setTimeout(() => {
      filterFiles();
    }, 100);
    
    return () => {
      clearTimeout(handler);
    };
  }, [filterFiles]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('QuickPicker: Key pressed in quick picker:', e.key);
    switch (e.key) {
      case 'Escape':
        onClose();
        console.log('QuickPicker: Closed via Escape key');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < filteredFiles.length - 1 ? prev + 1 : prev;
          console.log(`QuickPicker: Selection moved down to index: ${newIndex}`);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : 0;
          console.log(`QuickPicker: Selection moved up to index: ${newIndex}`);
          return newIndex;
        });
        break;
      case 'Enter':
        if (filteredFiles.length > 0) {
          const selectedFile = filteredFiles[selectedIndex];
          console.log(`QuickPicker: File selected via Enter key: ${selectedFile.name}`);
          onSelectFile(selectedFile.id);
          onClose();
        }
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const selectedItem = document.getElementById(`file-${selectedIndex}`);
    if (selectedItem && listRef.current) {
      const container = listRef.current;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.offsetHeight;

      if (itemTop < containerTop) {
        container.scrollTop = itemTop;
        console.log('QuickPicker: Scrolled item into view (top)');
      } else if (itemBottom > containerBottom) {
        container.scrollTop = itemBottom - container.offsetHeight;
        console.log('QuickPicker: Scrolled item into view (bottom)');
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50">
      <div 
        ref={containerRef}
        className="w-full max-w-[600px] bg-[#252526] shadow-lg rounded overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center p-2 border-b border-[#3c3c3c]">
          <Search className="w-5 h-5 text-[#cccccc] mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-[#6c6c6c] outline-none"
            placeholder="Type to search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        {/* Files list */}
        <div 
          ref={listRef}
          className="max-h-[400px] overflow-y-auto"
        >
          {filteredFiles.length === 0 ? (
            <div className="py-4 px-3 text-[#cccccc] text-center">
              {showingRecent ? 'No recent files' : 'No files found'}
            </div>
          ) : (
            <div>
              {showingRecent && (
                <div className="px-3 py-1 text-xs text-[#6c6c6c] uppercase">
                  Recent Files
                </div>
              )}
              <ul>
                {filteredFiles.map((file, index) => {
                  const { name, path } = getFilePathParts(file, rootNode);
                  
                  return (
                    <li 
                      id={`file-${index}`}
                      key={file.id}
                      className={`px-3 py-2 cursor-pointer ${
                        index === selectedIndex ? 'bg-[#04395e] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                      }`}
                      onClick={() => {
                        console.log(`QuickPicker: File selected via click: ${file.name}`);
                        onSelectFile(file.id);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center">
                        {getFileIcon(name)}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium">{name}</span>
                          {path && (
                            <span className="truncate text-xs opacity-60">
                              {path}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
