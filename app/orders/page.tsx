 'use client';
// app/orders/page.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import EmptyState from '../../components/EmptyState';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import CarrierBadge from '../../components/CarrierBadge';
import { TrackingStatusBadge } from '../../components/TrackingTimeline';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/format';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  invoiceAmount: number;
  paymentType: 'PREPAID' | 'COD';
  createdAt: string;
  trackingNumber: string | null;
  labelUrl?: string | null;
  shipment: {
    id: string;
    awb: string;
    status: string;
    courier?: string;
    labelUrl?: string | null;
  } | null;
  deliveryAddress?: {
    name: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const limit = 20;
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ['orders', page, statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await api.get<OrdersResponse>(`/orders?${params}`);
      return res.data;
    },
  });

  // Download label mutation
  const downloadLabelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.get(`/orders/${orderId}/label`, { responseType: 'blob' });
      return res.data;
    },
    onSuccess: (data, orderId) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `label-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Select all orders on current page
  const toggleSelectAll = () => {
    const orderIds = orders.map(o => o.id);
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orderIds);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-red-50 border-red-200">
          <div className="text-center py-8">
            <p className="text-red-700">Error loading orders. Please try again.</p>
          </div>
        </Card>
      </div>
    );
  }

  const orders = response?.data || [];
  const pagination = response?.pagination;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'CREATED', label: 'Created' },
    { value: 'READY_TO_SHIP', label: 'Ready to Ship' },
    { value: 'MANIFESTED', label: 'Manifested' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RTO_INITIATED', label: 'RTO Initiated' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track your shipments</p>
        </div>
        <Link href="/orders/create">
          <Button>+ Create Order</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by order number or AWB..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {orders.length === 0 ? (
        <Card>
          <EmptyState
            icon="orders"
            title="No orders yet"
            description="Create your first order to start shipping with best rates across all couriers."
            actionLabel="Create Your First Order"
            actionHref="/orders/create"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-all">
              {/* Mobile-first responsive layout */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header with order number and badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {order.orderNumber}
                    </h3>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.paymentType === 'COD' && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
                        COD
                      </span>
                    )}
                  </div>
                  
                  {/* Order details - stack on mobile, grid on larger */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                    {order.deliveryAddress && (
                      <>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-gray-500">Recipient:</span>
                          <span className="text-gray-900 font-medium truncate">
                            {order.deliveryAddress.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-gray-500">Location:</span>
                          <span className="text-gray-900">
                            {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
                          </span>
                        </div>
                      </>
                    )}
                    {order.shipment && (
                      <>
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-gray-500">Courier:</span>
                          <CarrierBadge
                            carrier={order.shipment.courier || 'Unknown'}
                            size="sm"
                            showLogo={false}
                          />
                        </div>
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-gray-500">AWB:</span>
                          <span className="text-gray-900 font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {order.shipment.awb}
                          </span>
                        </div>
                      </>
                    )}
                    {!order.shipment && order.trackingNumber && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-gray-500">Tracking:</span>
                        <span className="text-gray-900 font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {formatDate(order.createdAt)}
                  </div>

                  {/* Action Buttons - better mobile spacing */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(order.shipment?.labelUrl || order.labelUrl) && (
                      <button
                        onClick={() => downloadLabelMutation.mutate(order.id)}
                        disabled={downloadLabelMutation.isPending}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                      >
                        📄 Label
                      </button>
                    )}
                    {order.shipment?.awb && (
                      <Link
                        href={`/orders/${order.id}/tracking`}
                        className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        📍 Track
                      </Link>
                    )}
                    {order.status === 'READY_TO_SHIP' && (
                      <Link
                        href="/orders/pickup"
                        className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors font-medium"
                      >
                        🚚 Pickup
                      </Link>
                    )}
                  </div>
                </div>

                {/* Amount section - full width on mobile */}
                <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end pt-3 sm:pt-0 border-t sm:border-t-0 sm:ml-4">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(order.invoiceAmount)}
                  </div>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium sm:mt-2"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {orders.length} of {pagination.total} orders (Page {pagination.page} of {pagination.totalPages})
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                ← Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasMore || isLoading}
              >
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
