'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { showToast } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

// ✅ FIXED: Interface matches Prisma response (camelCase)
interface Address {
    id: string;
    // Backend Enum is PICKUP | WAREHOUSE | BILLING | DELIVERY. 
    // We map UI "RETURN" -> Backend "WAREHOUSE"
    type: 'PICKUP' | 'WAREHOUSE' | 'BILLING' | 'DELIVERY';
    name: string;
    phone: string;
    addressLine1: string; // ✅ Changed from address_line1
    addressLine2?: string; // ✅ Changed from address_line2
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean; // ✅ Changed from is_default
}

interface AddressFormData {
    type: 'PICKUP' | 'WAREHOUSE' | 'BILLING';
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
}

const initialFormData: AddressFormData = {
    type: 'PICKUP',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
};

export default function AddressesPage() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState<AddressFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: response, isLoading, error: fetchError } = useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const res = await api.get('/merchant/addresses');
            return res.data;
        },
        retry: (failureCount, error: any) => {
            // Retry up to 2 times for USER_SYNC_PENDING errors (rare with JIT provisioning)
            const errorCode = error?.response?.data?.error?.code;
            if (errorCode === 'USER_SYNC_PENDING') {
                return failureCount < 2;
            }
            // Retry once for network errors
            if (!error?.response) {
                return failureCount < 1;
            }
            return false;
        },
        retryDelay: (attemptIndex) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * 2 ** attemptIndex, 16000);
        },
    });

    const addresses: Address[] = response?.data || [];

    const createMutation = useMutation({
        mutationFn: async (data: AddressFormData) => {
            // ✅ Map data back to snake_case if your API Controller specifically demands it.
            // If your API uses standard Prisma create, it might want camelCase or snake_case depending on your validation layer.
            // Assuming your backend expects the same shape as it returns for consistency, or we assume snake_case payload:
            const payload = {
                type: data.type,
                name: data.name,
                phone: data.phone,
                address_line1: data.addressLine1, // Backend Zod likely expects snake_case input
                address_line2: data.addressLine2,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                country: data.country,
                is_default: data.isDefault,
            };
            const res = await api.post('/merchant/addresses', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            showToast('Address added successfully!', 'success');
            closeForm();
        },
        onError: (err: any) => {
            showToast(err.response?.data?.error?.message || 'Failed to add address', 'error');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: AddressFormData }) => {
             const payload = {
                type: data.type,
                name: data.name,
                phone: data.phone,
                address_line1: data.addressLine1,
                address_line2: data.addressLine2,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                country: data.country,
                is_default: data.isDefault,
            };
            const res = await api.put(`/merchant/addresses/${id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            showToast('Address updated successfully!', 'success');
            closeForm();
        },
        onError: (err: any) => {
            showToast(err.response?.data?.error?.message || 'Failed to update address', 'error');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/merchant/addresses/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            showToast('Address deleted successfully!', 'success');
        },
        onError: (err: any) => {
            showToast(err.response?.data?.error?.message || 'Failed to delete address', 'error');
        },
    });

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone || !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be exactly 10 digits';
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        // ✅ FIXED: Backend pattern ^[1-9][0-9]{5}$ (first digit cannot be 0)
        if (!formData.pincode || !/^[1-9][0-9]{5}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits (cannot start with 0)';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (editingAddress) {
            updateMutation.mutate({ id: editingAddress.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const openEditForm = (address: Address) => {
        setEditingAddress(address);
        // ✅ FIXED: Correctly mapping camelCase backend response to form state
        setFormData({
            type: address.type as any,
            name: address.name,
            phone: address.phone,
            addressLine1: address.addressLine1, // camelCase here
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
            isDefault: address.isDefault,
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingAddress(null);
        setFormData(initialFormData);
        setErrors({});
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
         return <div className="p-8 text-center">Loading addresses...</div>;
    }

    // ✅ Error State
    if (fetchError) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-red-700 dark:text-red-400 font-semibold mb-2">
                            Failed to load addresses
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {(fetchError as any)?.response?.data?.error?.message || 'Please try refreshing the page'}
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Addresses</h1>
                    <p className="text-gray-600 mt-1">Manage your locations</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>+ Add Address</Button>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="PICKUP">Pickup Address</option>
                                    {/* ✅ FIXED: Map Return to Warehouse */}
                                    <option value="WAREHOUSE">Return Address (Warehouse)</option>
                                    <option value="BILLING">Billing Address</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Contact Name *" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} error={errors.name} />
                                <Input label="Phone *" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} error={errors.phone} maxLength={10} />
                            </div>

                            <Input label="Address Line 1 *" value={formData.addressLine1} onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))} error={errors.addressLine1} />
                            <Input label="Address Line 2" value={formData.addressLine2} onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))} />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="City *" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} error={errors.city} />
                                <Input label="State *" value={formData.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} error={errors.state} />
                                <div>
                                    <Input label="Pincode *" value={formData.pincode} onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} error={errors.pincode} maxLength={6} />
                                    {formData.pincode && !/^[1-9][0-9]{5}$/.test(formData.pincode) && (
                                        <p className="text-yellow-600 text-xs mt-1">Must be 6 digits (cannot start with 0)</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))} className="w-4 h-4" />
                                <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingAddress ? 'Update' : 'Add'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

             {addresses.length === 0 ? (
                <Card><div className="text-center py-12">No addresses yet. Add one above.</div></Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <Card key={address.id}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                        {/* ✅ Show UI-friendly label for WAREHOUSE */}
                                        {address.type === 'WAREHOUSE' ? 'RETURN' : address.type}
                                    </span>
                                    {address.isDefault && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">DEFAULT</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditForm(address)} className="text-blue-600 text-sm">Edit</button>
                                    <button onClick={() => handleDelete(address.id)} className="text-red-600 text-sm">Delete</button>
                                </div>
                            </div>
                            <p className="font-semibold">{address.name}</p>
                            <p className="text-sm text-gray-700">{address.addressLine1}</p>
                            {address.addressLine2 && <p className="text-sm text-gray-700">{address.addressLine2}</p>}
                            <p className="text-sm text-gray-700">{address.city}, {address.state} - {address.pincode}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
