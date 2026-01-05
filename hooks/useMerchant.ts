'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * User data from the /auth/me endpoint
 * This replaces the old useAuthStore's user data
 */
interface MerchantUser {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    merchantProfile?: {
        id: string;
        companyName: string;
        walletBalance: number;
        billingCycle: string;
        isKycVerified: boolean;
    };
}

interface UseMerchantResult {
    user: MerchantUser | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
    updateWalletBalance: (newBalance: number) => void;
}

/**
 * Hook to get merchant/user data from the backend
 * Replaces useAuthStore for getting user info
 * 
 * Note: Authentication is still handled by Clerk, but business data
 * (like wallet balance, merchant profile) comes from our database
 */
export function useMerchant(): UseMerchantResult {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery<MerchantUser>({
        queryKey: ['merchant-me'],
        queryFn: async () => {
            const response = await api.get('/auth/me');
            return response.data?.data || response.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            // Retry up to 2 times for USER_SYNC_PENDING errors (rare with JIT provisioning)
            const errorCode = error?.response?.data?.error?.code;
            if (errorCode === 'USER_SYNC_PENDING') {
                return failureCount < 2;
            }
            // Retry once for network errors
            if (!error?.response) {
                return failureCount < 1;
            }
            // Don't retry other errors
            return false;
        },
        retryDelay: (attemptIndex) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * 2 ** attemptIndex, 16000);
        },
    });

    /**
     * Optimistically update wallet balance in the cache
     * This is used for instant UI feedback before API confirms
     */
    const updateWalletBalance = (newBalance: number) => {
        queryClient.setQueryData<MerchantUser>(['merchant-me'], (old) => {
            if (!old?.merchantProfile) return old;
            return {
                ...old,
                merchantProfile: {
                    ...old.merchantProfile,
                    walletBalance: newBalance,
                },
            };
        });
    };

    return {
        user: data || null,
        isLoading,
        error: error as Error | null,
        refetch,
        updateWalletBalance,
    };
}
