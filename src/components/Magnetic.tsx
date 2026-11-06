import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { MAGNETIC } from "@/config/motion";
import { useRichMotion } from "@/lib/hooks";

type Props = {
  children: ReactNode;
  /** 0–1: how much of the cursor offset the element follows */
  strength?: number;
  /** maximum travel in px (clamped on both axes) */
  max?: number;
  /** px beyond the element's bounds where the pull begins */
  radius?: number;
  className?: string;
};

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));

/**
 * Gently pulls its child toward the cursor (desktop only).
 * Transform-only and hard-capped at `max` px, so it can never change layout
 * or push the element into a neighbour. Springs back when the cursor leaves.
 */
export default function Magnetic({ children, strength = MAGNETIC.strength, max = MAGNETIC.max, radius = MAGNETIC.radius, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useRichMotion();
  const x = useSpring(useMotionValue(0), MAGNETIC.spring);
  const y = useSpring(useMotionValue(0), MAGNETIC.spring);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const reset = () => {
      x.set(0);
      y.set(0);
    };
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        // the outer wrapper never moves, so its rect is a stable reference
        const r = el.getBoundingClientRect();
        const inside =
          e.clientX > r.left - radius && e.clientX < r.right + radius && e.clientY > r.top - radius && e.clientY < r.bottom + radius;
        if (!inside) return reset();
        x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength, max));
        y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength, max));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(frame);
      reset();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [enabled, max, radius, strength, x, y]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x, y }} className="flex">
        {children}
      </motion.div>
    </div>
  );
}
