// components/ui/Skeleton.tsx
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-slate-700';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div 
      className={clsx(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
}

// Pre-built skeleton patterns
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <Skeleton height={100} />
      <div className="flex gap-2">
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={80} />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200 dark:border-slate-700">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={16} width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <Skeleton height={20} width={120} />
          <Skeleton height={14} width={80} />
        </div>
        <Skeleton height={24} width={80} className="rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton height={14} width="70%" />
        <Skeleton height={14} width="50%" />
      </div>
      <div className="flex gap-2">
        <Skeleton height={36} width={100} />
        <Skeleton height={36} width={100} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <Skeleton height={14} width="60%" className="mb-2" />
            <Skeleton height={32} width="40%" className="mb-1" />
            <Skeleton height={12} width="50%" />
          </div>
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <Skeleton height={20} width={150} className="mb-4" />
        <Skeleton height={200} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <Skeleton height={20} width={180} className="mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1">
                <Skeleton height={14} width="60%" className="mb-1" />
                <Skeleton height={12} width="40%" />
              </div>
              <Skeleton height={24} width={60} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <Skeleton height={18} width={100} />
        <Skeleton height={24} width={80} className="rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton height={14} width="80%" />
        <Skeleton height={14} width="60%" />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between">
        <Skeleton height={24} width={100} />
        <Skeleton height={32} width={120} />
      </div>
    </div>
  );
}
