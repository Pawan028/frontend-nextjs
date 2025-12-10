 'use client';
// components/Navbar.tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export default function Navbar() {
  const router = useRouter();
  const { token, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  // Simple check - no hydration warning
  const isClient = typeof window !== 'undefined';

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              ShipMVP
            </Link>
            {isClient && token && (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/orders" className="text-gray-700 hover:text-blue-600">
                  Orders
                </Link>
                <Link href="/invoices" className="text-gray-700 hover:text-blue-600">
                  Invoices
                </Link>
              </>
            )}
          </div>
          
          <div>
            {isClient && (
              token ? (
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              ) : (
                <Link href="/auth" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
