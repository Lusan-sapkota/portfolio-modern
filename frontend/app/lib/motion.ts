import type { Variants } from "framer-motion";

export const easeOutSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const swipeSection: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: easeOutSoft,
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const swipeGroup: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const swipeChild: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutSoft },
  },
};
