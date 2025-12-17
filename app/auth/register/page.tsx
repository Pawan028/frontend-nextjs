 'use client';
// app/auth/register/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import api, { showToast } from '../../../lib/api';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { useAuthStore } from '../../../stores/useAuthStore';

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
    token?: string;
    user?: {
      id: string;
      email: string;
      name?: string;
      role?: string;
    };
    // Registration might return user without token
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password requirements (must match backend)
    const passwordErrors: string[] = [];
    if (password.length < 8) passwordErrors.push('at least 8 characters');
    if (!/[a-z]/.test(password)) passwordErrors.push('one lowercase letter');
    if (!/[A-Z]/.test(password)) passwordErrors.push('one uppercase letter');
    if (!/\d/.test(password)) passwordErrors.push('one number');
    if (!/[@$!%*?&]/.test(password)) passwordErrors.push('one special character (@$!%*?&)');
    
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Registering user...');
      
      const res = await api.post<BackendResponse>('/auth/register', {
        name,
        email,
        password,
        role: 'merchant',
      });

      console.log('✅ Registration response:', res.data);

      // Check if registration was successful
      if (!res.data.success) {
        throw new Error(res.data.error?.message || 'Registration failed');
      }

      // Registration successful - redirect to email verification
      console.log('✅ Registration successful, redirecting to email verification...');
      showToast('Registration successful! Please verify your email.', 'success');
      
      // Redirect to verify-email page with email parameter
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&newUser=true`);
    } catch (err) {
      console.error('❌ Registration error:', err);
      
      // Extract detailed error message
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        const statusCode = err.response?.status;
        
        console.error('Backend error:', backendError);
        console.error('Status code:', statusCode);
        
        if (statusCode === 400) {
          const errorMsg = backendError?.error?.message || backendError?.message;
          if (typeof errorMsg === 'string' && (errorMsg.includes('already') || errorMsg.includes('exists'))) {
            setError('Email already registered. Try logging in instead.');
          } else {
            setError(errorMsg || 'Invalid registration data. Please check all fields.');
          }
        } else if (statusCode === 409) {
          setError('Email already exists. Please login instead.');
        } else {
          setError(backendError?.error?.message || backendError?.message || 'Registration failed. Please try again.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="text-3xl font-bold text-white">ShipMVP</Link>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Start shipping<br />in minutes.
          </h2>
          <p className="text-blue-100 text-lg">
            Create your free account and get access to India&apos;s top couriers.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>No setup fees or monthly charges</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Compare rates from 10+ couriers</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span>Real-time tracking & NDR management</span>
            </div>
          </div>
        </div>
        <div className="text-blue-200 text-sm">
          © 2025 ShipMVP. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-blue-600">ShipMVP</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="text-gray-600 mt-2">Start shipping in under 2 minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => {
                        const strength = [
                          password.length >= 8,
                          /[a-z]/.test(password),
                          /[A-Z]/.test(password),
                          /\d/.test(password),
                          /[@$!%*?&]/.test(password)
                        ].filter(Boolean).length;
                        return (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i < strength 
                                ? strength <= 2 ? 'bg-red-500' : strength <= 3 ? 'bg-yellow-500' : strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                        {password.length >= 8 ? '✓' : '○'} At least 8 characters
                      </div>
                      <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                        {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                        {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : ''}`}>
                        {/\d/.test(password) ? '✓' : '○'} One number
                      </div>
                      <div className={`flex items-center gap-1 ${/[@$!%*?&]/.test(password) ? 'text-green-600' : ''}`}>
                        {/[@$!%*?&]/.test(password) ? '✓' : '○'} One special character (@$!%*?&)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-300 bg-red-50' 
                      : confirmPassword && password === confirmPassword 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                    Creating Account...
                  </span>
                ) : 'Create Free Account'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
