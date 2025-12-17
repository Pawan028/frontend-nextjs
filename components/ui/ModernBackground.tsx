'use client';

/**
 * ModernBackground - Premium SaaS Background
 * Features: Animated gradient mesh, subtle floating shapes, glassmorphism-ready
 * More professional than particles, better than Shiprocket's plain gradients
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

export default function ModernBackground() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}
            />
        );
    }

    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Base Gradient */}
            <div
                className="absolute inset-0 transition-all duration-700"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)'
                }}
            />

            {/* Animated Gradient Orbs */}
            <div
                className="absolute top-0 -left-40 w-96 h-96 rounded-full opacity-30 blur-3xl animate-blob"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
                        : 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute top-1/3 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)'
                        : 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
                }}
            />
            <div
                className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl animate-blob animation-delay-4000"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #06b6d4 0%, transparent 70%)'
                        : 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)',
                }}
            />

            {/* Mesh Grid Pattern (subtle) */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`
                        : `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Radial Glow at Top */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-40"
                style={{
                    background: isDark
                        ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 100%)'
                        : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
                }}
            />

            {/* Noise Texture Overlay (subtle grain) */}
            <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
