// stores/useAuthStore.ts
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { getQueryClient } from '../lib/queryClient';

interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    emailVerified?: boolean;
    merchantProfile?: {
        id: string;
        companyName: string;
        walletBalance: number;
    };
}

interface AuthState {
    token: string | null;
    user: User | null;
    isInitialized: boolean;
    setAuth: (token: string, user: User) => void;
    setUser: (user: User) => void;  // ✅ NEW METHOD
    updateWalletBalance: (newBalance: number) => void;
    logout: () => void;
    initAuth: () => void;
}


const COOKIE_OPTIONS = {
    expires: 7,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isInitialized: false,

    setAuth: (token: string, user: User) => {
        Cookies.set('token', token, COOKIE_OPTIONS);
        Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);
        console.log('✅ Auth stored in cookies');
        set({ token, user, isInitialized: true });
    },

    // ✅ NEW: Update user in store and cookies
    setUser: (user: User) => {
        Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);
        console.log('✅ User updated in cookies');
        set({ user });
    },

    // ✅ Update wallet balance in store and cookies
    updateWalletBalance: (newBalance: number) => {

        set((state) => {
            if (!state.user?.merchantProfile) return state;

            const updatedUser = {
                ...state.user,
                merchantProfile: {
                    ...state.user.merchantProfile,
                    walletBalance: newBalance,
                },
            };

            // Update cookies with new balance
            Cookies.set('user', JSON.stringify(updatedUser), COOKIE_OPTIONS);
            console.log('✅ Wallet balance updated:', newBalance);

            return { user: updatedUser };
        });
    },

    logout: () => {
        Cookies.remove('token', { path: '/' });
        Cookies.remove('user', { path: '/' });
        console.log('✅ Logged out - cookies cleared');
        // ✅ NEW: Clear all query cache to prevent data leaks
        getQueryClient().clear();
        set({ token: null, user: null });
    },

    initAuth: () => {
        const token = Cookies.get('token');
        const userStr = Cookies.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                console.log('✅ Auth restored from cookies');
                set({ token, user, isInitialized: true });
            } catch (e) {
                console.error('❌ Invalid user data in cookies, clearing...');
                Cookies.remove('token', { path: '/' });
                Cookies.remove('user', { path: '/' });
                set({ token: null, user: null, isInitialized: true });
            }
        } else {
            set({ isInitialized: true });
        }
    },
}));
