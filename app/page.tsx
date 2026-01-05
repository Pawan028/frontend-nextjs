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
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import CTASection from '@/components/home/CTASection';
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
                <Link href="/sign-in" className="text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/sign-up"
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
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
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
                  href="/sign-up"
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

      {/* Stats Section with Icons */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div 
              ref={shipments.ref} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {shipments.count.toLocaleString()}+
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium text-sm">Monthly Shipments</div>
            </motion.div>
            
            <motion.div 
              ref={avgDelivery.ref} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {(avgDelivery.count / 10).toFixed(1)} Days
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium text-sm">Avg. Delivery Time</div>
            </motion.div>
            
            <motion.div 
              ref={costSavings.ref} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {costSavings.count}%
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium text-sm">Cost Savings</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                98%
              </div>
              <div className="text-gray-500 dark:text-slate-400 font-medium text-sm">Customer Satisfaction</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Bento Grid Features */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-4">
                Features
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything you need to <span className="text-blue-600 dark:text-blue-400">Scale Faster</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                Powerful tools designed to simplify logistics, reduce costs, and delight your customers at every touchpoint.
              </p>
            </motion.div>
          </div>
          <FeatureBento />
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

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
                href="/sign-up"
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
                href="/sign-up"
                className="block w-full py-4 text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-900 dark:bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">ShipMVP</div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                Empowering D2C brands with smart logistics solutions. Ship smarter, faster, and cheaper across India.
              </p>
              {/* Social Icons */}
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2026 ShipMVP. All rights reserved. Made with ❤️ in India
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
