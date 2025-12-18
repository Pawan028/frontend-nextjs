'use client';
// components/RateComparison.tsx
/**
 * Rate Comparison Component
 * Displays carrier rates with visual comparison
 */

import { useState } from 'react';
import { formatCurrency } from '../utils/format';
import { CarrierRate, getCarrierInfo, ZONE_DISPLAY, ShippingZone } from '../types/carrier';
import CarrierBadge, { ServiceTypeBadge } from './CarrierBadge';

interface RateComparisonProps {
    rates: CarrierRate[];
    selectedRate?: CarrierRate | null;
    onSelectRate?: (rate: CarrierRate) => void;
    showDetails?: boolean;
    zone?: ShippingZone;
}

export default function RateComparison({
    rates,
    selectedRate,
    onSelectRate,
    showDetails = true,
    zone,
}: RateComparisonProps) {
    const [sortBy, setSortBy] = useState<'price' | 'eta'>('price');

    // Sort rates
    const sortedRates = [...rates].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        return a.eta - b.eta;
    });

    const cheapest = rates.reduce((min, r) => r.price < min.price ? r : min, rates[0]);
    const fastest = rates.reduce((min, r) => r.eta < min.eta ? r : min, rates[0]);

    if (rates.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">No rates available for this route</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Zone indicator */}
            {zone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>📍</span>
                    <span className="font-medium">{ZONE_DISPLAY[zone]}</span>
                </div>
            )}

            {/* Sort controls */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                    {rates.length} options available
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <button
                        onClick={() => setSortBy('price')}
                        className={`text-sm px-3 py-1 rounded ${
                            sortBy === 'price' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        💰 Price
                    </button>
                    <button
                        onClick={() => setSortBy('eta')}
                        className={`text-sm px-3 py-1 rounded ${
                            sortBy === 'eta' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        ⚡ Speed
                    </button>
                </div>
            </div>

            {/* Rate cards */}
            <div className="space-y-3">
                {sortedRates.map((rate, idx) => {
                    const isSelected = selectedRate?.courier === rate.courier &&
                                       selectedRate?.serviceName === rate.serviceName;
                    const isCheapest = rate.price === cheapest.price;
                    const isFastest = rate.eta === fastest.eta;
                    const carrierInfo = getCarrierInfo(rate.courier);

                    return (
                        <div
                            key={`${rate.courier}-${rate.serviceName}-${idx}`}
                            onClick={() => onSelectRate?.(rate)}
                            className={`
                                relative p-4 rounded-lg border-2 transition-all
                                ${onSelectRate ? 'cursor-pointer hover:shadow-md' : ''}
                                ${isSelected 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            {/* Badges */}
                            <div className="absolute -top-2 left-3 flex gap-1">
                                {isCheapest && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                        💰 Cheapest
                                    </span>
                                )}
                                {isFastest && !isCheapest && (
                                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                        ⚡ Fastest
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                {/* Carrier info */}
                                <div className="flex items-center gap-3">
                                    {/* Carrier color indicator */}
                                    <div
                                        className="w-1 h-12 rounded-full"
                                        style={{ backgroundColor: carrierInfo.color }}
                                    />

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CarrierBadge
                                                carrier={rate.courier}
                                                showLogo={false}
                                                size="sm"
                                            />
                                            <ServiceTypeBadge type={rate.serviceType || 'standard'} />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {rate.serviceName}
                                        </p>
                                    </div>
                                </div>

                                {/* Price and ETA */}
                                <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900">
                                        {formatCurrency(rate.price)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {rate.eta === 1 ? 'Tomorrow' : `${rate.eta} days`}
                                    </p>
                                </div>
                            </div>

                            {/* Details */}
                            {showDetails && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                                    <span>📦 Up to {carrierInfo.maxWeight / 1000}kg</span>
                                    {carrierInfo.supportsCod && (
                                        <span className="text-green-600">✓ COD Available</span>
                                    )}
                                    {rate.codAvailable === false && (
                                        <span className="text-red-500">✗ No COD</span>
                                    )}
                                </div>
                            )}

                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3">
                                    <span className="text-blue-600 text-xl">✓</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            {showDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Quick Comparison</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Cheapest:</span>
                            <span className="ml-2 font-medium">
                                {cheapest.courier} - {formatCurrency(cheapest.price)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Fastest:</span>
                            <span className="ml-2 font-medium">
                                {fastest.courier} - {fastest.eta} day{fastest.eta !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

