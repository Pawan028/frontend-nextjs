'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: 'orders' | 'wallet' | 'invoices' | 'ndr' | 'pickup' | 'tracking';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const icons = {
  orders: (
    <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box */}
      <motion.rect 
        x="25" y="35" width="70" height="55" rx="8" 
        fill="#EEF2FF" stroke="#6366F1" strokeWidth="2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path 
        d="M25 50H95" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      {/* Box flaps */}
      <motion.path 
        d="M25 35L40 20H80L95 35" 
        fill="#C7D2FE" stroke="#6366F1" strokeWidth="2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      {/* Plus sign */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6, type: 'spring', stiffness: 200 }}
      >
        <circle cx="85" cy="75" r="15" fill="#3B82F6" />
        <path d="M85 68V82M78 75H92" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  ),
  wallet: (
    <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wallet body */}
      <motion.rect 
        x="20" y="35" width="80" height="55" rx="8" 
        fill="#ECFDF5" stroke="#10B981" strokeWidth="2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Wallet flap */}
      <motion.path 
        d="M20 50C20 46.6863 22.6863 44 26 44H70L75 35H26C22.6863 35 20 37.6863 20 41V50Z" 
        fill="#A7F3D0"
        initial={{ rotateX: 90 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />
      {/* Card slot */}
      <motion.rect 
        x="70" y="55" width="25" height="18" rx="4" 
        fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
      {/* Coin animation */}
      <motion.g
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7, type: 'spring', bounce: 0.5 }}
      >
        <circle cx="45" cy="62" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" />
        <text x="45" y="67" textAnchor="middle" fontSize="12" fill="#92400E" fontWeight="bold">₹</text>
      </motion.g>
    </svg>
  ),
  invoices: (
    <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Paper stack */}
      <motion.rect 
        x="35" y="25" width="55" height="75" rx="4" 
        fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      <motion.rect 
        x="30" y="22" width="55" height="75" rx="4" 
        fill="#F9FAFB" stroke="#9CA3AF" strokeWidth="1.5"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
      <motion.rect 
        x="25" y="19" width="55" height="75" rx="4" 
        fill="white" stroke="#6366F1" strokeWidth="2"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />
      {/* Lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <rect x="32" y="32" width="30" height="4" rx="2" fill="#E5E7EB" />
        <rect x="32" y="42" width="40" height="3" rx="1.5" fill="#F3F4F6" />
        <rect x="32" y="50" width="35" height="3" rx="1.5" fill="#F3F4F6" />
        <rect x="32" y="58" width="38" height="3" rx="1.5" fill="#F3F4F6" />
        <rect x="32" y="72" width="20" height="8" rx="2" fill="#DBEAFE" />
      </motion.g>
      {/* Checkmark */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.7, type: 'spring', stiffness: 200 }}
      >
        <circle cx="85" cy="80" r="15" fill="#10B981" />
        <path d="M78 80L83 85L93 75" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  ),
  ndr: (
    <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Package */}
      <motion.rect 
        x="30" y="40" width="50" height="45" rx="6" 
        fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.path 
        d="M30 55H80" stroke="#F59E0B" strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      {/* Return arrow */}
      <motion.g
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <path d="M90 50C95 50 100 55 100 62C100 69 95 74 88 74H75" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <path d="M80 68L74 74L80 80" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      {/* Exclamation */}
      <motion.g
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, delay: 0.7, type: 'spring' }}
      >
        <circle cx="55" cy="68" r="12" fill="#EF4444" />
        <path d="M55 60V68M55 73V74" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  ),
  pickup: (
    <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Truck */}
      <motion.rect 
        x="15" y="50" width="55" height="35" rx="4" 
        fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path 
        d="M70 60H90C93 60 95 62 96 65L100 75V85H70V60Z" 
        fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      {/* Window */}
      <motion.rect 
        x="75" y="63" width="15" height="10" rx="2" 
        fill="#60A5FA"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      />
      {/* Wheels */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <circle cx="35" cy="85" r="8" fill="#1F2937" />
        <circle cx="35" cy="85" r="4" fill="#6B7280" />
        <circle cx="85" cy="85" r="8" fill="#1F2937" />
        <circle cx="85" cy="85" r="4" fill="#6B7280" />
      </motion.g>
      {/* Clock */}
      <motion.g
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, delay: 0.8, type: 'spring' }}
      >
        <circle cx="95" cy="40" r="15" fill="white" stroke="#3B82F6" strokeWidth="2" />
        <path d="M95 32V40L100 45" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  ),
  tracking: (
    <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Map background */}
      <motion.rect 
        x="15" y="20" width="90" height="80" rx="8" 
        fill="#F0FDF4" stroke="#22C55E" strokeWidth="2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      {/* Route line */}
      <motion.path 
        d="M30 80C40 70 50 75 60 60C70 45 80 50 90 40" 
        stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      {/* Start point */}
      <motion.circle 
        cx="30" cy="80" r="6" 
        fill="#22C55E"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
      {/* End marker */}
      <motion.g
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8, type: 'spring', bounce: 0.4 }}
      >
        <path d="M90 25C83 25 78 30 78 37C78 48 90 55 90 55C90 55 102 48 102 37C102 30 97 25 90 25Z" fill="#EF4444" />
        <circle cx="90" cy="36" r="5" fill="white" />
      </motion.g>
    </svg>
  ),
};

export default function EmptyState({
  icon = 'orders',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div 
      className="text-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center mb-6">
        {icons[icon]}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          {actionHref ? (
            <Link 
              href={actionHref}
              className="inline-flex items-center gap-2 btn-gradient px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {actionLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ) : (
            <button 
              onClick={onAction}
              className="inline-flex items-center gap-2 btn-gradient px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {actionLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
