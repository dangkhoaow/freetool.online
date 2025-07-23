// Vietnamese translations for Contract Management System
export const viTranslations = {
  // Authentication
  auth: {
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    email: 'Email',
    password: 'Mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    invalidCredentials: 'Email hoặc mật khẩu không đúng',
    loginRequired: 'Vui lòng đăng nhập để tiếp tục',
    welcome: 'Chào mừng',
    signIn: 'Đăng nhập vào hệ thống quản lý hợp đồng',
    enterCredentials: 'Nhập thông tin đăng nhập của bạn để truy cập',
    username: 'Tên đăng nhập',
    enterUsername: 'Nhập tên đăng nhập',
    enterPassword: 'Nhập mật khẩu',
    demoCredentials: 'Thông tin đăng nhập demo:',
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    user: 'Người dùng',
    viewer: 'Người xem',
    accessDashboard: 'Truy cập bảng điều khiển quản lý hợp đồng của bạn',
    authRequired: 'Vui lòng nhập tên đăng nhập và mật khẩu',
    signingIn: 'Đang đăng nhập...',
    
    // Sign Up
    signUp: 'Đăng ký',
    register: 'Đăng ký tài khoản',
    createAccount: 'Tạo tài khoản mới',
    registerDescription: 'Điền thông tin của bạn để tạo tài khoản',
    firstName: 'Họ',
    lastName: 'Tên',
    confirmPassword: 'Xác nhận mật khẩu',
    enterFirstName: 'Nhập họ của bạn',
    enterLastName: 'Nhập tên của bạn',
    enterEmail: 'Nhập địa chỉ email',
    enterConfirmPassword: 'Nhập lại mật khẩu',
    passwordMismatch: 'Mật khẩu xác nhận không khớp',
    accountCreated: 'Tài khoản đã được tạo thành công',
    alreadyHaveAccount: 'Đã có tài khoản?',
    
    // Forgot Password
    resetPassword: 'Đặt lại mật khẩu',
    forgotPasswordTitle: 'Quên mật khẩu',
    forgotPasswordDescription: 'Nhập email của bạn để nhận liên kết đặt lại mật khẩu',
    sendResetLink: 'Gửi liên kết đặt lại',
    resetLinkSent: 'Liên kết đặt lại mật khẩu đã được gửi',
    checkEmail: 'Vui lòng kiểm tra email của bạn để biết hướng dẫn đặt lại mật khẩu',
    backToLogin: 'Quay lại đăng nhập',
    emailNotFound: 'Không tìm thấy email này trong hệ thống',
    
    // Navigation
    dontHaveAccount: 'Chưa có tài khoản?',
    forgotPasswordLink: 'Quên mật khẩu?'
  },

  // Contract Management System
  cms: {
    title: 'Hệ thống Quản lý Hợp đồng',
    subtitle: 'FreeTool Online',
    professionalManagement: 'Quản lý Hợp đồng Chuyên nghiệp',
    description: 'Hệ thống quản lý hợp đồng và phụ lục toàn diện với nhập dữ liệu, lưu trữ tuần tự, khả năng tìm kiếm và chức năng xuất dữ liệu. Tổ chức hợp đồng theo tên công ty và số quyết định trúng thầu.'
  },

  // Features
  features: {
    sequentialStorage: {
      title: 'Hệ thống Lưu trữ Tuần tự',
      description: 'Tổ chức tự động với 10 hợp đồng mỗi đơn vị lưu trữ để quản lý tệp hiệu quả.'
    },
    advancedSearch: {
      title: 'Tìm kiếm & Lọc Nâng cao',
      description: 'Tìm hợp đồng theo tên công ty, số quyết định trúng thầu, loại và phạm vi ngày.'
    },
    comprehensiveAnalytics: {
      title: 'Phân tích Toàn diện',
      description: 'Bảng điều khiển với thống kê hợp đồng, sử dụng lưu trữ và khả năng xuất dữ liệu.'
    }
  },

  // Dashboard
  dashboard: {
    title: 'Quản lý hợp đồng',
    welcome: 'Xin chào',
    overview: 'Tổng quan',
    quickActions: 'Thao tác nhanh',
    totalContracts: 'Tổng số hợp đồng',
    totalValue: 'Tổng giá trị',
    storageUtilization: 'Sử dụng lưu trữ',
    upcomingExpirations: 'Sắp hết hạn',
    contractsByType: 'Hợp đồng theo loại',
    contractsByStatus: 'Hợp đồng theo trạng thái',
    recentContracts: 'Hợp đồng gần đây',
    active: 'đang hoạt động',
    average: 'Trung bình',
    of: 'trên',
    units: 'đơn vị',
    next30Days: 'trong 30 ngày tới',
    statistics: 'Thống kê',
    totalValue_: 'Tổng giá trị hợp đồng',
    averageValue: 'Giá trị trung bình',
    storageUnits: 'Đơn vị lưu trữ',
    utilizationRate: 'Tỷ lệ sử dụng',
    contractsThisMonth: 'Hợp đồng tháng này',
    newThisMonth: 'mới trong tháng',
    expiringContracts: 'Hợp đồng sắp hết hạn'
  },

  // Tabs
  tabs: {
    dashboard: 'Tổng quan',
    addContract: 'Thêm hợp đồng',
    search: 'Tìm kiếm',
    export: 'Xuất dữ liệu'
  },

  // Contracts
  contracts: {
    addNew: 'Thêm hợp đồng mới',
    addDescription: 'Nhập thông tin hợp đồng hoặc phụ lục mới vào hệ thống',
    searchTitle: 'Tìm kiếm và lọc hợp đồng',
    searchDescription: 'Tìm kiếm hợp đồng theo công ty, số quyết định trúng thầu và các tiêu chí khác',
    companyName: 'Tên công ty',
    contractNumber: 'Số hợp đồng/phụ lục',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    duration: 'Thời hạn (tháng)',
    value: 'Giá trị hợp đồng',
    bidDecisionNumber: 'Số quyết định trúng thầu',
    contractType: 'Loại hợp đồng',
    pdfFile: 'File PDF hợp đồng',
    save: 'Lưu hợp đồng',
    cancel: 'Hủy',
    required: 'Bắt buộc',
    selectFile: 'Chọn file',
    noFileSelected: 'Chưa chọn file',
    search: 'Tìm kiếm',
    clear: 'Xóa bộ lọc',
    results: 'Kết quả tìm kiếm',
    noResults: 'Không tìm thấy kết quả',
    contractSaved: 'Hợp đồng đã được lưu thành công',
    errorSaving: 'Lỗi khi lưu hợp đồng'
  },

  // Export
  export: {
    title: 'Xuất dữ liệu hợp đồng',
    description: 'Xuất dữ liệu hợp đồng theo định dạng CSV hoặc JSON',
    format: 'Định dạng',
    csv: 'CSV (Excel)',
    json: 'JSON',
    includeFiles: 'Bao gồm đường dẫn file',
    dateRange: 'Khoảng thời gian',
    allData: 'Tất cả dữ liệu',
    customRange: 'Tùy chọn khoảng thời gian',
    from: 'Từ ngày',
    to: 'Đến ngày',
    contractType_: 'Loại hợp đồng',
    allTypes: 'Tất cả loại',
    exportData: 'Xuất dữ liệu',
    exporting: 'Đang xuất...',
    exported: 'Đã xuất thành công',
    errorExporting: 'Lỗi khi xuất dữ liệu'
  },

  // Contract Types
  contractTypes: {
    pharmaceuticals: 'Dược phẩm',
    medicalEquipment: 'Thiết bị y tế',
    services: 'Dịch vụ',
    construction: 'Xây dựng',
    consulting: 'Tư vấn',
    maintenance: 'Bảo trì',
    other: 'Khác'
  },

  // Navigation
  nav: {
    addContract: 'Thêm hợp đồng',
    searchContracts: 'Tìm kiếm hợp đồng',
    exportData: 'Xuất dữ liệu',
    viewCalendar: 'Xem lịch',
    settings: 'Cài đặt'
  },

  // Common
  common: {
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    cancel: 'Hủy',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    view: 'Xem',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    export: 'Xuất',
    import: 'Nhập',
    yes: 'Có',
    no: 'Không',
    confirm: 'Xác nhận',
    close: 'Đóng'
  },

  // Language Support
  language_support: {
    multiLanguageReady: 'Hệ thống đa ngôn ngữ đã sẵn sàng',
    translationSystemImplemented: 'Hệ thống dịch thuật đã được triển khai hoàn chỉnh'
  }
}; 