'use client';
//app/orders/[id]/page.tsx
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatCurrency, formatDate, getStatusColor } from '../../../utils/format';

interface TrackingEvent {
    id: string;
    event: string;
    location: string | null;
    remarks: string | null;
    timestamp: string;
}

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    paymentType: 'PREPAID' | 'COD';
    codAmount: number | null;
    invoiceAmount: number;
    weight: number;
    selectedCourier: string | null;
    trackingNumber: string | null;
    awb: string | null;
    labelUrl: string | null;
    invoiceUrl: string | null;
    expectedDelivery: string | null;
    createdAt: string;
    pickupAddress: {
        name: string;
        phone: string;
        address_line1: string;
        city: string;
        state: string;
        pincode: string;
    };
    deliveryAddress: {
        name: string;
        phone: string;
        address_line1: string;
        city: string;
        state: string;
        pincode: string;
    };
    shipment: {
        id: string;
        awb: string;
        courier: string;
        shipmentStatus: string;
        labelUrl: string | null;
    } | null;
    trackingEvents: TrackingEvent[];
}

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const res = await api.get(`/orders/${orderId}`);
            return res.data;
        },
    });

    const order: OrderDetail | undefined = response?.data;

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-64" />
                    <div className="h-64 bg-gray-200 rounded" />
                    <div className="h-48 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Card className="bg-red-50 border-red-200">
                    <div className="text-center py-8">
                        <p className="text-red-700 mb-4">Failed to load order details</p>
                        <Button onClick={() => router.back()} variant="secondary">
                            ← Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button onClick={() => router.back()} variant="secondary" size="sm">
                        ← Back to Orders
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 mt-3">{order.orderNumber}</h1>
                    <p className="text-gray-600 mt-1">Order Details & Tracking</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Summary */}
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Order Summary</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Order Number</p>
                                <p className="font-medium text-gray-900">{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Created On</p>
                                <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Payment Type</p>
                                <p className="font-medium text-gray-900">
                                    {order.paymentType}
                                    {order.paymentType === 'COD' && order.codAmount && (
                                        <span className="text-orange-600 ml-2">
                      ({formatCurrency(order.codAmount)})
                    </span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Invoice Amount</p>
                                <p className="font-medium text-gray-900">{formatCurrency(order.invoiceAmount)}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Weight</p>
                                <p className="font-medium text-gray-900">{order.weight}g</p>
                            </div>
                            {order.expectedDelivery && (
                                <div>
                                    <p className="text-gray-600">Expected Delivery</p>
                                    <p className="font-medium text-gray-900">{formatDate(order.expectedDelivery)}</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Shipment Info */}
                    {order.shipment && (
                        <Card>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">🚚 Shipment Information</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-gray-600">Courier</p>
                                    <p className="font-medium text-gray-900">{order.shipment.courier}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">AWB Number</p>
                                    <p className="font-medium text-gray-900 font-mono text-xs">{order.shipment.awb}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Shipment Status</p>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.shipment.shipmentStatus)}`}>
                    {order.shipment.shipmentStatus}
                  </span>
                                </div>
                                {order.trackingNumber && (
                                    <div>
                                        <p className="text-gray-600">Tracking Number</p>
                                        <p className="font-medium text-gray-900 font-mono text-xs">{order.trackingNumber}</p>
                                    </div>
                                )}
                            </div>

                            {/* Label Download */}
                            {order.shipment.labelUrl && (
                                <a
                                    href={order.shipment.labelUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    📄 Download Shipping Label
                                </a>
                            )}
                        </Card>
                    )}

                    {/* Tracking Events */}
                    <Card>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Tracking History</h2>
                        {order.trackingEvents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">📦</div>
                                <p>No tracking events available yet</p>
                                <p className="text-xs mt-1">Tracking will appear once the shipment is picked up</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {order.trackingEvents.map((event, index) => (
                                    <div key={event.id} className="flex gap-4">
                                        {/* Timeline */}
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    index === 0 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'
                                                }`}
                                            />
                                            {index < order.trackingEvents.length - 1 && (
                                                <div className="w-0.5 flex-1 bg-gray-300 my-1" style={{ minHeight: '40px' }} />
                                            )}
                                        </div>

                                        {/* Event Details */}
                                        <div className="flex-1 pb-4">
                                            <p className="font-medium text-gray-900">{event.event}</p>
                                            {event.location && (
                                                <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
                                            )}
                                            {event.remarks && (
                                                <p className="text-sm text-gray-500 italic mt-1">{event.remarks}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">{formatDate(event.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Addresses */}
                <div className="space-y-6">
                    {/* Pickup Address */}
                    <Card>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                            📦 PICKUP ADDRESS
                        </h3>
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-gray-900">{order.pickupAddress.name}</p>
                            <p className="text-gray-700">{order.pickupAddress.address_line1}</p>
                            <p className="text-gray-700">
                                {order.pickupAddress.city}, {order.pickupAddress.state}
                            </p>
                            <p className="text-gray-700">PIN: {order.pickupAddress.pincode}</p>
                            <p className="text-gray-700">📞 {order.pickupAddress.phone}</p>
                        </div>
                    </Card>

                    {/* Delivery Address */}
                    <Card>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                            📍 DELIVERY ADDRESS
                        </h3>
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-gray-900">{order.deliveryAddress.name}</p>
                            <p className="text-gray-700">{order.deliveryAddress.address_line1}</p>
                            <p className="text-gray-700">
                                {order.deliveryAddress.city}, {order.deliveryAddress.state}
                            </p>
                            <p className="text-gray-700">PIN: {order.deliveryAddress.pincode}</p>
                            <p className="text-gray-700">📞 {order.deliveryAddress.phone}</p>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <Card className="bg-blue-50 border-blue-200">
                        <div className="text-center">
                            <p className="text-sm text-blue-700 mb-3">Need Help?</p>
                            <Button variant="secondary" size="sm" className="w-full">
                                📞 Contact Support
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
