'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function TopupModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState<number | null>(null);

  useEffect(() => {
    const handleShowTopup = (event: Event) => {
      const customEvent = event as CustomEvent;
      setRequiredAmount(customEvent.detail?.requiredAmount);
      setIsOpen(true);
    };

    window.addEventListener('show-topup-modal', handleShowTopup);
    return () => window.removeEventListener('show-topup-modal', handleShowTopup);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-4">💰 Wallet Top-up Required</h2>
        
        <p className="text-gray-600 mb-4">
          Your wallet balance is insufficient for this transaction.
        </p>

        {requiredAmount && (
          <p className="text-lg font-semibold mb-6">
            Minimum Required: <span className="text-green-600">Rs.{requiredAmount.toFixed(2)}</span>
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/wallet');
            }}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Go to Wallet Top-up
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
