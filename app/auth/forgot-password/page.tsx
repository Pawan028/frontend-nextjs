'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { showToast } from '../../../lib/api';

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

    // Step-specific left panel content
    const getLeftPanelContent = () => {
        switch (step) {
            case 'email':
                return {
                    icon: (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    ),
                    title: 'Reset your',
                    highlight: 'password',
                    description: 'Enter your email and we\'ll send you a secure code to reset your password.',
                    gradient: 'from-orange-500 to-red-500'
                };
            case 'otp':
                return {
                    icon: (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    ),
                    title: 'Check your',
                    highlight: 'inbox',
                    description: 'We\'ve sent a 6-digit verification code to your email address.',
                    gradient: 'from-blue-500 to-cyan-500'
                };
            case 'password':
                return {
                    icon: (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    ),
                    title: 'Create new',
                    highlight: 'password',
                    description: 'Choose a strong password that you haven\'t used before.',
                    gradient: 'from-green-500 to-emerald-500'
                };
            case 'success':
                return {
                    icon: (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    title: 'Password',
                    highlight: 'reset!',
                    description: 'Your password has been successfully changed. You can now sign in.',
                    gradient: 'from-green-500 to-emerald-500'
                };
        }
    };

    const panelContent = getLeftPanelContent();

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Premium Glassmorphic Design */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex-col justify-between relative overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${panelContent.gradient} opacity-30 rounded-full blur-3xl animate-blob`}></div>
                    <div className="absolute top-1/2 -right-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>
                
                {/* Top - Logo & Back */}
                <div className="relative z-10">
                    <Link href="/auth" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm group">
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Login
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
                
                {/* Middle - Dynamic Content */}
                <div className="relative z-10 space-y-8">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={`w-16 h-16 bg-gradient-to-br ${panelContent.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                            {panelContent.icon}
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                            {panelContent.title}<br />
                            <span className={`bg-gradient-to-r ${panelContent.gradient} bg-clip-text text-transparent`}>{panelContent.highlight}</span>
                        </h2>
                        <p className="text-white/70 text-lg max-w-sm">
                            {panelContent.description}
                        </p>
                    </motion.div>
                    
                    {/* Progress Steps */}
                    <div className="flex items-center gap-3">
                        {['email', 'otp', 'password', 'success'].map((s, i) => {
                            const stepIndex = ['email', 'otp', 'password', 'success'].indexOf(step);
                            const isCompleted = i < stepIndex;
                            const isCurrent = s === step;
                            return (
                                <div key={s} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                                        isCompleted ? 'bg-green-500 text-white' :
                                        isCurrent ? `bg-gradient-to-br ${panelContent.gradient} text-white shadow-lg` :
                                        'bg-white/10 text-white/40'
                                    }`}>
                                        {isCompleted ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : i + 1}
                                    </div>
                                    {i < 3 && (
                                        <div className={`w-8 h-1 rounded-full transition-all ${
                                            isCompleted ? 'bg-green-500' : 'bg-white/10'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Tips Card */}
                    {step !== 'success' && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white/90 font-medium text-sm mb-1">Quick Tips</p>
                                    <ul className="text-white/60 text-xs space-y-1">
                                        <li>• Check spam/junk folder for the code</li>
                                        <li>• Code expires in 10 minutes</li>
                                        <li>• Use a strong, unique password</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Bottom - Footer */}
                <div className="relative z-10 flex items-center justify-between">
                    <p className="text-white/40 text-sm">© 2025 ShipMVP</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-white/40 hover:text-white/60 text-sm transition-colors">Help</a>
                        <a href="#" className="text-white/40 hover:text-white/60 text-sm transition-colors">Support</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8 bg-gray-50 dark:bg-slate-900 relative">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-50 dark:opacity-30" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}></div>
                
                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/auth" className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors mb-4 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Login
                        </Link>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">ShipMVP</span>
                        </div>
                        
                        {/* Mobile Progress */}
                        <div className="flex justify-center items-center gap-2 mt-6">
                            {['email', 'otp', 'password', 'success'].map((s, i) => {
                                const stepIndex = ['email', 'otp', 'password', 'success'].indexOf(step);
                                const isCompleted = i < stepIndex;
                                const isCurrent = s === step;
                                return (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                                            isCompleted ? 'bg-green-500 text-white' :
                                            isCurrent ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' :
                                            'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                                        }`}>
                                            {isCompleted ? '✓' : i + 1}
                                        </div>
                                        {i < 3 && <div className={`w-6 h-1 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-slate-900/50 p-8 border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        {/* Card glow effect */}
                        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${panelContent.gradient} opacity-10 rounded-full blur-3xl`}></div>
                        
                        <div className="relative z-10">
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
                                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                </svg>
                                            </div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
                                            <p className="text-gray-500 dark:text-slate-400 mt-2">No worries, we&apos;ll send you a reset code</p>
                                        </div>

                                        <form onSubmit={handleRequestReset} className="space-y-5">
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
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="you@example.com"
                                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400"
                                                        required
                                                        disabled={loading}
                                                    />
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
                                                disabled={loading || !email}
                                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Sending...
                                                    </span>
                                                ) : 'Send Reset Code'}
                                            </button>
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
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check Your Email</h1>
                                            <p className="text-gray-500 dark:text-slate-400 mt-2">We sent a code to <span className="font-medium text-gray-700 dark:text-slate-300">{email}</span></p>
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
                                                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white ${
                                                            error ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-slate-600'
                                                        }`}
                                                        disabled={loading}
                                                    />
                                                ))}
                                            </div>

                                            {/* Error Message */}
                                            {error && (
                                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-center">
                                                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                                                    {attemptsRemaining !== null && attemptsRemaining > 0 && (
                                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                                                            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading || otp.join('').length !== 6}
                                                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Verifying...
                                                    </span>
                                                ) : 'Verify Code'}
                                            </button>

                                            {/* Resend */}
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Didn&apos;t receive the code?</p>
                                                <button
                                                    type="button"
                                                    onClick={handleResend}
                                                    disabled={countdown > 0 || loading}
                                                    className={`text-sm font-semibold transition-colors ${
                                                        countdown > 0 ? 'text-gray-400 dark:text-slate-500 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                                                    }`}
                                                >
                                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                                </button>
                                            </div>

                                            {/* Change Email */}
                                            <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-700">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setStep('email');
                                                        setOtp(['', '', '', '', '', '']);
                                                        setError('');
                                                    }}
                                                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
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
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Password</h1>
                                            <p className="text-gray-500 dark:text-slate-400 mt-2">Your new password must be different</p>
                                        </div>

                                        <form onSubmit={handleResetPassword} className="space-y-4">
                                            {/* New Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400"
                                                        required
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
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
                                                                            i < strengthScore ? strengthColor : 'bg-gray-200 dark:bg-slate-600'
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
                                                        <div className="text-xs text-gray-500 dark:text-slate-400 grid grid-cols-2 gap-1">
                                                            <div className={`flex items-center gap-1 ${passwordRequirements.minLength ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                                {passwordRequirements.minLength ? '✓' : '○'} 8+ chars
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${passwordRequirements.hasLowercase ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                                {passwordRequirements.hasLowercase ? '✓' : '○'} Lowercase
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${passwordRequirements.hasUppercase ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                                {passwordRequirements.hasUppercase ? '✓' : '○'} Uppercase
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${passwordRequirements.hasNumber ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                                {passwordRequirements.hasNumber ? '✓' : '○'} Number
                                                            </div>
                                                            <div className={`flex items-center gap-1 col-span-2 ${passwordRequirements.hasSpecial ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                                {passwordRequirements.hasSpecial ? '✓' : '○'} Special (@$!%*?&)
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Confirm Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Confirm Password
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all disabled:bg-gray-100 dark:disabled:bg-slate-700 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 ${
                                                            confirmPassword && !passwordsMatch 
                                                                ? 'border-red-300 dark:border-red-500' 
                                                                : confirmPassword && passwordsMatch 
                                                                    ? 'border-green-300 dark:border-green-500' 
                                                                    : 'border-gray-200 dark:border-slate-600'
                                                        }`}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {confirmPassword && !passwordsMatch && (
                                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Passwords do not match
                                                    </p>
                                                )}
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
                                                disabled={loading || !allRequirementsMet || !passwordsMatch}
                                                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Resetting...
                                                    </span>
                                                ) : 'Reset Password'}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Step 4: Success */}
                                {step === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-4"
                                    >
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h1>
                                        <p className="text-gray-500 dark:text-slate-400 mb-8">
                                            Your password has been successfully reset. You can now login with your new password.
                                        </p>
                                        <button
                                            onClick={() => router.push('/auth')}
                                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                        >
                                            Go to Login
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        }>
            <ForgotPasswordContent />
        </Suspense>
    );
}
