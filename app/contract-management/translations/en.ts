// English translations for Contract Management System
export const enTranslations = {
  // Authentication
  auth: {
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    invalidCredentials: 'Invalid email or password',
    loginRequired: 'Please login to continue',
    welcome: 'Welcome',
    signIn: 'Sign in',
    enterCredentials: 'Enter your credentials to access the system',
    username: 'Username',
    enterUsername: 'Enter your username',
    enterPassword: 'Enter your password',
    accessDashboard: 'Access your contract management dashboard',
    authRequired: 'Please enter both username and password',
    signingIn: 'Signing in...',
    
    // Sign Up
    signUp: 'Sign Up',
    register: 'Register Account',
    createAccount: 'Create New Account',
    registerDescription: 'Fill in your information to create an account',
    firstName: 'First Name',
    lastName: 'Last Name',
    confirmPassword: 'Confirm Password',
    enterFirstName: 'Enter your first name',
    enterLastName: 'Enter your last name',
    enterEmail: 'Enter your email address',
    enterConfirmPassword: 'Re-enter your password',
    passwordMismatch: 'Passwords do not match',
    accountCreated: 'Account created successfully',
    alreadyHaveAccount: 'Already have an account?',
    
    // Forgot Password
    resetPassword: 'Reset Password',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordDescription: 'Enter your email to receive a password reset link',
    sendResetLink: 'Send Reset Link',
    resetLinkSent: 'Password reset link sent',
    checkEmail: 'Please check your email for password reset instructions',
    emailNotFound: 'Email not found in our system',
    
    // Navigation
    dontHaveAccount: "Don't have an account?",
    forgotPasswordLink: 'Forgot your password?',
    backToLogin: 'Back to Login',
    
    // Email Verification
    emailVerificationRequired: 'Email Verification Required',
    emailVerificationDescription: 'Your account needs email verification before you can log in. Enter your email address to receive a new verification link.',
    emailAddress: 'Email Address',
    enterEmailAddress: 'Enter your email address',
    sendVerificationEmail: 'Send Verification Email',
    sending: 'Sending...',
    sendingEmail: 'Sending Email...',
    verificationEmailSent: 'Verification email sent successfully! Please check your inbox.',
    networkError: 'Network error. Please try again.',
    pleaseEnterEmail: 'Please enter your email address',
    resendEmailVerification: 'Resend Email Verification',
    
    // Resend Verification Page
    resendVerificationTitle: 'Resend Verification Email',
    resendVerificationDescription: 'Enter your email address to receive a new verification link',
    dontHaveAccountSignUp: "Don't have an account?",
    signUpLink: 'Sign Up',
    
    // Success Messages
    whatsNext: "What's Next?",
    checkEmailInbox: '• Check your email inbox for the verification link',
    checkSpamFolder: "• Don't forget to check your spam/junk folder",
    clickVerificationLink: '• Click the verification link to activate your account',
    returnToLogin: '• Return to the login page to access your account',
    
    // Help Text
    troubleSupport: 'Still having trouble? Contact our support team for assistance.',
    dontRememberEmail: "Don't remember your email? Contact your system administrator for assistance.",
    
    // Loading States
    unexpectedError: 'An unexpected error occurred',
    failedSendVerification: 'Failed to send verification email. Please try again.',
    enterEmailToResend: 'Please enter your email address to resend verification',
    
    // Email Verification Page
    verifyingEmail: 'Verifying Email...',
    emailVerified: 'Email Verified',
    verificationFailed: 'Verification Failed',
    pleaseWaitVerifying: 'Please wait while we verify your email address',
    emailSuccessfullyVerified: 'Your email has been successfully verified',
    issueVerifyingEmail: 'There was an issue verifying your email',
    emailVerifiedSuccessfully: 'Email verified successfully',
    emailVerificationFailedGeneric: 'Email verification failed',
    networkErrorDuringVerification: 'Network error during verification',
    verificationTokenMissing: 'Verification token is missing',
    canNowLogin: 'You can now log in to your account and start managing contracts.',
    continueToLogin: 'Continue to Login',
    thisCouldHappen: 'This could happen if:',
    linkExpired: '• The verification link has expired',
    linkAlreadyUsed: '• The link has already been used',
    linkInvalidCorrupted: '• The link is invalid or corrupted',
    trySigningUpAgain: 'Try Signing Up Again',
    needHelpQuestion: 'Need help?',
    contactSupport: 'Contact Support'
  },

  // Contract Management System
  cms: {
    title: 'Contract Management System',
    subtitle: 'FreeTool Online',
    professionalManagement: 'Professional Contract Management',
    description: 'Comprehensive contract and addendum management system with data entry, sequential storage, search capabilities, and export functionality. Organize contracts by company name and winning bid decision number.'
  },

  // Features
  features: {
    sequentialStorage: {
      title: 'Sequential Storage System',
      description: 'Automatic organization with 10 contracts per storage unit for efficient file management.'
    },
    advancedSearch: {
      title: 'Advanced Search & Filtering',
      description: 'Find contracts by company name, bid decision number, type, and date ranges.'
    },
    comprehensiveAnalytics: {
      title: 'Comprehensive Analytics',
      description: 'Dashboard with contract statistics, storage utilization, and export capabilities.'
    }
  },

  // Dashboard
  dashboard: {
    title: 'Contract Management',
    welcome: 'Hello',
    overview: 'Overview',
    quickActions: 'Quick Actions',
    totalContracts: 'Total Contracts',
    totalValue: 'Total Value',
    storageUtilization: 'Storage Utilization',
    upcomingExpirations: 'Upcoming Expirations',
    contractsByType: 'Contracts by Type',
    contractsByStatus: 'Contracts by Status',
    monthlyTrend: 'Monthly Trend',
    recentContracts: 'Recent Contracts',
    active: 'active',
    average: 'Average',
    of: 'of',
    units: 'units',
    next30Days: 'in next 30 days',
    statistics: 'Statistics',
    totalValue_: 'Total Contract Value',
    averageValue: 'Average Value',
    storageUnits: 'Storage Units',
    utilizationRate: 'Utilization Rate',
    contractsThisMonth: 'Contracts This Month',
    newThisMonth: 'new this month',
    expiringContracts: 'Expiring Contracts',
    unableToLoad: 'Unable to load dashboard data',
    contractsLabel: 'contracts',
    noExpiringNext30Days: 'No contracts expiring in the next 30 days',
    moreExpiring: 'more expiring'
  },

  // Tabs
  tabs: {
    dashboard: 'Dashboard',
    addContract: 'Add Contract',
    search: 'Search',
    export: 'Export/Import'
  },

  // Contracts
  contracts: {
    addNew: 'Add New Contract',
    addDescription: 'Enter information for a new contract or addendum',
    searchTitle: 'Search and Filter Contracts',
    searchDescription: 'Find contracts by company, bid decision number, and other criteria',
    companyName: 'Company Name',
    contractNumber: 'Contract Number',
    contractNumberAppendix: 'Contract Appendix Number',
    phisicalStorageUnit: 'Physical Storage Location',
    startDate: 'Start Date',
    endDate: 'End Date',
    duration: 'Duration (months)',
    value: 'Contract Value',
    bidDecisionNumber: 'Winning Bid Decision Number',
    contractType: 'Contract Type',
    pdfFile: 'Contract PDF File',
    save: 'Save Contract',
    cancel: 'Cancel',
    required: 'Required',
    selectFile: 'Select file',
    noFileSelected: 'No file selected',
    search: 'Search',
    clear: 'Clear filters',
    results: 'Search Results',
    noResults: 'No results found',
    contractSaved: 'Contract saved successfully',
    errorSaving: 'Error saving contract',
    // Search placeholders
    searchCompanyPlaceholder: 'Search company name...',
    searchBidNumberPlaceholder: 'Search bid decision number...',
    allTypes: 'All types',
    allStatuses: 'All statuses',
    // Table and UI
    searchResults: 'Search Results',
    showHideColumns: 'Show/Hide Columns',
    columns: 'Columns',
    // Edit dialog
    editContract: 'Edit Contract',
    selectContractType: 'Select contract type',
    selectContractStatus: 'Select contract status',
    enterNotes: 'Enter additional notes...',
    updateContract: 'Update Contract',
    // Export placeholders
    enterCompanyFilter: 'Enter company name to filter...',
    enterContractNumber: 'Enter contract number to filter...',
    enterBidDecision: 'Enter bid decision to filter...',
    minValue: 'Minimum value',
    maxValue: 'Maximum value',
    enterStorageUnit: 'Enter storage unit code...',
    enterContractNumberAppendix: 'Enter contract appendix number',
    enterPhisicalStorageUnit: 'Enter physical storage location',
    physicalStorageLocation: 'Physical Storage Location',
    items: 'contracts',
    allCompanies: 'All companies',
    selectCompany: 'Select a company',
    // Form placeholders and messages
    endDateAfterStart: 'End date must be after start date',
    enterOrSelectCompany: 'Enter or select company name',
    selectOptionOrCreate: 'Select an option or create one',
    noOtherCompanies: 'No other companies found',
    enterContractAddendumNumber: 'Enter contract/addendum number',
    enterContractValue: 'Enter contract value',
    uploadFilesOptional: 'Upload Files (Optional)',
    noFilesSelectedInfo: 'No files selected. Supported formats:',
    supportedFormatsList: 'PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text (.txt, .csv), Images (.jpg, .png, .gif, .bmp, .webp, .svg)',
    fileLimits: 'Max 10 files, 25MB per file',
    notesOptional: 'Notes (Optional)',
    fileTooLarge: 'File exceeds size limit (25MB)',
    maxFiles: 'Maximum 10 files can be uploaded at once',
    invalidFileType: 'Invalid file type',
    enterWinningBidDecisionNumber: 'Enter winning bid decision number',
    // Details dialog
    detailsTitle: 'Contract Details',
    contractInformation: 'Contract Information',
    financialDetails: 'Financial Details',
    timeline: 'Timeline',
    storageLocation: 'Storage Location',
    unit: 'Unit',
    position: 'Position',
    contractFiles: 'Contract Files',
    created: 'Created',
    errorLoadingDetails: 'Failed to load contract details',
    downloadFailed: 'Download failed',
    errorDownloadingFile: 'Error downloading file'
  },

  // Export
  export: {
    title: 'Export Contract Data',
    description: 'Export contract data in CSV or JSON format',
    format: 'Format',
    csv: 'CSV (Excel)',
    json: 'JSON',
    includeFiles: 'Include file paths',
    dateRange: 'Date Range',
    allData: 'All Data',
    customRange: 'Custom Range',
    from: 'From',
    to: 'To',
    contractType_: 'Contract Type',
    allTypes: 'All Types',
    exportData: 'Export Data',
    exporting: 'Exporting...',
    exported: 'Export completed successfully',
    errorExporting: 'Error exporting data',
    tabExport: 'Export Contracts',
    tabImport: 'Import Contracts',
    info: 'Export Information',
    activeFilters: 'Active filters:',
    downloadAgain: 'Download Again',
    // Format info bullets
    formatInfoCsv1: '• CSV files can be opened in Excel',
    formatInfoCsv2: '• Compatible with spreadsheet applications',
    formatInfoCsv3: '• Best for data analysis and reporting',
    formatInfoJson1: '• JSON format for programmatic access',
    formatInfoJson2: '• Includes complete data structure',
    formatInfoJson3: '• Best for API integrations',
    // Export result labels
    fileLabel: 'File:',
    sizeLabel: 'Size:',
    recordsLabel: 'Records:',
    exportedAtLabel: 'Exported:'
  },

  // Import
  import: {
    title: 'Import Contracts',
    formatLabel: 'Import Format',
    selectFile: 'Select File',
    importing: 'Importing...',
    cta: 'Import Contracts',
    guidelines: 'Import Guidelines:',
    selectFileRequired: 'Please select a file to import',
    invalidFileType: 'Invalid file type',
    fileTooLarge: 'File size must not exceed 10MB',
    failed: 'Import failed',
    errorImporting: 'Error importing data',
    // Import result labels
    successTitle: 'Import Completed Successfully!',
    totalRecords: 'Total records processed:',
    successCount: 'Successfully imported:',
    failureCount: 'Failed records:',
    duplicates: 'Duplicates skipped:',
    errorsTitle: 'Import Errors:',
    row: 'Row',
    selected: 'Selected:',
    // Guidelines bullets
    guidelinesCsv1: '• CSV file should have headers: companyName, contractNumber, contractStartDate, contractEndDate, contractValue, etc.',
    guidelinesCsv2: '• Date format: YYYY-MM-DD or DD/MM/YYYY',
    guidelinesCsv3: '• Contract values should be numbers without currency symbols',
    guidelinesCsv4: '• Maximum file size: 10MB',
    guidelinesJson1: '• JSON file should contain an array of contract objects',
    guidelinesJson2: '• Each contract should have required fields: companyName, contractNumber, etc.',
    guidelinesJson3: '• Date format: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
    guidelinesJson4: '• Maximum file size: 10MB'
  },

  // Contract Types
  contractTypes: {
    pharmaceuticals: 'Pharmaceuticals',
    orientalMedicine: 'Oriental Medicine',
    medicalEquipment: 'Medical Equipment',
    medicalequipment: 'Medical Equipment',
    vaccines: 'Vaccines',
    biological: 'Biological',
    lao: 'Lao',
    arv: 'ARV',
    chemical: 'Chemical',
    services: 'Services',
    construction: 'Construction',
    consulting: 'Consulting',
    maintenance: 'Maintenance',
    other: 'Other'
  },

  // Contract Status
  contractStatus: {
    active: 'Active',
    expired: 'Expired',
    pending: 'Pending',
    cancelled: 'Cancelled',
    draft: 'Draft'
  },

  // Navigation
  nav: {
    addContract: 'Add Contract',
    searchContracts: 'Search Contracts',
    exportData: 'Export Data',
    viewCalendar: 'View Calendar',
    settings: 'Settings',
    profile: 'Profile'
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    create: 'Create',
    selectedFiles: 'Selected files',
    saving: 'Saving...',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    close: 'Close',
    notes: 'Notes',
    files: 'Files',
    status: 'Status',
    storage: 'Storage',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    days: 'days',
    actions: 'Actions',
    download: 'Download',
    downloading: 'Downloading...',
    kb: 'KB'
  },

  // Profile
  profile: {
    title: 'Profile',
    subtitle: 'Manage your account settings',
    backToDashboard: 'Back to Dashboard',
    accountInformation: 'Account Information',
    name: 'Name',
    email: 'Email',
    username: 'Username',
    system: 'System',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    enterCurrentPassword: 'Enter your current password',
    enterNewPassword: 'Enter your new password',
    confirmNewPasswordPlaceholder: 'Confirm your new password',
    passwordRequirements: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    changing: 'Changing...',
    passwordChangedSuccess: 'Password changed successfully!',
    // Validation messages
    currentPasswordRequired: 'Current password is required',
    newPasswordRequired: 'New password is required',
    confirmPasswordRequired: 'Please confirm your new password',
    passwordsDoNotMatch: 'Passwords do not match',
    newPasswordMustBeDifferent: 'New password must be different from current password',
    passwordChangeError: 'An error occurred while changing password',
    passwordChangeFailure: 'Failed to change password',
    // Password validation
    passwordMinLength: 'At least 8 characters long',
    passwordUppercase: 'At least one uppercase letter',
    passwordLowercase: 'At least one lowercase letter',
    passwordNumber: 'At least one number',
    passwordMustHave: 'Password must have'
  },

  // Language Support
  language_support: {
    multiLanguageReady: 'Multi-language system ready',
    translationSystemImplemented: 'Translation system fully implemented'
  }
}; 