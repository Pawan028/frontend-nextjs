'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { showToast } from '../lib/api';
import Button from './ui/Button';
import Input from './ui/Input';
import { useAuthStore } from '../stores/useAuthStore';

interface WalletTopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
}

export default function WalletTopupModal({ isOpen, onClose, currentBalance }: WalletTopupModalProps) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();
    const updateWalletBalance = useAuthStore((s) => s.updateWalletBalance);  // ✅ ADD THIS

    const topupMutation = useMutation({
        mutationFn: async (amount: number) => {
            // ✅ LIVE: Backend implemented POST /v1/wallet/topup (Phase 1)
            // Requires amount and reference object (type, id, description)
            // Returns: newBalance, transaction info, fully auth-protected
            
            const response = await api.post('/wallet/topup', {
                amount,
                reference: {
                    type: 'manual',
                    id: `TOPUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    description: 'User initiated wallet top-up'
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            // ✅ INSTANT UPDATE: Update Zustand store immediately with new balance
            const newBalance = data?.data?.newBalance || data?.newBalance;
            if (newBalance !== undefined) {
                updateWalletBalance(newBalance);
            }

            // ✅ PRODUCTION FIX: Invalidate queries in background (non-blocking)
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            // Show success toast with new balance
            showToast(`✅ Wallet topped up! New balance: ₹${newBalance?.toFixed(2)}`, 'success');

            // Reset form and close immediately (don't wait for refetch)
            setAmount('');
            setError('');
            onClose();
        },
        onError: (err: any, variables) => {
            console.error('❌ Top-up error:', err.response?.data);
            
            // ✅ ROLLBACK: Revert optimistic update on error
            const rollbackBalance = currentBalance; // Original balance before optimistic update
            updateWalletBalance(rollbackBalance);
            
            const errorMsg = err.response?.data?.error?.message || 'Top-up failed. Please try again.';
            setError(errorMsg);
            showToast(`❌ ${errorMsg}`, 'error');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const amountNum = parseFloat(amount);

        // Validation
        if (!amount || isNaN(amountNum)) {
            setError('Please enter a valid amount');
            return;
        }

        if (amountNum < 100) {
            setError('Minimum top-up amount is ₹100');
            return;
        }

        if (amountNum > 100000) {
            setError('Maximum top-up amount is ₹1,00,000');
            return;
        }

        // ✅ OPTIMISTIC UPDATE: Show new balance immediately before API call
        const optimisticNewBalance = currentBalance + amountNum;
        updateWalletBalance(optimisticNewBalance);
        
        // Close modal immediately for instant feedback
        onClose();
        
        // Show optimistic toast
        showToast(`💰 Adding ₹${amountNum.toFixed(2)} to wallet...`, 'info');

        topupMutation.mutate(amountNum);
    };

    const quickAmounts = [500, 1000, 2000, 5000];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">💰 Top-up Wallet</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                        disabled={topupMutation.isPending}
                    >
                        ×
                    </button>
                </div>

                {/* Current Balance */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-600">Current Balance</p>
                    <p className="text-2xl font-bold text-blue-700">₹{currentBalance.toFixed(2)}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="number"
                        label="Top-up Amount (₹)"
                        placeholder="Enter amount (min ₹100)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={topupMutation.isPending}
                        error={error}
                        min="100"
                        max="100000"
                        step="1"
                    />

                    {/* Quick Amount Buttons */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Quick Select:</p>
                        <div className="grid grid-cols-4 gap-2">
                            {quickAmounts.map((quickAmount) => (
                                <button
                                    key={quickAmount}
                                    type="button"
                                    onClick={() => setAmount(String(quickAmount))}
                                    disabled={topupMutation.isPending}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500 transition-colors disabled:opacity-50"
                                >
                                    ₹{quickAmount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Helper Text */}
                    <p className="text-xs text-gray-500">
                        💡 Min: ₹100 | Max: ₹1,00,000 per transaction
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={topupMutation.isPending}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={topupMutation.isPending || !amount}
                            className="flex-1"
                        >
                            {topupMutation.isPending ? 'Processing...' : 'Add Money'}
                        </Button>
                    </div>
                </form>

                {/* Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Secure payment processing
                </p>
            </div>
        </div>
    );
}
