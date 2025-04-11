/**
 * API Client for freetool.online
 * 
 * This file centralizes all API calls to the backend, making it easy to switch
 * between different environments (local, production).
 */

// Types for API configuration
export interface ApiConfig {
  apiBaseUrl: string;
  uploadEndpoint: string;
  convertEndpoint: string;
  healthEndpoint: string;
  filesEndpoint: string;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  error?: string;
}

export interface ConfigResponse {
  status: string;
  environment: string;
  config: ApiConfig;
  endpoints: {
    health: string;
    upload: string;
    convert: string;
    files: string;
  };
  serviceInfo: {
    name: string;
    version: string;
  };
}

// Environment types
export type Environment = 'local' | 'production';

// API client class
export class ApiClient {
  private static instance: ApiClient;
  private config: ApiConfig | null = null;
  private environment: Environment = 'production';

  // Backend services URL - change this to switch environments during testing
  private readonly CONFIG_URL = 'https://service.freetool.online/api/config';

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Initialize API client with configuration
   * @param env Environment to use ('local' or 'production')
   */
  public async initialize(env: Environment = 'production'): Promise<void> {
    try {
      this.environment = env;
      const response = await fetch(`${this.CONFIG_URL}?env=${env}`);
      const data = await response.json() as ConfigResponse;
      
      if (data.status === 'ok') {
        this.config = data.config;
        console.log(`API client initialized with ${env} environment`);
      } else {
        console.error('Failed to initialize API client');
        throw new Error('Failed to initialize API client');
      }
    } catch (error) {
      console.error('Error initializing API client:', error);
      throw error;
    }
  }

  /**
   * Get current API configuration
   */
  public getConfig(): ApiConfig {
    if (!this.config) {
      throw new Error('API client not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Switch environment
   * @param env Environment to switch to
   */
  public async switchEnvironment(env: Environment): Promise<void> {
    await this.initialize(env);
  }

  /**
   * Check API health
   */
  public async checkHealth(): Promise<ApiResponse<any>> {
    if (!this.config) {
      throw new Error('API client not initialized. Call initialize() first.');
    }

    try {
      const response = await fetch(`${this.config.apiBaseUrl}${this.config.healthEndpoint}`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: 'Health check failed' };
    }
  }

  /**
   * Upload files
   * @param files Files to upload
   */
  public async uploadFiles(files: File[]): Promise<ApiResponse<any>> {
    if (!this.config) {
      throw new Error('API client not initialized. Call initialize() first.');
    }

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const response = await fetch(`${this.config.apiBaseUrl}${this.config.uploadEndpoint}`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      return { status: 'error', error: 'Upload failed' };
    }
  }

  /**
   * Convert files
   * @param files Files to convert
   * @param format Output format (e.g., 'jpeg', 'png')
   * @param quality Output quality (1-100)
   */
  public async convertFiles(files: File[], format: string = 'jpeg', quality: number = 80): Promise<ApiResponse<any>> {
    if (!this.config) {
      throw new Error('API client not initialized. Call initialize() first.');
    }

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      formData.append('format', format);
      formData.append('quality', quality.toString());

      const response = await fetch(`${this.config.apiBaseUrl}${this.config.convertEndpoint}`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Conversion failed:', error);
      return { status: 'error', error: 'Conversion failed' };
    }
  }

  /**
   * Get file URL
   * @param filePath File path from the API response
   */
  public getFileUrl(filePath: string): string {
    if (!this.config) {
      throw new Error('API client not initialized. Call initialize() first.');
    }

    return `${this.config.apiBaseUrl}${this.config.filesEndpoint}/${filePath}`;
  }
}

// Export singleton instance
const apiClient = ApiClient.getInstance();
export default apiClient; 