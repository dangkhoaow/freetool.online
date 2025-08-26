import { useQuery } from "@tanstack/react-query";
import { useSession } from "./jwt-auth-adapter";
import { toast } from "@/components/ui/use-toast";
import { API_ENDPOINTS } from "@/app/projly/config/apiConfig";

// Define a simple client for API calls
const projlyClient = {
  async get(endpoint: string) {
    console.log(`[PROJLY_CLIENT] Making GET request to: ${endpoint}`);
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH.ME.split('/auth/me')[0]}/${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PROJLY_CLIENT] Error response (${response.status}):`, errorText);
        throw new Error(errorText || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log(`[PROJLY_CLIENT] Successful response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`[PROJLY_CLIENT] Request failed for ${endpoint}:`, error);
      throw error;
    }
  }
};

// Log initialization of hook for debugging
console.log('[HOOK] use-analytics hook initialized');

// Log detailed information for debugging
const logAnalytics = (message: string, data?: any) => {
  console.log(`[ANALYTICS] ${message}`, data ? data : '', 'at', new Date().toISOString());
};

// Helper function to transform backend data to chart format
const transformToChartData = (data: any[], nameKey: string, valueKey: string) => {
  console.log(`[ANALYTICS] Transforming data with keys: nameKey=${nameKey}, valueKey=${valueKey}`, data);
  
  if (!data || !Array.isArray(data)) {
    console.log('[ANALYTICS] Invalid data for transformation:', data);
    return [];
  }
  
  const transformedData = data.map(item => {
    if (!item || typeof item !== 'object') {
      console.log('[ANALYTICS] Invalid item in data:', item);
      return { name: 'Unknown', value: 0 };
    }
    
    const name = String(item[nameKey] || 'Unknown');
    const value = typeof item[valueKey] === 'number' ? item[valueKey] : 0;
    
    console.log(`[ANALYTICS] Transforming item: ${nameKey}=${name}, ${valueKey}=${value}`);
    return { name, value };
  });

  console.log('[ANALYTICS] Transformed data:', transformedData);
  return transformedData;
};

