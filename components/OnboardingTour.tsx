'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface TourStep {
  target?: string; // CSS selector for element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    href?: string;
  };
}

const tourSteps: TourStep[] = [
  {
    title: '👋 Welcome to ShipMVP!',
    description: 'Let\'s take a quick tour to help you get started with shipping.',
    position: 'center',
  },
  {
    title: '📦 Create Orders',
    description: 'Create shipping orders with automatic rate comparison across 10+ courier partners.',
    position: 'center',
    action: {
      label: 'Create Order',
      href: '/orders/create',
    },
  },
  {
    title: '💰 Wallet System',
    description: 'Add funds to your wallet for seamless prepaid shipping. Top up anytime!',
    position: 'center',
    action: {
      label: 'View Wallet',
      href: '/wallet',
    },
  },
  {
    title: '📊 Track Everything',
    description: 'Monitor all your shipments in real-time from a single dashboard.',
    position: 'center',
    action: {
      label: 'View Dashboard',
      href: '/dashboard',
    },
  },
  {
    title: '🚚 Schedule Pickups',
    description: 'Request pickups for your orders with just one click.',
    position: 'center',
    action: {
      label: 'View Pickups',
      href: '/orders/pickup',
    },
  },
  {
    title: '🎉 You\'re All Set!',
    description: 'Start shipping with the best rates. Create your first order now!',
    position: 'center',
    action: {
      label: 'Get Started',
      href: '/orders/create',
    },
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      // Delay showing tour to let page load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setIsOpen(false);
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setIsOpen(false);
    
    // Navigate to action if available
    const step = tourSteps[currentStep];
    if (step.action?.href) {
      router.push(step.action.href);
    }
  };

  const handleAction = () => {
    const step = tourSteps[currentStep];
    if (step.action?.href) {
      localStorage.setItem('hasSeenOnboardingTour', 'true');
      setIsOpen(false);
      router.push(step.action.href);
    }
  };

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Progress Bar */}
              <div className="h-1 bg-gray-200 dark:bg-slate-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Action Button (if available) */}
                  {step.action && (
                    <button
                      onClick={handleAction}
                      className="mb-4 px-6 py-3 btn-gradient text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      {step.action.label} →
                    </button>
                  )}
                </motion.div>

                {/* Step Indicators */}
                <div className="flex justify-center gap-2 mb-6">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-6 bg-blue-600'
                          : index < currentStep
                          ? 'bg-blue-400'
                          : 'bg-gray-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium"
                  >
                    Skip Tour
                  </button>

                  <div className="flex gap-3">
                    {currentStep > 0 && (
                      <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      {isLastStep ? 'Finish' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manually trigger tour
export function useTour() {
  const resetTour = () => {
    localStorage.removeItem('hasSeenOnboardingTour');
    window.location.reload();
  };

  return { resetTour };
}
