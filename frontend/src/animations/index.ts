import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

export const cardVariant: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.12, ease: 'easeIn' }
  }
};

export const continuousFloat: Variants = {
  animate: {
    y: [-3, 3, -3],
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const continuousPulseGlow: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.85, 1, 0.85],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

