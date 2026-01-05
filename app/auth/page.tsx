'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

/**
 * Auth page handler - redirects to appropriate page
 * This handles the /auth route that Clerk may redirect to
 */
export default function AuthPage() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn) {
            // User is signed in, go to dashboard
            router.replace('/dashboard');
        } else {
            // User is not signed in, go to sign-in page
            router.replace('/sign-in');
        }
    }, [isLoaded, isSignedIn, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Redirecting...</p>
            </div>
        </div>
    );
}
