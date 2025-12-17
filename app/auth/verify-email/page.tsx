'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api, { showToast } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { useAuthStore } from '../../../stores/useAuthStore';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get('email') || '';
    const isNewUser = searchParams.get('newUser') === 'true';
    const fromLogin = searchParams.get('fromLogin') === 'true';

    const [email, setEmail] = useState(emailFromParams);
    const [originalEmail] = useState(emailFromParams); // Track original email
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState<'enter-email' | 'enter-otp'>(
        emailFromParams ? 'enter-otp' : 'enter-email'
    );
    const [countdown, setCountdown] = useState(isNewUser ? 60 : 0);
    const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
    const [verificationError, setVerificationError] = useState('');
    const [emailChanged, setEmailChanged] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);

    // Auto-set email from user if logged in
    useEffect(() => {
        if (user?.email && !email) {
            setEmail(user.email);
        }
    }, [user]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Send OTP mutation
    const sendOtpMutation = useMutation({
        mutationFn: async (emailToSend: string) => {
            const response = await api.post('/auth/send-verification', { email: emailToSend });
            return response.data.data;
        },
        onSuccess: (data) => {
            showToast('✅ Verification code sent to your email!', 'success');
            setStep('enter-otp');
            setCountdown(60); // 60 second cooldown
            // Focus first OTP input
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error?.message || 'Failed to send verification code';
            showToast(errorMsg, 'error');
        },
    });

    // Verify OTP mutation
    const verifyOtpMutation = useMutation({
        mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
            const response = await api.post('/auth/verify-email', { email, otp });
            return response.data.data;
        },
        onSuccess: (data) => {
            showToast('🎉 Email verified successfully!', 'success');
            setVerificationError('');
            setAttemptsRemaining(null);

            // Update user in store if new token provided
            if (data.token && user) {
                // Store new token
                localStorage.setItem('token', data.token);
                // Update user state
                setUser({ ...user, emailVerified: true });
            }

            // Redirect to dashboard or login
            setTimeout(() => {
                if (isNewUser) {
                    router.push('/auth?verified=true');
                } else {
                    router.push('/dashboard');
                }
            }, 1500);
        },
        onError: (error: any) => {
            const errorData = error.response?.data;
            const errorMsg = errorData?.error?.message || 'Invalid verification code';
            const attempts = errorData?.error?.attemptsRemaining;
            
            // Set attempts from backend response
            if (attempts !== undefined) {
                setAttemptsRemaining(attempts);
            }
            
            // Check for specific error types
            if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('not found')) {
                setVerificationError('Code expired. Please request a new one.');
                setAttemptsRemaining(null);
            } else if (errorMsg.toLowerCase().includes('too many') || errorMsg.toLowerCase().includes('locked') || attempts === 0) {
                setVerificationError('Too many failed attempts. Please request a new code.');
                setAttemptsRemaining(0);
            } else {
                setVerificationError(errorMsg);
            }
            
            showToast(errorMsg, 'error');
            // Clear OTP inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        },
    });

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            showToast('Please enter your email', 'error');
            return;
        }
        sendOtpMutation.mutate(email);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            showToast('Please enter the complete 6-digit code', 'error');
            return;
        }
        verifyOtpMutation.mutate({ email, otp: otpString });
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (value && index === 5 && newOtp.every(d => d)) {
            verifyOtpMutation.mutate({ email, otp: newOtp.join('') });
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
            // Auto-submit
            verifyOtpMutation.mutate({ email, otp: pastedData });
        }
    };

    const handleResend = () => {
        if (countdown > 0) return;
        sendOtpMutation.mutate(email);
    };

    const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 shadow-xl border-0">
                    {/* Alert for users coming from login */}
                    {fromLogin && step === 'enter-otp' && (
                        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">⚠️</span>
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">Email verification required</p>
                                    <p>Please verify your email to continue logging in.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
                            <span className="text-3xl">✉️</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {step === 'enter-email' ? 'Verify Your Email' : 'Enter Verification Code'}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {step === 'enter-email'
                                ? 'We\'ll send a 6-digit code to verify your email address'
                                : `We sent a code to ${email}`
                            }
                        </p>
                    </div>

                    {/* Step 1: Enter Email */}
                    {step === 'enter-email' && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            {/* Warning when changing email */}
                            {emailChanged && originalEmail && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="text-amber-500">⚠️</span>
                                        <div className="text-sm text-amber-800">
                                            <p className="font-medium">Changing email address</p>
                                            <p className="text-xs mt-1">
                                                The previous code for <strong>{originalEmail}</strong> will no longer work.
                                                A new code will be sent to the email you enter below.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 'enter-otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            {/* OTP Input */}
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            verificationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading || attemptsRemaining === 0}
                                    />
                                ))}
                            </div>
                            
                            {/* Error Message with Attempts */}
                            {verificationError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                                    <p className="text-red-700 text-sm font-medium">{verificationError}</p>
                                    {attemptsRemaining !== null && attemptsRemaining > 0 && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Verify Button */}
                            <Button
                                type="submit"
                                disabled={isLoading || otp.join('').length !== 6}
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            >
                                {verifyOtpMutation.isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                        Verifying...
                                    </span>
                                ) : (
                                    '✅ Verify Email'
                                )}
                            </Button>

                            {/* Resend */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Didn't receive the code?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || isLoading}
                                    className={`text-sm font-medium ${countdown > 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                >
                                    {countdown > 0
                                        ? `Resend in ${countdown}s`
                                        : 'Resend Code'
                                    }
                                </button>
                            </div>

                            {/* Change Email */}
                            <div className="text-center pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('enter-email');
                                        setOtp(['', '', '', '', '', '']);
                                        setVerificationError('');
                                        setAttemptsRemaining(null);
                                        setEmailChanged(true);
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    ← Use a different email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">💡</span>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Tip:</p>
                                <p>Check your spam folder if you don't see the email. The code expires in 10 minutes.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push('/auth')}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                        ← Back to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Loading fallback for Suspense
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

// Main export with Suspense wrapper for useSearchParams
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
