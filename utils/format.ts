// utils/format.ts
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    delivered: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}
