// stores/useAuthStore.ts
import { create } from 'zustand';
import { setToken, getToken } from '../lib/auth';

type User = {
  id: string;
  email: string;
  role?: string;
  name?: string;
} | null;

interface AuthState {
  token: string | null;
  user: User;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? getToken() : null,
  user: null,
  
  setAuth: (token, user) => {
    setToken(token);
    set({ token, user });
  },
  
  logout: () => {
    setToken(null);
    set({ token: null, user: null });
  },
  
  isAuthenticated: () => {
    return !!get().token;
  },
}));
