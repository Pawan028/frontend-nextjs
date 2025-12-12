'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/format';
import type { DashboardResponse } from '../../types/dashboard';

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery<DashboardResponse>({
        queryKey: ['dashboard'],
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
        refetchInterval: 30000,
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, {merchant.name}! Here&apos;s your shipping overview for {merchant.companyName}.
                </p>
            </div>

            {/* Primary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Wallet Balance */}
                <Card>
                    <div className="text-sm text-gray-600 mb-1">Wallet Balance</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.wallet.balance)}
                    </div>
                    <Link href="/wallet" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                        Top up →
                    </Link>
                </Card>

                {/* Total Orders */}
                <Card>
                    <div className="text-sm text-gray-600 mb-1">Total Orders</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {stats.orders.total}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {stats.orders.thisMonth} this month
                    </div>
                </Card>

                {/* Delivery Rate */}
                <Card>
                    <div className="text-sm text-gray-600 mb-1">Delivery Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                        {stats.orders.deliveryRate}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {stats.orders.delivered} delivered
                    </div>
                </Card>

                {/* Revenue Growth */}
                <Card>
                    <div className="text-sm text-gray-600 mb-1">Revenue Growth</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {stats.revenue.growth > 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(stats.revenue.thisMonth)} this month
                    </div>
                </Card>
            </div>

            {/* Order Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{stats.orders.inTransit}</div>
                    <div className="text-sm text-gray-600 mt-1">In Transit</div>
                </Card>
                <Card className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.orders.pending}</div>
                    <div className="text-sm text-gray-600 mt-1">Pending</div>
                </Card>
                <Card className="text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.orders.cancelled}</div>
                    <div className="text-sm text-gray-600 mt-1">Cancelled</div>
                </Card>
                <Card className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{stats.orders.rto}</div>
                    <div className="text-sm text-gray-600 mt-1">RTO</div>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                        <Link
                            href="/orders/create"
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            + New
                        </Link>
                    </div>

                    {recentActivity.orders.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">📦</div>
                            <p className="text-gray-600 text-sm mb-3">No orders yet</p>
                            <Link
                                href="/orders/create"
                                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                                Create First Order
                            </Link>
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
                        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
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
                                            className={`font-semibold ${
                                                tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
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
        </div>
    );
}