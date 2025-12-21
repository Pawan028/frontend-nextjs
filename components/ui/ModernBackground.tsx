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
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)`
                        : `linear-gradient(rgba(100,116,139,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(100,116,139,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Tech Circuit Pattern - NexusShip Style */}
            <svg className="absolute inset-0 opacity-[0.06]" style={{ mixBlendMode: 'screen' }}>
                <defs>
                    <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        {/* Horizontal lines */}
                        <line 
                            x1="0" y1="50" x2="100" y2="50" 
                            stroke={isDark ? 'rgba(59,130,246,0.3)' : 'rgba(100,116,139,0.2)'} 
                            strokeWidth="0.5"
                        />
                        {/* Vertical lines */}
                        <line 
                            x1="50" y1="0" x2="50" y2="100" 
                            stroke={isDark ? 'rgba(99,102,241,0.3)' : 'rgba(100,116,139,0.2)'} 
                            strokeWidth="0.5"
                        />
                        {/* Connection nodes */}
                        <circle 
                            cx="50" cy="50" r="2" 
                            fill={isDark ? 'rgba(59,130,246,0.5)' : 'rgba(100,116,139,0.3)'}
                        />
                        {/* Corner nodes for detail */}
                        <circle 
                            cx="0" cy="0" r="1.5" 
                            fill={isDark ? 'rgba(99,102,241,0.4)' : 'rgba(100,116,139,0.25)'}
                        />
                        <circle 
                            cx="100" cy="0" r="1.5" 
                            fill={isDark ? 'rgba(99,102,241,0.4)' : 'rgba(100,116,139,0.25)'}
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circuit)"/>
            </svg>

            {/* Animated Glow Lines - NexusShip Tech Aesthetic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute top-1/4 left-0 w-full h-px animate-slide"
                    style={{
                        background: isDark
                            ? 'linear-gradient(to right, transparent, rgba(6,182,212,0.4) 50%, transparent)'
                            : 'linear-gradient(to right, transparent, rgba(59,130,246,0.3) 50%, transparent)'
                    }}
                />
                <div 
                    className="absolute top-2/3 left-0 w-full h-px animate-slide-reverse"
                    style={{
                        background: isDark
                            ? 'linear-gradient(to right, transparent, rgba(59,130,246,0.4) 50%, transparent)'
                            : 'linear-gradient(to right, transparent, rgba(99,102,241,0.3) 50%, transparent)'
                    }}
                />
                <div 
                    className="absolute top-1/2 left-0 w-full h-px opacity-60"
                    style={{
                        background: isDark
                            ? 'linear-gradient(to right, transparent, rgba(139,92,246,0.3) 50%, transparent)'
                            : 'linear-gradient(to right, transparent, rgba(100,116,139,0.2) 50%, transparent)',
                        animation: 'slide 15s linear infinite'
                    }}
                />
            </div>

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
