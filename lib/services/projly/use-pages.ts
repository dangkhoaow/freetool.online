/**
 * Re-export from use-pages-api.ts for backward compatibility
 * This file maintains the same API as before but uses the new API client implementation
 */

import {
  usePages,
  usePageBySlug,
  usePageById,
  usePageSections,
  usePageTemplates,
  usePageRevisions,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  useCreatePageSection,
  useCreatePageTemplate,
  useCreatePageRevision,
  // Types
  Page,
  PageSection,
  PageTemplate,
  PageRevision,
  CreatePageParams,
  UpdatePageParams,
  PageSectionParams,
  PageTemplateParams,
  PageRevisionParams
} from './use-pages-api';

// Re-export everything

// Export functions
export {
  usePages,
  usePageBySlug,
  usePageById,
  usePageSections,
  usePageTemplates, 
  usePageRevisions,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  useCreatePageSection,
  useCreatePageTemplate,
  useCreatePageRevision
};

// Re-export types for components that need them using 'export type' syntax for isolatedModules
export type {
  Page,
  PageSection,
  PageTemplate,
  PageRevision,
  CreatePageParams,
  UpdatePageParams,
  PageSectionParams,
  PageTemplateParams,
  PageRevisionParams
};
