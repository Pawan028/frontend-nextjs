'use client';

import ModernBackground from '../../components/ui/ModernBackground';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden font-sans">
            {/* Modern Gradient Background */}
            <ModernBackground />

            {/* Content Layer */}
            <div className="relative z-10 w-full min-h-screen">
                {children}
            </div>
        </div>
    );
}
