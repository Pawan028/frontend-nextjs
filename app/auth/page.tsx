 'use client';
// app/auth/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

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

      // Store auth data in Zustand + localStorage
      console.log('💾 Storing auth data...');
      setAuth(token, user);
      
      // Verify storage
      const storedToken = localStorage.getItem('token');
      console.log('✅ Token stored in localStorage:', storedToken ? 'YES' : 'NO');

      // Redirect to dashboard
      console.log('🚀 Redirecting to dashboard...');
      window.location.href = '/dashboard';

    } catch (err: unknown) {
      console.error('❌ Login error:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">ShipMVP</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
            <strong>Test Account:</strong><br/>
            Email: <span className="font-mono">newuser@test.com</span><br/>
            Password: <span className="font-mono">Test@123</span>
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
}
