'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroWidgets() {
    const [activeTab, setActiveTab] = useState<'rate' | 'track'>('rate');
    const [pincode, setPincode] = useState('');
    const [weight, setWeight] = useState('');
    const [orderId, setOrderId] = useState('');

    return (
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('rate')}
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
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                        Pickup Pincode
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 110001"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                        Delivery Pincode
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 400001"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0.5"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>
                                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-sm">
                                    Check Rates
                                </button>
                            </div>
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
