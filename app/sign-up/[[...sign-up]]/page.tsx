import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Link from 'next/link';

/**
 * Sign-up page using Clerk's pre-built SignUp component
 * Enhanced with company branding and theme-aware styling
 */
export default function SignUpPage() {
    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 dark:from-purple-600/20 dark:via-blue-600/20 dark:to-indigo-600/20">
                <div className="max-w-md text-center">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">📦</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">ShipMVP</span>
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                        Start Shipping Today
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                        Join thousands of merchants who trust ShipMVP for their logistics needs.
                    </p>

                    {/* Features */}
                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-3 bg-white/80 dark:bg-white/5 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-green-500">✓</span>
                            </div>
                            <div>
                                <div className="text-gray-800 dark:text-white font-medium">Multiple Carriers</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Compare rates from Delhivery, BlueDart, and more</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white/80 dark:bg-white/5 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-500">📊</span>
                            </div>
                            <div>
                                <div className="text-gray-800 dark:text-white font-medium">Real-time Tracking</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Track all shipments from one dashboard</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white/80 dark:bg-white/5 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-purple-500">💰</span>
                            </div>
                            <div>
                                <div className="text-gray-800 dark:text-white font-medium">Wallet System</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Prepaid wallet with instant top-up</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Sign Up Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold">📦</span>
                            </div>
                            <span className="text-xl font-bold text-gray-800 dark:text-white">ShipMVP</span>
                        </Link>
                    </div>
                    {/* Clerk uses baseTheme for automatic light/dark support */}
                    <SignUp
                        routing="path"
                        path="/sign-up"
                        signInUrl="/sign-in"
                        forceRedirectUrl="/dashboard"
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
