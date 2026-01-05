'use client';

/**
 * Public Rate Calculator for Landing Page
 * Allows visitors to check shipping rates without signing up
 * Shows CTA to sign up after getting rates
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface RateResult {
  courier: string;
  serviceName: string;
  price: number;
  eta: number;
}

export default function PublicRateCalculator() {
  const [originPincode, setOriginPincode] = useState('');
  const [destPincode, setDestPincode] = useState('');
  const [weight, setWeight] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const [rates, setRates] = useState<RateResult[]>([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleCalculate = async () => {
    // Validate inputs
    if (!/^\d{6}$/.test(originPincode)) {
      setError('Please enter a valid 6-digit pickup pincode');
      return;
    }
    if (!/^\d{6}$/.test(destPincode)) {
      setError('Please enter a valid 6-digit delivery pincode');
      return;
    }
    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    setError('');
    setIsLoading(true);
    setHasSearched(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/v1/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originPincode,
          destPincode,
          weight: parseFloat(weight),
          paymentType: 'prepaid',
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.rates) {
        setRates(data.data.rates);
      } else {
        setError(data.error?.message || 'Failed to fetch rates');
        setRates([]);
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
      setRates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const cheapestRate = rates.length > 0 
    ? rates.reduce((a, b) => a.price < b.price ? a : b) 
    : null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-blue-500/10 border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span>📦</span> Quick Rate Check
          </h3>
          <p className="text-blue-100 text-sm">Get instant shipping rates</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Pickup Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="110001"
                value={originPincode}
                onChange={(e) => setOriginPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Delivery Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="400001"
                value={destPincode}
                onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
              Weight (grams)
            </label>
            <input
              type="number"
              min={1}
              max={50000}
              placeholder="500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Checking Rates...
              </>
            ) : (
              <>
                <span>🔍</span> Check Rates
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && !isLoading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 dark:border-slate-800"
            >
              {rates.length > 0 ? (
                <div className="p-6 space-y-4">
                  {/* Best Rate Highlight */}
                  {cheapestRate && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                            ✨ Best Rate
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {cheapestRate.courier}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {cheapestRate.eta} day{cheapestRate.eta !== 1 ? 's' : ''} delivery
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ₹{cheapestRate.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Rates */}
                  {rates.length > 1 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        All Available Rates ({rates.length})
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                        {rates.map((rate, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm"
                          >
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {rate.courier}
                              </span>
                              <span className="text-gray-400 mx-1">•</span>
                              <span className="text-gray-500 dark:text-slate-400">
                                {rate.eta}d
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₹{rate.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href="/sign-up"
                    className="block w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-center font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Sign Up to Ship at This Rate →
                  </Link>
                  <p className="text-center text-xs text-gray-400 dark:text-slate-500">
                    No setup fees • Pay as you ship
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-slate-400 text-sm">
                    {error || 'No rates available for this route'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
