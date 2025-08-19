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
export function useRecentUpdatesAnalytics(limit: number = 20) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  logAnalytics("Fetching recent updates analytics");
  
  return useQuery({
    queryKey: ["analytics", "recent-updates", userId, limit],
    queryFn: async () => {
      logAnalytics("Executing recent updates analytics query");
      
      if (!userId) {
        logAnalytics("No user ID provided for recent updates analytics");
        return [];
      }
      
      try {
        const response = await projlyClient.get(`analytics/recent-updates?limit=${limit}`);
        logAnalytics("Recent updates analytics response:", response);
        
        // Check if we have valid data in the response
        if (response.error) {
          throw new Error(response.error || 'Failed to fetch recent updates analytics');
        }
        
        return response.data || [];
      } catch (error: any) {
        console.error("[ANALYTICS] Error fetching recent updates analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: error.message || "Failed to fetch recent updates analytics",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!userId,
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
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
