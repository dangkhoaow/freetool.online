import { viTranslations } from './vi';
import { enTranslations } from './en';

export type Language = 'vi' | 'en';

export type TranslationPath = 
  | 'auth.login' | 'auth.logout' | 'auth.email' | 'auth.password' | 'auth.rememberMe' | 'auth.forgotPassword' 
  | 'auth.invalidCredentials' | 'auth.loginRequired' | 'auth.welcome' | 'auth.signIn' | 'auth.enterCredentials'
  | 'auth.username' | 'auth.enterUsername' | 'auth.enterPassword' | 'auth.demoCredentials' 
  | 'auth.admin' | 'auth.manager' | 'auth.user' | 'auth.viewer' | 'auth.accessDashboard'
  | 'auth.authRequired' | 'auth.signingIn'
  | 'auth.signUp' | 'auth.register' | 'auth.createAccount' | 'auth.registerDescription'
  | 'auth.firstName' | 'auth.lastName' | 'auth.confirmPassword' | 'auth.enterFirstName' | 'auth.enterLastName' 
  | 'auth.enterEmail' | 'auth.enterConfirmPassword' | 'auth.passwordMismatch' | 'auth.accountCreated' | 'auth.alreadyHaveAccount'
  | 'auth.resetPassword' | 'auth.forgotPasswordTitle' | 'auth.forgotPasswordDescription' | 'auth.sendResetLink' 
  | 'auth.resetLinkSent' | 'auth.checkEmail' | 'auth.backToLogin' | 'auth.emailNotFound'
  | 'auth.dontHaveAccount' | 'auth.forgotPasswordLink'
  | 'cms.title' | 'cms.subtitle' | 'cms.professionalManagement' | 'cms.description'
  | 'features.sequentialStorage.title' | 'features.sequentialStorage.description'
  | 'features.advancedSearch.title' | 'features.advancedSearch.description'
  | 'features.comprehensiveAnalytics.title' | 'features.comprehensiveAnalytics.description'
  | 'dashboard.title' | 'dashboard.welcome' | 'dashboard.overview' | 'dashboard.quickActions' 
  | 'dashboard.totalContracts' | 'dashboard.totalValue' | 'dashboard.storageUtilization' | 'dashboard.upcomingExpirations'
  | 'dashboard.contractsByType' | 'dashboard.contractsByStatus' | 'dashboard.recentContracts' | 'dashboard.active'
  | 'dashboard.average' | 'dashboard.of' | 'dashboard.units' | 'dashboard.next30Days' | 'dashboard.statistics'
  | 'dashboard.totalValue_' | 'dashboard.averageValue' | 'dashboard.storageUnits' | 'dashboard.utilizationRate'
  | 'dashboard.contractsThisMonth' | 'dashboard.newThisMonth' | 'dashboard.expiringContracts'
  | 'tabs.dashboard' | 'tabs.addContract' | 'tabs.search' | 'tabs.export'
  | 'contracts.addNew' | 'contracts.addDescription' | 'contracts.searchTitle' | 'contracts.searchDescription'
  | 'contracts.companyName' | 'contracts.contractNumber' | 'contracts.startDate' | 'contracts.endDate'
  | 'contracts.duration' | 'contracts.value' | 'contracts.bidDecisionNumber' | 'contracts.contractType'
  | 'contracts.pdfFile' | 'contracts.save' | 'contracts.cancel' | 'contracts.required' | 'contracts.selectFile'
  | 'contracts.noFileSelected' | 'contracts.search' | 'contracts.clear' | 'contracts.results' | 'contracts.noResults'
  | 'contracts.contractSaved' | 'contracts.errorSaving'
  | 'export.title' | 'export.description' | 'export.format' | 'export.csv' | 'export.json' | 'export.includeFiles'
  | 'export.dateRange' | 'export.allData' | 'export.customRange' | 'export.from' | 'export.to' | 'export.contractType_'
  | 'export.allTypes' | 'export.exportData' | 'export.exporting' | 'export.exported' | 'export.errorExporting'
  | 'contractTypes.pharmaceuticals' | 'contractTypes.medicalEquipment' | 'contractTypes.services'
  | 'contractTypes.construction' | 'contractTypes.consulting' | 'contractTypes.maintenance' | 'contractTypes.other'
  | 'nav.addContract' | 'nav.searchContracts' | 'nav.exportData' | 'nav.viewCalendar' | 'nav.settings'
  | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel' | 'common.save' | 'common.delete'
  | 'common.edit' | 'common.view' | 'common.search' | 'common.filter' | 'common.export' | 'common.import'
  | 'common.yes' | 'common.no' | 'common.confirm' | 'common.close'
  | 'language_support.multiLanguageReady' | 'language_support.translationSystemImplemented';

export const translations = {
  vi: viTranslations,
  en: enTranslations
};

export const supportedLanguages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', isDefault: true },
  { code: 'en', name: 'English', flag: '🇺🇸', isDefault: false }
];

export const defaultLanguage = 'vi'; 