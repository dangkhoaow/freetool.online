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
    console.log('CommandPalette: Filtering commands with query:', searchQuery);
    if (!searchQuery) {
      setFilteredCommands(commands);
      console.log('CommandPalette: No query, showing all commands:', commands.length);
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
      console.log('CommandPalette: Filtered commands count:', filtered.length);
    }
    
    // Reset selection when filter changes
    setSelectedIndex(0);
  }, [searchQuery, commands]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('CommandPalette: Key pressed in command palette:', e.key);
    switch (e.key) {
      case 'Escape':
        onClose();
        console.log('CommandPalette: Closed via Escape key');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        console.log('CommandPalette: Selection moved down to index:', selectedIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        console.log('CommandPalette: Selection moved up to index:', selectedIndex - 1);
        break;
      case 'Enter':
        if (filteredCommands.length > 0) {
          const command = filteredCommands[selectedIndex];
          executeCommand(command);
          console.log('CommandPalette: Command executed via Enter key:', command.id);
        }
        break;
    }
  };

  // Execute a command
  const executeCommand = (command: VSCodeCommand) => {
    console.log('CommandPalette: Executing command:', command.id);
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
        console.log('CommandPalette: Scrolled item into view (top)');
      } else if (itemBottom > containerBottom) {
        container.scrollTop = itemBottom - container.offsetHeight;
        console.log('CommandPalette: Scrolled item into view (bottom)');
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
    openSettings: () => {
      console.log('CommandPalette: openSettings action triggered');
      console.log('Open settings');
    },
    openKeybindings: () => {
      console.log('CommandPalette: openKeybindings action triggered');
      console.log('Open keybindings');
    },
    openUserSnippets: () => {
      console.log('CommandPalette: openUserSnippets action triggered');
      console.log('Open user snippets');
    },
    toggleSidebar: () => {
      console.log('CommandPalette: toggleSidebar action triggered');
      console.log('Toggle sidebar');
    },
    togglePanel: () => {
      console.log('CommandPalette: togglePanel action triggered');
      console.log('Toggle panel');
    },
    saveFile: () => {
      console.log('CommandPalette: saveFile action triggered');
      console.log('Save file');
    },
    createNewFile: () => {
      console.log('CommandPalette: createNewFile action triggered');
      console.log('Create new file');
    },
    openFile: () => {
      console.log('CommandPalette: openFile action triggered');
      console.log('Open file');
    },
    openFolder: () => {
      console.log('CommandPalette: openFolder action triggered');
      console.log('Open folder');
    },
    selectFile: () => {
      console.log('CommandPalette: selectFile action triggered');
      console.log('Select file');
    },
    toggleTheme: () => {
      console.log('CommandPalette: toggleTheme action triggered');
      console.log('Toggle theme');
    },
    
    // Merge with additional actions
    ...additionalActions
  };
  
  // Standard command definitions
  return [
    // File commands
    { id: 'file.new', title: 'New File', category: 'File', keybinding: 'Ctrl+N', execute: actions.createNewFile },
    { id: 'file.open', title: 'Open File...', category: 'File', keybinding: 'Ctrl+O', execute: actions.openFile },
    { id: 'file.openFolder', title: 'Open Folder...', category: 'File', execute: actions.openFolder },
    { id: 'file.save', title: 'Save', category: 'File', keybinding: 'Ctrl+S', execute: actions.saveFile },
    { id: 'file.selectFile', title: 'Go to File...', category: 'File', keybinding: 'Ctrl+P', execute: actions.selectFile },
    
    // View commands
    { id: 'view.toggleSidebar', title: 'Toggle Sidebar', category: 'View', keybinding: 'Ctrl+B', execute: actions.toggleSidebar },
    { id: 'view.togglePanel', title: 'Toggle Panel', category: 'View', keybinding: 'Ctrl+J', execute: actions.togglePanel },
    { id: 'view.toggleTheme', title: 'Toggle Theme', category: 'View', execute: actions.toggleTheme },
    
    // Preferences commands
    { id: 'preferences.openSettings', title: 'Open Settings', category: 'Preferences', keybinding: 'Ctrl+,', execute: actions.openSettings },
    { id: 'preferences.openKeybindings', title: 'Open Keyboard Shortcuts', category: 'Preferences', execute: actions.openKeybindings },
    { id: 'preferences.openUserSnippets', title: 'Open User Snippets', category: 'Preferences', execute: actions.openUserSnippets },
  ];
};
