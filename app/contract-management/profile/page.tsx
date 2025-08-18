'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { contractManagementAuthService } from '@/lib/services/contract-management';
import { useLanguage } from '../contexts/language-context';
import ContractHeader from '../components/contract-header';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const currentUser = contractManagementAuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/contract-management');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) {
      errors.push(t('profile.passwordMinLength' as any));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('profile.passwordUppercase' as any));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('profile.passwordLowercase' as any));
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t('profile.passwordNumber' as any));
    }
    return errors;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('profile.currentPasswordRequired' as any);
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = t('profile.newPasswordRequired' as any);
    } else {
      const passwordErrors = validatePassword(passwordData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = `${t('profile.passwordMustHave' as any)}: ${passwordErrors.join(', ')}`;
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = t('profile.confirmPasswordRequired' as any);
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t('profile.passwordsDoNotMatch' as any);
    }

    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = t('profile.newPasswordMustBeDifferent' as any);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrors({});

    try {
      const result = await contractManagementAuthService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setSuccessMessage(result.message || t('profile.passwordChangedSuccess' as any));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setErrors(prev => ({ 
          ...prev, 
          general: result.error || t('profile.passwordChangeFailure' as any) 
        }));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: t('profile.passwordChangeError' as any) 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const goBack = () => {
    router.push('/contract-management/dashboard');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 bg-gradient-to-br from-blue-50 to-indigo-100">
      <ContractHeader />
      
      <main className="pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={goBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('profile.backToDashboard' as any)}
            </Button>
            
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.title' as any)}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('profile.subtitle' as any)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{t('profile.accountInformation' as any)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.name' as any)}</Label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.email' as any)}</Label>
                    <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.username' as any)}</Label>
                    <p className="text-lg text-gray-900 dark:text-white">{user.username}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('profile.system' as any)}</Label>
                    <p className="text-lg text-gray-900 dark:text-white capitalize">{user.system || 'Contract Management'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Password Change */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>{t('profile.changePassword' as any)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Success Message */}
                  {successMessage && (
                    <Alert className="border-green-200 bg-green-50 mb-6">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* General Error */}
                  {errors.general && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">
                        {t('profile.currentPassword' as any)} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                          placeholder={t('profile.enterCurrentPassword' as any)}
                          className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={isLoading}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-sm text-red-500">{errors.currentPassword}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">
                        {t('profile.newPassword' as any)} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder={t('profile.enterNewPassword' as any)}
                          className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={isLoading}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-sm text-red-500">{errors.newPassword}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t('profile.passwordRequirements' as any)}
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        {t('profile.confirmNewPassword' as any)} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder={t('profile.confirmNewPasswordPlaceholder' as any)}
                          className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="min-w-[140px]"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Lock className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? t('profile.changing' as any) : t('profile.changePassword' as any)}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
