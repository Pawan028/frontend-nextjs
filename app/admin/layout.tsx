'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMerchant } from '../../hooks/useMerchant';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isLoading } = useMerchant();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user || user.role !== 'ADMIN') {
            console.log('⛔ Access denied: Not an admin');
            router.push('/dashboard');
        } else {
            setIsAuthorized(true);
        }
    }, [user, isLoading, router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
