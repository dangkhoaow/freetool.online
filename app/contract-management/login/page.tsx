"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Users, BarChart3, Mail, CheckCircle2 } from "lucide-react";
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
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = contractManagementAuthService.isAuthenticated();
        if (isAuthenticated) {
          // User is already logged in, redirect to dashboard
          router.push('/contract-management/dashboard');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

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
        const errorMessage = response.error || t('auth.invalidCredentials');
        setError(errorMessage);
        
        // Check if the error is about email verification
        if (errorMessage.toLowerCase().includes('verify') || 
            errorMessage.toLowerCase().includes('not active') ||
            errorMessage.toLowerCase().includes('activation')) {
          setShowResendVerification(true);
          // Try to extract email from username (if it's an email format)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(username)) {
            setResendEmail(username);
          }
        } else {
          setShowResendVerification(false);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(t('auth.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setError(t('auth.enterEmailToResend'));
      return;
    }

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await contractManagementAuthService.resendVerificationEmail(resendEmail);
      
      if (response.success) {
        setResendMessage(response.message || t('auth.verificationEmailSent'));
        setError(""); // Clear the login error
      } else {
        setResendMessage(response.error || t('auth.failedSendVerification'));
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendMessage(t('auth.networkError'));
    } finally {
      setResendLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-6xl py-16">
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

                  {/* Resend Verification Section */}
                  {showResendVerification && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                            {t('auth.emailVerificationRequired')}
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                            {t('auth.emailVerificationDescription')}
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="resendEmail" className="text-yellow-800 dark:text-yellow-200">{t('auth.emailAddress')}</Label>
                              <Input
                                id="resendEmail"
                                type="email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                placeholder={t('auth.enterEmailAddress')}
                                className="mt-1"
                                disabled={resendLoading}
                              />
                            </div>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleResendVerification}
                              disabled={resendLoading || !resendEmail}
                              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
                            >
                              {resendLoading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                  <span>{t('auth.sending')}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{t('auth.sendVerificationEmail')}</span>
                                </div>
                              )}
                            </Button>
                          </div>

                          {resendMessage && (
                            <Alert className={`mt-3 ${resendMessage.includes('success') || resendMessage.includes('sent') ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
                              {resendMessage.includes('success') || resendMessage.includes('sent') ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <AlertDescription className={resendMessage.includes('success') || resendMessage.includes('sent') ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                                {resendMessage}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
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
                    
                    <div className="flex justify-end mb-2">
                      <Button
                        type="submit"
                        className="w-full mr-4"
                        disabled={isLoading}
                      >
                        {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                      </Button>

                      <div className="flex justify-end mb-2">
                        <LanguageSwitcher variant="compact" />
                      </div>
                    </div>
                    
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
                      
                      <p className="text-sm">
                        <Link 
                          href="/contract-management/resend-verification" 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {t('auth.resendEmailVerification')}
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 