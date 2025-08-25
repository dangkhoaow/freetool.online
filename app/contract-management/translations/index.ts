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
  | 'auth.emailVerificationRequired' | 'auth.emailVerificationDescription' | 'auth.emailAddress' | 'auth.enterEmailAddress'
  | 'auth.sendVerificationEmail' | 'auth.sending' | 'auth.sendingEmail' | 'auth.verificationEmailSent'
  | 'auth.networkError' | 'auth.pleaseEnterEmail' | 'auth.resendEmailVerification'
  | 'auth.resendVerificationTitle' | 'auth.resendVerificationDescription' | 'auth.dontHaveAccountSignUp' | 'auth.signUpLink'
  | 'auth.whatsNext' | 'auth.checkEmailInbox' | 'auth.checkSpamFolder' | 'auth.clickVerificationLink' | 'auth.returnToLogin'
  | 'auth.troubleSupport' | 'auth.dontRememberEmail' | 'auth.unexpectedError' | 'auth.failedSendVerification' | 'auth.enterEmailToResend'
  | 'auth.verifyingEmail' | 'auth.emailVerified' | 'auth.verificationFailed' | 'auth.pleaseWaitVerifying' | 'auth.emailSuccessfullyVerified'
  | 'auth.issueVerifyingEmail' | 'auth.emailVerifiedSuccessfully' | 'auth.emailVerificationFailedGeneric' | 'auth.networkErrorDuringVerification'
  | 'auth.verificationTokenMissing' | 'auth.canNowLogin' | 'auth.continueToLogin' | 'auth.thisCouldHappen' | 'auth.linkExpired'
  | 'auth.linkAlreadyUsed' | 'auth.linkInvalidCorrupted' | 'auth.trySigningUpAgain' | 'auth.needHelpQuestion' | 'auth.contactSupport'
  | 'cms.title' | 'cms.subtitle' | 'cms.professionalManagement' | 'cms.description'
  | 'features.sequentialStorage.title' | 'features.sequentialStorage.description'
  | 'features.advancedSearch.title' | 'features.advancedSearch.description'
  | 'features.comprehensiveAnalytics.title' | 'features.comprehensiveAnalytics.description'
  | 'dashboard.title' | 'dashboard.welcome' | 'dashboard.overview' | 'dashboard.quickActions' 
  | 'dashboard.totalContracts' | 'dashboard.totalValue' | 'dashboard.storageUtilization' | 'dashboard.physicalStorageUsage' | 'dashboard.upcomingExpirations'
  | 'dashboard.contractsByType' | 'dashboard.contractsByStatus' | 'dashboard.recentContracts' | 'dashboard.active'
  | 'dashboard.average' | 'dashboard.of' | 'dashboard.units' | 'dashboard.next30Days' | 'dashboard.statistics'
  | 'dashboard.totalValue_' | 'dashboard.averageValue' | 'dashboard.storageUnits' | 'dashboard.utilizationRate'
  | 'dashboard.contractsThisMonth' | 'dashboard.newThisMonth' | 'dashboard.expiringContracts' | 'dashboard.contractsUsingSeparateStorage'
  | 'dashboard.unableToLoad' | 'dashboard.monthlyTrend' | 'dashboard.contractsLabel' | 'dashboard.noExpiringNext30Days' | 'dashboard.moreExpiring'
  | 'tabs.dashboard' | 'tabs.addContract' | 'tabs.search' | 'tabs.export'
  | 'contracts.addNew' | 'contracts.addDescription' | 'contracts.searchTitle' | 'contracts.searchDescription'
  | 'contracts.companyName' | 'contracts.contractNumber' | 'contracts.contractNumberAppendix' | 'contracts.phisicalStorageUnit' | 'contracts.startDate' | 'contracts.endDate'
  | 'contracts.duration' | 'contracts.value' | 'contracts.bidDecisionNumber' | 'contracts.contractType'
  | 'contracts.pdfFile' | 'contracts.save' | 'contracts.cancel' | 'contracts.required' | 'contracts.selectFile'
  | 'contracts.noFileSelected' | 'contracts.search' | 'contracts.clear' | 'contracts.results' | 'contracts.noResults'
  | 'contracts.contractSaved' | 'contracts.errorSaving'
  | 'contracts.searchCompanyPlaceholder' | 'contracts.searchBidNumberPlaceholder' | 'contracts.allTypes' | 'contracts.allStatuses'
  | 'contracts.searchResults' | 'contracts.showHideColumns' | 'contracts.columns'
  | 'contracts.editContract' | 'contracts.selectContractType' | 'contracts.selectContractStatus' | 'contracts.enterNotes' | 'contracts.updateContract'
  | 'contracts.enterCompanyFilter' | 'contracts.enterContractNumber' | 'contracts.enterBidDecision' | 'contracts.minValue' | 'contracts.maxValue' | 'contracts.enterStorageUnit'
  | 'contracts.enterContractNumberAppendix' | 'contracts.enterPhisicalStorageUnit' | 'contracts.physicalStorageLocation'
  | 'contracts.items' | 'contracts.allCompanies' | 'contracts.selectCompany'
  | 'export.title' | 'export.description' | 'export.format' | 'export.csv' | 'export.json' | 'export.includeFiles'
  | 'export.dateRange' | 'export.allData' | 'export.customRange' | 'export.from' | 'export.to' | 'export.contractType_'
  | 'export.allTypes' | 'export.exportData' | 'export.exporting' | 'export.exported' | 'export.errorExporting'
  | 'export.tabExport' | 'export.tabImport' | 'export.info' | 'export.activeFilters' | 'export.downloadAgain'
  | 'export.formatInfoCsv1' | 'export.formatInfoCsv2' | 'export.formatInfoCsv3'
  | 'export.formatInfoJson1' | 'export.formatInfoJson2' | 'export.formatInfoJson3'
  | 'export.fileLabel' | 'export.sizeLabel' | 'export.recordsLabel' | 'export.exportedAtLabel'
  | 'contractTypes.pharmaceuticals' | 'contractTypes.orientalMedicine' | 'contractTypes.medicalEquipment' | 'contractTypes.vaccines'
  | 'contractTypes.biological' | 'contractTypes.lao' | 'contractTypes.arv' | 'contractTypes.chemical'
  | 'contractTypes.services' | 'contractTypes.construction' | 'contractTypes.consulting' | 'contractTypes.maintenance' | 'contractTypes.other'
  | 'contractStatus.active' | 'contractStatus.expired' | 'contractStatus.pending' | 'contractStatus.cancelled' | 'contractStatus.draft'
  | 'nav.addContract' | 'nav.searchContracts' | 'nav.exportData' | 'nav.viewCalendar' | 'nav.settings'
  | 'nav.profile'
  | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel' | 'common.save' | 'common.delete'
  | 'common.edit' | 'common.view' | 'common.search' | 'common.filter' | 'common.export' | 'common.import'
  | 'common.create' | 'common.selectedFiles' | 'common.saving'
  | 'common.yes' | 'common.no' | 'common.confirm' | 'common.close' | 'common.notes' | 'common.files' | 'common.status' | 'common.storage'
  | 'common.showing' | 'common.to' | 'common.of' | 'common.previous' | 'common.next' | 'common.days' | 'common.actions'
  | 'import.title' | 'import.formatLabel' | 'import.selectFile' | 'import.importing' | 'import.cta' | 'import.guidelines'
  | 'import.selectFileRequired' | 'import.invalidFileType' | 'import.fileTooLarge' | 'import.failed' | 'import.errorImporting'
  | 'import.successTitle' | 'import.totalRecords' | 'import.successCount' | 'import.failureCount' | 'import.duplicates'
  | 'import.errorsTitle' | 'import.row' | 'import.selected'
  | 'import.guidelinesCsv1' | 'import.guidelinesCsv2' | 'import.guidelinesCsv3' | 'import.guidelinesCsv4'
  | 'import.guidelinesJson1' | 'import.guidelinesJson2' | 'import.guidelinesJson3' | 'import.guidelinesJson4'
  | 'contracts.endDateAfterStart' | 'contracts.enterOrSelectCompany' | 'contracts.selectOptionOrCreate' | 'contracts.noOtherCompanies'
  | 'contracts.enterContractAddendumNumber' | 'contracts.enterContractValue' | 'contracts.uploadFilesOptional'
  | 'contracts.noFilesSelectedInfo' | 'contracts.supportedFormatsList' | 'contracts.fileLimits'
  | 'contracts.notesOptional' | 'contracts.fileTooLarge' | 'contracts.maxFiles' | 'contracts.invalidFileType' | 'contracts.enterWinningBidDecisionNumber'
  | 'contracts.detailsTitle' | 'contracts.contractInformation' | 'contracts.financialDetails' | 'contracts.timeline' | 'contracts.storageLocation'
  | 'contracts.unit' | 'contracts.position' | 'contracts.contractFiles' | 'contracts.created' | 'contracts.errorLoadingDetails'
  | 'contracts.downloadFailed' | 'contracts.errorDownloadingFile'
  | 'common.download' | 'common.downloading' | 'common.kb'
  | 'language_support.multiLanguageReady' | 'language_support.translationSystemImplemented'
  | 'footer.copyright';

export const translations = {
  vi: viTranslations,
  en: enTranslations
};

export const supportedLanguages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', isDefault: true },
  { code: 'en', name: 'English', flag: '🇺🇸', isDefault: false }
];

export const defaultLanguage = 'vi'; 