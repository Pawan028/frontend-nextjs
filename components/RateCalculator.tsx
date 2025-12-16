'use client';
// components/RateCalculator.tsx
/**
 * Rate Calculator Widget
 * Allows merchants to check shipping rates before creating orders
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import Card from './ui/Card';
import Button from './ui/Button';
import { formatCurrency } from '../utils/format';

interface RateResult {
  courier: string;
  serviceable: boolean;
  rate: number;
  estimatedDays: string;
  codAvailable: boolean;
}

interface RateResponse {
  success: boolean;
  data: {
    rates: RateResult[];
    bestRate?: RateResult;
  };
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

export default function RateCalculator() {
  const [originPincode, setOriginPincode] = useState('');
  const [destPincode, setDestPincode] = useState('');
  const [weight, setWeight] = useState('');
  const [paymentType, setPaymentType] = useState<'prepaid' | 'cod'>('prepaid');
  const [showResults, setShowResults] = useState(false);

  // Check serviceability first
  const serviceabilityMutation = useMutation({
    mutationFn: async (data: { pickupPincode: string; deliveryPincode: string; paymentType: string }) => {
      const res = await api.post<{ success: boolean; data: ServiceabilityResult } | ServiceabilityResult>(
        '/serviceability/check',
        data
      );
      // Handle both wrapped and unwrapped response formats
      return 'success' in res.data ? res.data.data : res.data;
    },
  });

  // Get rates
  const ratesMutation = useMutation({
    mutationFn: async (data: { originPincode: string; destPincode: string; weight: number; paymentType: string }) => {
      const res = await api.post<RateResponse>('/rates/check', data);
      return res.data;
    },
  });

  const handleCalculate = async () => {
    if (!originPincode || !destPincode || !weight) {
      return;
    }

    setShowResults(true);
    
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
    });
  };

  const isLoading = serviceabilityMutation.isPending || ratesMutation.isPending;
  const serviceability = serviceabilityMutation.data;
  const rates = ratesMutation.data?.data?.rates || [];

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Rate Calculator</h2>
      <p className="text-gray-600 text-sm mb-6">
        Check shipping rates and delivery availability before creating an order
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Pincode
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="110001"
            value={originPincode}
            onChange={(e) => setOriginPincode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Pincode
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="400001"
            value={destPincode}
            onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (grams)
          </label>
          <input
            type="number"
            min={1}
            max={50000}
            placeholder="500"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Type
          </label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as 'prepaid' | 'cod')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="prepaid">Prepaid</option>
            <option value="cod">Cash on Delivery (COD)</option>
          </select>
        </div>
      </div>

      <Button 
        onClick={handleCalculate} 
        disabled={isLoading || !originPincode || !destPincode || !weight}
        className="w-full"
      >
        {isLoading ? 'Calculating...' : 'Calculate Rates'}
      </Button>

      {/* Results */}
      {showResults && (
        <div className="mt-6 space-y-4">
          {/* Serviceability Status */}
          {serviceability && (
            <div className={`p-4 rounded-lg ${serviceability.serviceable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{serviceability.serviceable ? '✅' : '❌'}</span>
                <span className={`font-semibold ${serviceability.serviceable ? 'text-green-800' : 'text-red-800'}`}>
                  {serviceability.serviceable ? 'Delivery Available' : 'Delivery Not Available'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                📍 {serviceability.deliveryCity}, {serviceability.deliveryState}
              </p>
              {serviceability.bestOption && (
                <p className="text-sm text-green-700 mt-1">
                  🚀 Best option: {serviceability.bestOption.courier} ({serviceability.bestOption.estimatedDays})
                </p>
              )}
            </div>
          )}

          {/* Rates Table */}
          {rates.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Courier</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Rate</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Delivery Time</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">COD</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 ${idx === 0 ? 'bg-blue-50' : ''}`}>
                      <td className="py-2 px-3">
                        <span className="font-medium">{rate.courier}</span>
                        {idx === 0 && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                            Best
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-900">
                        {formatCurrency(rate.rate)}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{rate.estimatedDays}</td>
                      <td className="py-2 px-3">
                        {rate.codAvailable ? (
                          <span className="text-green-600">✓ Available</span>
                        ) : (
                          <span className="text-red-500">✗ Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Weight Info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">💡 Weight Tips</p>
            <ul className="space-y-1">
              <li>• Rates are based on charged weight (actual or volumetric, whichever is higher)</li>
              <li>• Volumetric weight = (L × W × H) / 5000 (dimensions in cm)</li>
              <li>• COD orders incur an additional handling charge</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
