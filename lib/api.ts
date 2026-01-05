// lib/api.ts
import axios from 'axios';

// Toast notification helper - will dispatch custom events for toast component
const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    window.dispatchEvent(
        new CustomEvent('show-toast', {
            detail: { message, type },
        })
    );
};

// If the ENV var already ends with /v1, don't add it again.
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
const finalUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

const api = axios.create({
    baseURL: finalUrl,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

/**
 * Token getter function - set by ClerkTokenProvider
 * This allows the axios interceptor to get Clerk's token without importing Clerk
 * (which would require 'use client' and break server-side usage)
 */
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
    tokenGetter = getter;
};

// Request interceptor - automatically add Clerk token
api.interceptors.request.use(
    async (config) => {
        if (tokenGetter) {
            try {
                const token = await tokenGetter();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn('Failed to get auth token:', error);
            }
        }
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorCode = error.response?.data?.error?.code;
        const errorMessage = error.response?.data?.error?.message;

        // Handle specific error codes
        if (errorCode === 'INSUFFICIENT_BALANCE') {
            console.warn('💰 Insufficient wallet balance');
            // Dispatch topup modal event
            window.dispatchEvent(
                new CustomEvent('show-topup-modal', {
                    detail: {
                        message: errorMessage,
                        requiredAmount: error.response?.data?.error?.details?.required
                    },
                })
            );
        }

        // Handle USER_SYNC_PENDING first (before checking status)
        if (errorCode === 'USER_SYNC_PENDING') {
            console.warn('⏳ User sync pending - account setup in progress');
            // Don't redirect, let the calling component handle it
            return Promise.reject(error);
        }

        // Handle other 401 errors with redirect
        if (errorCode === 'UNAUTHORIZED' || error.response?.status === 401) {
            console.warn('🔐 Unauthorized - redirecting to sign-in');
            // Redirect to Clerk sign-in
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
                window.location.href = '/sign-in';
            }
        }

        if (errorCode === 'RATE_LIMITED' || error.response?.status === 429) {
            console.warn('⏳ Rate limited');
            showToast(errorMessage || 'Too many attempts. Please wait and try again.', 'warning');
        }

        if (errorCode === 'VALIDATION_ERROR') {
            console.error('❌ Validation error:', error.response?.data?.error?.details);
        }

        if (errorCode === 'FORBIDDEN') {
            console.warn('🚫 Forbidden - access denied');
        }

        if (errorCode === 'NOT_FOUND') {
            console.error('🔍 Not found:', errorMessage);
        }

        if (errorCode === 'INTERNAL_ERROR') {
            console.error('⚠️ Internal server error');
        }

        // Generic error dispatch for ErrorBoundary
        if (
            errorCode !== 'INSUFFICIENT_BALANCE' &&
            errorCode !== 'UNAUTHORIZED' &&
            errorCode !== 'VALIDATION_ERROR'
        ) {
            window.dispatchEvent(
                new CustomEvent('api-error', {
                    detail: { message: errorMessage || 'An error occurred' },
                })
            );
        }

        // Network error handling
        if (!navigator.onLine) {
            showToast('Network error. Please check your internet connection.', 'error');
        } else if (!error.response) {
            showToast('Cannot connect to server. Please try again later.', 'error');
        }

        // Return error for caller to handle
        return Promise.reject(error);
    }
);

// Export toast helper for use in components
export { showToast };
export default api;
