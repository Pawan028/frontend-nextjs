 // lib/auth.ts
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (!token) {
    localStorage.removeItem('token');
    // Remove cookie
    document.cookie = 'token=; path=/; max-age=0';
  } else {
    localStorage.setItem('token', token);
    // Set cookie for middleware (7 days)
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
  }
}
