# Contract Management System

## Overview
A comprehensive Vietnamese pharmaceutical contract management system designed for healthcare organizations to manage contracts, storage units, and compliance tracking. The system supports multi-language functionality (Vietnamese/English) and features sequential physical storage organization.

## Project Structure

### Frontend (`freetool.online/app/contract-management/`)
```
contract-management/
├── components/           # React components
│   ├── contract-export.tsx      # Export functionality UI
│   ├── contract-form.tsx        # Contract creation/editing form
│   ├── contract-search.tsx      # Advanced search interface
│   ├── dashboard-overview.tsx   # Analytics dashboard
│   ├── language-switcher.tsx    # Internationalization
│   └── protected-route.tsx      # Authentication guard
├── contexts/
│   └── language-context.tsx     # I18n context provider
├── translations/         # Multi-language support
├── dashboard/           # Main dashboard page
├── login/, signup/      # Authentication pages
└── layout.tsx, page.tsx # Route components
```

### Backend Services (`service.freetool.online/`)
```
app/api/contract-management/
├── auth/               # Authentication endpoints
├── contracts/          # Contract CRUD operations
├── dashboard/          # Analytics and statistics
├── files/             # File upload management
├── exports/           # Data export functionality
└── storage-units/     # Storage management

lib/services/prisma/contract-management/
├── auth-dao.ts         # User authentication service
├── contract-dao.ts     # Contract database operations
├── audit-dao.ts        # Change tracking service
├── contract-file-dao.ts # File management service
├── export-job-dao.ts   # Export job processing
├── storage-unit-dao.ts # Storage unit management
└── system-setting-dao.ts # Configuration management
```

### Frontend Services (`freetool.online/lib/services/contract-management/`)
```
├── auth-service.ts     # Authentication client
├── contract-service.ts # Contract operations client
├── dashboard-service.ts # Dashboard data fetching
├── export-service.ts   # Export functionality
├── config.ts          # API configuration
├── types.ts           # TypeScript interfaces
└── index.ts           # Service exports
```

## Database Schema (`CtrMgmt` Models)

### Core Tables
- **`CtrMgmtUser`** - Isolated authentication system for contract management
- **`CtrMgmtContract`** - Main contracts with full business data
- **`CtrMgmtStorageUnit`** - Sequential physical storage (10 contracts per unit)
- **`CtrMgmtContractFile`** - File attachments with S3 integration
- **`CtrMgmtContractAudit`** - Complete change tracking
- **`CtrMgmtExportJob`** - Export job processing and tracking
- **`CtrMgmtSystemSetting`** - System configuration

### Key Features
- Sequential storage organization (contracts numbered 1-10 per storage unit)
- Comprehensive audit logging for all changes
- Multi-file support per contract with S3 storage
- Vietnamese currency support (VND with large number handling)
- Advanced search and filtering capabilities

## Current Development Status

### ✅ **Fully Implemented - Backend**
- **Database Schema**: Complete 7-table system with relationships and indexes
- **Authentication API**: Full JWT system with registration, login, email verification
- **Contract CRUD API**: Complete REST endpoints with validation and error handling
- **Dashboard Analytics API**: Real-time statistics and trend analysis
- **Audit System**: Comprehensive change tracking and logging
- **Storage Management**: Automatic unit assignment and sequential organization
- **Data Validation**: Input validation, business rule enforcement
- **Security**: JWT authentication, CORS handling, input sanitization

### ✅ **Fully Implemented - Frontend**
- **UI Components**: Complete form components with validation
- **Dashboard Interface**: Rich analytics with charts and statistics
- **Authentication Flow**: Login, registration, password reset, email verification
- **Internationalization**: Vietnamese/English language support
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Search Interface**: Advanced filtering and pagination
- **Export Interface**: CSV/JSON export options with filtering

### ✅ **Recently Completed (August 2025)**
- **Contract Service Integration**: 
  - ✅ All CRUD operations now use real API calls
  - ✅ Update contract operations integrated
  - ✅ Delete contract operations integrated
  - ✅ Search and filtering now use backend API
  - ✅ Storage unit operations integrated
- **File Upload System**: 
  - ✅ Backend API endpoint implemented (`/api/contract-management/files/upload`)
  - ✅ Frontend file upload integrated with contract creation/update
  - ✅ S3 storage integration complete
  - ✅ File validation and error handling
  - ✅ CORS support added to file upload endpoint
  - ✅ Multiple file upload support with expanded file types (PDF, DOC, XLS, images)
