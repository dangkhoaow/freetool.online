import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'next/link': path.resolve(__dirname, 'src/compat/next/link.tsx'),
        'next/navigation': path.resolve(__dirname, 'src/compat/next/navigation.tsx'),
        'next/dynamic': path.resolve(__dirname, 'src/compat/next/dynamic.tsx'),
        'next/image': path.resolve(__dirname, 'src/compat/next/image.tsx'),
        'next/script': path.resolve(__dirname, 'src/compat/next/script.tsx'),
        'next/font/google': path.resolve(__dirname, 'src/compat/next/font-google.ts'),
      },
    },
  };
});
