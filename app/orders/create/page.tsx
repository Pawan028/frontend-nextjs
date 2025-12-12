'use client';
//app/order/create/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/format';

interface MerchantAddress {
    id: string;
    name: string;
    phone: string;
    address_line1: string;  // ✅ FIXED: snake_case
    address_line2?: string;  // ✅ FIXED: snake_case
    city: string;
    state: string;
    pincode: string;
    country: string;
    is_default: boolean;  // ✅ FIXED: snake_case
}


interface RateOption {
    courier: string;
    serviceName: string;
    price: number;
    eta: number;
}

interface CreateOrderPayload {
    pickup_address_id: string;
    delivery_address: {
        name: string;
        phone: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    items: Array<{
        name: string;
        price: number;
        quantity: number;
    }>;
    weight: number;
    invoice_amount: number;
    payment_type: 'PREPAID' | 'COD';
    dimensions: {
        length: number;
        breadth: number;
        height: number;
    };
}

export default function CreateOrderPage() {
    const router = useRouter();

    // Fetch merchant addresses
    const {
        data: addressesResponse,
        isLoading: loadingAddresses,
        isError: addressesError,
        error: addressesErrorData,
    } = useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const res = await api.get('/merchant/addresses');
            return res.data;
        },
    });

    const addresses: MerchantAddress[] = addressesResponse?.data || [];

    // Form state
    const [pickupAddressId, setPickupAddressId] = useState('');
    const [destPincode, setDestPincode] = useState('');
    const [weight, setWeight] = useState('250');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('500');
    const [paymentType, setPaymentType] = useState<'PREPAID' | 'COD'>('PREPAID');

    // Rates state
    const [rates, setRates] = useState<RateOption[]>([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Auto-select default address
    useEffect(() => {
        if (addresses.length > 0 && !pickupAddressId) {
            const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];  // ✅ FIXED
            setPickupAddressId(defaultAddr.id);
        }
    }, [addresses, pickupAddressId]);

    // Validation functions
    const validatePincode = (pincode: string): boolean => {
        return /^\d{6}$/.test(pincode);
    };

    const validatePhone = (phone: string): boolean => {
        return /^\d{10}$/.test(phone);
    };

    const validateWeight = (weight: string): boolean => {
        const w = Number(weight);
        return !isNaN(w) && w >= 10 && w <= 50000;
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!pickupAddressId) {
            errors.pickupAddressId = 'Please select a pickup address';
        }

        if (!destPincode) {
            errors.destPincode = 'Delivery pincode is required';
        } else if (!validatePincode(destPincode)) {
            errors.destPincode = 'Pincode must be exactly 6 digits';
        }

        if (!weight) {
            errors.weight = 'Weight is required';
        } else if (!validateWeight(weight)) {
            errors.weight = 'Weight must be between 10g and 50,000g';
        }

        if (!name.trim()) {
            errors.name = 'Recipient name is required';
        }

        if (!phone) {
            errors.phone = 'Phone number is required';
        } else if (!validatePhone(phone)) {
            errors.phone = 'Phone must be exactly 10 digits';
        }

        if (!address.trim()) {
            errors.address = 'Address is required';
        }

        if (!city.trim()) {
            errors.city = 'City is required';
        }

        if (!state.trim()) {
            errors.state = 'State is required';
        }

        if (!productName.trim()) {
            errors.productName = 'Product name is required';
        }

        if (!productPrice || Number(productPrice) <= 0) {
            errors.productPrice = 'Valid product price is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    async function handleGetRates() {
        // Validate only fields needed for rate calculation
        const errors: Record<string, string> = {};

        if (!pickupAddressId) {
            errors.pickupAddressId = 'Please select a pickup address';
        }

        if (!destPincode) {
            errors.destPincode = 'Delivery pincode is required';
        } else if (!validatePincode(destPincode)) {
            errors.destPincode = 'Pincode must be exactly 6 digits';
        }

        if (!weight) {
            errors.weight = 'Weight is required';
        } else if (!validateWeight(weight)) {
            errors.weight = 'Weight must be between 10g and 50,000g';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError('Please fix validation errors before getting rates');
            return;
        }

        setError('');
        setValidationErrors({});
        setLoadingRates(true);

        try {
            const selectedAddress = addresses.find((a) => a.id === pickupAddressId);
            if (!selectedAddress) {
                throw new Error('Selected pickup address not found');
            }

            const res = await api.post('/rates', {
                originPincode: selectedAddress.pincode,
                destPincode,
                weight: Number(weight),
                paymentType: paymentType.toLowerCase(),
                dimensions: {
                    length: 10,
                    breadth: 10,
                    height: 10,
                },
            });

            const responseData = res.data;
            const ratesData = responseData.success ? responseData.data?.rates : responseData.rates;

            setRates(ratesData || []);

            if (!ratesData || ratesData.length === 0) {
                setError('No courier services available for this route');
            }
        } catch (err: any) {
            console.error('Rates error:', err);
            setError(
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                'Failed to fetch rates. Please try again.'
            );
        } finally {
            setLoadingRates(false);
        }
    }

    async function handleCreateOrder() {
        if (!validateForm()) {
            setError('Please fix all validation errors before submitting');
            return;
        }

        setError('');
        setCreatingOrder(true);

        // Backend expects snake_case field names
        const payload: CreateOrderPayload = {
            pickup_address_id: pickupAddressId,
            delivery_address: {
                name,
                phone,
                address_line1: address,
                address_line2: addressLine2 || undefined,
                city,
                state,
                pincode: destPincode,
                country: 'India',
            },
            items: [
                {
                    name: productName,
                    price: Number(productPrice),
                    quantity: 1,
                },
            ],
            weight: Number(weight),
            invoice_amount: Number(productPrice),
            payment_type: paymentType,
            dimensions: {
                length: 10,
                breadth: 10,
                height: 10,
            },
        };

        try {
            await api.post('/orders', payload);
            router.push('/orders');
        } catch (err: any) {
            console.error('Create order error:', err);
            setError(
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                'Failed to create order. Please try again.'
            );
        } finally {
            setCreatingOrder(false);
        }
    }

    // Loading state for addresses
    if (loadingAddresses) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading addresses...</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Error state for addresses
    if (addressesError) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-red-600 font-semibold mb-2">Failed to load merchant addresses</p>
                        <p className="text-sm text-gray-600 mb-4">
                            {(addressesErrorData as any)?.response?.data?.error?.message ||
                                'Please try refreshing the page'}
                        </p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </Card>
            </div>
        );
    }

    // No addresses found
    if (addresses.length === 0) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📍</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Pickup Addresses Found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            You need to add at least one pickup address before creating orders.
                        </p>
                        <Button onClick={() => router.push('/settings/addresses')}>
                            Add Pickup Address
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Create New Order</h1>
                <p className="text-gray-600 mt-1">Enter shipment details and compare rates</p>
            </div>

            {error && (
                <Card className="mb-4 border-red-300 bg-red-50">
                    <p className="text-red-700 text-sm">{error}</p>
                </Card>
            )}

            {/* Pickup Address */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Pickup Address</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Pickup Location *
                        </label>
                        <select
                            value={pickupAddressId}
                            onChange={(e) => {
                                setPickupAddressId(e.target.value);
                                setValidationErrors((prev) => ({ ...prev, pickupAddressId: '' }));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                validationErrors.pickupAddressId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">-- Select Pickup Address --</option>
                            {addresses.map((addr) => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.name} - {addr.city}, {addr.pincode}
                                    {addr.is_default ? ' (Default)' : ''}  {/* ✅ FIXED */}
                                </option>
                            ))}
                        </select>
                        {validationErrors.pickupAddressId && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.pickupAddressId}</p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Shipment Details */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipment Details</h2>
                <div className="space-y-4">
                    <div>
                        <Input
                            label="Delivery Pincode *"
                            type="text"
                            value={destPincode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setDestPincode(value);
                                setValidationErrors((prev) => ({ ...prev, destPincode: '' }));
                            }}
                            maxLength={6}
                            placeholder="e.g., 110001"
                            error={validationErrors.destPincode}
                        />
                        {destPincode && !validatePincode(destPincode) && (
                            <p className="text-yellow-600 text-xs mt-1">Must be exactly 6 digits</p>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Weight (grams) *"
                            type="number"
                            value={weight}
                            onChange={(e) => {
                                setWeight(e.target.value);
                                setValidationErrors((prev) => ({ ...prev, weight: '' }));
                            }}
                            min={10}
                            max={50000}
                            placeholder="e.g., 250"
                            error={validationErrors.weight}
                        />
                        <p className="text-xs text-gray-500 mt-1">Min: 10g, Max: 50,000g (50kg)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Type *
                        </label>
                        <select
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value as 'PREPAID' | 'COD')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="PREPAID">Prepaid</option>
                            <option value="COD">Cash on Delivery (COD)</option>
                        </select>
                    </div>

                    <Button
                        onClick={handleGetRates}
                        disabled={loadingRates}
                        className="w-full"
                    >
                        {loadingRates ? 'Fetching Rates...' : '🔍 Compare Rates'}
                    </Button>
                </div>
            </Card>

            {/* Rate Comparison */}
            {rates.length > 0 && (
                <Card className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Available Courier Services
                    </h2>
                    <div className="space-y-3">
                        {rates.map((rate, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{rate.serviceName}</p>
                                    <p className="text-sm text-gray-600">
                                        {rate.courier} • ETA: {rate.eta} days
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {formatCurrency(rate.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Delivery Address */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                    <Input
                        label="Recipient Name *"
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setValidationErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        placeholder="e.g., John Doe"
                        error={validationErrors.name}
                    />

                    <div>
                        <Input
                            label="Phone Number *"
                            type="text"
                            value={phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhone(value);
                                setValidationErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            maxLength={10}
                            placeholder="e.g., 9876543210"
                            error={validationErrors.phone}
                        />
                        {phone && !validatePhone(phone) && (
                            <p className="text-yellow-600 text-xs mt-1">Must be exactly 10 digits</p>
                        )}
                    </div>

                    <Input
                        label="Address Line 1 *"
                        type="text"
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);
                            setValidationErrors((prev) => ({ ...prev, address: '' }));
                        }}
                        placeholder="e.g., 123 Main Street, Apartment 4B"
                        error={validationErrors.address}
                    />

                    <Input
                        label="Address Line 2 (Optional)"
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="e.g., Near City Mall"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="City *"
                            type="text"
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setValidationErrors((prev) => ({ ...prev, city: '' }));
                            }}
                            placeholder="e.g., Mumbai"
                            error={validationErrors.city}
                        />

                        <Input
                            label="State *"
                            type="text"
                            value={state}
                            onChange={(e) => {
                                setState(e.target.value);
                                setValidationErrors((prev) => ({ ...prev, state: '' }));
                            }}
                            placeholder="e.g., Maharashtra"
                            error={validationErrors.state}
                        />
                    </div>
                </div>
            </Card>

            {/* Product Details */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h2>
                <div className="space-y-4">
                    <Input
                        label="Product Name *"
                        type="text"
                        value={productName}
                        onChange={(e) => {
                            setProductName(e.target.value);
                            setValidationErrors((prev) => ({ ...prev, productName: '' }));
                        }}
                        placeholder="e.g., Laptop Charger"
                        error={validationErrors.productName}
                    />

                    <Input
                        label="Product Price (₹) *"
                        type="number"
                        value={productPrice}
                        onChange={(e) => {
                            setProductPrice(e.target.value);
                            setValidationErrors((prev) => ({ ...prev, productPrice: '' }));
                        }}
                        min={1}
                        placeholder="e.g., 500"
                        error={validationErrors.productPrice}
                    />
                </div>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
                <Button
                    onClick={() => router.back()}
                    variant="secondary"
                    className="flex-1"
                    disabled={creatingOrder}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleCreateOrder}
                    disabled={creatingOrder}
                    className="flex-1"
                >
                    {creatingOrder ? 'Creating Order...' : '✓ Create Order'}
                </Button>
            </div>
        </div>
    );
}