 'use client';
// app/orders/create/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useRequireAuth } from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/format';

interface RateOption {
  courier: string;
  serviceName: string;
  service_name?: string;
  price: number;
  eta: number;
  currency?: string;
}

interface CreateOrderPayload {
  pickup_address_id?: string;
  delivery_address: {
    name: string;
    phone: string;
    address_line1: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  weight: number;
  invoice_amount: number;
  payment_type: string;
  dimensions: {
    length: number;
    breadth: number;
    height: number;
  };
}

export default function CreateOrderPage() {
  const router = useRouter();
  const token = useRequireAuth();

  // Form state
  const [originPincode] = useState('400001'); // Default or fetch from merchant profile
  const [destPincode, setDestPincode] = useState('');
  const [weight, setWeight] = useState(250);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState(500);
  
  // Rates state
  const [rates, setRates] = useState<RateOption[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState('');

  async function handleGetRates() {
    if (!destPincode || destPincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setError('');
    setLoadingRates(true);

    try {
      const res = await api.post<RateOption[]>('/rates', {
        originPincode,
        destPincode,
        weight,
      });
      
      setRates(res.data || []);
      
      if (!res.data || res.data.length === 0) {
        setError('No courier services available for this pincode');
      }
    } catch {
      // Removed unused 'err' variable
      setError('Failed to fetch rates. Please try again.');
    } finally {
      setLoadingRates(false);
    }
  }

  async function handleCreateOrder() {
    // Removed unused 'selectedRate' parameter
    if (!name || !phone || !address || !city || !state || !productName) {
      setError('Please fill all required fields');
      return;
    }

    setError('');
    setCreatingOrder(true);

    const payload: CreateOrderPayload = {
      delivery_address: {
        name,
        phone,
        address_line1: address,
        city,
        state,
        pincode: destPincode,
        country: 'India',
      },
      items: [
        {
          name: productName,
          price: productPrice,
          quantity: 1,
        },
      ],
      weight,
      invoice_amount: productPrice,
      payment_type: 'prepaid',
      dimensions: {
        length: 10,
        breadth: 10,
        height: 10,
      },
    };

    try {
      await api.post('/orders', payload);
      router.push('/orders');
    } catch {
      // Removed unused 'err' variable
      setError('Failed to create order. Please try again.');
    } finally {
      setCreatingOrder(false);
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-600 mt-1">Enter shipment details and compare rates</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Shipment Details */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Shipment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Destination Pincode *"
              placeholder="400001"
              value={destPincode}
              onChange={(e) => setDestPincode(e.target.value)}
              maxLength={6}
            />
            <Input
              label="Weight (grams) *"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
          <div className="mt-4">
            <Button onClick={handleGetRates} disabled={loadingRates} className="w-full">
              {loadingRates ? 'Fetching Rates...' : '🔍 Compare Rates'}
            </Button>
          </div>
        </Card>

        {/* Rate Comparison */}
        {rates.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Available Courier Services</h2>
            <div className="space-y-3">
              {rates.map((rate, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {rate.serviceName || rate.service_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {rate.courier} • ETA: {rate.eta} days
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(rate.price)}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCreateOrder}
                      disabled={creatingOrder}
                    >
                      {creatingOrder ? 'Creating...' : 'Select'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Delivery Address */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Recipient Name *"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Phone *"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Input
              label="Address *"
              placeholder="Building, Street, Landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City *"
                placeholder="Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State *"
                placeholder="Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Product Details */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              placeholder="T-Shirt"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <Input
              label="Product Price (₹) *"
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(Number(e.target.value))}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
