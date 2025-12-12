 'use client';
// app/orders/page.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/format';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  invoiceAmount: number;
  paymentType: 'PREPAID' | 'COD';
  createdAt: string;
  trackingNumber: string | null;
  shipment: {
    id: string;
    awb: string;
    status: string;
    courier?: string;
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
}

export default function OrdersPage() {
  const { data: response, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<OrdersResponse>('/orders');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
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

      {orders.length === 0 ? (
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
                      {order.orderNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.paymentType === 'COD' && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        COD
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {order.deliveryAddress && (
                      <>
                        <div>
                          <span className="text-gray-600">Recipient:</span>
                          <span className="ml-2 text-gray-900">
                            {order.deliveryAddress.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 text-gray-900">
                            {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
                          </span>
                        </div>
                      </>
                    )}
                    {order.shipment && (
                      <>
                        <div>
                          <span className="text-gray-600">Courier:</span>
                          <span className="ml-2 text-gray-900">
                            {order.shipment.courier || 'Assigned'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">AWB:</span>
                          <span className="ml-2 text-gray-900 font-mono text-xs">
                            {order.shipment.awb}
                          </span>
                        </div>
                      </>
                    )}
                    {!order.shipment && order.trackingNumber && (
                      <div>
                        <span className="text-gray-600">Tracking:</span>
                        <span className="ml-2 text-gray-900 font-mono text-xs">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Created: {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.invoiceAmount)}
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

      {orders.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
