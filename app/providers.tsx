'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '../lib/queryClient';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export default function Providers({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();
    const { initAuth } = useAuthStore();

    // Initialize auth from cookies on mount
    useEffect(() => {
        console.log('Initializing auth from cookies...');
        initAuth();
    }, []); // Empty dependency array - run once

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

