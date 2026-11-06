import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { scrollLock } from "@/lib/scrollLock";

type SmoothScrollModule = typeof import("@/lib/smoothScroll");

/**
 * Mounts Lenis (skipped for reduced motion). GSAP + Lenis are lazy-loaded so they
 * stay off the critical path. Scrolling is locked while `paused` (preloader) or while
 * any component holds a scrollLock (e.g. the project detail view).
 */
export default function SmoothScroll({ paused = false }: { paused?: boolean }) {
  const reduced = useReducedMotion();
  const mod = useRef<SmoothScrollModule | null>(null);
  const [locked, setLocked] = useState(scrollLock.isLocked());
  const stop = paused || locked;
  const stopRef = useRef(stop);
  stopRef.current = stop;

  useEffect(() => scrollLock.subscribe(setLocked), []);

  useEffect(() => {
    if (reduced) return;
    let alive = true;
    import("@/lib/smoothScroll").then((m) => {
      if (!alive) return;
      mod.current = m;
      const lenis = m.initSmoothScroll();
      if (stopRef.current) lenis.stop();
    });
    return () => {
      alive = false;
      mod.current?.destroySmoothScroll();
      mod.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", stop);
    const lenis = mod.current?.getLenis();
    if (stop) lenis?.stop();
    else lenis?.start();
  }, [stop]);

  return null;
}
