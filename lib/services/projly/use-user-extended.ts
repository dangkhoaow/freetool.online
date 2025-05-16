import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "./jwt-auth-adapter";

// Using relative import for api-client to avoid module resolution issues
import apiClient from "../../api-client";

// Log import paths for debugging
console.log('[use-user-extended] Importing useSession and apiClient');

// Define the extended user data type
export interface ExtendedUserData {
  id: string;
  email: string | null;
  createdAt: string | null; // User creation date
  profile: {
    firstName: string;
    lastName: string;
    createdAt: string; // Profile creation date
  } | null;
  role: string;
}

// Log initialization of hook for debugging
console.log('[HOOK] use-user-extended hook initialized');

/**
 * Hook to fetch extended user information including creation dates
 * This is used to display "Member Since" information in the profile page
 */
export function useUserExtended() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["user-extended"],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("[HOOK:USER-EXTENDED] No user session found");
        return null;
      }
      
      const userId = session.user.id;
      console.log("[HOOK:USER-EXTENDED] Fetching extended user data for user:", userId);
      
      // Call API endpoint to get extended user data
      const response = await apiClient.get('users-extended/me');
      console.log("[HOOK:USER-EXTENDED] API response received:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:USER-EXTENDED] Error fetching extended user data:", response.error);
        toast({
          title: "Error fetching user data",
          description: response.error.message,
          variant: "destructive"
        });
        return null;
      }
      
      // Log the creation dates for debugging
      const userData = response.data as ExtendedUserData;
      console.log("[HOOK:USER-EXTENDED] User creation date:", userData?.createdAt);
      console.log("[HOOK:USER-EXTENDED] Profile creation date:", userData?.profile?.createdAt);
      
      return userData;
    },
    enabled: !!session?.user?.id
  });
}

/**
 * Hook to fetch extended user information for a specific user
 * @param userId The ID of the user to fetch extended data for
 */
export function useUserExtendedById(userId: string | undefined) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["user-extended", userId],
    queryFn: async () => {
      if (!userId || !session?.user?.id) {
        console.log("[HOOK:USER-EXTENDED] No user ID or session found");
        return null;
      }
      
      console.log("[HOOK:USER-EXTENDED] Fetching extended user data for user ID:", userId);
      
      // Call API endpoint to get extended user data
      const response = await apiClient.get(`users-extended/${userId}`);
      console.log("[HOOK:USER-EXTENDED] API response received:", response.error ? 'Error' : 'Success');
      
      if (response.error) {
        console.error("[HOOK:USER-EXTENDED] Error fetching extended user data:", response.error);
        toast({
          title: "Error fetching user data",
          description: response.error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return response.data as ExtendedUserData;
    },
    enabled: !!userId && !!session?.user?.id
  });
}
