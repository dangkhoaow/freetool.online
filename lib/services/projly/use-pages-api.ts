/**
 * React Query hooks for pages API
 * This uses the API client to communicate with backend API endpoints
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";

// Using relative import for api-client to avoid module resolution issues
import apiClient from "../../api-client";

// Log import paths for debugging
console.log('[use-pages-api] Importing useSession and apiClient');

// Types for pages functionality
export type Page = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status?: string;
  isPublished?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  publishedAt?: Date;
  templateId?: string;
  meta?: any;
  author?: any;
};

export type PageSection = {
  id: string;
  pageId: string;
  name: string;
  content: any;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PageTemplate = {
  id: string;
  name: string;
  description?: string;
  structure: any;
  createdAt: Date;
  updatedAt: Date;
};

export type PageRevision = {
  id: string;
  pageId: string;
  content: any;
  createdAt: Date;
  createdBy?: string;
  author?: any;
};

export type CreatePageParams = {
  title: string;
  slug: string;
  description?: string;
  status?: string;
  isPublished?: boolean;
  templateId?: string;
  meta?: any;
};

export type UpdatePageParams = Partial<Omit<CreatePageParams, 'slug'>> & {
  slug?: string;
  publishedAt?: Date;
};

export type PageSectionParams = {
  name: string;
  content: any;
  orderIndex: number;
};

export type PageTemplateParams = {
  name: string;
  description?: string;
  structure: any;
};

export type PageRevisionParams = {
  content: any;
};

// API response type
type ApiResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

/**
 * Hook to fetch all pages
 */
export function usePages() {
  const { data: session } = useSession();
  
  return useQuery<Page[]>({
    queryKey: ['pages'],
    queryFn: async () => {
      console.log('[usePages] Fetching all pages');
      const response = await apiClient.get<ApiResponse<Page[]>>('/api/pages');
      console.log('[usePages] Fetched pages:', response.data?.data?.length || 0);
      return response.data?.data || [];
    },
    enabled: !!session?.user
  });
}

/**
 * Hook to fetch a page by slug
 */
export function usePageBySlug(slug: string) {
  const { data: session } = useSession();
  
  return useQuery<Page | null>({
    queryKey: ['page', slug],
    queryFn: async () => {
      console.log('[usePageBySlug] Fetching page by slug:', slug);
      const response = await apiClient.get<ApiResponse<Page>>(`/api/pages/slug/${slug}`);
      console.log('[usePageBySlug] Fetched page:', response.data?.data?.id);
      return response.data?.data || null;
    },
    enabled: !!slug && !!session?.user
  });
}

/**
 * Hook to fetch a page by ID
 */
export function usePageById(id: string) {
  const { data: session } = useSession();
  
  return useQuery<Page | null>({
    queryKey: ['page', id],
    queryFn: async () => {
      console.log('[usePageById] Fetching page by id:', id);
      const response = await apiClient.get<ApiResponse<Page>>(`/api/pages/${id}`);
      console.log('[usePageById] Fetched page:', response.data?.data?.title);
      return response.data?.data || null;
    },
    enabled: !!id && !!session?.user
  });
}

/**
 * Hook to fetch page sections for a page
 */
export function usePageSections(pageId: string) {
  const { data: session } = useSession();
  
  return useQuery<PageSection[]>({
    queryKey: ['page-sections', pageId],
    queryFn: async () => {
      console.log('[usePageSections] Fetching page sections for page:', pageId);
      const response = await apiClient.get<ApiResponse<PageSection[]>>(`/api/pages/${pageId}/sections`);
      console.log('[usePageSections] Fetched sections:', response.data?.data?.length || 0);
      return response.data?.data || [];
    },
    enabled: !!pageId && !!session?.user
  });
}

/**
 * Hook to fetch all page templates
 */
export function usePageTemplates() {
  const { data: session } = useSession();
  
  return useQuery<PageTemplate[]>({
    queryKey: ['page-templates'],
    queryFn: async () => {
      console.log('[usePageTemplates] Fetching page templates');
      const response = await apiClient.get<ApiResponse<PageTemplate[]>>('/api/pages/templates/all');
      console.log('[usePageTemplates] Fetched templates:', response.data?.data?.length || 0);
      return response.data?.data || [];
    },
    enabled: !!session?.user
  });
}

/**
 * Hook to fetch revisions for a page
 */
export function usePageRevisions(pageId: string) {
  const { data: session } = useSession();
  
  return useQuery<PageRevision[]>({
    queryKey: ['page-revisions', pageId],
    queryFn: async () => {
      console.log('[usePageRevisions] Fetching page revisions for page:', pageId);
      const response = await apiClient.get<ApiResponse<PageRevision[]>>(`/api/pages/${pageId}/revisions`);
      console.log('[usePageRevisions] Fetched revisions:', response.data?.data?.length || 0);
      return response.data?.data || [];
    },
    enabled: !!pageId && !!session?.user
  });
}

/**
 * Hook to create a new page
 */
