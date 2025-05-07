"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { FileSystemItem, FileTreeItemProps } from '../types';

/**
 * FileTreeItem component - Renders a single file or folder in the explorer with proper styling
 * 
 * This is a recursive component that renders the file/folder and its children
 */
export function FileTreeItem({ 
  item, 
  depth = 0, 
  onDoubleClick, 
  onContextMenu 
}: FileTreeItemProps) {
  console.log(`Rendering tree item: ${item.name}, type: ${item.type}, depth: ${depth}`);

  // State to track if folder is expanded or collapsed
  const [isOpen, setIsOpen] = useState(depth < 2); // Auto-open first two levels
  
  // Toggle folder open/closed
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
  
  // For error items
  if (item.type === 'error') {
    return (
      <div 
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
      <div>
        <div 
          className="flex items-center text-gray-300 hover:text-white py-1 cursor-pointer"
          onClick={toggleOpen}
          onContextMenu={(e) => onContextMenu(e, item)}
        >
          {isOpen ? (
            <ChevronDown size={16} className="mr-1" />
          ) : (
            <ChevronRight size={16} className="mr-1" />
          )}
          <Folder size={16} className="mr-2" style={{ color: "#dcb67a" }} />
          <span className="text-xs">{item.name}</span>
        </div>
        
        {isOpen && item.children && (
          <div className="pl-4">  {/* Reduced padding for better nested display */}
            {item.children.length === 0 ? (
              <div className="text-gray-400 py-1 text-xs">Empty folder</div>
            ) : (
              item.children.map((child, childIndex) => (
                <FileTreeItem 
                  key={`child-${child.path}-${childIndex}`} 
                  item={child} 
                  depth={depth + 1} 
                  onDoubleClick={onDoubleClick}
                  onContextMenu={onContextMenu}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Special placeholder for showing there are more items
  if (item.type === 'more-items') {
    return (
      <div className="text-gray-400 py-1 pl-6">
        <span>... (more items not shown, open folder directly)</span>
      </div>
    );
  }
  
  // For files (default case)
  return (
    <div 
      className="flex items-center text-gray-300 hover:text-white py-1 cursor-pointer"
      onDoubleClick={() => onDoubleClick(item)}
      onContextMenu={(e) => onContextMenu(e, item)}
    >
      <FileText size={16} className="mr-2" style={{ color: getFileColor(item.name) }} />
      <span className="text-xs">{item.name}</span>
    </div>
  );
}
