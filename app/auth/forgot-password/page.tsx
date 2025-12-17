'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { showToast } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

// Eye icons for password visibility
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

type Step = 'email' | 'otp' | 'password' | 'success';

function ForgotPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get('email') || '';

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState(emailFromParams);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Password requirements check
    const passwordRequirements = {
        minLength: newPassword.length >= 8,
        hasLowercase: /[a-z]/.test(newPassword),
        hasUppercase: /[A-Z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasSpecial: /[@$!%*?&]/.test(newPassword),
    };
    const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    // Step 1: Request reset code
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
            showToast('If an account exists, you will receive a reset code.', 'success');
            setStep('otp');
            setCountdown(60);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to send reset code';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (otpString?: string) => {
        const code = otpString || otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/verify-reset-code', { 
                email: email.trim().toLowerCase(), 
                otp: code 
            });
            
            setResetToken(response.data.data.resetToken);
            setAttemptsRemaining(null);
            showToast('Code verified! Set your new password.', 'success');
            setStep('password');
        } catch (err: any) {
            const errorData = err.response?.data?.error;
            const errorMsg = errorData?.message || 'Invalid verification code';
            
            if (errorData?.attemptsRemaining !== undefined) {
                setAttemptsRemaining(errorData.attemptsRemaining);
            }
            
            setError(errorMsg);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!allRequirementsMet) {
            setError('Password does not meet requirements');
            return;
        }
        
        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email: email.trim().toLowerCase(),
                resetToken,
                newPassword,
            });
            
            showToast('🎉 Password reset successful!', 'success');
            setStep('success');
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Failed to reset password';
            setError(errorMsg);
            
            // If token expired, go back to email step
            if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('session')) {
                setTimeout(() => {
                    setStep('email');
                    setOtp(['', '', '', '', '', '']);
                    setResetToken('');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    // OTP input handlers
    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (value && index === 5 && newOtp.every(d => d)) {
            handleVerifyOtp(newOtp.join(''));
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
            setOtp(pastedData.split(''));
            inputRefs.current[5]?.focus();
            handleVerifyOtp(pastedData);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setLoading(true);
        setError('');
        
        try {
            await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
            showToast('New code sent!', 'success');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            setAttemptsRemaining(null);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    // Calculate password strength
    const strengthScore = Object.values(passwordRequirements).filter(Boolean).length;
    const strengthLevel = strengthScore <= 2 ? 'Weak' : strengthScore <= 3 ? 'Fair' : strengthScore <= 4 ? 'Good' : 'Strong';
    const strengthColor = strengthScore <= 2 ? 'bg-red-500' : strengthScore <= 3 ? 'bg-yellow-500' : strengthScore <= 4 ? 'bg-blue-500' : 'bg-green-500';

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 shadow-xl border-0">
                    {/* Progress Steps */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-2">
                            {['email', 'otp', 'password', 'success'].map((s, i) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                        step === s ? 'bg-red-500 text-white' :
                                        ['email', 'otp', 'password', 'success'].indexOf(step) > i 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {['email', 'otp', 'password', 'success'].indexOf(step) > i ? '✓' : i + 1}
                                    </div>
                                    {i < 3 && (
                                        <div className={`w-8 h-1 ${
                                            ['email', 'otp', 'password', 'success'].indexOf(step) > i 
                                                ? 'bg-green-500' 
                                                : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Enter Email */}
                        {step === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mb-4">
                                        <span className="text-3xl">🔑</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                                    <p className="text-gray-600 mt-2">No worries, we&apos;ll send you a reset code</p>
                                </div>

                                <form onSubmit={handleRequestReset} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading || !email}
                                        className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                Sending...
                                            </span>
                                        ) : 'Send Reset Code'}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 2: Enter OTP */}
                        {step === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mb-4">
                                        <span className="text-3xl">📧</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
                                    <p className="text-gray-600 mt-2">We sent a code to <strong>{email}</strong></p>
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-6">
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
                                                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                                                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                disabled={loading}
                                            />
                                        ))}
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                                            <p className="text-red-700 text-sm font-medium">{error}</p>
                                            {attemptsRemaining !== null && attemptsRemaining > 0 && (
                                                <p className="text-red-600 text-xs mt-1">
                                                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading || otp.join('').length !== 6}
                                        className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                Verifying...
                                            </span>
                                        ) : 'Verify Code'}
                                    </Button>

                                    {/* Resend */}
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive the code?</p>
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={countdown > 0 || loading}
                                            className={`text-sm font-medium ${
                                                countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700'
                                            }`}
                                        >
                                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                        </button>
                                    </div>

                                    {/* Change Email */}
                                    <div className="text-center pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('email');
                                                setOtp(['', '', '', '', '', '']);
                                                setError('');
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            ← Use a different email
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: New Password */}
                        {step === 'password' && (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
                                        <span className="text-3xl">🔐</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
                                    <p className="text-gray-600 mt-2">Your new password must be different from previous</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>

                                        {/* Password Strength */}
                                        {newPassword && (
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 flex gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                                    i < strengthScore ? strengthColor : 'bg-gray-200'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className={`text-xs font-medium ${
                                                        strengthScore <= 2 ? 'text-red-600' : 
                                                        strengthScore <= 3 ? 'text-yellow-600' : 
                                                        strengthScore <= 4 ? 'text-blue-600' : 'text-green-600'
                                                    }`}>{strengthLevel}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    {[
                                                        { key: 'minLength', label: 'At least 8 characters', met: passwordRequirements.minLength },
                                                        { key: 'hasLowercase', label: 'One lowercase letter', met: passwordRequirements.hasLowercase },
                                                        { key: 'hasUppercase', label: 'One uppercase letter', met: passwordRequirements.hasUppercase },
                                                        { key: 'hasNumber', label: 'One number', met: passwordRequirements.hasNumber },
                                                        { key: 'hasSpecial', label: 'One special character (@$!%*?&)', met: passwordRequirements.hasSpecial },
                                                    ].map(req => (
                                                        <div key={req.key} className={`flex items-center gap-1 ${req.met ? 'text-green-600' : ''}`}>
                                                            {req.met ? '✓' : '○'} {req.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                                confirmPassword && !passwordsMatch 
                                                    ? 'border-red-300 bg-red-50' 
                                                    : confirmPassword && passwordsMatch 
                                                        ? 'border-green-300 bg-green-50' 
                                                        : 'border-gray-300'
                                            }`}
                                            required
                                            disabled={loading}
                                        />
                                        {confirmPassword && !passwordsMatch && (
                                            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading || !allRequirementsMet || !passwordsMatch}
                                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                Resetting...
                                            </span>
                                        ) : 'Reset Password'}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 4: Success */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6">
                                    <span className="text-4xl">✅</span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h1>
                                <p className="text-gray-600 mb-8">
                                    Your password has been successfully reset. You can now login with your new password.
                                </p>
                                <Button
                                    onClick={() => router.push('/auth')}
                                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                >
                                    Go to Login
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tips */}
                    {step !== 'success' && (
                        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">💡</span>
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">Tips:</p>
                                    <ul className="mt-1 space-y-1 text-xs">
                                        <li>• Check spam/junk folder for the reset code</li>
                                        <li>• The code expires in 10 minutes</li>
                                        <li>• Use a strong, unique password</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <Link href="/auth" className="text-gray-600 hover:text-gray-800 text-sm">
                        ← Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent" />
            </div>
        }>
            <ForgotPasswordContent />
        </Suspense>
    );
}
