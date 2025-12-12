 // utils/format.ts

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs.0.00';
  }
  return `Rs.${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
}

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  const colors: Record<string, string> = {
    // Order statuses
    'delivered': 'bg-green-100 text-green-800',
    'in_transit': 'bg-blue-100 text-blue-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800',
    'rto': 'bg-orange-100 text-orange-800',
    'failed': 'bg-red-100 text-red-800',
    
    // Invoice statuses
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
    'partially_paid': 'bg-blue-100 text-blue-800',
  };
  
  return colors[statusLower] || 'bg-gray-100 text-gray-800';
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: +91 98765 43210
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

export function formatWeight(grams: number | null | undefined): string {
  if (grams === null || grams === undefined || isNaN(grams)) {
    return '0g';
  }
  
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}kg`;
  }
  
  return `${grams}g`;
}

export function getStatusBadge(status: string): {
  color: string;
  text: string;
  icon: string;
} {
  const statusLower = status.toLowerCase();
  
  const badges: Record<string, { color: string; text: string; icon: string }> = {
    'delivered': { color: 'bg-green-100 text-green-800', text: 'Delivered', icon: '✅' },
    'in_transit': { color: 'bg-blue-100 text-blue-800', text: 'In Transit', icon: '🚚' },
    'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: '⏳' },
    'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelled', icon: '❌' },
    'rto': { color: 'bg-orange-100 text-orange-800', text: 'RTO', icon: '↩️' },
    'paid': { color: 'bg-green-100 text-green-800', text: 'Paid', icon: '💰' },
    'unpaid': { color: 'bg-yellow-100 text-yellow-800', text: 'Unpaid', icon: '⏰' },
    'overdue': { color: 'bg-red-100 text-red-800', text: 'Overdue', icon: '⚠️' },
  };
  
  return badges[statusLower] || {
    color: 'bg-gray-100 text-gray-800',
    text: status,
    icon: '📄',
  };
}

export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function formatPercentage(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0%';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0%';
  
  return `${num.toFixed(2)}%`;
}
