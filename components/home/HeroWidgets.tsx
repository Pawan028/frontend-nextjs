'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RateResult {
    courier: string;
    serviceName: string;
    price: number;
    eta: number;
}

export default function HeroWidgets() {
    const [activeTab, setActiveTab] = useState<'rate' | 'track'>('rate');
    const [originPincode, setOriginPincode] = useState('');
    const [destPincode, setDestPincode] = useState('');
    const [weight, setWeight] = useState('500');
    const [orderId, setOrderId] = useState('');
    
    // Rate calculator state
    const [isLoading, setIsLoading] = useState(false);
    const [rates, setRates] = useState<RateResult[]>([]);
    const [error, setError] = useState('');

    const handleCheckRates = async () => {
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
        setRates([]);

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
            }
        } catch {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const cheapestRate = rates.length > 0 
        ? rates.reduce((a, b) => a.price < b.price ? a : b) 
        : null;

    return (
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-slate-800">
                <button
                    onClick={() => { setActiveTab('rate'); setRates([]); setError(''); }}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'rate'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                        }`}
                >
                    Rate Calculator
                    {activeTab === 'rate' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('track')}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'track'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                        }`}
                >
                    Track Shipment
                    {activeTab === 'track' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'rate' ? (
                        <motion.div
                            key="rate"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Show form or results */}
                            {rates.length === 0 ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                            Pickup Pincode
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="e.g. 110001"
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                                            value={originPincode}
                                            onChange={(e) => setOriginPincode(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                            Delivery Pincode
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="e.g. 400001"
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                                            value={destPincode}
                                            onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                            Weight (grams)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={50000}
                                            placeholder="500"
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm dark:text-white"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                        />
                                    </div>
                                    
                                    {error && (
                                        <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                                            {error}
                                        </p>
                                    )}
                                    
                                    <button 
                                        onClick={handleCheckRates}
                                        disabled={isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Checking...
                                            </>
                                        ) : (
                                            'Check Rates'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* Results */
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                            Available Rates
                                        </h4>
                                        <button 
                                            onClick={() => setRates([])}
                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        >
                                            ← New Search
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {rates.map((rate, idx) => (
                                            <div 
                                                key={idx}
                                                className={`p-3 rounded-lg border ${
                                                    cheapestRate?.courier === rate.courier 
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {rate.courier}
                                                            {cheapestRate?.courier === rate.courier && (
                                                                <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                                                                    Best
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400">
                                                            {rate.eta} day{rate.eta > 1 ? 's' : ''} delivery
                                                        </p>
                                                    </div>
                                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                        ₹{rate.price}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <a 
                                        href="/sign-up"
                                        className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold text-center text-sm hover:shadow-lg transition-all"
                                    >
                                        Sign Up to Ship →
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="track"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                    Tracking ID / Order ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter AWB or Order ID"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                />
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Track up to 20 shipments at once. Separate IDs with commas.
                                </p>
                            </div>
                            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-sm">
                                Track Now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
