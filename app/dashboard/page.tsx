 'use client';
// app/dashboard/page.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useRequireAuth } from '../../hooks/useAuth';
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
  delivery_address?: {
    city?: string;
  };
}

interface WalletBalance {
  balance: number;
}

interface DashboardData {
  orders: Order[];
  wallet: WalletBalance;
}

export default function DashboardPage() {
  const token = useRequireAuth(); // Use the auth guard hook

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const [ordersRes, walletRes] = await Promise.all([
        api.get<Order[] | { orders: Order[] }>('/orders?limit=5'),
        api.get<WalletBalance>('/wallet/balance').catch(() => ({ data: { balance: 0 } })),
      ]);
      
      const orders = Array.isArray(ordersRes.data) 
        ? ordersRes.data 
        : ordersRes.data.orders || [];
      
      return {
        orders,
        wallet: walletRes.data,
      };
    },
    enabled: !!token,
  });

  // Show loading while checking auth
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
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading dashboard. Please try again.
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  const walletBalance = data?.wallet?.balance || 0;
  
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your shipping overview.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-sm text-gray-600">Wallet Balance</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {formatCurrency(walletBalance)}
          </div>
          <Link href="/wallet" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
            Top up →
          </Link>
        </Card>

        <Card>
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-600">Delivered</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{deliveredOrders}</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">{pendingOrders}</div>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        <Link href="/orders/create">
          <Button size="sm">+ Create Order</Button>
        </Link>
      </div>

      <Card>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link href="/orders/create">
              <Button>Create Your First Order</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {order.orderNumber || order.order_number || `#${order.id}`}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {order.delivery_address?.city || 'N/A'} • {formatDate(order.created_at || order.createdAt || new Date())}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(order.invoice_amount || order.invoiceAmount || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-6 text-center">
        <Link href="/orders" className="text-blue-600 hover:underline">
          View all orders →
        </Link>
      </div>
    </div>
  );
}
