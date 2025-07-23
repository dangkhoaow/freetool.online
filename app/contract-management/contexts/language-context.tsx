"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language,
  TranslationPath, 
  translations, 
  defaultLanguage, 
  supportedLanguages 
} from '../translations';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationPath) => string;
  availableLanguages: typeof supportedLanguages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('contractManagementLanguage') as Language;
      if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
        setCurrentLanguage(savedLanguage);
      }
    }
  }, []);

  // Save language preference to localStorage when it changes
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractManagementLanguage', language);
    }
  };

  // Translation function that supports nested keys
  const t = (key: TranslationPath): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[currentLanguage];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if key not found in current language
          value = translations.en;
          for (const fallbackK of keys) {
            if (value && typeof value === 'object' && fallbackK in value) {
              value = value[fallbackK];
            } else {
              // Return the key itself if not found in any language
              console.warn(`Translation key not found: ${key}`);
              return key;
            }
          }
          break;
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch (error) {
      console.error(`Error translating key: ${key}`, error);
      return key;
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages: supportedLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use the language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for just the translation function (most commonly used)
export function useTranslation() {
  const { t, currentLanguage } = useLanguage();
  return { t, currentLanguage };
} 