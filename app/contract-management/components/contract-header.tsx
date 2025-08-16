'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Home, Settings, User, LogOut } from "lucide-react";
import { useLanguage } from '../contexts/language-context';
import { LanguageSwitcher } from './language-switcher';
import { contractManagementAuthService } from '@/lib/services/contract-management';
import { ThemeToggle } from "@/components/theme-toggle";

export default function ContractHeader() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = contractManagementAuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    contractManagementAuthService.logout();
    router.push('/contract-management');
  };

  const handleProfile = () => {
    router.push('/contract-management/profile');
  };

  const handleSettings = () => {
    // Placeholder for settings functionality
    console.log('Settings clicked');
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToHome}
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">FreeTool</span>
            </Button>
            
            <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
            
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contract Management
              </h1>
            </div>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <LanguageSwitcher variant="compact" />
            
            {/* User Welcome */}
            {user && (
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">
                {t('dashboard.welcome')}, {user.name}
              </span>
            )}

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfile}
            >
              <User className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Profile</span>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">{t('auth.logout')}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
