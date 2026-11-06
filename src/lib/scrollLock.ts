/**
 * Tiny scroll-lock registry (no GSAP/Lenis import, so any component can use it).
 * SmoothScroll subscribes and pauses Lenis while at least one lock is held.
 */
type Listener = (locked: boolean) => void;

let count = 0;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l(count > 0));

export const scrollLock = {
  lock() {
    count++;
    emit();
  },
  unlock() {
    count = Math.max(0, count - 1);
    emit();
  },
  isLocked: () => count > 0,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
