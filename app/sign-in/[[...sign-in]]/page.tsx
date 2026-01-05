import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Link from 'next/link';

/**
 * Sign-in page using Clerk's pre-built SignIn component
 * Enhanced with company branding and theme-aware styling
 */
export default function SignInPage() {
    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-indigo-600/20">
                <div className="max-w-md text-center">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">📦</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">ShipFlow</span>
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                        Welcome Back!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                        Sign in to manage your shipments, track orders, and grow your business.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">10K+</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">Shipments</div>
                        </div>
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">500+</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">Merchants</div>
                        </div>
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">99.9%</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Sign In Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold">📦</span>
                            </div>
                            <span className="text-xl font-bold text-gray-800 dark:text-white">ShipFlow</span>
                        </Link>
                    </div>
                    {/* Clerk uses baseTheme for automatic light/dark support */}
                    <SignIn
                        appearance={{
                            baseTheme: dark,
                            variables: {
                                colorPrimary: '#6366f1',
                                colorBackground: '#1f2937',
                                colorInputBackground: '#374151',
                                colorInputText: '#ffffff',
                                borderRadius: '0.75rem',
                            },
                            elements: {
                                rootBox: 'mx-auto w-full',
                                card: 'shadow-2xl rounded-2xl border-0',
                                headerTitle: 'text-2xl font-bold',
                                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg',
                                footerActionLink: 'text-blue-400 hover:text-blue-300 font-medium',
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
