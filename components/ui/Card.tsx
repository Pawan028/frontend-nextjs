// components/ui/Card.tsx
import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glass-strong' | 'premium' | 'glow';
  compact?: boolean;
  hover?: boolean;
}

export default function Card({ 
  children, 
  className, 
  variant = 'default',
  compact = false,
  hover = false 
}: CardProps) {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700',
    glass: 'glass-light border border-white/20 dark:border-slate-700/50',
    'glass-strong': 'glass-strong border border-white/30 dark:border-slate-700/70',
    premium: 'bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 shadow-premium',
    glow: 'bg-white dark:bg-slate-800 border-glow-strong shadow-glow dark:shadow-glow-lg',
  };

  const paddingStyle = compact ? 'p-4' : 'p-6';
  const hoverStyle = hover ? 'card-glow-hover' : '';

  return (
    <div 
      className={clsx(
        'rounded-xl transition-all duration-300',
        variantStyles[variant],
        paddingStyle,
        hoverStyle,
        className
      )}
    >
      {children}
    </div>
  );
}
