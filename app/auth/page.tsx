'use client';

// app/auth/page.tsx
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Cookies from 'js-cookie';
import { getQueryClient } from '../../lib/queryClient';

interface BackendResponse {
    success: boolean;
    data?: {
        token: string;
        user: {
            id: string;
            email: string;
            name?: string;
            role?: string;
            merchantProfile?: {
                id: string;
                companyName: string;
                walletBalance: number;
            };
        };
    };
    error?: {
        code: string;
        message: string;
    };
}

function LoginContent() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    
    // Check for success messages from registration/verification
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccessMessage('🎉 Email verified successfully! Please login to continue.');
        } else if (searchParams.get('registered') === 'true') {
            setSuccessMessage('✅ Registration successful! Please login.');
        }
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔐 Attempting login...');
            const response = await api.post<BackendResponse>('/auth/login', {
                email,
                password
            });

            console.log('✅ Backend response:', response.data);

            // Check if backend returned success
            if (!response.data.success) {
                throw new Error(response.data.error?.message || 'Login failed');
            }

            // Extract token and user from data object (NOT payload!)
            const { token, user } = response.data.data!;
            console.log('✅ Token extracted:', token ? 'YES' : 'NO');
            console.log('✅ User extracted:', user);

            if (!token) {
                throw new Error('No token received from server');
            }

            // Store auth data in Zustand + cookies
            console.log('💾 Storing auth data...');
            setAuth(token, user);

            // Verify storage
            const storedToken = Cookies.get('token');
            console.log('✅ Token stored in cookies:', storedToken ? 'YES' : 'NO');

            // ✅ OPTIMIZATION: Prefetch dashboard data for instant load
            // Note: We use the same query key format as in dashboard/page.tsx
            const queryClient = getQueryClient();
            if (user.merchantProfile?.id) {
                console.log('🚀 Prefetching dashboard data...');
                // We don't await this - let it run in background/parallel with navigation
                queryClient.prefetchQuery({
                    queryKey: ['dashboard', user.merchantProfile.id],
                    queryFn: async () => {
                        const res = await api.get('/merchant/dashboard');
                        return res.data;
                    },
                    staleTime: 1000 * 30, // 30s match with backend
                });
            }

            // ✅ FIXED: Role-Based Redirection
            console.log('🚀 Redirecting based on role:', user.role);
            if (user.role === 'ADMIN') {
                router.push('/admin/invoices');
            } else {
                router.push('/dashboard');
            }

        } catch (err: any) {
            console.error('❌ Login error:', err);
            
            // Check for email not verified error
            const errorData = err.response?.data?.error;
            if (errorData?.code === 'EMAIL_NOT_VERIFIED') {
                // Redirect to verification page with email
                const userEmail = errorData.email || email;
                router.push(`/auth/verify-email?email=${encodeURIComponent(userEmail)}&fromLogin=true`);
                return;
            }
            
            if (err instanceof Error) {
                setError(err.message);
            } else if (err.response?.data?.error?.message) {
                setError(err.response.data.error.message);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding (Glassmorphic) */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600/90 backdrop-blur-sm p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="text-3xl font-bold text-white">ShipMVP</Link>
                </div>
                {/* ... content ... */}
                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Ship smarter,<br />not harder.
                    </h2>
                    <p className="text-blue-100 text-lg">
                        Join 500+ businesses using ShipMVP to streamline their logistics.
                    </p>
                    <div className="flex items-center gap-6 text-blue-100">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📦</span>
                            <span>Multi-Courier</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <span>Instant Rates</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📍</span>
                            <span>Live Tracking</span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-blue-200 text-sm">
                    © 2025 ShipMVP. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Login Form (Transparent/Glass) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="text-3xl font-bold text-blue-600">ShipMVP</Link>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 p-8 border border-gray-100 dark:border-slate-700">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-2">Sign in to your account to continue</p>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span>{successMessage}</span>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                        Password
                                    </label>
                                    <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                                    Create one free
                                </Link>
                            </p>
                        </div>

                        {/* Demo credentials */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-800 font-medium mb-2">🧪 Demo Account</p>
                            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                <p><span className="text-gray-500 dark:text-slate-400">Email:</span> <code className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded">merchant.full@example.com</code></p>
                                <p><span className="text-gray-500 dark:text-slate-400">Password:</span> <code className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded">Merchant@123</code></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main export with Suspense wrapper for useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
