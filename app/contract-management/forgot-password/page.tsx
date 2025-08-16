'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { useLanguage } from '../contexts/language-context';
import { LanguageSwitcher } from '../components/language-switcher';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate email
    if (!email.trim()) {
      setErrors({ email: t('contracts.required') });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email format' });
      return;
    }

    setIsLoading(true);

    try {
      // Call the real password reset API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/contract-management/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setErrors({ general: data.message || 'Failed to send reset email. Please try again.' });
      }
      
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Clear email error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setEmail('');
    setErrors({});
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Success State */}
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('auth.resetLinkSent')}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {t('auth.checkEmail')}
                  </p>
                </div>

                <Alert className="border-green-200 bg-green-50 text-left">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Reset link sent to: <strong>{email}</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    onClick={handleTryAgain}
                    variant="outline"
                    className="w-full"
                  >
                    Send to different email
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/contract-management/login')}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('auth.backToLogin')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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

        {/* Forgot Password Form */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t('auth.forgotPasswordTitle')}</CardTitle>
            <CardDescription>{t('auth.forgotPasswordDescription')}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('auth.email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={t('auth.enterEmail')}
                  className={errors.email ? 'border-red-500' : ''}
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mb-2">
                <Button
                  type="submit"
                  className="w-full mr-4"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {t('auth.sendResetLink')}
                    </>
                  )}
                </Button>

                <div className="flex justify-end mb-2">
                  <LanguageSwitcher variant="compact" />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="text-center space-y-2">
                <Link 
                  href="/contract-management/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Don't remember your email? Contact your system administrator for assistance.
          </p>
        </div>

        {/* System Description */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('cms.professionalManagement')}
          </p>
        </div>
      </div>
    </div>
  );
} 