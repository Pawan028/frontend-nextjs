'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Listen for toast events from api.ts
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message, type } = customEvent.detail;
      
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, message, type };
      
      setToasts(prev => [...prev, newToast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    // Listen for both old 'api-error' and new 'show-toast' events
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message } = customEvent.detail;
      handleToast(new CustomEvent('show-toast', { 
        detail: { message, type: 'error' } 
      }));
    };

    window.addEventListener('show-toast', handleToast);
    window.addEventListener('api-error', handleApiError);
    
    return () => {
      window.removeEventListener('show-toast', handleToast);
      window.removeEventListener('api-error', handleApiError);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${getToastStyles(toast.type)} border px-4 py-3 rounded-lg shadow-lg animate-slide-in-right flex items-start gap-3`}
          >
            <span className="text-xl">{getIcon(toast.type)}</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {children}
    </>
  );
}
