"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  FilePlus, 
  FolderPlus, 
  Copy, 
  Trash, 
  Edit, 
  Download, 
  ChevronRight
} from "lucide-react";

interface MenuPosition {
  x: number;
  y: number;
}

interface ContextMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: MenuPosition;
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  
  console.log("Rendering context menu at position:", position);

  useEffect(() => {
    // Handle clicks outside the menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      console.log("Click detected, checking if outside menu");
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        console.log("Click was outside menu, closing");
        onClose();
      }
    };

    // Handle escape key to close the menu
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log("Escape key pressed, closing menu");
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust menu position if it would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontally if menu extends beyond viewport
      if (position.x + menuRect.width > viewportWidth) {
        adjustedX = viewportWidth - menuRect.width - 10;
      }

      // Adjust vertically if menu extends beyond viewport
      if (position.y + menuRect.height > viewportHeight) {
        adjustedY = viewportHeight - menuRect.height - 10;
      }

      // Only reposition if necessary to avoid unnecessary rerenders
      if (adjustedX !== position.x || adjustedY !== position.y) {
        console.log("Adjusting menu position to fit viewport", { adjustedX, adjustedY });
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }
  }, [position]);

  // Handle hovering over an item with a submenu
  const handleItemHover = (index: number, item: ContextMenuItem, event: React.MouseEvent) => {
    if (item.submenu && item.submenu.length > 0) {
      console.log("Hovering over item with submenu:", item.label);
      
      const element = event.currentTarget as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      
      setSubmenuPosition({
        x: rect.right,
        y: rect.top
      });
      
      setActiveSubmenu(index);
    } else {
      setActiveSubmenu(null);
    }
  };

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-[#252526] border border-[#3c3c3c] text-[#cccccc] text-sm rounded-md shadow-md min-w-[180px]"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="py-1">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-center px-3 py-1.5 hover:bg-[#094771] cursor-pointer ${
              item.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (!item.disabled && !item.submenu) {
                console.log("Menu item clicked:", item.label);
                item.onClick();
                onClose();
              }
            }}
            onMouseEnter={(e) => handleItemHover(index, item, e)}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            <span className="flex-grow">{item.label}</span>
            {item.submenu && <ChevronRight className="h-4 w-4 ml-2" />}
          </div>
        ))}
      </div>

      {/* Render submenu if active */}
      {activeSubmenu !== null && items[activeSubmenu].submenu && (
        <div 
          className="absolute z-50 bg-[#252526] border border-[#3c3c3c] text-[#cccccc] text-sm rounded-md shadow-md min-w-[180px]"
          style={{ 
            left: `${submenuPosition.x}px`, 
            top: `${submenuPosition.y}px` 
          }}
        >
          <div className="py-1">
            {items[activeSubmenu].submenu!.map((subItem, subIndex) => (
              <div
                key={subIndex}
                className={`flex items-center px-3 py-1.5 hover:bg-[#094771] cursor-pointer ${
                  subItem.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => {
                  if (!subItem.disabled) {
                    console.log("Submenu item clicked:", subItem.label);
                    subItem.onClick();
                    onClose();
                  }
                }}
              >
                {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                <span>{subItem.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContextMenu;