export function useCreatePage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<ApiResponse<Page>, Error, CreatePageParams>({
    mutationFn: async (params: CreatePageParams) => {
      console.log('[useCreatePage] Creating page with title:', params.title);
      const response = await apiClient.post<ApiResponse<Page>>('/api/pages', params);
      console.log('[useCreatePage] Create page response:', response.data);
      return response.data;
    },
    onSuccess: (result) => {
      console.log('[useCreatePage] Successfully created page, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      if (result?.data) {
        toast({
          title: "Page created",
          description: `"${result.data.title}" has been created successfully.`,
        });
      }
    },
    onError: (error: Error) => {
      console.error('[useCreatePage] Error creating page:', error);
      toast({
        variant: "destructive",
        title: "Failed to create page",
        description: error.message || "An error occurred while creating the page.",
      });
    },
  });
}

/**
 * Hook to update an existing page
 */
export function useUpdatePage(id: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<ApiResponse<Page>, Error, UpdatePageParams>({
    mutationFn: async (params: UpdatePageParams) => {
      console.log('[useUpdatePage] Updating page with ID:', id);
      const response = await apiClient.put<ApiResponse<Page>>(`/api/pages/${id}`, params);
      console.log('[useUpdatePage] Update page response:', response.data);
      return response.data;
    },
    onSuccess: (result) => {
      console.log('[useUpdatePage] Successfully updated page, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', id] });
      if (result?.data) {
        toast({
          title: "Page updated",
          description: `"${result.data.title}" has been updated successfully.`,
        });
      }
    },
    onError: (error: Error) => {
      console.error('[useUpdatePage] Error updating page:', error);
      toast({
        variant: "destructive",
        title: "Failed to update page",
        description: error.message || "An error occurred while updating the page.",
      });
    },
  });
}

/**
 * Hook to delete a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<ApiResponse<{ id: string }>, Error, string>({
    mutationFn: async (id: string) => {
      console.log('[useDeletePage] Deleting page with ID:', id);
      const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/api/pages/${id}`);
      console.log('[useDeletePage] Delete page response:', response.data);
      return response.data;
    },
    onSuccess: (result, variables) => {
      console.log('[useDeletePage] Successfully deleted page, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', variables] });
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('[useDeletePage] Error deleting page:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete page",
        description: error.message || "An error occurred while deleting the page.",
      });
    },
  });
}

/**
 * Hook to create a section for a page
 */
export function useCreatePageSection(pageId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<ApiResponse<PageSection>, Error, PageSectionParams>({
    mutationFn: async (params: PageSectionParams) => {
      console.log('[useCreatePageSection] Creating section for page ID:', pageId);
      const response = await apiClient.post<ApiResponse<PageSection>>(`/api/pages/${pageId}/sections`, params);
      console.log('[useCreatePageSection] Create section response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('[useCreatePageSection] Successfully created section, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageId] });
      toast({
        title: "Section created",
        description: "The section has been added to the page.",
      });
    },
    onError: (error: Error) => {
      console.error('[useCreatePageSection] Error creating section:', error);
      toast({
        variant: "destructive",
        title: "Failed to create section",
        description: error.message || "An error occurred while creating the section.",
      });
    },
  });
}

/**
 * Hook to create a page template
 */
export function useCreatePageTemplate() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<ApiResponse<PageTemplate>, Error, PageTemplateParams>({
    mutationFn: async (params: PageTemplateParams) => {
      console.log('[useCreatePageTemplate] Creating page template with name:', params.name);
      const response = await apiClient.post<ApiResponse<PageTemplate>>('/api/pages/templates', params);
      console.log('[useCreatePageTemplate] Create template response:', response.data);
      return response.data;
    },
    onSuccess: (result) => {
      console.log('[useCreatePageTemplate] Successfully created template, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['page-templates'] });
      if (result?.data) {
        toast({
          title: "Template created",
          description: `"${result.data.name}" template has been created.`,
        });
      }
    },
    onError: (error: Error) => {
      console.error('[useCreatePageTemplate] Error creating template:', error);
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: error.message || "An error occurred while creating the template.",
      });
    },
  });
}

/**
 * Hook to create a revision for a page
 */
export function useCreatePageRevision(pageId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<ApiResponse<PageRevision>, Error, PageRevisionParams>({
    mutationFn: async (params: PageRevisionParams) => {
      console.log('[useCreatePageRevision] Creating revision for page ID:', pageId);
      const response = await apiClient.post<ApiResponse<PageRevision>>(`/api/pages/${pageId}/revisions`, params);
      console.log('[useCreatePageRevision] Create revision response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('[useCreatePageRevision] Successfully created revision, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['page-revisions', pageId] });
      toast({
        title: "Revision saved",
        description: "A new revision has been saved for this page.",
      });
    },
    onError: (error: Error) => {
      console.error('[useCreatePageRevision] Error creating revision:', error);
      toast({
        variant: "destructive",
        title: "Failed to save revision",
        description: error.message || "An error occurred while saving the revision.",
      });
    },
  });
}

export default {
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
