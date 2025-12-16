'use client';
// app/dashboard/rates/page.tsx
/**
 * Rate Calculator Page
 * Check shipping rates and serviceability
 */

import RateCalculator from '../../../components/RateCalculator';

export default function RatesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Rate Calculator</h1>
        <p className="text-gray-600 mt-2">
          Check delivery availability and compare shipping rates across couriers
        </p>
      </div>

      <RateCalculator />

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
          <p className="text-sm text-gray-600 mt-1">
            Next-day delivery available in major metros
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="font-semibold text-gray-900">Best Rates</h3>
          <p className="text-sm text-gray-600 mt-1">
            Compare rates from 10+ courier partners
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="font-semibold text-gray-900">Pan India Coverage</h3>
          <p className="text-sm text-gray-600 mt-1">
            Deliver to 29,000+ pincodes across India
          </p>
        </div>
      </div>
    </div>
  );
}
