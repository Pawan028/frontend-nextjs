'use client';
// components/RateCalculator.tsx
/**
 * Rate Calculator Widget - Week 2 Enhanced
 * Shows detailed cost breakdown with zone-based pricing
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import Card from './ui/Card';
import Button from './ui/Button';
import { formatCurrency } from '../utils/format';

// ==========================================
// 📦 TYPES
// ==========================================

interface RateBreakdown {
  basePrice: number;
  additionalWeightCharge: number;
  codFee: number;
  fuelSurcharge: number;
  gst: number;
  subtotal: number;
  total: number;
}

interface RateResult {
  courier: string;
  serviceName?: string;
  serviceType?: string;
  rate: number;
  estimatedDays: string;
  zone?: string;
  chargeableWeight?: number;
  breakdown?: RateBreakdown;
  codAvailable?: boolean;
}

interface ServiceabilityResult {
  serviceable: boolean;
  deliveryCity: string;
  deliveryState: string;
  couriers: Array<{
    courier: string;
    serviceable: boolean;
    codAvailable: boolean;
    estimatedDays: string;
  }>;
  bestOption?: {
    courier: string;
    estimatedDays: string;
  };
}

// ==========================================
// 🎨 COMPONENT
// ==========================================

export default function RateCalculator() {
  const [originPincode, setOriginPincode] = useState('');
  const [destPincode, setDestPincode] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [height, setHeight] = useState('');
  const [paymentType, setPaymentType] = useState<'prepaid' | 'cod'>('prepaid');
  const [codAmount, setCodAmount] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedRate, setSelectedRate] = useState<RateResult | null>(null);

  // Check serviceability
  const serviceabilityMutation = useMutation({
    mutationFn: async (data: { pickupPincode: string; deliveryPincode: string; paymentType: string }) => {
      const res = await api.post<{ success: boolean; data: ServiceabilityResult } | ServiceabilityResult>(
        '/serviceability/check',
        data
      );
      return 'success' in res.data ? res.data.data : res.data;
    },
  });

  // Get rates with breakdown
  const ratesMutation = useMutation({
    mutationFn: async (data: {
      originPincode: string;
      destPincode: string;
      weight: number;
      paymentType: string;
      codAmount?: number;
      length?: number;
      breadth?: number;
      height?: number;
    }) => {
      const res = await api.post<any>('/rates', data);
      const backendRates = res.data?.data?.rates || res.data?.rates || [];

      return backendRates.map((r: any) => ({
        courier: r.courier,
        serviceName: r.serviceName || `${r.courier} Standard`,
        serviceType: r.serviceType || 'standard',
        rate: r.price,
        estimatedDays: `${r.eta} days`,
        zone: r.zone,
        chargeableWeight: r.chargeableWeight,
        breakdown: r.breakdown,
        codAvailable: true,
      })) as RateResult[];
    },
  });

  const handleCalculate = async () => {
    if (!originPincode || !destPincode || !weight) {
      return;
    }

    setShowResults(true);
    setSelectedRate(null);

    // Check serviceability
    await serviceabilityMutation.mutateAsync({
      pickupPincode: originPincode,
      deliveryPincode: destPincode,
      paymentType,
    });

    // Get rates
    await ratesMutation.mutateAsync({
      originPincode,
      destPincode,
      weight: parseInt(weight),
      paymentType,
      codAmount: paymentType === 'cod' ? parseInt(codAmount) || 0 : undefined,
      length: length ? parseInt(length) : undefined,
      breadth: breadth ? parseInt(breadth) : undefined,
      height: height ? parseInt(height) : undefined,
    });
  };

  const isLoading = serviceabilityMutation.isPending || ratesMutation.isPending;
  const serviceability = serviceabilityMutation.data;
  const rates = ratesMutation.data || [];

  // Find cheapest and fastest
  const cheapestRate = rates.length > 0 ? rates.reduce((a, b) => (a.rate < b.rate ? a : b)) : null;
  const fastestRate = rates.length > 0
    ? rates.reduce((a, b) => {
      const aDays = parseInt(a.estimatedDays) || 99;
      const bDays = parseInt(b.estimatedDays) || 99;
      return aDays < bDays ? a : b;
    })
    : null;

  return (
    <Card className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        📊 Rate Calculator
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
        Check shipping rates and see detailed cost breakdown
      </p>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pickup Pincode *
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="110001"
            value={originPincode}
            onChange={(e) => setOriginPincode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Delivery Pincode *
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="400001"
            value={destPincode}
            onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight (grams) *
          </label>
          <input
            type="number"
            min={1}
            max={50000}
            placeholder="500"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Type
          </label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as 'prepaid' | 'cod')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="prepaid">Prepaid</option>
            <option value="cod">Cash on Delivery (COD)</option>
          </select>
        </div>

        {/* COD Amount (shown only for COD) */}
        {paymentType === 'cod' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              COD Amount (₹)
            </label>
            <input
              type="number"
              min={100}
              placeholder="1000"
              value={codAmount}
              onChange={(e) => setCodAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Dimensions Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📦 Dimensions (optional, for volumetric weight)
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="L (cm)"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
          />
          <input
            type="number"
            placeholder="W (cm)"
            value={breadth}
            onChange={(e) => setBreadth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
          />
          <input
            type="number"
            placeholder="H (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <Button
        onClick={handleCalculate}
        disabled={isLoading || !originPincode || !destPincode || !weight}
        className="w-full"
      >
        {isLoading ? 'Calculating...' : '🔍 Calculate Rates'}
      </Button>

      {/* Results */}
      {showResults && (
        <div className="mt-6 space-y-4">
          {/* Serviceability Status */}
          {serviceability && (
            <div className={`p-4 rounded-lg ${serviceability.serviceable ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{serviceability.serviceable ? '✅' : '❌'}</span>
                <span className={`font-semibold ${serviceability.serviceable ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                  {serviceability.serviceable ? 'Delivery Available' : 'Delivery Not Available'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📍 {serviceability.deliveryCity}, {serviceability.deliveryState}
              </p>
            </div>
          )}

          {/* Rates Table */}
          {rates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Carrier</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Zone</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Rate</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Delivery</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate, idx) => {
                    const isCheapest = rate === cheapestRate;
                    const isFastest = rate === fastestRate && !isCheapest;

                    return (
                      <tr
                        key={idx}
                        className={`border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedRate === rate
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        onClick={() => setSelectedRate(rate)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{rate.courier}</span>
                            {isCheapest && (
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                                💰 Cheapest
                              </span>
                            )}
                            {isFastest && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                🚀 Fastest
                              </span>
                            )}
                          </div>
                          {rate.serviceName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{rate.serviceName}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {rate.zone || 'ROI'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(rate.rate)}
                        </td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{rate.estimatedDays}</td>
                        <td className="py-3 px-3">
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRate(rate);
                            }}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected Rate Breakdown */}
          {selectedRate && selectedRate.breakdown && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                📋 Cost Breakdown - {selectedRate.courier}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedRate.breakdown.basePrice)}</span>
                </div>

                {selectedRate.breakdown.additionalWeightCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Additional Weight</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedRate.breakdown.additionalWeightCharge)}</span>
                  </div>
                )}

                {selectedRate.breakdown.codFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">COD Fee</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(selectedRate.breakdown.codFee)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fuel Surcharge</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedRate.breakdown.fuelSurcharge)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedRate.breakdown.subtotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">GST (18%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedRate.breakdown.gst)}</span>
                </div>

                <div className="border-t-2 border-blue-300 dark:border-blue-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(selectedRate.breakdown.total)}</span>
                  </div>
                </div>

                {/* Weight Info */}
                {selectedRate.chargeableWeight && (
                  <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ⚖️ Chargeable Weight: <strong>{(selectedRate.chargeableWeight / 1000).toFixed(2)} kg</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weight Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">💡 Pricing Info</p>
            <ul className="space-y-1">
              <li>• Rates include GST where applicable</li>
              <li>• COD orders have additional handling charges</li>
              <li>• Volumetric weight = (L × W × H) / 5000</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
