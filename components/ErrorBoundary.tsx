'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Listen for API errors
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message } = customEvent.detail;
      setErrorMessage(message);

      // Auto-clear after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    };

    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, []);

  return (
    <>
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{errorMessage}</p>
        </div>
      )}
      {children}
    </>
  );
}
