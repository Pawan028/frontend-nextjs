'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Settings page - redirects to addresses settings by default
 */
export default function SettingsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/settings/addresses');
    }, [router]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-64"></div>
            </div>
        </div>
    );
}
