'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { showToast } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/format';

// Interface matching backend NdrReport model
interface NDR {
    id: string;
    orderId: string;
    reason: string; // NdrReason enum value
    reasonText: string | null;
    attemptCount: number;
    lastUpdated: string;
    resolution: 'PENDING' | 'RESCHEDULE' | 'RETURN_TO_ORIGIN' | 'DELIVER_TO_CUSTOMER' | 'ATTEMPT_RETRY' | 'CANCELLED';
    resolutionNote: string | null;
    rescheduleDate: string | null;
    resolvedAt: string | null;
    createdAt: string;
    order: {
        id: string;
        orderNumber: string;
        deliveryAddress: {
            name: string;
            city: string;
            pincode: string;
        };
        status: string;
    };
}

export default function NDRPage() {
    const queryClient = useQueryClient();
    const [selectedNDR, setSelectedNDR] = useState<NDR | null>(null);
    const [resolution, setResolution] = useState<'REATTEMPT' | 'RESCHEDULE' | 'RTO' | 'ADDRESS_UPDATE'>('REATTEMPT');
    const [rescheduleDate, setRescheduleDate] = useState('');

    // Fetch NDRs
    const { data: response, isLoading, error } = useQuery({
        queryKey: ['ndrs'],
        queryFn: async () => {
            const res = await api.get('/ndr/ndrs');
            return res.data;
        },
        refetchInterval: 60000, // Refetch every minute
    });

    const ndrs: NDR[] = response?.data || [];

    // Resolve NDR mutation
    const resolveMutation = useMutation({
        mutationFn: async ({ id, resolution, reschedule_date }: { id: string; resolution: string; reschedule_date?: string }) => {
            const res = await api.patch(`/ndr/ndrs/${id}/resolve`, {
                resolution,
                reschedule_date,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ndrs'] });
            showToast('NDR resolved successfully!', 'success');
            setSelectedNDR(null);
            setRescheduleDate('');
        },
        onError: (err: any) => {
            showToast(err.response?.data?.error?.message || 'Failed to resolve NDR', 'error');
        },
    });

    const handleResolve = () => {
        if (!selectedNDR) return;

        if (resolution === 'RESCHEDULE' && !rescheduleDate) {
            showToast('Please select a reschedule date', 'warning');
            return;
        }

        resolveMutation.mutate({
            id: selectedNDR.id,
            resolution,
            reschedule_date: resolution === 'RESCHEDULE' ? rescheduleDate : undefined,
        });
    };

    const getResolutionBadge = (resolution: string | null) => {
        if (!resolution) return null;
        
        const colors: Record<string, string> = {
            REATTEMPT: 'bg-blue-100 text-blue-800',
            RESCHEDULE: 'bg-yellow-100 text-yellow-800',
            RTO: 'bg-red-100 text-red-800',
            ADDRESS_UPDATE: 'bg-purple-100 text-purple-800',
        };

        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[resolution] || 'bg-gray-100 text-gray-800'}`}>
                {resolution.replace('_', ' ')}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    // ✅ Error State
    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-red-700 dark:text-red-400 font-semibold mb-2">
                            Failed to load NDRs
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {(error as any)?.response?.data?.error?.message || 'Please try refreshing the page'}
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const pendingNDRs = ndrs.filter(ndr => ndr.resolution === 'PENDING');
    const resolvedNDRs = ndrs.filter(ndr => ndr.resolution !== 'PENDING');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NDR Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Non-Delivery Reports - Manage failed delivery attempts
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total NDRs</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{ndrs.length}</div>
                </Card>
                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pending Action</div>
                    <div className="text-2xl font-bold text-orange-600">{pendingNDRs.length}</div>
                </Card>
                <Card>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
                    <div className="text-2xl font-bold text-green-600">{resolvedNDRs.length}</div>
                </Card>
            </div>

            {/* Resolution Modal */}
            {selectedNDR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resolve NDR</h2>
                            <button
                                onClick={() => setSelectedNDR(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800 rounded">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Order</p>
                            <p className="font-semibold dark:text-white">{selectedNDR.order.orderNumber}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Customer</p>
                            <p className="dark:text-gray-200">{selectedNDR.order.deliveryAddress.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Reason</p>
                            <p className="text-red-600 dark:text-red-400">{selectedNDR.reason}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Resolution *
                                </label>
                                <select
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value as any)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="REATTEMPT">Reattempt Delivery</option>
                                    <option value="RESCHEDULE">Reschedule Delivery</option>
                                    <option value="ADDRESS_UPDATE">Update Address</option>
                                    <option value="RTO">Return to Origin</option>
                                </select>
                            </div>

                            {resolution === 'RESCHEDULE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reschedule Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {resolution === 'RTO' && (
                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                    <p className="text-sm text-red-800">
                                        ⚠️ This will initiate a return to origin. The shipment will be sent back to your pickup address.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleResolve}
                                    disabled={resolveMutation.isPending}
                                >
                                    {resolveMutation.isPending ? 'Processing...' : 'Confirm Resolution'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setSelectedNDR(null)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Pending NDRs */}
            {pendingNDRs.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Pending NDRs</h2>
                    <div className="space-y-4">
                        {pendingNDRs.map((ndr) => (
                            <Card key={ndr.id} className="border-l-4 border-orange-500">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {ndr.order.orderNumber}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ndr.resolution)}`}>
                                                {ndr.resolution}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Customer:</span>
                                                <span className="ml-2 text-gray-900">{ndr.order.deliveryAddress.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Location:</span>
                                                <span className="ml-2 text-gray-900">
                                                    {ndr.order.deliveryAddress.city}, {ndr.order.deliveryAddress.pincode}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Reported:</span>
                                                <span className="ml-2 text-gray-900">{formatDate(ndr.createdAt)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Attempts:</span>
                                                <span className="ml-2 text-gray-900">{ndr.attemptCount}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 p-3 bg-red-50 rounded">
                                            <p className="text-sm font-medium text-red-900">Reason:</p>
                                            <p className="text-sm text-red-800">{ndr.reason}</p>
                                        </div>
                                    </div>

                                    <div className="ml-6 flex flex-col gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => setSelectedNDR(ndr)}
                                        >
                                            Resolve
                                        </Button>
                                        {/* Quick actions */}
                                        <button
                                            onClick={() => {
                                                setSelectedNDR(ndr);
                                                setResolution('REATTEMPT');
                                            }}
                                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors"
                                        >
                                            🔄 Reattempt
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedNDR(ndr);
                                                setResolution('RTO');
                                            }}
                                            className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
                                        >
                                            ↩️ RTO
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Resolved NDRs */}
            {resolvedNDRs.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Resolved NDRs</h2>
                    <div className="space-y-4">
                        {resolvedNDRs.map((ndr) => (
                            <Card key={ndr.id} className="bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {ndr.order.orderNumber}
                                            </h3>
                                            {ndr.resolution && getResolutionBadge(ndr.resolution)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Customer:</span>
                                                <span className="ml-2 text-gray-900">{ndr.order.deliveryAddress.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Resolved:</span>
                                                <span className="ml-2 text-gray-900">
                                                    {ndr.resolvedAt ? formatDate(ndr.resolvedAt) : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-2">
                                            Original Reason: {ndr.reason}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {ndrs.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No NDRs</h3>
                        <p className="text-gray-600">All deliveries are going smoothly!</p>
                    </div>
                </Card>
            )}
        </div>
    );
}
