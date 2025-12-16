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

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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

      // If backend returns token with registration, use it
      if (res.data.data?.token) {
        console.log('🔐 Token received, auto-logging in...');
        const user = res.data.data.user || {
          id: res.data.data.id || '',
          email: res.data.data.email || email,
          name: res.data.data.name || name,
          role: res.data.data.role || 'MERCHANT',
        };
        
        setAuth(res.data.data.token, user);
        window.location.href = '/dashboard';
      } else {
        // Registration successful but no token - need to login
        console.log('✅ Registration successful, now logging in...');
        const loginRes = await api.post<BackendResponse>('/auth/login', {
          email,
          password,
        });
        
        if (loginRes.data.success && loginRes.data.data?.token) {
          const user = loginRes.data.data.user || {
            id: loginRes.data.data.id || '',
            email: loginRes.data.data.email || email,
            name: loginRes.data.data.name || name,
            role: loginRes.data.data.role || 'MERCHANT',
          };
          
          setAuth(loginRes.data.data.token, user);
          window.location.href = '/dashboard';
        } else {
          // Fallback: redirect to login page
          router.push('/auth?registered=true');
        }
      }
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                </div>
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
