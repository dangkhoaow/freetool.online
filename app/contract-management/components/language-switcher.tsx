"use client";

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '../contexts/language-context';
import { Language } from '../translations';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangConfig = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode: Language) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 w-8 p-0 ${className}`}
            aria-label="Switch language"
          >
            <span className="text-lg">{currentLangConfig?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center space-x-3x ${
                currentLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
              {lang.isDefault && (
                <span className="text-xs text-gray-500 dark:text-gray-400">(mặc định)</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-10 px-2 ${className}`}
          >
            <span className="text-sm">{currentLangConfig?.flag}</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center space-x-3 ${
                currentLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
              {lang.isDefault && (
                <span className="text-xs text-gray-500 dark:text-gray-400">(mặc định)</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center space-x-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLangConfig?.flag}</span>
          <span className="hidden sm:inline">{currentLangConfig?.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b">
          Chọn ngôn ngữ / Select Language
        </div>
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center space-x-3 ${
              currentLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex-1">
              <div className="font-medium">{lang.name}</div>
              {lang.isDefault && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Ngôn ngữ mặc định / Default language
                </div>
              )}
            </div>
            {currentLanguage === lang.code && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 