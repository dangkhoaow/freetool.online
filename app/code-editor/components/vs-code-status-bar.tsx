import React from 'react';
import { GitBranch, Wifi, WifiOff, Check, AlertCircle, Bell, Moon, Sun } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface StatusBarItemProps {
  icon: React.ReactNode;
  text: string;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

function StatusBarItem({ 
  icon, 
  text, 
  tooltip, 
  onClick, 
  className = '' 
}: StatusBarItemProps) {
  const content = (
    <div 
      className={`flex items-center px-2 h-6 text-xs cursor-pointer hover:bg-[#2a2d2e] ${className}`}
      onClick={onClick}
    >
      <span className="mr-1.5">{icon}</span>
      <span>{text}</span>
    </div>
  );
  
  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : content;
}

interface StatusBarProps {
  lineCount: number;
  currentLine: number;
  currentColumn: number;
  language: string;
  selectionCount?: number;
  isConnected?: boolean;
  errorCount?: number;
  warningCount?: number;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function VSCodeStatusBar({
  lineCount,
  currentLine,
  currentColumn,
  language,
  selectionCount = 0,
  isConnected = true,
  errorCount = 0,
  warningCount = 0,
  isDarkMode = true,
  onToggleTheme
}: StatusBarProps) {
  console.log('Rendering status bar with current line:', currentLine, 'column:', currentColumn);
  
  return (
    <div className="flex items-center justify-between h-6 bg-[#007acc] text-white text-xs">
      {/* Left items */}
      <TooltipProvider>
        <div className="flex items-center">
          <StatusBarItem 
            icon={<GitBranch className="h-3.5 w-3.5" />}
            text="main"
            tooltip="Source Control"
            className="border-r border-white/20"
          />
          
          <StatusBarItem
            icon={isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            text={isConnected ? "Connected" : "Offline"}
            tooltip={isConnected ? "Connected to server" : "Working offline"}
            className="border-r border-white/20"
          />
          
          {(errorCount > 0 || warningCount > 0) && (
            <StatusBarItem
              icon={errorCount > 0 ? <AlertCircle className="h-3.5 w-3.5 text-red-400" /> : <Check className="h-3.5 w-3.5 text-green-400" />}
              text={`${errorCount} ${errorCount === 1 ? 'Error' : 'Errors'}, ${warningCount} ${warningCount === 1 ? 'Warning' : 'Warnings'}`}
              tooltip="Problems"
              className="border-r border-white/20"
            />
          )}
          
          <StatusBarItem
            icon={<Bell className="h-3.5 w-3.5" />}
            text="0"
            tooltip="Notifications"
          />
        </div>
      </TooltipProvider>
      
      {/* Right items */}
      <TooltipProvider>
        <div className="flex items-center">
          {selectionCount > 0 && (
            <StatusBarItem
              text={`Ln ${selectionCount} chars selected`}
              tooltip="Selection Length"
              icon={<></>}
            />
          )}
          
          <StatusBarItem
            text={`Ln ${currentLine}, Col ${currentColumn}`}
            tooltip="Go to Line/Column"
            icon={<></>}
          />
          
          <StatusBarItem
            text={`${lineCount} lines`}
            tooltip="Line Count"
            icon={<></>}
            className="border-l border-white/20"
          />
          
          <StatusBarItem
            text={language}
            tooltip="Select Language Mode"
            icon={<></>}
            className="border-l border-white/20"
          />
          
          <StatusBarItem
            icon={isDarkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            text={isDarkMode ? "Dark" : "Light"}
            tooltip="Toggle Theme"
            onClick={onToggleTheme}
            className="border-l border-white/20"
          />
        </div>
      </TooltipProvider>
    </div>
  );
}
