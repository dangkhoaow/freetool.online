"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Users, BarChart3 } from "lucide-react";
import { contractManagementAuthService } from "@/lib/services/contract-management";
import { useTranslation } from "../contexts/language-context";
import { LanguageSwitcher } from "../components/language-switcher";

export default function ContractManagementLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError(t('auth.authRequired'));
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await contractManagementAuthService.login({
        username,
        password
      });
      
      if (response.success) {
        // Redirect to dashboard
        router.push("/contract-management/dashboard");
      } else {
        setError(response.error || t('auth.invalidCredentials'));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="w-full bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('cms.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('cms.subtitle')}
                </p>
              </div>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher variant="compact" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Features */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('cms.professionalManagement')}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  {t('cms.description')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('features.sequentialStorage.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('features.sequentialStorage.description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('features.advancedSearch.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('features.advancedSearch.description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('features.comprehensiveAnalytics.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('features.comprehensiveAnalytics.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Demo credentials */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('auth.demoCredentials')}
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>{t('auth.admin')}:</strong> admin / admin123</p>
                  <p><strong>{t('auth.manager')}:</strong> manager / manager123</p>
                  <p><strong>{t('auth.user')}:</strong> user / user123</p>
                  <p><strong>{t('auth.viewer')}:</strong> viewer / viewer123</p>
                </div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    {t('auth.signIn')}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('auth.accessDashboard')}
                  </p>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('auth.username')}</Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        placeholder={t('auth.enterUsername')}
                        autoComplete="username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        placeholder={t('auth.enterPassword')}
                        autoComplete="current-password"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                    </Button>
                    
                    {/* Navigation Links */}
                    <div className="text-center space-y-2 mt-4">
                      <p className="text-sm text-gray-600">
                        {t('auth.dontHaveAccount')}{' '}
                        <Link 
                          href="/contract-management/signup" 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {t('auth.signUp')}
                        </Link>
                      </p>
                      
                      <p className="text-sm">
                        <Link 
                          href="/contract-management/forgot-password" 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {t('auth.forgotPasswordLink')}
                        </Link>
                      </p>
                    </div>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('language_support.translationSystemImplemented')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 