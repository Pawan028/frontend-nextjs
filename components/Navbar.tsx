 'use client';
// components/Navbar.tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export default function Navbar() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  // Don't render navigation links until auth is initialized
  // This prevents hydration mismatches
  if (!isInitialized) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              ShipMVP
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              ShipMVP
            </Link>
            
            {/* Navigation Links - Only show when authenticated */}
            {token && (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/orders" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Orders
                </Link>
                <Link 
                  href="/ndr" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  NDR
                </Link>
                <Link 
                  href="/invoices" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Invoices
                </Link>
                <Link 
                  href="/wallet" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Wallet
                </Link>
                <Link 
                  href="/settings/addresses" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Settings
                </Link>
              </>
            )}
          </div>
          
          {/* Right side - User & Auth */}
          <div className="flex items-center gap-4">
            {token && user && (
              <div className="text-sm">
                <div className="text-gray-900 font-medium">{user.name || user.email}</div>
                {user.merchantProfile && (
                  <div className="text-gray-600 text-xs">
                    Balance: ₹{user.merchantProfile.walletBalance.toFixed(2)}
                  </div>
                )}
              </div>
            )}
            
            {token ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors shadow-sm"
              >
                Logout
              </button>
            ) : (
              <Link 
                href="/auth" 
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm inline-block"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
