'use client';

// app/wallet/page.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/format';
import { useAuthStore } from '../../stores/useAuthStore';
import PaymentIntentModal from '../../components/PaymentIntentModal';  // ✅ NEW: Payment Intent Modal

interface Transaction {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    closingBalance: number;
    createdAt: string;
}

interface WalletResponse {
    success: boolean;
    data: {
        balance: number;
        transactions: Transaction[];
    };
}

export default function WalletPage() {
    const user = useAuthStore((s) => s.user);
    const updateWalletBalance = useAuthStore((s) => s.updateWalletBalance);
    const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
    const [topupAmount, setTopupAmount] = useState(1000); // Default amount

    // ✅ PRODUCTION FIX: Fetch live balance from API for accuracy
    const { data: balanceResponse, isLoading: balanceLoading } = useQuery({
        queryKey: ['wallet-balance'],
        queryFn: async () => {
            const res = await api.get('/wallet/balance');
            // Update Zustand store with fresh balance
            const balance = res.data?.data?.balance;
            if (balance !== undefined) {
                updateWalletBalance(balance);
            }
            return res.data;
        },
        staleTime: 0, // Always fetch fresh data
        refetchOnWindowFocus: true, // Refetch when user returns to tab
    });

    const { data: transactionsResponse, isLoading: transactionsLoading } = useQuery<WalletResponse>({
        queryKey: ['wallet-transactions'],
        queryFn: async () => {
            const res = await api.get('/wallet/transactions');
            return res.data;
        },
    });

    const walletBalance = balanceResponse?.data?.balance ?? user?.merchantProfile?.walletBalance ?? 0;
    const transactions = transactionsResponse?.data?.transactions || [];
    const isLoading = balanceLoading || transactionsLoading;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-7xl mx-auto px-4 py-8"
        >
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                <p className="text-gray-600 mt-1">Manage your wallet balance and transactions</p>
            </div>

            {/* Wallet Balance Card */}
            <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-blue-100 text-sm mb-1">Available Balance</p>
                        <h2 className="text-4xl font-bold">{formatCurrency(walletBalance)}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={topupAmount}
                            onChange={(e) => setTopupAmount(Number(e.target.value))}
                            min="100"
                            max="100000"
                            step="100"
                            className="hidden sm:block w-32 px-3 py-2 bg-white/90 backdrop-blur-sm text-blue-900 font-semibold rounded-lg border-2 border-white/50 focus:border-white focus:outline-none"
                            placeholder="Amount"
                        />
                        <button
                            onClick={() => setIsTopupModalOpen(true)}
                            className="bg-white text-blue-600 hover:bg-blue-50 rounded-lg px-4 py-2 sm:px-6 sm:py-3 font-semibold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <span className="text-2xl">💰</span>
                            <span className="hidden sm:inline">Top Up Wallet</span>
                        </button>
                    </div>
                </div>
            </Card>


            {/* Transaction History */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                    {transactions.length > 0 && (
                        <span className="text-sm text-gray-600">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💳</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                        <p className="text-gray-600">Your wallet transactions will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            tx.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'
                                        }`}
                                    >
                                        {tx.type === 'CREDIT' ? '⬇️' : '⬆️'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{tx.description}</p>
                                        <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`text-lg font-semibold ${
                                            tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {tx.type === 'CREDIT' ? '+' : '-'}
                                        {formatCurrency(tx.amount)}
                                    </p>
                                    <p className="text-sm text-gray-500">Balance: {formatCurrency(tx.closingBalance)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* ✅ Payment Intent Modal */}
            {isTopupModalOpen && (
                <PaymentIntentModal
                    isOpen={isTopupModalOpen}
                    onClose={() => setIsTopupModalOpen(false)}
                    amount={topupAmount}
                    type="WALLET_TOPUP"
                    description={`Wallet top-up of ₹${topupAmount}`}
                    onSuccess={() => {
                        // Refetch wallet data after successful payment
                        updateWalletBalance(walletBalance + topupAmount);
                    }}
                />
            )}
        </motion.div>
    );
}
