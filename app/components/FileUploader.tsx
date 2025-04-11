import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import apiClient, { ApiResponse, Environment } from '@/lib/api-client';

interface FileUploaderProps {
  onUploadComplete?: (response: ApiResponse<any>) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<Environment>('production');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize API client on component mount
  useEffect(() => {
    const initializeApi = async () => {
      try {
        await apiClient.initialize(environment);
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize API client');
        console.error(err);
      }
    };

    initializeApi();
  }, [environment]);

  // Handle environment change
  const handleEnvironmentChange = async (env: Environment) => {
    setIsInitialized(false);
    setEnvironment(env);
    try {
      await apiClient.switchEnvironment(env);
      setIsInitialized(true);
    } catch (err) {
      setError('Failed to switch environment');
      console.error(err);
    }
  };

  // Handle file upload
  const onDrop = async (acceptedFiles: File[]) => {
    if (!isInitialized) {
      setError('API client not initialized yet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.uploadFiles(acceptedFiles);
      
      if (response.status === 'error') {
        setError(response.error || 'Upload failed');
      } else if (onUploadComplete) {
        onUploadComplete(response);
      }
    } catch (err) {
      setError('Upload failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Health check
  const checkApiHealth = async () => {
    if (!isInitialized) {
      setError('API client not initialized yet');
      return;
    }

    try {
      const health = await apiClient.checkHealth();
      alert(`API Health: ${health.status}`);
    } catch (err) {
      setError('Health check failed');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Environment
        </label>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              environment === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => handleEnvironmentChange('local')}
          >
            Local
          </button>
          <button
            className={`px-4 py-2 rounded ${
              environment === 'production' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => handleEnvironmentChange('production')}
          >
            Production
          </button>
          <button
            className="px-4 py-2 rounded bg-green-500 text-white"
            onClick={checkApiHealth}
          >
            Check Health
          </button>
        </div>
      </div>

      {!isInitialized && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          Initializing API client...
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <p className="text-gray-500">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the files here...</p>
        ) : (
          <p className="text-gray-500">
            Drag &amp; drop files here, or click to select files
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {isInitialized && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <p>Current API base URL: {apiClient.getConfig().apiBaseUrl}</p>
          <p>Environment: {environment}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 