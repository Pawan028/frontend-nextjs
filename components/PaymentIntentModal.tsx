'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { showToast } from '../lib/api';
import Button from './ui/Button';

interface PaymentIntent {
  id: string;
  paymentUrl: string;
  gatewayOrderId: string;
  amount: number;
  status: string;
}

interface PaymentIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  type: 'WALLET_TOPUP' | 'INVOICE_PAYMENT';
  invoiceId?: string;
  description?: string;
  onSuccess?: () => void;
}

export default function PaymentIntentModal({
  isOpen,
  onClose,
  amount,
  type,
  invoiceId,
  description,
  onSuccess,
}: PaymentIntentModalProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Create payment intent
  const createIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/payments/intents', {
        amount,
        type,
        invoice_id: invoiceId,
        description: description || (type === 'WALLET_TOPUP' ? 'Wallet Top-up' : 'Invoice Payment'),
        gateway: 'SIMULATED',
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setPaymentIntent(data);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error?.message || 'Failed to create payment intent';
      showToast(errorMsg, 'error');
      onClose();
    },
  });

  // Simulate payment success
  const simulateSuccessMutation = useMutation({
    mutationFn: async (intentId: string) => {
      setIsProcessing(true);
      const response = await api.post(`/payments/simulate/${intentId}`);
      return response.data.data;
    },
    onSuccess: async (data) => {
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      showToast(
        type === 'WALLET_TOPUP'
          ? `✅ Wallet topped up successfully! Amount: ₹${amount.toFixed(2)}`
          : '✅ Invoice paid successfully!',
        'success'
      );

      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.error?.message || 'Payment simulation failed';
      showToast(errorMsg, 'error');
    },
  });

  // Cancel payment intent
  const cancelIntentMutation = useMutation({
    mutationFn: async (intentId: string) => {
      const response = await api.post(`/payments/intents/${intentId}/cancel`);
      return response.data.data;
    },
    onSuccess: () => {
      showToast('Payment cancelled', 'info');
      handleClose();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error?.message || 'Failed to cancel payment';
      showToast(errorMsg, 'error');
      handleClose();
    },
  });

  // Initialize payment intent on modal open
  useEffect(() => {
    if (isOpen && !paymentIntent) {
      createIntentMutation.mutate();
    }
  }, [isOpen]);

  const handleClose = () => {
    setPaymentIntent(null);
    setIsProcessing(false);
    onClose();
  };

  const handleSimulateSuccess = () => {
    if (paymentIntent) {
      simulateSuccessMutation.mutate(paymentIntent.id);
    }
  };

  const handleCancel = () => {
    if (paymentIntent) {
      cancelIntentMutation.mutate(paymentIntent.id);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const isLoading =
    createIntentMutation.isPending ||
    simulateSuccessMutation.isPending ||
    cancelIntentMutation.isPending ||
    isProcessing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {type === 'WALLET_TOPUP' ? '💳 Payment Gateway' : '🧾 Invoice Payment'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {createIntentMutation.isPending ? 'Initializing...' : 'Secure Payment Simulation'}
              </p>
            </div>
            {!isLoading && (
              <button
                onClick={handleClose}
                className="text-white hover:text-blue-200 text-3xl transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {createIntentMutation.isPending && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Creating payment intent...</p>
            </div>
          )}

          {/* Payment Intent Created */}
          {paymentIntent && !isProcessing && (
            <div className="space-y-6">
              {/* Amount Display */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <p className="text-4xl font-bold text-blue-700">₹{amount.toFixed(2)}</p>
                {description && (
                  <p className="text-sm text-gray-600 mt-2">{description}</p>
                )}
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-gray-900 text-xs">{paymentIntent.gatewayOrderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {paymentIntent.status}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">Test Payment Environment</p>
                    <p className="text-xs text-blue-700">
                      This is a simulated payment gateway for testing. Click "Simulate Success" to complete the payment or "Cancel" to abort.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={isLoading}
                  className="flex-1 border-2 hover:bg-gray-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>❌</span>
                    <span>Cancel Payment</span>
                  </span>
                </Button>
                <Button
                  onClick={handleSimulateSuccess}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    <span>Simulate Success</span>
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
              <p className="text-gray-900 font-semibold mb-1">Processing Payment...</p>
              <p className="text-gray-600 text-sm">Please wait while we complete your transaction</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>🔒</span>
            <span>Secure & Encrypted Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
