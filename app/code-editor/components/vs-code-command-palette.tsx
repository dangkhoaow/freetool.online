import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X } from 'lucide-react';

// Define command interface
export interface VSCodeCommand {
  id: string;
  title: string;
  category?: string;
  keybinding?: string | string[];
  execute: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: VSCodeCommand[];
  onCommandExecute: (command: VSCodeCommand) => void;
}

export function VSCodeCommandPalette({
  isOpen,
  onClose,
  commands,
  onCommandExecute
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<VSCodeCommand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter commands based on search query
  useEffect(() => {
    console.log('Filtering commands with query:', searchQuery);
    if (!searchQuery) {
      setFilteredCommands(commands);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = commands
        .filter(cmd => 
          cmd.title.toLowerCase().includes(query) || 
          (cmd.category && cmd.category.toLowerCase().includes(query))
        )
        .sort((a, b) => {
          // Sort by match quality (exact match, startsWith, includes)
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          
          // Exact match gets highest priority
          if (aTitle === query) return -1;
          if (bTitle === query) return 1;
          
          // Then startsWith
          if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
          if (!aTitle.startsWith(query) && bTitle.startsWith(query)) return 1;
          
          // Finally alphabetical
          return aTitle.localeCompare(bTitle);
        });
      
      setFilteredCommands(filtered);
    }
    
    // Reset selection when filter changes
    setSelectedIndex(0);
  }, [searchQuery, commands]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('Key pressed in command palette:', e.key);
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        if (filteredCommands.length > 0) {
          const command = filteredCommands[selectedIndex];
          executeCommand(command);
        }
        break;
    }
  };

  // Execute a command
  const executeCommand = (command: VSCodeCommand) => {
    console.log('Executing command:', command.id);
    onCommandExecute(command);
    onClose();
  };

  // Scroll selected item into view
  useEffect(() => {
    const selectedItem = document.getElementById(`command-${selectedIndex}`);
    if (selectedItem && containerRef.current) {
      const container = containerRef.current;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.offsetHeight;

      if (itemTop < containerTop) {
        container.scrollTop = itemTop;
      } else if (itemBottom > containerBottom) {
        container.scrollTop = itemBottom - container.offsetHeight;
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50">
      <div className="w-full max-w-[600px] bg-[#252526] shadow-lg rounded overflow-hidden">
        {/* Search input */}
        <div className="flex items-center p-2 border-b border-[#3c3c3c]">
          <Search className="w-5 h-5 text-[#cccccc] mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-[#6c6c6c] outline-none"
            placeholder="Type command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onClose} className="text-[#cccccc] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Commands list */}
        <div 
          ref={containerRef}
          className="max-h-[300px] overflow-y-auto"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-4 px-3 text-[#cccccc] text-center">
              No commands found
            </div>
          ) : (
            <ul>
              {filteredCommands.map((command, index) => (
                <li 
                  id={`command-${index}`}
                  key={command.id}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                    index === selectedIndex ? 'bg-[#04395e] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                  }`}
                  onClick={() => executeCommand(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center">
                    <Command className="w-4 h-4 mr-2 opacity-70" />
                    <span>{command.title}</span>
                    {command.category && (
                      <span className="ml-2 text-xs opacity-60">
                        {command.category}
                      </span>
                    )}
                  </div>
                  {command.keybinding && (
                    <div className="text-xs bg-[#2a2d2e] px-1.5 py-0.5 rounded">
                      {command.keybinding}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Standard commands that should be available in any VS Code editor
export const getStandardCommands = (
  additionalActions: Record<string, () => void> = {}
): VSCodeCommand[] => {
  const actions = {
    // Default core actions
    openSettings: () => console.log('Open settings'),
    toggleSidebar: () => console.log('Toggle sidebar'),
    togglePanel: () => console.log('Toggle panel'),
    openFile: () => console.log('Open file'),
    saveFile: () => console.log('Save file'),
    saveFileAs: () => console.log('Save file as'),
    ...additionalActions
  };

  return [
    {
      id: 'workbench.action.openSettings',
      title: 'Open Settings',
      category: 'Preferences',
      keybinding: 'Ctrl+,',
      execute: actions.openSettings
    },
    {
      id: 'workbench.action.toggleSidebarVisibility',
      title: 'Toggle Side Bar Visibility',
      category: 'View',
      keybinding: 'Ctrl+B',
      execute: actions.toggleSidebar
    },
    {
      id: 'workbench.action.togglePanel',
      title: 'Toggle Panel',
      category: 'View',
      keybinding: 'Ctrl+J',
      execute: actions.togglePanel
    },
    {
      id: 'workbench.action.quickOpen',
      title: 'Go to File...',
      category: 'File',
      keybinding: 'Ctrl+P',
      execute: actions.openFile
    },
    {
      id: 'workbench.action.files.save',
      title: 'Save',
      category: 'File',
      keybinding: 'Ctrl+S',
      execute: actions.saveFile
    },
    {
      id: 'workbench.action.files.saveAs',
      title: 'Save As...',
      category: 'File',
      keybinding: 'Ctrl+Shift+S',
      execute: actions.saveFileAs
    }
  ];
};
