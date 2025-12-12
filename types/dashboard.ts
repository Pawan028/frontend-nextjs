// types/dashboard.ts

export interface DashboardResponse {
  error: any;
  success: boolean;
  data: DashboardData;
}

export interface DashboardData {
  merchant: MerchantInfo;
  stats: DashboardStats;
  recentActivity: RecentActivity;
}

export interface MerchantInfo {
  id: string;
  companyName: string;
  email: string;
  name: string;
  phone: string;
  walletBalance: number;
  billingCycle: 'PREPAID' | 'POSTPAID';
  isKycVerified: boolean;
  gst: string | null;
}

export interface DashboardStats {
  orders: OrderStats;
  revenue: RevenueStats;
  wallet: WalletStats;
  invoices: InvoiceStats;
}

export interface OrderStats {
  total: number;
  delivered: number;
  inTransit: number;
  pending: number;
  cancelled: number;
  rto: number;
  thisMonth: number;
  thisWeek: number;
  deliveryRate: string;
}

export interface RevenueStats {
  thisMonth: number;
  lastMonth: number;
  growth: number;
  totalDelivered: number;
}

export interface WalletStats {
  balance: number;
  lastTransaction: Transaction | null;
}

export interface InvoiceStats {
  total: number;
  unpaid: number;
  overdue: number;
  paid: number;
  totalUnpaidAmount: number;
}

export interface RecentActivity {
  orders: RecentOrder[];
  transactions: Transaction[];
  invoices: RecentInvoice[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentType: 'PREPAID' | 'COD';
  invoiceAmount: number;
  createdAt: string;
  trackingNumber: string | null;
  shipment: {
    id: string;
    awb: string;
    status: string;
  } | null;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  closingBalance: number;
  createdAt: string;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
}
