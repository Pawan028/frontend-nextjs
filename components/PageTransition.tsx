'use client';
// components/PageTransition.tsx
/**
 * Page Transition Wrapper
 * Provides smooth fade/slide animations for page transitions
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Fade up animation - default for most pages
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade only - for modals and overlays
export function FadeIn({ children, className = '', delay = 0 }: PageTransitionProps & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.2, 
        delay,
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide from right - for sidebars and panels
export function SlideIn({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale up - for cards and popups
export function ScaleIn({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.2, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation - for lists
export function StaggerContainer({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated button wrapper
export function AnimatedButton({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Card hover animation
export function AnimatedCard({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
