// types/address.ts

export interface Address {
    id: string;
    type: 'PICKUP' | 'DELIVERY';
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    is_default?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AddressesResponse {
    success: boolean;
    data: Address[];
}

export interface CreateAddressRequest {
    type: 'PICKUP' | 'DELIVERY';
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    is_default?: boolean;
}