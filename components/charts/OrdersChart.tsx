'use client';
// components/charts/OrdersChart.tsx
/**
 * Orders Chart Component
 * Displays order trends over time using recharts
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OrdersChartProps {
  data?: Array<{
    date: string;
    orders: number;
    delivered: number;
  }>;
}

// Default sample data for demo
const defaultData = [
  { date: 'Mon', orders: 24, delivered: 22 },
  { date: 'Tue', orders: 35, delivered: 31 },
  { date: 'Wed', orders: 28, delivered: 26 },
  { date: 'Thu', orders: 42, delivered: 38 },
  { date: 'Fri', orders: 55, delivered: 50 },
  { date: 'Sat', orders: 38, delivered: 35 },
  { date: 'Sun', orders: 20, delivered: 18 },
];

export default function OrdersChart({ data = defaultData }: OrdersChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              padding: '12px 16px',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
            itemStyle={{ color: '#6B7280', fontSize: '14px' }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
            name="Total Orders"
          />
          <Area
            type="monotone"
            dataKey="delivered"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDelivered)"
            name="Delivered"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
