'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { showToast } from '../../lib/api';
import Card from '../../components/ui/Card';
import InvoicePreviewModal from '../../components/InvoicePreviewModal';
import PaymentIntentModal from '../../components/PaymentIntentModal';

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
}

export default function InvoicesPage() {
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
    const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

    const {
        data: invoicesData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            try {
                const response = await api.get('/invoices');
                return response.data;
            } catch (err: any) {
                // ✅ FIXED: If 404 (No invoices found), return empty list instead of throwing
                if (err.response?.status === 404) {
                    return { success: true, data: [] };
                }
                throw err;
            }
        },
    });

    const invoices: Invoice[] = invoicesData?.data || [];

    // ✅ Download handler with loading state and PDF generation support
    const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
        setDownloadingInvoiceId(invoiceId);
        showToast('Preparing invoice PDF...', 'info');

        try {
            const response = await api.get(`/invoices/${invoiceId}/download`, {
                responseType: 'blob',
                timeout: 30000, // 30 second timeout for PDF generation
            });

            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                showToast(errorData?.error?.message || 'Failed to download PDF', 'error');
                setDownloadingInvoiceId(null);
                return;
            }

            // Create download link
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast('Invoice PDF downloaded successfully!', 'success');
        } catch (err: any) {
            console.error('Download error:', err);
            showToast(
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to download invoice',
                'error'
            );
        } finally {
            setDownloadingInvoiceId(null);
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
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                <p className="text-gray-600 mt-1">View and download your billing invoices</p>
            </div>

            {isLoading && (
                <Card>
                    <div className="text-center py-8 text-gray-600">Loading invoices...</div>
                </Card>
            )}

            {!isLoading && !error && invoices.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg
                                className="mx-auto h-12 w-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                        <p className="text-gray-600">Invoices will appear here after billing cycles</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Invoices are generated monthly for your shipping charges
                        </p>
                    </div>
                </Card>
            )}

            {!isLoading && !error && invoices.length > 0 && (
                <div className="space-y-4">
                    {invoices.map((invoice) => (
                        <Card key={invoice.id}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {invoice.invoiceNumber}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                invoice.status
                                            )}`}
                                        >
                      {invoice.status}
                    </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Billing Period</p>
                                            <p className="font-medium text-gray-800">
                                                {new Date(invoice.billingStart).toLocaleDateString()} -{' '}
                                                {new Date(invoice.billingEnd).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Amount</p>
                                            <p className="font-medium text-gray-800">
                                                ₹{invoice.totalAmount.toFixed(2)}
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
                                                {invoice.status === 'PAID' ? 'Paid On' : 'Generated On'}
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {invoice.paidAt
                                                    ? new Date(invoice.paidAt).toLocaleDateString()
                                                    : new Date(invoice.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    {/* Pay Invoice Button - Only show if PENDING or OVERDUE */}
                                    {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                                        <button
                                            onClick={() => {
                                                setProcessingInvoiceId(invoice.id);
                                                setPaymentInvoice(invoice);
                                            }}
                                            disabled={processingInvoiceId === invoice.id || !!paymentInvoice}
                                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded shadow-md transition-all font-semibold ${
                                                processingInvoiceId === invoice.id || paymentInvoice
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105'
                                            }`}
                                        >
                                            {processingInvoiceId === invoice.id ? (
                                                <>
                                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>💳</span>
                                                    <span>Pay Invoice</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Preview Button */}
                                    <button
                                        onClick={() => setSelectedInvoiceId(invoice.id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                                    >
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
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                        Preview
                                    </button>

                                    {/* Download Button */}
                                    <button
                                        onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}
                                        disabled={downloadingInvoiceId === invoice.id}
                                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded border transition-colors ${
                                            downloadingInvoiceId === invoice.id
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'text-blue-600 hover:bg-blue-50 border-blue-200'
                                        }`}
                                    >
                                        {downloadingInvoiceId === invoice.id ? (
                                            <>
                                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></span>
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            <>
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
                                                <span>Download PDF</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Footer */}
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-600">
                            Total: {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">💡 All invoices are downloadable as PDF</p>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {selectedInvoiceId && (
                <InvoicePreviewModal
                    invoiceId={selectedInvoiceId}
                    onClose={() => setSelectedInvoiceId(null)}
                />
            )}

            {/* Payment Intent Modal */}
            {paymentInvoice && (
                <PaymentIntentModal
                    isOpen={true}
                    onClose={() => {
                        setPaymentInvoice(null);
                        setProcessingInvoiceId(null);
                    }}
                    amount={paymentInvoice.totalAmount}
                    type="INVOICE_PAYMENT"
                    invoiceId={paymentInvoice.id}
                    description={`Payment for invoice ${paymentInvoice.invoiceNumber}`}
                    onSuccess={() => {
                        setPaymentInvoice(null);
                        setProcessingInvoiceId(null);
                    }}
                />
            )}
        </div>
    );
}
