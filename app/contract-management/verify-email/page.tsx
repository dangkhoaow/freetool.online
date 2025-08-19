'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { contractManagementAuthService } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';
import { LanguageSwitcher } from '../components/language-switcher';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError(t('auth.verificationTokenMissing'));
        setIsLoading(false);
        return;
      }

      try {
        const response = await contractManagementAuthService.verifyEmail(token);
        
        if (response.success) {
          setIsVerified(true);
          setMessage(response.message || t('auth.emailVerifiedSuccessfully'));
        } else {
          setError(response.error || t('auth.emailVerificationFailedGeneric'));
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setError(t('auth.networkErrorDuringVerification'));
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinueToLogin = () => {
    router.push('/contract-management/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher variant="compact" />
        </div>

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

        {/* Verification Status */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isLoading ? t('auth.verifyingEmail') : isVerified ? t('auth.emailVerified') : t('auth.verificationFailed')}
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? t('auth.pleaseWaitVerifying')
                : isVerified 
                  ? t('auth.emailSuccessfullyVerified')
                  : t('auth.issueVerifyingEmail')
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {isVerified && (
              <>
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600">
                  {t('auth.canNowLogin')}
                </p>
                <Button 
                  onClick={handleContinueToLogin}
                  className="w-full"
                >
                  {t('auth.continueToLogin')}
                </Button>
              </>
            )}

            {error && !isLoading && !isVerified && (
              <>
                <div className="flex justify-center">
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {t('auth.thisCouldHappen')}
                  </p>
                  <ul className="text-sm text-gray-600 text-left space-y-1">
                    <li>{t('auth.linkExpired')}</li>
                    <li>{t('auth.linkAlreadyUsed')}</li>
                    <li>{t('auth.linkInvalidCorrupted')}</li>
                  </ul>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/contract-management/signup')}
                    >
                      {t('auth.trySigningUpAgain')}
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => router.push('/contract-management/login')}
                    >
                      {t('auth.backToLogin')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            {t('auth.needHelpQuestion')}{' '}
            <Link 
              href="/contract-management/login" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('auth.contactSupport')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
