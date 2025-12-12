'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function InvoicePreviewModal({
                                                invoiceId,
                                                onClose,
                                            }: {
    invoiceId: string | null;
    onClose: () => void;
}) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadPdf() {
            if (!invoiceId) return;

            setLoading(true);
            setError('');
            setBlobUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });

            try {
                const res = await api.get(`/invoices/${invoiceId}/download`, {
                    responseType: 'blob',
                });

                const contentType = String(res.headers?.['content-type'] || '');

                // Check if backend returned JSON error instead of PDF
                if (contentType.includes('application/json')) {
                    const text = await (res.data as Blob).text();
                    const errorData = JSON.parse(text);

                    // Handle specific backend error codes
                    if (errorData?.error?.code === 'NOT_FOUND') {
                        throw new Error(
                            'PDF not yet generated.\n\nThe invoice exists but the PDF file hasn\'t been created on the server yet. Please contact support or try again later.'
                        );
                    }

                    throw new Error(errorData?.error?.message || 'Failed to load PDF');
                }

                // Success - create blob URL for iframe
                const url = URL.createObjectURL(res.data as Blob);
                if (!cancelled) {
                    setBlobUrl(url);
                }
            } catch (e: any) {
                let msg = 'Failed to load invoice PDF';

                // Handle specific error cases with friendly messages
                if (e?.response?.status === 404) {
                    msg = 'PDF not yet generated.\n\nThis invoice exists in the database, but the PDF file hasn\'t been created yet. The backend team has been notified.';
                } else if (e?.response?.data?.error?.code === 'NOT_FOUND') {
                    msg = 'PDF file not found on server.\n\nThe invoice data exists but the PDF hasn\'t been generated yet. Please try again later.';
                } else if (e?.message) {
                    msg = e.message;
                } else if (e?.response?.data?.error?.message) {
                    msg = e.response.data.error.message;
                }

                if (!cancelled) {
                    setError(String(msg));
                }
                console.error('PDF load error:', e);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPdf();

        return () => {
            cancelled = true;
            setBlobUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        };
    }, [invoiceId]);

    if (!invoiceId) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Invoice Preview</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <div className="text-gray-600">Loading PDF…</div>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <div className="text-center max-w-md">
                                <div className="text-6xl mb-4">📄</div>
                                <p className="text-red-600 font-semibold mb-3 text-lg">
                                    ⚠️ Error Loading PDF
                                </p>
                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-6">
                                    {error}
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && blobUrl && (
                        <iframe
                            src={blobUrl}
                            className="w-full h-full border-0"
                            title="Invoice PDF Preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
