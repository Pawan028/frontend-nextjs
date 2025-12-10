 'use client';
// app/invoices/page.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useRequireAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';

interface Invoice {
  id: string;
  invoice_number: string;
  invoiceNumber?: string;
  billing_start: string;
  billingStart?: string;
  billing_end: string;
  billingEnd?: string;
  total_amount: number;
  totalAmount?: number;
  status: string;
  created_at?: string;
  createdAt?: string;
}

interface InvoiceResponse {
  success: boolean;
  data?: Invoice[];
}

export default function InvoicesPage() {
  const token = useRequireAuth();

  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get<InvoiceResponse | Invoice[]>('/invoices');
      
      // Handle backend response format
      if (res.data && typeof res.data === 'object' && 'success' in res.data) {
        return (res.data as InvoiceResponse).data || [];
      }
      
      return Array.isArray(res.data) ? res.data : [];
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
        <div className="text-gray-600">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading invoices. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">View and download your billing invoices</p>
      </div>

      {!invoices || invoices.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-600 mb-4">Invoices will appear here after billing cycles</p>
            <p className="text-sm text-gray-500">
              Similar to Shiprocket, invoices are generated monthly for your shipping charges
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.invoice_number || invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {invoice.status || 'PAID'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span>Billing Period: </span>
                    <span className="font-medium">
                      {formatDate(invoice.billing_start || invoice.billingStart || new Date())} 
                      {' - '}
                      {formatDate(invoice.billing_end || invoice.billingEnd || new Date())}
                    </span>
                  </div>
                  
                  {(invoice.created_at || invoice.createdAt) && (
                    <div className="text-xs text-gray-500 mt-2">
                      Generated: {formatDate(invoice.created_at || invoice.createdAt || new Date())}
                    </div>
                  )}
                </div>

                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-gray-900 mb-3">
                    {formatCurrency(invoice.total_amount || invoice.totalAmount || 0)}
                  </div>
                  <a
                    href={`/api/v1/invoices/${invoice.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                  >
                    📥 Download PDF
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Total: {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            💡 Like Shiprocket, all invoices are downloadable as PDF
          </p>
        </div>
      )}
    </div>
  );
}
