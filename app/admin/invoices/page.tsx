'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { showToast } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Invoice {
    id: string;
    invoiceNumber: string;
    billingStart: string;
    billingEnd: string;
    totalAmount: number;
    paidAmount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paymentMethod: string | null;
    dueDate: string;
    paidAt: string | null;
    createdAt: string;
    merchant: {
        id: string;
        businessName: string;
        email: string;
    };
}

export default function AdminInvoicesPage() {
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const queryClient = useQueryClient();

    const {
        data: invoicesData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin-invoices', selectedStatus],
        queryFn: async () => {
            try {
                const params = selectedStatus !== 'ALL' ? `?status=${selectedStatus}` : '';
                const response = await api.get(`/admin/invoices${params}`);
                return response.data;
            } catch (err: any) {
                if (err.response?.status === 404) {
                    return { success: true, data: [] };
                }
                throw err;
            }
        },
    });

    const invoices: Invoice[] = invoicesData?.data || [];

    // Mark invoice as paid
    const markPaidMutation = useMutation({
        mutationFn: async ({ invoiceId }: { invoiceId: string }) => {
            const response = await api.post(`/admin/invoices/${invoiceId}/mark-paid`);
            return response.data;
        },
        onSuccess: (data, variables) => {
            showToast('Invoice marked as paid successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error?.message || 'Failed to mark invoice as paid';
            showToast(errorMsg, 'error');
        },
    });

    // Download invoice PDF
    const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
        try {
            const response = await api.get(`/invoices/${invoiceId}/download`, {
                responseType: 'blob',
            });

            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                showToast(errorData?.error?.message || 'Failed to download PDF', 'error');
                return;
            }

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Download error:', err);
            showToast('Failed to download invoice', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'OVERDUE':
                return 'bg-red-100 text-red-800';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">🧾 Admin - Invoices</h1>
                <p className="text-gray-600 mt-1">Manage merchant invoices and payments</p>
            </div>

            {/* Filter Buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
                {['ALL', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            selectedStatus === status
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading && (
                <Card>
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Loading invoices...</p>
                    </div>
                </Card>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <Card className="bg-red-50 border-red-200">
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-red-700 font-semibold mb-2">Failed to load invoices</p>
                        <p className="text-gray-600 text-sm mb-4">
                            {(error as any)?.response?.data?.error?.message || 'Please try refreshing the page'}
                        </p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && invoices.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                        <p className="text-gray-600">
                            {selectedStatus !== 'ALL'
                                ? `No ${selectedStatus.toLowerCase()} invoices`
                                : 'No invoices have been generated yet'}
                        </p>
                    </div>
                </Card>
            )}

            {/* Invoices List */}
            {!isLoading && !error && invoices.length > 0 && (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <div className="text-center">
                                <p className="text-sm text-blue-600 font-medium">Total Invoices</p>
                                <p className="text-3xl font-bold text-blue-700">{invoices.length}</p>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <div className="text-center">
                                <p className="text-sm text-green-600 font-medium">Paid</p>
                                <p className="text-3xl font-bold text-green-700">
                                    {invoices.filter((i) => i.status === 'PAID').length}
                                </p>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                            <div className="text-center">
                                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                                <p className="text-3xl font-bold text-yellow-700">
                                    {invoices.filter((i) => i.status === 'PENDING').length}
                                </p>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <div className="text-center">
                                <p className="text-sm text-red-600 font-medium">Overdue</p>
                                <p className="text-3xl font-bold text-red-700">
                                    {invoices.filter((i) => i.status === 'OVERDUE').length}
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Invoices Table */}
                    {invoices.map((invoice) => (
                        <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Invoice Details */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {invoice.invoiceNumber}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                invoice.status
                                            )}`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </div>

                                    {/* Merchant Info */}
                                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-gray-600">Merchant</p>
                                        <p className="font-semibold text-gray-900">{invoice.merchant.businessName}</p>
                                        <p className="text-xs text-gray-500">{invoice.merchant.email}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-600">Amount</p>
                                            <p className="font-bold text-gray-900">₹{invoice.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Billing Period</p>
                                            <p className="font-medium text-gray-800">
                                                {new Date(invoice.billingStart).toLocaleDateString()} -{' '}
                                                {new Date(invoice.billingEnd).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Due Date</p>
                                            <p className="font-medium text-gray-800">
                                                {new Date(invoice.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                {invoice.status === 'PAID' ? 'Paid On' : 'Created'}
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {invoice.paidAt
                                                    ? new Date(invoice.paidAt).toLocaleDateString()
                                                    : new Date(invoice.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 lg:ml-4">
                                    {/* Mark Paid Button */}
                                    {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                                        <Button
                                            onClick={() => markPaidMutation.mutate({ invoiceId: invoice.id })}
                                            disabled={markPaidMutation.isPending}
                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white whitespace-nowrap"
                                        >
                                            {markPaidMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                    Processing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <span>✅</span>
                                                    <span>Mark Paid</span>
                                                </span>
                                            )}
                                        </Button>
                                    )}

                                    {/* View PDF Button */}
                                    <Button
                                        onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}
                                        variant="secondary"
                                        className="whitespace-nowrap"
                                    >
                                        <span className="flex items-center gap-2">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                            <span>View PDF</span>
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Footer */}
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-600">
                            Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
