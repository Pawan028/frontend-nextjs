'use client';
// app/orders/pickup/page.tsx
/**
 * Pickup Request Page
 * Schedule courier pickup for manifested orders
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Link from 'next/link';
import { formatDate } from '../../../utils/format';

interface Address {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  weight: number;
  shipment?: {
    awb: string;
    courier: string;
  };
  deliveryAddress?: {
    name: string;
    city: string;
  };
}

export default function PickupRequestPage() {
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('MORNING');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch pickup addresses
  const { data: addressesData, isLoading: addressesLoading, error: addressesError } = useQuery({
    queryKey: ['pickup-addresses'],
    queryFn: async () => {
      // ✅ FIXED: Use correct endpoint /merchant/addresses instead of /addresses
      const res = await api.get<{ success: boolean; data: Address[] }>('/merchant/addresses?type=PICKUP');
      return res.data.data || [];
    },
  });

  // Fetch ready-to-ship orders
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['pickup-eligible-orders'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Order[] }>('/orders?status=READY_TO_SHIP&limit=100');
      return res.data.data || [];
    },
  });

  // Create pickup request mutation
  const createPickupMutation = useMutation({
    mutationFn: async (data: {
      pickup_address_id: string;
      order_ids: string[];
      preferred_date: string;
      preferred_time_slot: string;
      notes?: string;
    }) => {
      const res = await api.post('/pickup/request', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickup-eligible-orders'] });
      setSelectedOrderIds([]);
      setNotes('');
      alert('Pickup request created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create pickup request');
    },
  });

  const addresses = addressesData || [];
  const orders = ordersData || [];

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map(o => o.id));
    }
  };

  const handleSubmit = () => {
    if (!selectedAddressId) {
      alert('Please select a pickup address');
      return;
    }
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one order');
      return;
    }
    if (!preferredDate) {
      alert('Please select a preferred date');
      return;
    }

    createPickupMutation.mutate({
      pickup_address_id: selectedAddressId,
      order_ids: selectedOrderIds,
      preferred_date: preferredDate,
      preferred_time_slot: preferredTime,
      notes: notes || undefined,
    });
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Calculate totals
  const totalWeight = orders
    .filter(o => selectedOrderIds.includes(o.id))
    .reduce((sum, o) => sum + (o.weight || 500), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Pickup</h1>
          <p className="text-gray-600 mt-1">Request courier pickup for your manifested orders</p>
        </div>
        <Link href="/orders">
          <Button variant="secondary">← Back to Orders</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Orders for Pickup</h2>
              <button
                onClick={selectAllOrders}
                className="text-sm text-blue-600 hover:underline"
              >
                {selectedOrderIds.length === orders.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {ordersLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : ordersError ? (
              <div className="text-center py-8 text-red-500">
                <div className="text-4xl mb-2">⚠️</div>
                <p>Failed to load orders</p>
                <p className="text-sm mt-1">{(ordersError as any)?.response?.data?.error?.message || 'Please try again later'}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p>No orders ready for pickup</p>
                <p className="text-sm mt-1">Orders must be in "Ready to Ship" status</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => toggleOrderSelection(order.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrderIds.includes(order.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {order.deliveryAddress?.name} • {order.deliveryAddress?.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-600">{order.weight}g</p>
                        {order.shipment && (
                          <p className="font-mono text-xs text-gray-500">
                            {order.shipment.awb}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Pickup Details */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Pickup Details</h2>

            {/* Pickup Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Address
              </label>
              {addressesError ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  ⚠️ Failed to load addresses. Please refresh the page.
                </div>
              ) : addressesLoading ? (
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : addresses.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                  No pickup addresses found. <Link href="/settings/addresses" className="underline">Add one here</Link>.
                </div>
              ) : (
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select address</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.name} - {addr.addressLine1}, {addr.city}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Preferred Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                min={minDate}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time Slot */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="MORNING">Morning (9 AM - 12 PM)</option>
                <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
                <option value="EVENING">Evening (4 PM - 7 PM)</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for pickup..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders Selected:</span>
                  <span className="font-medium">{selectedOrderIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Weight:</span>
                  <span className="font-medium">{(totalWeight / 1000).toFixed(2)} kg</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createPickupMutation.isPending || selectedOrderIds.length === 0}
              className="w-full"
            >
              {createPickupMutation.isPending ? 'Creating...' : 'Schedule Pickup'}
            </Button>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">💡 Pickup Tips</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Schedule pickup at least 1 day in advance</li>
                <li>• Ensure packages are properly packed and labeled</li>
                <li>• Keep tracking numbers handy for reference</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
