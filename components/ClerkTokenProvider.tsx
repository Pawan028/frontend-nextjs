'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { setTokenGetter } from '../lib/api';

/**
 * ClerkTokenProvider - Sets up the token getter for the API client
 * This component bridges Clerk's auth with our axios instance
 * 
 * CRITICAL: This ensures API requests wait for Clerk authentication
 * to be ready before attempting to fetch tokens
 */
export function ClerkTokenProvider({ children }: { children: React.ReactNode }) {
    const { getToken, isLoaded } = useAuth();

    useEffect(() => {
        // Only set token getter once Clerk is fully loaded
        if (!isLoaded) return;

        // Set the token getter so api.ts can fetch tokens
        setTokenGetter(async () => {
            try {
                const token = await getToken();
                return token;
            } catch (error) {
                console.warn('Failed to get Clerk token:', error);
                return null;
            }
        });
    }, [getToken, isLoaded]);

    return <>{children}</>;
}
