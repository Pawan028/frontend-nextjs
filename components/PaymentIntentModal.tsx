'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { showToast } from '../lib/api';
import Button from './ui/Button';

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentIntent {
  id: string;
  paymentUrl: string;
  gatewayOrderId: string;
  amount: number;
  status: string;
}

interface RazorpayConfig {
  isConfigured: boolean;
  isTestMode: boolean;
  keyId: string;
}

interface RazorpayOrderResponse {
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount: number;
  currency: string;
  intent_id: string;
  is_test_mode: boolean;
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

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'SIMULATED'>('RAZORPAY');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const queryClient = useQueryClient();

  // Check Razorpay configuration
  const { data: razorpayConfig } = useQuery<RazorpayConfig>({
    queryKey: ['razorpay-config'],
    queryFn: async () => {
      const response = await api.get('/payments/razorpay/config');
      return response.data.data;
    },
    enabled: isOpen,
    staleTime: 60000, // Cache for 1 minute
  });

  // Load Razorpay script when modal opens
  useEffect(() => {
    if (isOpen && razorpayConfig?.isConfigured) {
      loadRazorpayScript().then(setRazorpayLoaded);
    }
  }, [isOpen, razorpayConfig?.isConfigured]);

  // Set default payment method based on Razorpay availability
  useEffect(() => {
    if (razorpayConfig?.isConfigured && razorpayLoaded) {
      setPaymentMethod('RAZORPAY');
    } else {
      setPaymentMethod('SIMULATED');
    }
  }, [razorpayConfig, razorpayLoaded]);

  // Create payment intent
  const createIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/payments/intents', {
        amount,
        type,
        invoice_id: invoiceId,
        description: description || (type === 'WALLET_TOPUP' ? 'Wallet Top-up' : 'Invoice Payment'),
        gateway: paymentMethod,
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

  // Simulate payment success (for SIMULATED gateway)
  const simulateSuccessMutation = useMutation({
    mutationFn: async (intentId: string) => {
      setIsProcessing(true);
      const response = await api.post(`/payments/simulate/${intentId}`);
      return response.data.data;
    },
    onSuccess: async () => {
      await invalidateCaches();
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

  // Verify Razorpay payment
  const verifyRazorpayMutation = useMutation({
    mutationFn: async (data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      intent_id: string;
    }) => {
      const response = await api.post('/payments/razorpay/verify', data);
      return response.data.data;
    },
    onSuccess: async () => {
      await invalidateCaches();
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
      const errorMsg = error.response?.data?.error?.message || 'Payment verification failed';
      showToast(errorMsg, 'error');
    },
  });

  const invalidateCaches = async () => {
    await queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    await queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

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

  const handleRazorpayPayment = useCallback(async () => {
    if (!paymentIntent || !razorpayLoaded) return;

    setIsProcessing(true);

    try {
      // Create Razorpay order
      const orderResponse = await api.post('/payments/razorpay/create-order', {
        intent_id: paymentIntent.id,
      });

      const orderData: RazorpayOrderResponse = orderResponse.data.data;

      // Initialize Razorpay checkout
      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShipMVP',
        description: description || (type === 'WALLET_TOPUP' ? 'Wallet Top-up' : 'Invoice Payment'),
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          // Payment successful, verify on backend
          verifyRazorpayMutation.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            intent_id: paymentIntent.id,
          });
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          intent_id: paymentIntent.id,
          type: type,
        },
        theme: {
          color: '#3B82F6', // Blue color matching our theme
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            showToast('Payment cancelled', 'info');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        showToast(`Payment failed: ${response.error.description}`, 'error');
      });
      razorpay.open();
    } catch (error: any) {
      setIsProcessing(false);
      const errorMsg = error.response?.data?.error?.message || 'Failed to initiate payment';
      showToast(errorMsg, 'error');
    }
  }, [paymentIntent, razorpayLoaded, description, type, verifyRazorpayMutation]);

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
    verifyRazorpayMutation.isPending ||
    isProcessing;

  const razorpayAvailable = razorpayConfig?.isConfigured && razorpayLoaded;

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
                {createIntentMutation.isPending ? 'Initializing...' : 'Secure Payment'}
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

              {/* Payment Method Selection */}
              {razorpayAvailable && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Select Payment Method:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('RAZORPAY')}
                      className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'RAZORPAY'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl">💳</span>
                        <p className="text-sm font-medium mt-1">Razorpay</p>
                        <p className="text-xs text-gray-500">UPI, Cards, Netbanking</p>
                        {razorpayConfig?.isTestMode && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Test Mode
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('SIMULATED')}
                      className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'SIMULATED'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl">🧪</span>
                        <p className="text-sm font-medium mt-1">Simulate</p>
                        <p className="text-xs text-gray-500">For testing</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gateway:</span>
                  <span className="font-medium text-gray-900">
                    {paymentMethod === 'RAZORPAY' ? '💳 Razorpay' : '🧪 Simulated'}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              {paymentMethod === 'RAZORPAY' && razorpayConfig?.isTestMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 mb-1">Test Mode Active</p>
                      <p className="text-xs text-yellow-700">
                        Use test card: <code className="bg-yellow-100 px-1 rounded">4111 1111 1111 1111</code> or UPI: <code className="bg-yellow-100 px-1 rounded">success@razorpay</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'SIMULATED' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Simulated Payment</p>
                      <p className="text-xs text-blue-700">
                        Click "Pay Now" to simulate a successful payment. No actual money will be charged.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                    <span>Cancel</span>
                  </span>
                </Button>
                <Button
                  onClick={paymentMethod === 'RAZORPAY' ? handleRazorpayPayment : handleSimulateSuccess}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>{paymentMethod === 'RAZORPAY' ? '💳' : '✅'}</span>
                    <span>Pay ₹{amount.toFixed(0)}</span>
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
              <p className="text-gray-600 text-sm">Please complete the payment in the Razorpay window</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>🔒</span>
            <span>Secure & Encrypted Payment</span>
            {razorpayConfig?.isConfigured && (
              <>
                <span>•</span>
                <span>Powered by Razorpay</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
