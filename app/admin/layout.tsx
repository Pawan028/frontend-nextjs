'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isInitialized } = useAuthStore();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isInitialized) return;

        if (!user || user.role !== 'ADMIN') {
            console.log('⛔ Access denied: Not an admin');
            router.push('/dashboard'); // or /auth
        } else {
            setIsAuthorized(true);
        }
    }, [user, isInitialized, router]);

    if (!isInitialized || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Navigation Header if needed, or rely on main Navbar */}
            {children}
        </div>
    );
}
