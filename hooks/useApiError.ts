// hooks/useApiError.ts
'use client';

import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useState } from 'react';

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export function useApiError() {
    const router = useRouter();
    const { signOut } = useClerk();
    const [error, setError] = useState<ApiError | null>(null);

    const handleError = (error: any): ApiError => {
        const errorData = error.response?.data?.error || {};
        const code = errorData.code || 'UNKNOWN_ERROR';
        const message = errorData.message || 'An error occurred';
        const details = errorData.details || {};

        const apiError: ApiError = { code, message, details };

        // Log for debugging
        console.error(`[${code}]`, message);

        switch (code) {
            case 'INSUFFICIENT_BALANCE':
                console.warn('💰 Wallet balance too low for this operation');
                // Dispatch event to show topup modal
                window.dispatchEvent(
                    new CustomEvent('show-topup-modal', {
                        detail: { message, requiredAmount: details.required },
                    })
                );
                break;

            case 'VALIDATION_ERROR':
                console.error('❌ Form validation failed');
                // Return field errors
                setError(apiError);
                break;

            case 'UNAUTHORIZED':
                console.warn('🔐 Session expired - redirecting to sign-in');
                // Sign out via Clerk and redirect
                signOut().then(() => router.push('/sign-in'));
                break;

            case 'FORBIDDEN':
                console.warn('🚫 Access denied');
                setError({
                    ...apiError,
                    message: "You don't have permission to perform this action",
                });
                break;

            case 'NOT_FOUND':
                console.error('🔍 Resource not found');
                setError({
                    ...apiError,
                    message: 'The requested resource was not found',
                });
                break;

            case 'INTERNAL_ERROR':
                console.error('⚠️ Server error');
                setError({
                    ...apiError,
                    message: 'Server error occurred. Please try again later.',
                });
                break;

            default:
                console.error('❓ Unknown error');
                setError(apiError);
        }

        return apiError;
    };

    const clearError = () => setError(null);

    return { error, handleError, clearError };
}
