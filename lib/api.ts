// lib/api.ts
import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';
import Cookies from 'js-cookie';

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


// Request interceptor - automatically add token from cookies
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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

        // Handle specific error codes (✅ FIXED: WITH UNDERSCORES)
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

        if (errorCode === 'UNAUTHORIZED' || error.response?.status === 401) {
            console.warn('🔐 Unauthorized - clearing auth');
            const { logout } = useAuthStore.getState();
            logout();
            // Redirect to login
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
                window.location.href = '/auth';
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

        // ✅ Generic error dispatch for ErrorBoundary
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
