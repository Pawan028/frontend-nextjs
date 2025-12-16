// components/ui/Card.tsx
import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700/30 p-4', className)}>
      {children}
    </div>
  );
}
