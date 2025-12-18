'use client';
// components/CarrierBadge.tsx
/**
 * Carrier Badge Component
 * Displays carrier name with logo and color coding
 */

import { getCarrierInfo } from '../types/carrier';

interface CarrierBadgeProps {
    carrier: string;
    serviceName?: string;
    showLogo?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function CarrierBadge({
    carrier,
    serviceName,
    showLogo = true,
    size = 'md',
    className = ''
}: CarrierBadgeProps) {
    const info = getCarrierInfo(carrier);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 rounded-full font-medium
                ${sizeClasses[size]}
                ${className}
            `}
            style={{
                backgroundColor: `${info.color}15`,
                color: info.color,
                border: `1px solid ${info.color}30`
            }}
        >
            {showLogo && (
                <span className="font-bold text-xs">
                    {info.name.substring(0, 2).toUpperCase()}
                </span>
            )}
            <span>{info.name}</span>
            {serviceName && (
                <span className="opacity-70 font-normal">
                    • {serviceName}
                </span>
            )}
        </span>
    );
}

// Carrier logo component (for when we have actual logos)
export function CarrierLogo({ carrier, size = 24 }: { carrier: string; size?: number }) {
    const info = getCarrierInfo(carrier);

    // Placeholder with initials
    return (
        <div
            className="rounded-full flex items-center justify-center font-bold text-white"
            style={{
                backgroundColor: info.color,
                width: size,
                height: size,
                fontSize: size * 0.4,
            }}
        >
            {info.name.substring(0, 2).toUpperCase()}
        </div>
    );
}

// Service type badge
export function ServiceTypeBadge({ type }: { type: 'express' | 'standard' | 'economy' }) {
    const config = {
        express: { label: '⚡ Express', color: 'text-orange-600 bg-orange-50' },
        standard: { label: '📦 Standard', color: 'text-blue-600 bg-blue-50' },
        economy: { label: '💰 Economy', color: 'text-green-600 bg-green-50' },
    };

    const { label, color } = config[type] || config.standard;

    return (
        <span className={`text-xs px-2 py-0.5 rounded ${color}`}>
            {label}
        </span>
    );
}

