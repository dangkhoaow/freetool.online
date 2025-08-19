'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { contractManagementAuthService } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';
import { LanguageSwitcher } from '../components/language-switcher';
import ContractForm from '../components/contract-form';
import ContractSearch from '../components/contract-search';
import ContractExport from '../components/contract-export';
import DashboardOverview from '../components/dashboard-overview';

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = contractManagementAuthService.isAuthenticated();
        const currentUser = contractManagementAuthService.getCurrentUser();
        
        if (!isAuthenticated || !currentUser) {
          router.push('/contract-management/login');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/contract-management/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await contractManagementAuthService.logout();
      router.push('/contract-management/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
            <TabsList className="inline-flex w-auto md:grid md:w-full md:grid-cols-4 min-w-max md:min-w-full">
              <TabsTrigger value="dashboard" className="flex-shrink-0 whitespace-nowrap">{t('tabs.dashboard')}</TabsTrigger>
              <TabsTrigger value="add-contract" className="flex-shrink-0 whitespace-nowrap">{t('tabs.addContract')}</TabsTrigger>
              <TabsTrigger value="search" className="flex-shrink-0 whitespace-nowrap">{t('tabs.search')}</TabsTrigger>
              <TabsTrigger value="export" className="flex-shrink-0 whitespace-nowrap">{t('tabs.export')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="add-contract" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('contracts.addNew')}</CardTitle>
                <CardDescription>
                  {t('contracts.addDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('contracts.searchTitle')}</CardTitle>
                <CardDescription>
                  {t('contracts.searchDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractSearch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('export.title')}</CardTitle>
                <CardDescription>
                  {t('export.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractExport />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 