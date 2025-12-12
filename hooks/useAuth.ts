 // hooks/useAuth.ts
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    // Only check after auth is initialized
    if (isInitialized && !token) {
      router.push('/auth');
    }
  }, [token, isInitialized, router]);

  return token;
}
