'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import Button from './ui/Button';
import Input from './ui/Input';
import { useAuthStore } from '../stores/useAuthStore';  // ✅ ADD THIS

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
            const response = await api.post('/wallet/topup', {
                amount,
                reference: {
                    type: 'manual',
                    id: `TOPUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    description: `Wallet top-up of ₹${amount.toFixed(2)} via merchant portal`,
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            // ✅ UPDATE ZUSTAND STORE WITH NEW BALANCE
            const newBalance = data.data?.newBalance;
            if (newBalance !== undefined) {
                updateWalletBalance(newBalance);
            }

            // Invalidate wallet queries to refetch transactions
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            // Show success message
            alert(`✅ Top-up successful! New balance: ₹${newBalance}`);

            // Reset form and close
            setAmount('');
            setError('');
            onClose();
        },
        onError: (err: any) => {
            console.error('❌ Top-up error:', err.response?.data);
            const errorMsg = err.response?.data?.error?.message || 'Top-up failed. Please try again.';
            setError(errorMsg);
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
