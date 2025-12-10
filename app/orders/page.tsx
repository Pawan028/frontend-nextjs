 'use client';
// app/orders/page.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useRequireAuth } from '../../hooks/useAuth'; // Add this
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/format';

interface Order {
  id: string;
  orderNumber?: string;
  order_number?: string;
  status: string;
  invoice_amount?: number;
  invoiceAmount?: number;
  created_at?: string;
  createdAt?: string;
  tracking_id?: string;
  trackingId?: string;
  courier?: string;
  delivery_address?: {
    name?: string;
    city?: string;
    pincode?: string;
  };
}

 export default function OrdersPage() {
  const token = useRequireAuth(); // Replace the old useEffect logic

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<Order[] | { orders: Order[] }>('/orders');
      return Array.isArray(res.data) ? res.data : res.data.orders || [];
    },
    enabled: !!token,
  });

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Checking authentication...</div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading orders. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track your shipments</p>
        </div>
        <Link href="/orders/create">
          <Button>+ Create Order</Button>
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Create your first order to get started</p>
            <Link href="/orders/create">
              <Button>Create Order</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.orderNumber || order.order_number || `#${order.id.slice(0, 8)}`}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Recipient:</span>
                      <span className="ml-2 text-gray-900">
                        {order.delivery_address?.name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 text-gray-900">
                        {order.delivery_address?.city || 'N/A'}, {order.delivery_address?.pincode || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Courier:</span>
                      <span className="ml-2 text-gray-900">
                        {order.courier || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tracking ID:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs">
                        {order.tracking_id || order.trackingId || 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Created: {formatDate(order.created_at || order.createdAt || new Date())}
                  </div>
                </div>

                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.invoice_amount || order.invoiceAmount || 0)}
                  </div>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
