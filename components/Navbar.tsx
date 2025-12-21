'use client';
// components/Navbar.tsx
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    // Redirect to landing page instead of auth
    router.push('/');
  };

  interface NavLink {
    href: string;
    label: string;
    icon: string;
  }

  const navLinks = useMemo<NavLink[]>(() => [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/orders', label: 'Orders', icon: '📦' },
    { href: '/orders/pickup', label: 'Pickup', icon: '🚚' },
    { href: '/ndr', label: 'NDR', icon: '🔔' },
    { href: '/invoices', label: 'Invoices', icon: '📄' },
    { href: '/wallet', label: 'Wallet', icon: '💰' },
    { href: '/dashboard/rates', label: 'Rates', icon: '💵' },
  ], []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Don't render navigation links until auth is initialized
  // Also hide Navbar entirely on auth pages to let the 3D background shine
  if (!isInitialized || pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <>
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-8">
              <Link
                href={user?.role === 'ADMIN' ? "/admin/invoices" : "/dashboard"}
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                ShipMVP
              </Link>

              {/* Desktop Navigation Links - Hidden on mobile */}
              {token && (
                <div className="hidden lg:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Admin Link - Only show for admin users */}
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin/invoices"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${isActive('/admin')
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}
                    >
                      <span>👑</span>
                      <span>Admin</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right side - User & Auth */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>

              {/* User Dropdown or Login Button */}
              <div className="hidden sm:block">
                {token ? (
                  <UserDropdown />
                ) : (
                  <Link
                    href="/auth"
                    className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-lg hover:shadow-blue-500/30"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info on mobile */}
          {user && (
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">{user.name || user.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-32">{user.email}</div>
                </div>
              </div>
              {user.merchantProfile && (
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    ₹{user.merchantProfile.walletBalance.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {token ? navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(link.href)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              )) : (
                <li className="text-center py-4">
                  <Link href="/auth" className="block w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg">
                    Login to Continue
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Logout button at bottom */}
          {token && (
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

