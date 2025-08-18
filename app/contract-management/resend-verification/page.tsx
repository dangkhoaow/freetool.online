'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { contractManagementAuthService } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';
import { LanguageSwitcher } from '../components/language-switcher';

export default function ResendVerificationPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage(t('auth.pleaseEnterEmail'));
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await contractManagementAuthService.resendVerificationEmail(email);
      
      if (response.success) {
        setMessage(response.message || t('auth.verificationEmailSent'));
        setIsSuccess(true);
      } else {
        setMessage(response.error || t('auth.failedSendVerification'));
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(t('auth.networkError'));
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* System Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('cms.title')}</h1>
          </div>
          <p className="text-gray-600">{t('cms.subtitle')}</p>
        </div>

        {/* Resend Verification Form */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl">{t('auth.resendVerificationTitle')}</CardTitle>
            <CardDescription>
              {t('auth.resendVerificationDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status Message */}
              {message && (
                <Alert className={isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {isSuccess ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={isSuccess ? 'text-green-800' : 'text-red-800'}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('auth.emailAddress')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.enterEmailAddress')}
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mb-2">
                <Button
                  type="submit"
                  className="w-full mr-4"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t('auth.sendingEmail')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{t('auth.sendVerificationEmail')}</span>
                    </div>
                  )}
                </Button>

                <div className="flex justify-end mb-2">
                  <LanguageSwitcher variant="compact" />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <Link 
                    href="/contract-management/login" 
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    {t('auth.backToLogin')}
                  </Link>
                </p>
                
                <p className="text-sm text-gray-600">
                  {t('auth.dontHaveAccountSignUp')}{' '}
                  <Link 
                    href="/contract-management/signup" 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('auth.signUpLink')}
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Information */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">{t('auth.whatsNext')}</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>{t('auth.checkEmailInbox')}</li>
              <li>{t('auth.checkSpamFolder')}</li>
              <li>{t('auth.clickVerificationLink')}</li>
              <li>{t('auth.returnToLogin')}</li>
            </ul>
          </div>
        )}

        {/* Troubleshooting */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {t('auth.troubleSupport')}
          </p>
        </div>
      </div>
    </div>
  );
}
