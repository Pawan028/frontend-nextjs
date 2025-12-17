'use client';
// components/Navbar.tsx
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';

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
    router.push('/auth');
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
    { href: '/settings/addresses', label: 'Settings', icon: '⚙️' },
  ], []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Don't render navigation links until auth is initialized
  // Also hide Navbar entirely on auth pages to let the 3D background shine
  if (!isInitialized || pathname.startsWith('/auth')) {
    return null;
  }



  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-8">
              <Link
                href={user?.role === 'ADMIN' ? "/admin/invoices" : "/dashboard"}
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                ShipMVP
              </Link>

              {/* Desktop Navigation Links - Hidden on mobile */}
              {token && (
                <div className="hidden lg:flex items-center gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`font-medium transition-colors ${isActive(link.href)
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Admin Link - Only show for admin users */}
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin/invoices"
                      className={`font-semibold transition-colors flex items-center gap-1 ${isActive('/admin')
                        ? 'text-purple-700'
                        : 'text-purple-600 hover:text-purple-700'
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
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User info - hidden on mobile */}
              {token && user && (
                <div className="hidden sm:block text-sm text-right">
                  <div className="text-gray-900 dark:text-white font-medium">{user.name || user.email}</div>
                  {user.merchantProfile && (
                    <div className="text-gray-600 dark:text-gray-300 text-xs">
                      Balance: ₹{user.merchantProfile.walletBalance.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Auth buttons - Desktop */}
              <div className="hidden sm:block">
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

              {/* Mobile hamburger button */}
              {token && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
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
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-800 shadow-2xl dark:shadow-slate-900 z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
            <span className="text-lg font-bold text-blue-600">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info on mobile */}
          {user && (
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <div className="text-gray-900 dark:text-white font-medium">{user.name || user.email}</div>
              {user.merchantProfile && (
                <div className="text-blue-600 font-semibold mt-1">
                  ₹{user.merchantProfile.walletBalance.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(link.href)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                    {isActive(link.href) && (
                      <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </Link>
                </li>
              ))}

              {/* Admin Link */}
              {user?.role === 'ADMIN' && (
                <li>
                  <Link
                    href="/admin/invoices"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin')
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-purple-600 hover:bg-purple-50'
                      }`}
                  >
                    <span className="text-lg">👑</span>
                    <span>Admin Panel</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Logout button at bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
