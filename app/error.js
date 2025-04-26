'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We're sorry, but there was an error loading this page.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
