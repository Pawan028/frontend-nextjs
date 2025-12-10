// components/ui/Card.tsx
import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-lg shadow p-4', className)}>
      {children}
    </div>
  );
}
