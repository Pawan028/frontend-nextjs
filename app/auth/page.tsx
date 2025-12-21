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

// Eye icons for password visibility toggle
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

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
    const [showPassword, setShowPassword] = useState(false);
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
            {/* Left Panel - Premium Glassmorphic Design */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 flex-col justify-between relative overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob"></div>
                    <div className="absolute top-1/2 -right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>
                
                {/* Top - Logo & Back */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm group">
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">ShipMVP</span>
                    </Link>
                </div>
                
                {/* Middle - Hero Content */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                            Welcome back to<br />
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">smarter shipping</span>
                        </h2>
                        <p className="text-white/70 text-lg max-w-sm">
                            Access your dashboard to manage shipments, track deliveries, and optimize costs.
                        </p>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all group">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-white">98.5%</p>
                            <p className="text-white/60 text-sm">Delivery Success</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-white">30%</p>
                            <p className="text-white/60 text-sm">Avg. Cost Savings</p>
                        </div>
                    </div>
                    
                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-white/80 text-sm">Real-time Tracking</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span className="text-white/80 text-sm">10+ Couriers</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            <span className="text-white/80 text-sm">Smart NDR</span>
                        </div>
                    </div>
                </div>
                
                {/* Bottom - Footer */}
                <div className="relative z-10 flex items-center justify-between">
                    <p className="text-white/40 text-sm">© 2025 ShipMVP</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-white/40 hover:text-white/60 text-sm transition-colors">Privacy</a>
                        <a href="#" className="text-white/40 hover:text-white/60 text-sm transition-colors">Terms</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8 bg-gray-50 dark:bg-slate-900 relative">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-50 dark:opacity-30" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}></div>
                
                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo + Back Link */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors mb-4 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">ShipMVP</span>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-slate-900/50 p-8 border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        {/* Card glow effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
                                <p className="text-gray-500 dark:text-slate-400 mt-2">Sign in to your account to continue</p>
                            </div>

                            {/* Success Message */}
                            {successMessage && (
                                <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>{successMessage}</span>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                            Password
                                        </label>
                                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                                            tabIndex={-1}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
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

                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                                        Create one free
                                    </Link>
                                </p>
                            </div>

                            {/* Demo credentials - More subtle */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Demo Account</span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                    <p className="flex items-center gap-2">
                                        <span className="text-slate-400 dark:text-slate-500">Email:</span>
                                        <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">merchant.full@example.com</code>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="text-slate-400 dark:text-slate-500">Password:</span>
                                        <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">Merchant@123</code>
                                    </p>
                                </div>
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