- **Contract Actions Interface**:
  - ✅ Dropdown menu interface implemented for contract actions (replaced individual buttons)
  - ✅ Contract detail popup with comprehensive information display and file download
  - ✅ Contract edit dialog with full form validation and API integration
  - ✅ Contract delete confirmation dialog with safety warnings
  - ✅ BigInt serialization fix for contract file data
  - ✅ Real-time data refresh after successful operations
- **File Management Enhancements**:
  - ✅ Secure file download API with proper CORS headers and Content-Disposition
  - ✅ File download functionality with loading indicators and original filename preservation
  - ✅ File deletion capability in edit contract dialog
  - ✅ Multiple file upload in edit contract dialog
  - ✅ Fixed Next.js async params compatibility issues
- **UI/UX Improvements**:
  - ✅ Added Notes column to contract search table
  - ✅ Implemented whitespace-nowrap styling for all table columns
  - ✅ Notes column max-width (200px) with ellipsis overflow
  - ✅ Auto-search functionality for all filter changes including "Clear Filters"
  - ✅ Fixed date input loading in edit contract dialog
  - ✅ Responsive search filter layout with improved Clear button positioning

### 🔴 **CRITICAL SECURITY ISSUE - IN PROGRESS**
- **User Data Isolation Implementation**: 
  - ✅ **S3 Structure Fixed**: Files now stored as `users/{userId}/contracts/{contractId}/files/`
  - ✅ **Contract List API**: Added userId filtering - users only see their contracts
  - ✅ **Contract Details API**: Added ownership verification before access
  - ✅ **Contract Update/Delete**: Added ownership verification before modification
  - ✅ **Dashboard API**: Statistics filtered by logged-in user only
  - ✅ **File Download API**: Created secure endpoint with ownership verification
  - ❌ **Storage Units API**: Still needs user-specific filtering
  - ❌ **Frontend Cleanup**: Remove mock data showing multiple users' contracts
  
**COMPLETED SECURITY MEASURES:**
1. ✅ **S3 Reorganization**: `users/{userId}/contracts/{contractId}/files/` structure implemented
2. ✅ **API Security**: userId filtering added to contract CRUD operations  
3. ✅ **File Access Control**: Ownership verification implemented for file downloads
4. 🔄 **Database Updates**: Most queries now filter by logged-in user (in progress)
  - ✅ Audit logging for file operations

### ⚠️ **Partially Implemented**
- **Export System**:
  - Backend export job tracking complete
  - Frontend export UI implemented
  - Missing: Real-time export status updates
- **Dashboard Data Integration**:
  - Backend statistics API complete
  - Frontend makes API calls for most data
  - Some components may still use mock data for UI previews

### ❌ **Currently Mocked (Needs Implementation)**
- **Real-time Updates**: Live data refresh mechanisms
- **Advanced File Management**: File versioning and bulk operations
- **Enhanced Analytics**: Advanced reporting and visualization

## Development Roadmap
### Priority 2 - Enhanced Features (Next Phase)
1. **Real-time Data Updates**
   - WebSocket integration for live data synchronization
   - Real-time export progress tracking
   - Live dashboard refreshing

2. **Advanced File Management**
   - File versioning and history tracking
   - Bulk file operations and management
   - File preview and download capabilities

3. **Enhance Export System**
   - Add real-time export job status tracking
   - Implement downloadable export files
   - Add export history and management

### Priority 2 - Advanced Features
1. **Search and Filtering Enhancement**
   - Implement advanced search with full-text capabilities
   - Add saved search filters
   - Implement search result caching

2. **Notification System**
   - Contract expiration alerts
   - Storage unit capacity warnings
   - System maintenance notifications

3. **Reporting Dashboard**
   - Advanced analytics with custom date ranges
   - Comparative analysis tools
   - Export reports to PDF/Excel

### Priority 3 - System Optimization
1. **Performance Improvements**
   - Database query optimization
   - Frontend component lazy loading
   - API response caching

2. **Security Enhancements**
   - Role-based access control
   - Audit log encryption
   - Advanced authentication options

3. **Scalability Preparations**
   - Database sharding strategies
   - CDN integration for file storage
   - Load balancing configuration

## Testing Strategy
- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user workflows
- **Security Tests**: Authentication and authorization

