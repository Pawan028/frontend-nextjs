'use client';

import confetti from 'canvas-confetti';

// Basic confetti burst
export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Celebration with multiple bursts
export function fireCelebration() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

// Success confetti (green/blue themed)
export function fireSuccessConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#22c55e', '#10b981', '#3b82f6'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#22c55e', '#10b981', '#3b82f6'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#22c55e', '#10b981', '#3b82f6'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#22c55e', '#10b981', '#3b82f6'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#22c55e', '#10b981', '#3b82f6'],
  });
}

// Fireworks effect
export function fireFireworks() {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fireworks from bottom
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.2, 0.8), y: 1 },
      colors: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
    });
  }, 400);
}

// First order celebration (special!)
export function fireFirstOrderCelebration() {
  // Fire success confetti first
  fireSuccessConfetti();
  
  // Then fire stars
  setTimeout(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'] as confetti.Shape[],
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
    };

    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.5 },
    });

    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      origin: { x: 0.5, y: 0.5 },
    });
  }, 500);
}
