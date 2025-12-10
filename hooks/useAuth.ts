// hooks/useAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.replace('/auth');
    }
  }, [token, router]);

  return token;
}
