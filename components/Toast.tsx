'use client';
//components/Toast.tsx
import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([]);

    const showToast = (props: ToastProps) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { ...props, id }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, props.duration || 5000);
    };

    return { toasts, showToast };
}

export function ToastContainer({ toasts }: { toasts: Array<ToastProps & { id: number }> }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
}

function Toast({ message, type = 'info' }: ToastProps) {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-orange-500',
        info: 'bg-blue-500',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div
            className={`${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}
        >
            <span className="text-xl">{icons[type]}</span>
            <p className="flex-1">{message}</p>
        </div>
    );
}
