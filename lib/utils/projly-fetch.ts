/**
 * Utility function for making API calls to the Projly backend
 * This file centralizes fetch logic with proper error handling and logging
 */

// Define the base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Enhanced fetch function for Projly API calls
 * @param endpoint - API endpoint path (without the base URL)
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
export async function projlyFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:FETCH] ${message}`, data);
    } else {
      console.log(`[PROJLY:FETCH] ${message}`);
    }
  };

  // Construct the full URL
  const url = `${API_BASE_URL}${endpoint}`;
  log(`Making ${options.method || 'GET'} request to: ${url}`);

  // Set default headers if not provided
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add credentials to include cookies in the request
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Log the response status
    log(`Response status: ${response.status}`);
    
    return response;
  } catch (error) {
    log(`Error in fetch: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
