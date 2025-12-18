// types/carrier.ts
/**
 * Carrier-related types for frontend
 * Matches backend carrier adapter types
 */

// Shipping zones (from backend)
export type ShippingZone =
    | 'LOCAL'       // Same pincode area
    | 'INTRA_CITY'  // Same metro city
    | 'INTRA_STATE' // Same state
    | 'METRO'       // Metro to Metro
    | 'ROI'         // Rest of India
    | 'SPECIAL';    // NE, J&K, Islands

// Rate from API
export interface CarrierRate {
    courier: string;
    serviceName: string;
    serviceType: 'express' | 'standard' | 'economy';
    price: number;
    eta: number; // days
    zone?: ShippingZone;
    codAvailable?: boolean;
}

// Carrier info
export interface CarrierInfo {
    name: string;
    code: string;
    logo?: string;
    color: string;
    isActive: boolean;
    maxWeight: number;
    supportsCod: boolean;
}

// Tracking event
export interface TrackingEvent {
    status: string;
    rawStatus?: string;
    location: string;
    timestamp: string;
    description: string;
}

// Tracking response
export interface TrackingInfo {
    awb: string;
    currentStatus: string;
    carrier: string;
    events: TrackingEvent[];
    estimatedDelivery?: string;
}

// Shipment info
export interface ShipmentInfo {
    id: string;
    awb: string;
    courier: string;
    shipmentStatus: string;
    labelUrl: string | null;
    manifestUrl?: string | null;
    routingCode?: string;
}

// Serviceability response
export interface ServiceabilityResult {
    serviceable: boolean;
    deliveryCity: string;
    deliveryState: string;
    zone?: ShippingZone;
    couriers: Array<{
        courier: string;
        serviceable: boolean;
        codAvailable: boolean;
        estimatedDays: string;
        maxCodAmount?: number;
    }>;
    bestOption?: {
        courier: string;
        estimatedDays: string;
        price?: number;
    };
}

// Carrier logos and colors for display
export const CARRIER_CONFIG: Record<string, CarrierInfo> = {
    'DELHIVERY': {
        name: 'Delhivery',
        code: 'DELHIVERY',
        logo: '/carriers/delhivery.png',
        color: '#e41e26',
        isActive: true,
        maxWeight: 30000,
        supportsCod: true,
    },
    'BLUEDART': {
        name: 'BlueDart',
        code: 'BLUEDART',
        logo: '/carriers/bluedart.png',
        color: '#003399',
        isActive: true,
        maxWeight: 35000,
        supportsCod: true,
    },
    'DTDC': {
        name: 'DTDC',
        code: 'DTDC',
        logo: '/carriers/dtdc.png',
        color: '#ed1c24',
        isActive: false,
        maxWeight: 25000,
        supportsCod: true,
    },
    'XPRESSBEES': {
        name: 'Xpressbees',
        code: 'XPRESSBEES',
        logo: '/carriers/xpressbees.png',
        color: '#fbb03b',
        isActive: false,
        maxWeight: 25000,
        supportsCod: true,
    },
    'ECOM_EXPRESS': {
        name: 'Ecom Express',
        code: 'ECOM_EXPRESS',
        logo: '/carriers/ecom.png',
        color: '#00a0e3',
        isActive: false,
        maxWeight: 20000,
        supportsCod: true,
    },
};

// Helper to get carrier display info
export function getCarrierInfo(carrierCode: string): CarrierInfo {
    if (!carrierCode) {
        return {
            name: 'Unknown',
            code: 'UNKNOWN',
            color: '#6b7280',
            isActive: false,
            maxWeight: 25000,
            supportsCod: false,
        };
    }

    // Normalize: uppercase and replace spaces with underscores
    const normalized = carrierCode.toUpperCase().replace(/\s+/g, '_');

    // Direct lookup
    if (CARRIER_CONFIG[normalized]) {
        return CARRIER_CONFIG[normalized];
    }

    // Try common variations
    // "Delhivery" -> "DELHIVERY"
    // "BlueDart" -> "BLUEDART"
    const variations = [
        normalized,
        normalized.replace(/-/g, '_'),
        carrierCode.replace(/\s+/g, '').toUpperCase(),
    ];

    for (const variant of variations) {
        if (CARRIER_CONFIG[variant]) {
            return CARRIER_CONFIG[variant];
        }
    }

    // Fallback: try to match by partial name
    const lowerCode = carrierCode.toLowerCase();
    for (const [key, config] of Object.entries(CARRIER_CONFIG)) {
        if (config.name.toLowerCase() === lowerCode ||
            key.toLowerCase() === lowerCode) {
            return config;
        }
    }

    // Return unknown carrier with the original name
    return {
        name: carrierCode,
        code: normalized,
        color: '#6b7280',
        isActive: false,
        maxWeight: 25000,
        supportsCod: false,
    };
}

// Zone display names
export const ZONE_DISPLAY: Record<ShippingZone, string> = {
    'LOCAL': 'Local Delivery',
    'INTRA_CITY': 'Same City',
    'INTRA_STATE': 'Within State',
    'METRO': 'Metro Express',
    'ROI': 'Pan India',
    'SPECIAL': 'Special Zone',
};

// Status display config
export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    'CREATED': { label: 'Created', color: 'gray', icon: '📝' },
    'READY_TO_SHIP': { label: 'Ready to Ship', color: 'blue', icon: '📦' },
    'MANIFESTED': { label: 'Manifested', color: 'indigo', icon: '📋' },
    'PICKED_UP': { label: 'Picked Up', color: 'purple', icon: '🚛' },
    'IN_TRANSIT': { label: 'In Transit', color: 'yellow', icon: '🚚' },
    'OUT_FOR_DELIVERY': { label: 'Out for Delivery', color: 'orange', icon: '🏃' },
    'DELIVERED': { label: 'Delivered', color: 'green', icon: '✅' },
    'RTO_INITIATED': { label: 'RTO Initiated', color: 'red', icon: '↩️' },
    'RTO_DELIVERED': { label: 'RTO Delivered', color: 'red', icon: '📦↩️' },
    'CANCELLED': { label: 'Cancelled', color: 'gray', icon: '❌' },
    'NDR_PENDING': { label: 'Delivery Failed', color: 'red', icon: '⚠️' },
};

export function getStatusConfig(status: string) {
    const normalized = status?.toUpperCase().replace(/\s+/g, '_');
    return STATUS_CONFIG[normalized] || {
        label: status || 'Unknown',
        color: 'gray',
        icon: '❓'
    };
}
