'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/EmptyState';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/format';
import type { DashboardResponse } from '../../types/dashboard';
import { useAuthStore } from '../../stores/useAuthStore';

// Dynamic import for chart (prevents SSR issues with recharts)
const OrdersChart = dynamic(() => import('../../components/charts/OrdersChart'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
});

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const { data, isLoading, error, isFetching } = useQuery<DashboardResponse>({
        // ✅ SECURITY: Scope query key to merchant ID to prevent cross-user data leaks
        queryKey: ['dashboard', user?.merchantProfile?.id || 'anonymous'],
        queryFn: async () => {
            try {
                const response = await api.get<DashboardResponse>('/merchant/dashboard');

                console.log('📊 Raw API Response:', response.data);

                if (!response.data.success) {
                    throw new Error(response.data.error?.message || 'Failed to fetch');
                }

                // ✅ SAFE date parsing - never throws errors
                const parseDate = (date: any): string => {
                    // If no date, return current ISO string
                    if (!date) return new Date().toISOString();

                    try {
                        // If already a valid ISO string, return it
                        if (typeof date === 'string' && date.includes('T')) {
                            const testDate = new Date(date);
                            if (!isNaN(testDate.getTime())) {
                                return date;
                            }
                        }

                        // Try parsing as Date object
                        if (date instanceof Date) {
                            if (!isNaN(date.getTime())) {
                                return date.toISOString();
                            }
                        }

                        // Try parsing string/number as timestamp
                        const parsed = new Date(date);
                        if (!isNaN(parsed.getTime())) {
                            return parsed.toISOString();
                        }
                    } catch (err) {
                        console.warn('⚠️ Date parse error:', err, 'for value:', date);
                    }

                    // Fallback: return current date
                    return new Date().toISOString();
                };

                // ✅ Safe number parsing
                const parseNumber = (value: any): number => {
                    if (value === null || value === undefined) return 0;
                    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
                    return isNaN(num) ? 0 : num;
                };

                // ✅ Sanitize the data with safe parsing
                const sanitized = {
                    success: response.data.success,
                    data: {
                        merchant: {
                            name: response.data.data?.merchant?.name || 'User',
                            companyName: response.data.data?.merchant?.companyName || 'Company',
                        },
                        stats: {
                            wallet: {
                                balance: parseNumber(response.data.data?.stats?.wallet?.balance),
                            },
                            orders: {
                                total: parseNumber(response.data.data?.stats?.orders?.total),
                                delivered: parseNumber(response.data.data?.stats?.orders?.delivered),
                                thisMonth: parseNumber(response.data.data?.stats?.orders?.thisMonth),
                                deliveryRate: parseNumber(response.data.data?.stats?.orders?.deliveryRate),
                                inTransit: parseNumber(response.data.data?.stats?.orders?.inTransit),
                                pending: parseNumber(response.data.data?.stats?.orders?.pending),
                                cancelled: parseNumber(response.data.data?.stats?.orders?.cancelled),
                                rto: parseNumber(response.data.data?.stats?.orders?.rto),
                            },
                            revenue: {
                                growth: parseNumber(response.data.data?.stats?.revenue?.growth),
                                thisMonth: parseNumber(response.data.data?.stats?.revenue?.thisMonth),
                            },
                            invoices: {
                                unpaid: parseNumber(response.data.data?.stats?.invoices?.unpaid),
                                totalUnpaidAmount: parseNumber(response.data.data?.stats?.invoices?.totalUnpaidAmount),
                                overdue: parseNumber(response.data.data?.stats?.invoices?.overdue),
                            },
                        },
                        recentActivity: {
                            orders: (response.data.data?.recentActivity?.orders || []).map((o: any) => ({
                                id: o.id || 'unknown',
                                orderNumber: o.orderNumber || 'N/A',
                                invoiceAmount: parseNumber(o.invoiceAmount),
                                paymentType: o.paymentType || 'PREPAID',
                                status: o.status || 'PENDING',
                            })),
                            transactions: (response.data.data?.recentActivity?.transactions || []).map((t: any) => ({
                                id: t.id || 'unknown',
                                description: t.description || 'Transaction',
                                type: t.type || 'DEBIT',
                                amount: parseNumber(t.amount),
                                createdAt: parseDate(t.createdAt),
                                closingBalance: parseNumber(t.closingBalance),
                            })),
                        },
                    },
                };

                console.log('✅ Sanitized data:', sanitized);
                return sanitized as unknown as DashboardResponse;
            } catch (err) {
                console.error('❌ Dashboard fetch error:', err);
                throw err;
            }
        },
        // ✅ PERFORMANCE OPTIMIZATION: Cache for 2 minutes, refetch in background
        // ✅ PERFORMANCE OPTIMIZATION: Cache for 30s (matches backend TTL)
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
        refetchInterval: 30000, // Background refresh every 30s
        refetchOnWindowFocus: true, // Refetch when user returns
    });

    // Only show skeleton on initial load, not when refetching
    if (isLoading && !data) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <DashboardSkeleton />
            </div>
        );
    }

    // Error state
    if (error || !data?.success) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Card className="bg-red-50 border-red-200">
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-red-900 mb-2">
                            Failed to load dashboard
                        </h2>
                        <p className="text-red-700 mb-2">{errorMessage}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    const { merchant, stats, recentActivity } = data.data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-7xl mx-auto px-4 py-8"
        >
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-slate-400 mt-1">
                        Welcome back, {merchant.name}! Here&apos;s your shipping overview for {merchant.companyName}.
                    </p>
                </div>
                {isFetching && (
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                    </div>
                )}
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-8 text-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">Quick Actions</h2>
                        <p className="text-blue-100 text-sm">Get things done faster</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/orders/create"
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
                        >
                            📦 Create Order
                        </Link>
                        <Link
                            href="/orders/pickup"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors text-sm"
                        >
                            🚚 Schedule Pickup
                        </Link>
                        <Link
                            href="/dashboard/rates"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors text-sm"
                        >
                            💰 Check Rates
                        </Link>
                        <Link
                            href="/wallet"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors text-sm"
                        >
                            💳 Top Up Wallet
                        </Link>
                    </div>
                </div>
            </div>

            {/* Primary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Wallet Balance */}
                <Card>
                    <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Wallet Balance</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.wallet.balance)}
                    </div>
                    <Link href="/wallet" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                        Top up →
                    </Link>
                </Card>

                {/* Total Orders */}
                <Card>
                    <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Total Orders</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.orders.total}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {stats.orders.thisMonth} this month
                    </div>
                </Card>

                {/* Delivery Rate */}
                <Card>
                    <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Delivery Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                        {stats.orders.deliveryRate}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {stats.orders.delivered} delivered
                    </div>
                </Card>

                {/* Revenue Growth */}
                <Card>
                    <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Revenue Growth</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {stats.revenue.growth > 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(stats.revenue.thisMonth)} this month
                    </div>
                </Card>
            </div>

            {/* Alert Banners */}
            <div className="space-y-3 mb-8">
                {/* Low wallet balance warning */}
                {stats.wallet.balance < 500 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-medium text-yellow-800">Low Wallet Balance</p>
                                <p className="text-sm text-yellow-700">Add funds to avoid order failures</p>
                            </div>
                        </div>
                        <Link href="/wallet" className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700">
                            Top Up Now
                        </Link>
                    </div>
                )}

                {/* Unpaid invoices alert */}
                {stats.invoices.unpaid > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📄</span>
                            <div>
                                <p className="font-medium text-red-800">{stats.invoices.unpaid} Unpaid Invoice{stats.invoices.unpaid > 1 ? 's' : ''}</p>
                                <p className="text-sm text-red-700">Total due: {formatCurrency(stats.invoices.totalUnpaidAmount)}</p>
                            </div>
                        </div>
                        <Link href="/invoices" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                            View Invoices
                        </Link>
                    </div>
                )}

                {/* Pending orders reminder */}
                {stats.orders.pending > 5 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📦</span>
                            <div>
                                <p className="font-medium text-blue-800">{stats.orders.pending} Orders Pending</p>
                                <p className="text-sm text-blue-700">Schedule a pickup to ship these orders</p>
                            </div>
                        </div>
                        <Link href="/orders/pickup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                            Schedule Pickup
                        </Link>
                    </div>
                )}
            </div>

            {/* Orders Chart & Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Chart Section */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Trends</h3>
                            <p className="text-sm text-gray-500">Last 7 days performance</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">Orders</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-gray-600">Delivered</span>
                            </div>
                        </div>
                    </div>
                    <OrdersChart />
                </Card>

                {/* Order Status Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="text-center card-hover">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.orders.inTransit}</div>
                        <div className="text-sm text-gray-600 mt-1">In Transit</div>
                    </Card>
                    <Card className="text-center card-hover">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{stats.orders.pending}</div>
                        <div className="text-sm text-gray-600 mt-1">Pending</div>
                    </Card>
                    <Card className="text-center card-hover">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="text-3xl font-bold text-red-600">{stats.orders.cancelled}</div>
                        <div className="text-sm text-gray-600 mt-1">Cancelled</div>
                    </Card>
                    <Card className="text-center card-hover">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </div>
                        <div className="text-3xl font-bold text-orange-600">{stats.orders.rto}</div>
                        <div className="text-sm text-gray-600 mt-1">RTO</div>
                    </Card>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
                        <Link
                            href="/orders/create"
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            + New
                        </Link>
                    </div>

                    {recentActivity.orders.length === 0 ? (
                        <div className="py-4">
                            <EmptyState
                                icon="orders"
                                title="No orders yet"
                                description="Start shipping to see your recent orders here."
                                actionLabel="Create First Order"
                                actionHref="/orders/create"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">
                                            {order.orderNumber}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatCurrency(order.invoiceAmount)} • {order.paymentType}
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {order.status}
                                    </span>
                                </div>
                            ))}
                            <Link
                                href="/orders"
                                className="block text-center text-sm text-blue-600 hover:underline pt-2"
                            >
                                View all orders →
                            </Link>
                        </div>
                    )}
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                        <Link
                            href="/wallet"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {recentActivity.transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">💰</div>
                            <p className="text-gray-600 text-sm">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                                >
                                    <div>
                                        <div className="text-sm text-gray-900">{tx.description}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`font-semibold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Bal: {formatCurrency(tx.closingBalance)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Invoice Alert (if unpaid) */}
            {stats.invoices.unpaid > 0 && (
                <Card className="mt-6 bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-orange-900">
                                {stats.invoices.unpaid} Unpaid Invoice{stats.invoices.unpaid > 1 ? 's' : ''}
                            </h3>
                            <p className="text-sm text-orange-700">
                                Total: {formatCurrency(stats.invoices.totalUnpaidAmount)}
                                {stats.invoices.overdue > 0 && ` (${stats.invoices.overdue} overdue)`}
                            </p>
                        </div>
                        <Link
                            href="/invoices"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                        >
                            View Invoices
                        </Link>
                    </div>
                </Card>
            )}
        </motion.div>
    );
}