## Deployment
- **Frontend**: Vercel/Netlify deployment with Next.js
- **Backend**: AWS/Google Cloud with containerization
- **Database**: Managed PostgreSQL service
- **File Storage**: AWS S3 with CloudFront CDN

## Contributing
1. Follow existing code patterns and structure
2. Ensure all new features include proper error handling
3. Add comprehensive logging for debugging
4. Update this README with any architectural changes

---

**Last Updated**: August 16, 2025  
**Version**: 1.1.0-beta  
**Status**: Core Integration Complete - File Upload System Fully Implemented

## API Endpoints

### Authentication
- `POST /api/contract-management/auth/login` - User authentication
- `POST /api/contract-management/auth/register` - User registration
- `POST /api/contract-management/auth/verify-email` - Email verification
- `POST /api/contract-management/auth/resend-verification` - Resend verification
- `POST /api/contract-management/auth/logout` - Session logout

### Contracts
- `GET /api/contract-management/contracts` - Search and list contracts
- `POST /api/contract-management/contracts` - Create new contract

### Files
- `GET /api/contract-management/files/[id]` - Download file (secure with ownership verification)
- `POST /api/contract-management/files/upload` - Upload files to contract
- `DELETE /api/contract-management/files/[id]` - Delete file (with ownership verification)

### Storage Units
- `GET /api/contract-management/storage-units` - List available storage units
- `POST /api/contract-management/storage-units` - Create new storage unit

## Configuration

### Environment Variables
#### Backend (`service.freetool.online/.env`)
```bash
# Database
CONTRACT_MGMT_DATABASE_URL="postgresql://user:password@localhost:5432/contract_mgmt"

# JWT Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# AWS S3 (File Storage) - Required for file upload functionality
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="contract-files-bucket"
AWS_REGION="us-east-1"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourcompany.com"
```

**⚠️ Important**: AWS S3 credentials are required for the file upload system to function properly.

### Configuration

### Environment Variables

#### Backend (`service.freetool.online/.env`)
```bash
# Database
CONTRACT_MGMT_DATABASE_URL="postgresql://user:password@localhost:5432/contract_mgmt"

# JWT Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# AWS S3 (File Storage) - Required for file upload functionality
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="contract-files-bucket"
AWS_REGION="us-east-1"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourcompany.com"
```

**⚠️ Important**: AWS S3 credentials are required for the file upload system to function properly.

### API Configuration
- **Base URL**: Configurable via environment variables
- **CORS**: Enabled for cross-origin requests
- **Rate Limiting**: Configured for production use
- **Request Timeout**: 30 seconds default

## Development Roadmap
### Priority 2 - Enhanced Features (Next Phase)
1. **Real-time Data Updates**
   - WebSocket integration for live data synchronization
   - Real-time export progress tracking
   - Live dashboard refreshing

2. **Advanced File Management**
   - File versioning and history tracking
   - Bulk file operations and management
   - File preview and download capabilities

3. **Enhance Export System**
   - Add real-time export job status tracking
   - Implement downloadable export files
   - Add export history and management

### Priority 2 - Advanced Features
1. **Search and Filtering Enhancement**
   - Implement advanced search with full-text capabilities
   - Add saved search filters
   - Implement search result caching

2. **Notification System**
   - Contract expiration alerts
   - Storage unit capacity warnings
   - System maintenance notifications

3. **Reporting Dashboard**
   - Advanced analytics with custom date ranges
   - Comparative analysis tools
   - Export reports to PDF/Excel

### Priority 3 - System Optimization
1. **Performance Improvements**
   - Database query optimization
   - Frontend component lazy loading
   - API response caching

2. **Security Enhancements**
   - Role-based access control
   - Audit log encryption
   - Advanced authentication options

3. **Scalability Preparations**
   - Database sharding strategies
   - CDN integration for file storage
   - Load balancing configuration

## Testing Strategy
- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user workflows
- **Security Tests**: Authentication and authorization

## Deployment
- **Frontend**: Vercel/Netlify deployment with Next.js
- **Backend**: AWS/Google Cloud with containerization
- **Database**: Managed PostgreSQL service
- **File Storage**: AWS S3 with CloudFront CDN

## Contributing
1. Follow existing code patterns and structure
2. Ensure all new features include proper error handling
3. Add comprehensive logging for debugging
4. Update this README with any architectural changes

---

**Last Updated**: August 16, 2025  
**Version**: 1.0.0-beta  
**Status**: Development Phase - Core Backend Complete, Frontend Integration In Progress
