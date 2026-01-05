'use client';

/**
 * Auth Loading Guard
 * 
 * Prevents flash of sign-in page on refresh by showing a loading state
 * while Clerk determines the authentication status.
 */

import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

interface AuthLoadingGuardProps {
  children: React.ReactNode;
}

// Routes that don't need auth loading guard
const publicRoutes = ['/', '/sign-in', '/sign-up', '/auth'];

export default function AuthLoadingGuard({ children }: AuthLoadingGuardProps) {
  const { isLoaded } = useAuth();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // For public routes, render immediately
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, show loading until Clerk is ready
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ShipMVP
            </span>
          </div>
          
          {/* Loading Spinner */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Once loaded, render children
  return <>{children}</>;
}