// Task status analytics
export function useTaskStatusAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching task status analytics");
  
  return useQuery({
    queryKey: ["analytics", "tasks", "status", userId],
    queryFn: async () => {
      logAnalytics("Executing task status analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for task status analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/task-status');
        logAnalytics("Task status analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch task status analytics');
        }
        
        // Transform the data to match the chart format
        const transformedData = transformToChartData(response.data || [], 'status', 'count');
        logAnalytics("Transformed task status data:", transformedData);
        return transformedData;
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching task status analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch task analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Task due date analytics (overdue vs on-time)
export function useTaskDueDateAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching task due date analytics");
  
  return useQuery({
    queryKey: ["analytics", "tasks", "due-date", userId],
    queryFn: async () => {
      logAnalytics("Executing task due date analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for task due date analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/task-due-date');
        logAnalytics("Task due date analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch task due date analytics');
        }
        
        // Transform the data to match the chart format
        const transformedData = transformToChartData(response.data || [], 'period', 'count');
        logAnalytics("Transformed task due date data:", transformedData);
        return transformedData;
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching task due date analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch task due date analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Project status analytics
export function useProjectStatusAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching project status analytics");
  
  return useQuery({
    queryKey: ["analytics", "projects", "status", userId],
    queryFn: async () => {
      logAnalytics("Executing project status analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for project status analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/project-status');
        logAnalytics("Project status analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch project status analytics');
        }
        
        // Transform the data to match the chart format
        const transformedData = transformToChartData(response.data || [], 'status', 'count');
        logAnalytics("Transformed project status data:", transformedData);
        return transformedData;
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching project status analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch project analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Resources analytics - analyze resource types and allocation
export const useResourcesAnalytics = () => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['analytics', 'resources'],
    queryFn: async () => {
      logAnalytics('Fetching resources analytics data');
      const data = await projlyClient.get('api/projly/analytics/resources');
      logAnalytics('Resources analytics data received:', data);
      return data;
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

// Hook for team member roles analytics
export const useTeamMemberRolesAnalytics = () => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['analytics', 'team-member-roles'],
    queryFn: async () => {
      logAnalytics('Fetching team member roles analytics data');
      const data = await projlyClient.get('analytics/team-member-roles');
      logAnalytics('Team member roles analytics data received:', data);
      return data;
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

// Team task distribution analytics - analyze how tasks are distributed among team members
export function useTeamTaskDistributionAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching team task distribution analytics");
  
  return useQuery({
    queryKey: ["analytics", "tasks", "team-distribution", userId],
    queryFn: async () => {
      logAnalytics("Executing team task distribution analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for team task distribution analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/team-task-distribution');
        logAnalytics("Team task distribution analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch team task distribution analytics');
        }
        
        // Transform the data to match the chart format
        const transformedData = (response.data || []).map((item: any) => ({
          name: item.name || 'Unknown',
          value: item.taskCount || 0
        }));
        
        logAnalytics("Transformed team task distribution data:", transformedData);
        return transformedData;
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching team task distribution analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch team task distribution analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Task timeline analytics - track tasks created and completed over time
export function useTaskTimelineAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching task timeline analytics");
  
  return useQuery({
    queryKey: ["analytics", "tasks", "timeline", userId],
    queryFn: async () => {
      logAnalytics("Executing task timeline analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for task timeline analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/task-timeline');
        logAnalytics("Task timeline analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch task timeline analytics');
        }
        
        // Transform the data to match the chart format
        const transformedData = (response.data || []).map((item: any) => ({
          name: item.month,
          total: item.total || 0,
          completed: item.completed || 0
        }));
        
        logAnalytics("Transformed task timeline data:", transformedData);
        return transformedData;
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching task timeline analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch task timeline analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Recent updates analytics - latest activities across user's teams
export function useRecentUpdatesAnalytics(
  limit: number = 20,
  page: number = 1,
  filters?: {
    activityType?: string;
    entityType?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching recent updates analytics");
  
  return useQuery({
    queryKey: ["analytics", "recent-updates", userId, limit, page, filters],
    queryFn: async () => {
      logAnalytics("Executing recent updates analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for recent updates analytics");
        return { activities: [], pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
      }
      
      try {
        // Build query parameters
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString()
        });

        if (filters) {
          if (filters.activityType) params.append('activityType', filters.activityType);
          if (filters.entityType) params.append('entityType', filters.entityType);
          if (filters.actorId) params.append('actorId', filters.actorId);
          if (filters.startDate) params.append('startDate', filters.startDate);
          if (filters.endDate) params.append('endDate', filters.endDate);
        }

        const response = await projlyClient.get(`analytics/recent-updates?${params.toString()}`);
        logAnalytics("Recent updates analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch recent updates analytics');
        }
        
        return response.data || { activities: [], pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching recent updates analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch recent updates analytics",
          variant: "destructive"
        });
        return { activities: [], pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
      }
    },
    enabled: !!userId,
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });
}

// Activity filters - get available filter options
export function useActivityFilters() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching activity filters");
  
  return useQuery({
    queryKey: ["analytics", "activity-filters", userId],
    queryFn: async () => {
      logAnalytics("Executing activity filters query");
      
      if (!userId) {
        logAnalytics("No user ID provided for activity filters");
        return { activityTypes: [], entityTypes: [], users: [] };
      }
      
      try {
        const response = await projlyClient.get('analytics/activity-filters');
        logAnalytics("Activity filters response:", response);
        
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch activity filters');
        }
        
        return response.data || { activityTypes: [], entityTypes: [], users: [] };
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching activity filters:", error);
        toast({
          title: "Error fetching filters",
          description: error.message || "Failed to fetch activity filters",
          variant: "destructive"
        });
        return { activityTypes: [], entityTypes: [], users: [] };
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - filters don't change often
  });
}

// Member activity analytics - team members with last access and task update times
export function useMemberActivityAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching member activity analytics");
  
  return useQuery({
    queryKey: ["analytics", "member-activity", userId],
    queryFn: async () => {
      logAnalytics("Executing member activity analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for member activity analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/member-activity');
        logAnalytics("Member activity analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch member activity analytics');
        }
        
        return response.data || [];
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching member activity analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch member activity analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// My tasks status analytics - current user's overdue, due soon, and in progress tasks
export function useMyTasksStatusAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching my tasks status analytics");
  
  return useQuery({
    queryKey: ["analytics", "my-tasks-status", userId],
    queryFn: async () => {
      logAnalytics("Executing my tasks status analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for my tasks status analytics");
        return null;
      }
      
      try {
        const response = await projlyClient.get('analytics/my-tasks-status');
        logAnalytics("My tasks status analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch my tasks status analytics');
        }
        
        return response.data || null;
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching my tasks status analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch my tasks status analytics",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!userId
  });
}

// Member activity calendar analytics - team member activities grouped by date
export function useMemberActivityCalendarAnalytics(month?: number, year?: number) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching member activity calendar analytics");
  
  return useQuery({
    queryKey: ["analytics", "member-activity-calendar", userId, month, year],
    queryFn: async () => {
      logAnalytics("Executing member activity calendar analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for member activity calendar analytics");
        return { activities: [], members: [], period: null };
      }
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        
        const endpoint = `analytics/member-activity-calendar${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await projlyClient.get(endpoint);
        logAnalytics("Member activity calendar analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch member activity calendar analytics');
        }
        
        return response.data || { activities: [], members: [], period: null };
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching member activity calendar analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch member activity calendar analytics",
          variant: "destructive"
        });
        return { activities: [], members: [], period: null };
      }
    },
    enabled: !!userId
  });
}

// Member activity heatmap
export function useMemberActivityHeatmap(month?: number, year?: number) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["analytics", "member-activity-heatmap", userId, month, year],
    queryFn: async () => {
      if (!userId) return { members: [], heatmap: {}, period: null };
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      const endpoint = `analytics/member-activity-heatmap${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await projlyClient.get(endpoint);
      if (response.error) throw new Error(response.error);
      return response.data || { members: [], heatmap: {}, period: null };
    },
    enabled: !!userId
  });
}

// Member activity streaks
export function useMemberActivityStreaks(windowDays: number = 60) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["analytics", "member-activity-streaks", userId, windowDays],
    queryFn: async () => {
      if (!userId) return [];
      const response = await projlyClient.get(`analytics/member-activity-streaks?windowDays=${windowDays}`);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!userId
  });
}

// Member flow efficiency
export function useMemberFlowEfficiency(month?: number, year?: number) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ["analytics", "member-flow-efficiency", userId, month, year],
    queryFn: async () => {
      if (!userId) return [];
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      const endpoint = `analytics/member-flow-efficiency${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await projlyClient.get(endpoint);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!userId
  });
}

// Team Ownership Metrics Analytics
export function useTeamOwnershipMetrics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching team ownership metrics");
  
  return useQuery({
    queryKey: ["analytics", "team-ownership-metrics", userId],
    queryFn: async () => {
      logAnalytics("Executing team ownership metrics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for team ownership metrics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/team-ownership-metrics');
        logAnalytics("Team ownership metrics response:", response);
        
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch team ownership metrics');
        }
        
        return response.data || [];
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching team ownership metrics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch team ownership metrics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Sprint Commitment Analytics
export function useSprintCommitmentAnalytics(sprintDays: number = 14) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching sprint commitment analytics");
  
  return useQuery({
    queryKey: ["analytics", "sprint-commitment", userId, sprintDays],
    queryFn: async () => {
      logAnalytics("Executing sprint commitment analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for sprint commitment analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get(`analytics/sprint-commitment?sprintDays=${sprintDays}`);
        logAnalytics("Sprint commitment analytics response:", response);
        
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch sprint commitment analytics');
        }
        
        return response.data || [];
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching sprint commitment analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch sprint commitment analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Daily Standup Preparation Analytics
export function useDailyStandupPrepAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching daily standup prep analytics");
  
  return useQuery({
    queryKey: ["analytics", "daily-standup-prep", userId],
    queryFn: async () => {
      logAnalytics("Executing daily standup prep analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for daily standup prep analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/daily-standup-prep');
        logAnalytics("Daily standup prep analytics response:", response);
        
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch daily standup prep analytics');
        }
        
        return response.data || [];
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching daily standup prep analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch daily standup prep analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Blocker Resolution Analytics
export function useBlockerResolutionAnalytics() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching blocker resolution analytics");
  
  return useQuery({
    queryKey: ["analytics", "blocker-resolution", userId],
    queryFn: async () => {
      logAnalytics("Executing blocker resolution analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for blocker resolution analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get('analytics/blocker-resolution');
        logAnalytics("Blocker resolution analytics response:", response);
        
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch blocker resolution analytics');
        }
        
        return response.data || [];
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching blocker resolution analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch blocker resolution analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId
  });
}

// Task Activities Hook
export const useTaskActivities = (taskId: string | null) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['analytics', 'task-activities', taskId],
    queryFn: () => {
      if (!taskId) throw new Error('Task ID is required');
      return projlyClient.get(`analytics/task-activities?taskId=${taskId}`);
    },
    enabled: !!session?.user && !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
};
