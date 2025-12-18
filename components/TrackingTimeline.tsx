'use client';
// components/TrackingTimeline.tsx
/**
 * Tracking Timeline Component
 * Shows shipment tracking events in a visual timeline
 */

import { TrackingEvent, getStatusConfig } from '../types/carrier';
import CarrierBadge from './CarrierBadge';

interface TrackingTimelineProps {
    events: TrackingEvent[];
    currentStatus: string;
    carrier?: string;
    awb?: string;
    estimatedDelivery?: string;
}

export default function TrackingTimeline({
    events,
    currentStatus,
    carrier,
    awb,
    estimatedDelivery,
}: TrackingTimelineProps) {
    const statusConfig = getStatusConfig(currentStatus);

    // Define the standard status flow
    const statusFlow = [
        'CREATED',
        'MANIFESTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
    ];

    // Find current position in flow
    const normalizedStatus = currentStatus?.toUpperCase().replace(/\s+/g, '_');
    const currentIndex = statusFlow.indexOf(normalizedStatus);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{statusConfig.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {statusConfig.label}
                        </h3>
                    </div>
                    {awb && (
                        <p className="text-sm text-gray-500">
                            AWB: <span className="font-mono">{awb}</span>
                        </p>
                    )}
                </div>
                {carrier && (
                    <CarrierBadge carrier={carrier} />
                )}
            </div>

            {/* Progress bar for simple status */}
            <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between relative">
                    {/* Progress line */}
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded">
                        <div
                            className="h-full bg-blue-500 rounded transition-all duration-500"
                            style={{
                                width: `${Math.max(0, (currentIndex / (statusFlow.length - 1)) * 100)}%`
                            }}
                        />
                    </div>

                    {/* Status dots */}
                    {statusFlow.map((status, idx) => {
                        const config = getStatusConfig(status);
                        const isPast = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;

                        return (
                            <div
                                key={status}
                                className="flex flex-col items-center relative z-10"
                            >
                                <div
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center
                                        transition-all duration-300
                                        ${isCurrent 
                                            ? 'bg-blue-500 text-white ring-4 ring-blue-200' 
                                            : isPast 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-200 text-gray-400'
                                        }
                                    `}
                                >
                                    {isPast ? '✓' : config.icon}
                                </div>
                                <span className={`
                                    text-xs mt-2 text-center max-w-[60px]
                                    ${isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'}
                                `}>
                                    {config.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Estimated Delivery */}
            {estimatedDelivery && currentStatus !== 'DELIVERED' && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl">🗓️</span>
                    <div>
                        <p className="text-sm text-blue-700 font-medium">Estimated Delivery</p>
                        <p className="text-blue-900">
                            {new Date(estimatedDelivery).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            )}

            {/* Detailed Events Timeline */}
            {events.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">📋 Tracking History</h4>
                    <div className="space-y-0">
                        {events.map((event, idx) => {
                            const isFirst = idx === 0;
                            const isLast = idx === events.length - 1;
                            const eventConfig = getStatusConfig(event.status);

                            return (
                                <div key={idx} className="flex gap-4">
                                    {/* Timeline line */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`
                                                w-3 h-3 rounded-full border-2
                                                ${isFirst 
                                                    ? 'bg-blue-500 border-blue-500' 
                                                    : 'bg-white border-gray-300'
                                                }
                                            `}
                                        />
                                        {!isLast && (
                                            <div className="w-0.5 flex-1 bg-gray-200 min-h-[40px]" />
                                        )}
                                    </div>

                                    {/* Event content */}
                                    <div className={`pb-6 ${isFirst ? 'pt-0' : '-mt-1'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{eventConfig.icon}</span>
                                            <span className={`
                                                text-sm font-medium
                                                ${isFirst ? 'text-blue-600' : 'text-gray-700'}
                                            `}>
                                                {event.status}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                📍 {event.location}
                                            </p>
                                        )}
                                        {event.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {event.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(event.timestamp).toLocaleString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No events fallback */}
            {events.length === 0 && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500">
                        No tracking updates available yet. Updates will appear once the shipment is in transit.
                    </p>
                </div>
            )}
        </div>
    );
}

// Compact tracking status for lists
export function TrackingStatusBadge({ status }: { status: string }) {
    const config = getStatusConfig(status);

    const colorClasses: Record<string, string> = {
        gray: 'bg-gray-100 text-gray-700',
        blue: 'bg-blue-100 text-blue-700',
        indigo: 'bg-indigo-100 text-indigo-700',
        purple: 'bg-purple-100 text-purple-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        orange: 'bg-orange-100 text-orange-700',
        green: 'bg-green-100 text-green-700',
        red: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`
            inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium
            ${colorClasses[config.color] || colorClasses.gray}
        `}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}

