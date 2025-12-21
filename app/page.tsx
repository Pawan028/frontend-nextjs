/**
 * Marketing Landing Page
 * Professional landing page to establish credibility and convert visitors
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ModernBackground from '@/components/ui/ModernBackground';
import ThemeToggle from '@/components/ThemeToggle';
import HeroWidgets from '@/components/home/HeroWidgets';
import IntegrationMarquee from '@/components/home/IntegrationMarquee';
import FeatureBento from '@/components/home/FeatureBento';
import { motion } from 'framer-motion';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, suffix: string = '') {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return { count, ref, suffix };
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stats for animated counters
  const shipments = useAnimatedCounter(50000, 2000);
  const avgDelivery = useAnimatedCounter(21, 1500);
  const costSavings = useAnimatedCounter(30, 1800);

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-blue-100 selection:text-blue-900">
      <ModernBackground />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ShipMVP
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">Features</a>
              <a href="#reach" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">Reach</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth" className="text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle mobile menu"
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

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-2">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Features
                </a>
                <a
                  href="#reach"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Reach
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Pricing
                </a>
                <hr className="my-2 border-gray-100 dark:border-slate-800" />
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mx-4 py-3 bg-blue-600 text-white rounded-lg text-center font-medium shadow-lg shadow-blue-500/20"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* New Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New: Smart NDR Management
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] mb-6">
                Shipping Made <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Simple & Smart
                </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl">
                The all-in-one logistics platform for Indian brands. Compare rates, track shipments, and boost delivery success — all in one dashboard.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  Start Shipping Free
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 px-4">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card required
                </div>
              </div>
            </div>

            {/* Right Widget */}
            <div className="relative z-10 flex justify-center lg:justify-end">
              {/* Decorative Blobs */}
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

              <HeroWidgets />
            </div>
          </div>
        </div>
      </section>

      {/* Integration Marquee */}
      <IntegrationMarquee />

      {/* Stats Section with Framer Motion (reusing counters but simpler layout) */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div ref={shipments.ref} className="text-center p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-gray-100 dark:border-slate-800">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {shipments.count.toLocaleString()}+
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium">Monthly Shipments</div>
            </div>
            <div ref={avgDelivery.ref} className="text-center p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-gray-100 dark:border-slate-800">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {(avgDelivery.count / 10).toFixed(1)} Days
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium">Avg. Delivery Time</div>
            </div>
            <div ref={costSavings.ref} className="text-center p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-gray-100 dark:border-slate-800">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {costSavings.count}%
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium">Shipping Cost Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to <span className="text-blue-600 dark:text-blue-400">Scale Faster</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed to simplify logistics, reduce costs, and delight your customers at every touchpoint.
            </p>
          </div>
          <FeatureBento />
        </div>
      </section>

      {/* Nationwide Reach Section (Replaces Global) */}
      <section id="reach" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 dark:bg-black">
          {/* Simple Map Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-no-repeat bg-center bg-cover filter invert dark:invert-0"></div>
          {/* Radial Gradient overlay to focus on center (symbolizing India focus) */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-900"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-white">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-orange-600/30 border border-orange-500/50 text-orange-300 font-semibold text-sm mb-6">
                Nationwide Coverage �🇳
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Deliver to every corner of India.
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Reach over 29,000+ pincodes across the country. From metro cities to Tier 2 & 3 towns, we've got you covered with our extensive courier network.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-orange-400 mb-1">29k+</div>
                  <div className="text-sm text-slate-400">Pincodes Covered</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-green-400 mb-1">10+</div>
                  <div className="text-sm text-slate-400">Courier Partners</div>
                </div>
              </div>
              <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105 text-white rounded-lg font-semibold transition-all shadow-lg shadow-orange-500/25">
                Check Serviceability
              </button>
            </div>
            <div className="relative flex justify-center">
              {/* Illustrative Card for India Map/Network */}
              <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
                <p className="text-center text-slate-400 mb-8 font-medium">Serving all major cities and beyond</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur'].map(city => (
                    <span key={city} className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 border border-slate-600">{city}</span>
                  ))}
                  <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 border border-slate-600">+ thousands more</span>
                </div>
                {/* Decorative pulse dots */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-green-500 rounded-full animate-ping delay-700"></div>
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full animate-ping delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Simply kept but refined style) */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 dark:text-slate-400">Choose the plan that fits your business scale.</p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Perfect for small businesses</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">₹0</span>
                <span className="text-gray-500 dark:text-slate-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 100 shipments/month', 'All courier integrations', 'Real-time tracking', 'Email support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="block w-full py-4 text-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-bold text-gray-900 dark:text-white transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Growth</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">For scaling businesses</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">₹999</span>
                <span className="text-gray-400 dark:text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited shipments', 'Priority courier rates', 'Bulk upload & API access', 'Dedicated account manager'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="block w-full py-4 text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">ShipMVP</div>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                Empowering D2C brands with smart logistics solutions. Ship smarter, faster, and cheaper within India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-slate-400">
              © 2025 ShipMVP. All rights reserved.
            </div>
            <div className="flex gap-6">
              {/* Social Icons Placeholder */}
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
