/**
 * Premium scroll animation variants for SubTracker.
 * Tuned for modern SaaS feel — smooth, deliberate, never jarring.
 * 
 * Design principles:
 * - Use spring physics for organic feel (no linear/mechanical motion)
 * - Longer durations (0.6-0.8s) for drama, shorter (0.3s) only for micro-interactions
 * - Subtle blur transitions for depth perception
 * - GPU-friendly: only animate transform + opacity
 */

// ── Premium easing curve (Apple-style ease-out) ──────────────
const premiumEase = [0.16, 1, 0.3, 1];

// ── Spring configs ───────────────────────────────────────────
export const springSmooth = { type: 'spring', stiffness: 50, damping: 20, mass: 0.8 };
export const springSnappy = { type: 'spring', stiffness: 120, damping: 22, mass: 0.6 };

// ── Section header reveal ────────────────────────────────────
export const sectionHeader = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: premiumEase }
  }
};

// ── Stagger container (parent wraps children) ────────────────
export const staggerContainer = (stagger = 0.12, delayChildren = 0.15) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren }
  }
});

// ── Card reveal (child of stagger container) ─────────────────
export const cardReveal = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.97,
    filter: 'blur(4px)'
  },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.6, ease: premiumEase }
  }
};

// ── Scale up entrance (CTA, hero elements) ───────────────────
export const scaleUp = {
  hidden: { opacity: 0, y: 20, scale: 0.94 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: premiumEase }
  }
};

// ── Step reveal (HowItWorks) ─────────────────────────────────
export const stepReveal = {
  hidden: { opacity: 0, y: 32, scale: 0.96, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.65, ease: premiumEase }
  }
};

// ── Horizontal wipe (connector lines) ────────────────────────
export const horizontalWipe = (delay = 0.4) => ({
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, delay, ease: premiumEase }
  }
});

// ── Viewport defaults (reusable props) ───────────────────────
export const viewportOnce = { once: true, margin: '-80px' };
export const viewportEarly = { once: true, margin: '-40px' };
