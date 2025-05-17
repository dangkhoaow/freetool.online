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
      if (!session?.user?.id) return [];
      const response = await apiClient.get<Page[]>("api/projly/pages");
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!session?.user?.id
  });
}

/**
 * Hook to fetch a page by slug
 */
export function usePageBySlug(slug: string) {
  const { data: session } = useSession();
  
  return useQuery<Page>({
    queryKey: ['page', slug],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const response = await apiClient.get<Page>(`api/projly/pages/slug/${slug}`);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Page not found");
      return response.data;
    },
    enabled: !!session?.user?.id && !!slug
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
      if (!session?.user?.id) return null;
      const response = await apiClient.get<Page>(`api/projly/pages/${id}`);
      if (response.error) throw new Error(response.error);
      return response.data || null;
    },
    enabled: !!session?.user?.id && !!id
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
      if (!session?.user?.id) return [];
      const response = await apiClient.get<PageSection[]>(`api/projly/pages/${pageId}/sections`);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!session?.user?.id && !!pageId
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
      if (!session?.user?.id) return [];
      const response = await apiClient.get<PageTemplate[]>("api/projly/pages/templates");
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!session?.user?.id
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
      if (!session?.user?.id) return [];
      const response = await apiClient.get<PageRevision[]>(`api/projly/pages/${pageId}/revisions`);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!session?.user?.id && !!pageId
  });
}

/**
 * Hook to create a new page
 */
export function useCreatePage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  return useMutation<Page, Error, CreatePageParams>({
    mutationFn: async (pageData) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      const response = await apiClient.post<Page>('api/projly/pages', pageData);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to create page');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
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
  
  return useMutation<boolean, Error, string>({
    mutationFn: async (pageId) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      const response = await apiClient.delete<boolean>(`api/projly/pages/${pageId}`);
      if (response.error) throw new Error(response.error);
      return response.data !== undefined ? response.data : false;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Page deleted successfully',
        variant: 'default',
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
  
  return useMutation<PageSection, Error, { pageId: string; sectionData: PageSectionParams }>({
    mutationFn: async ({ pageId, sectionData }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      const response = await apiClient.post<PageSection>(
        `api/projly/pages/${pageId}/sections`,
        sectionData
      );
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to create section');
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
  
  return useMutation<PageTemplate, Error, PageTemplateParams>({
    mutationFn: async (templateData) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      const response = await apiClient.post<PageTemplate>(
        'api/projly/pages/templates',
        templateData
      );
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to create template');
      return response.data;
    },
    onSuccess: (result) => {
      console.log('[useCreatePageTemplate] Successfully created template, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['page-templates'] });
      if (result) {
        toast({
          title: "Template created",
          description: `"${result.name}" template has been created.`,
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
  
  return useMutation<PageRevision, Error, { pageId: string; revisionData: PageRevisionParams }>({
    mutationFn: async ({ pageId, revisionData }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      const response = await apiClient.post<PageRevision>(
        `api/projly/pages/${pageId}/revisions`,
        revisionData
      );
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to create revision');
      return response.data;
    },
    onSuccess: (_, { pageId }) => {
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
