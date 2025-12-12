// lib/api.ts
import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';
import Cookies from 'js-cookie';

// Global toast dispatcher (simple alert for now, can be enhanced later)
const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    // For now, use alert. Can be replaced with actual toast library
    if (type === 'error') {
        alert(`❌ Error: ${message}`);
    } else {
        alert(`✅ ${message}`);
    }
};

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
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

        if (errorCode === 'UNAUTHORIZED') {
            console.warn('🔐 Unauthorized - clearing auth');
            const { logout } = useAuthStore.getState();
            logout();
            // Redirect will be handled by middleware
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

        if (!navigator.onLine) {
            showToast('Network error. Please check your internet connection.', 'error');
        }

        // Return error for caller to handle
        return Promise.reject(error);
    }
);

export default api;
