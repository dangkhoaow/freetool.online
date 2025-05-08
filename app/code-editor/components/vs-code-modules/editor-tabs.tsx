import React from 'react';
import { X, Dot, Save } from 'lucide-react';
import { FileNode } from '@/lib/services/vs-code-file-system';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

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
  console.log(`EditorTabs: File icon for ${fileName} using color ${color}`);
  
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="mr-1.5"
    >
      <path 
        d="M13.5 4.5L9.5 0.5H2.5C1.9 0.5 1.5 0.9 1.5 1.5V14.5C1.5 15.1 1.9 15.5 2.5 15.5H13.5C14.1 15.5 14.5 15.1 14.5 14.5V5.5C14.5 5.2 14.4 5 14.2 4.8L13.5 4.5Z" 
        stroke={color} 
        strokeWidth="1.5" 
      />
      <path 
        d="M9.5 0.5V4.5H13.5" 
        stroke={color} 
        strokeWidth="1.5" 
      />
    </svg>
  );
};

interface EditorTabsProps {
  openFiles: FileNode[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
  unsavedFiles: Set<string>;
  onSaveFile: (fileId: string) => void;
}

export function VSCodeEditorTabs({
  openFiles,
  activeFileId,
  onSelectFile,
  onCloseFile,
  unsavedFiles,
  onSaveFile
}: EditorTabsProps) {
  console.log('EditorTabs: Rendering editor tabs with active file:', activeFileId);
  console.log('EditorTabs: Open files count:', openFiles.length);
  console.log('EditorTabs: Unsaved files count:', unsavedFiles.size);
  
  return (
    <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto">
      <TooltipProvider>
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;
          const isUnsaved = unsavedFiles.has(file.id);
          console.log(`EditorTabs: Tab for file ${file.name}, active: ${isActive}, unsaved: ${isUnsaved}`);
          
          return (
            <div 
              key={file.id}
              className={`
                flex items-center min-w-0 max-w-[200px] h-9 px-3 
                ${isActive 
                  ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' 
                  : 'bg-[#2d2d2d] text-[#969696] hover:text-white'}
                border-r border-r-[#3c3c3c]
                cursor-pointer group
              `}
              onClick={() => {
                console.log(`EditorTabs: Selected file ${file.id}`);
                onSelectFile(file.id);
              }}
            >
              {/* File icon */}
              {getFileIcon(file.name)}
              
              {/* File name */}
              <span className="truncate text-xs">{file.name}</span>
              
              {/* Unsaved indicator */}
              {isUnsaved && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Dot className="h-6 w-6 flex-shrink-0 text-white" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Unsaved changes
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Actions */}
              <div className="flex ml-1 space-x-1">
                {isUnsaved && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 hover:bg-[#383838] p-0.5 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`EditorTabs: Saving file ${file.id}`);
                          onSaveFile(file.id);
                        }}
                      >
                        <Save className="h-3.5 w-3.5 text-[#cccccc]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Save
                    </TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="opacity-0 group-hover:opacity-100 hover:bg-[#383838] p-0.5 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`EditorTabs: Closing file ${file.id}`);
                        onCloseFile(file.id);
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-[#cccccc]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Close
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
