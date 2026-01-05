'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '../lib/queryClient';
import { ThemeProvider } from '../hooks/useTheme';
import { ClerkTokenProvider } from '../components/ClerkTokenProvider';

/**
 * Providers component wrapping the app with necessary context providers.
 * Note: ClerkProvider is in layout.tsx (must be server component compatible)
 */
export default function Providers({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ClerkTokenProvider>
                    {children}
                </ClerkTokenProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

