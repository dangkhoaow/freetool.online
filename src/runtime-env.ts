type RuntimeEnvMap = Record<string, string>;

declare global {
  interface Window {
    process?: {
      env: RuntimeEnvMap;
    };
  }
}

const runtimeEnv: RuntimeEnvMap = {
  NODE_ENV: import.meta.env.MODE,
  NEXT_PUBLIC_API_URL: import.meta.env.VITE_API_URL || 'https://service.freetool.online',
  NEXT_PUBLIC_PROJECT_LIST_CACHE_EXPIRY_MINUTES:
    import.meta.env.VITE_PROJECT_LIST_CACHE_EXPIRY_MINUTES || '5',
  NEXT_PUBLIC_USER_CACHE_EXPIRY_MINUTES:
    import.meta.env.VITE_USER_CACHE_EXPIRY_MINUTES || '5',
  NEXT_PUBLIC_USER_ROLE_CACHE_EXPIRY_MINUTES:
    import.meta.env.VITE_USER_ROLE_CACHE_EXPIRY_MINUTES || '5',
  NEXT_PUBLIC_CONTRACT_MANAGEMENT_API_URL:
    import.meta.env.VITE_CONTRACT_MANAGEMENT_API_URL || 'https://service.freetool.online',
  USER_CACHE_EXPIRY_MINUTES: import.meta.env.VITE_USER_CACHE_EXPIRY_MINUTES || '5',
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || '',
  LLAMA_2_7B_MODEL_URL: import.meta.env.VITE_LLAMA_2_7B_MODEL_URL || '',
};

function installRuntimeEnv() {
  const globalObject = globalThis as typeof globalThis & {
    process?: {
      env: RuntimeEnvMap;
    };
  };

  const existingEnv = globalObject.process?.env || {};

  globalObject.process = {
    env: {
      ...existingEnv,
      ...runtimeEnv,
    },
  };

  if (typeof window !== 'undefined') {
    window.process = globalObject.process;
  }
}

installRuntimeEnv();

export { runtimeEnv as appRuntimeEnv };
