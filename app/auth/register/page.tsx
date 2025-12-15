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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Sign up to start shipping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth" className="text-blue-600 hover:underline font-semibold">
            Sign In Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
