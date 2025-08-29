import type { Transition } from "framer-motion";

export const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const spring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.6,
};
