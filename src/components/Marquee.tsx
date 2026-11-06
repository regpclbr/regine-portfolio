import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { MARQUEE } from "@/config/motion";

type Props = {
  children: ReactNode;
  /** px/s at rest (defaults to MARQUEE.speed) */
  speed?: number;
  /** 1 = moves left, -1 = moves right */
  direction?: 1 | -1;
  /** skew with scroll velocity */
  skew?: boolean;
  /** ease to a stop while hovered */
  pauseOnHover?: boolean;
  className?: string;
  label?: string;
};

/**
 * Infinite marquee. Speeds up with scroll velocity and flips direction when the
 * page scrolls up. Transform-only. Static (no motion) for reduced-motion users.
 */
export default function Marquee({ children, speed = MARQUEE.speed, direction = 1, skew = false, pauseOnHover = true, className = "", label }: Props) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);
  const x = useMotionValue(0);
  const hovered = useRef(false);
  const currentSpeed = useRef(speed);
  const dir = useRef<number>(direction);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 300 });
  const skewX = useTransform(smoothVelocity, [-2000, 0, 2000], [MARQUEE.maxSkew, 0, -MARQUEE.maxSkew], { clamp: true });

  // measure one copy of the content
  useEffect(() => {
    const el = trackRef.current?.firstElementChild as HTMLElement | null;
    if (!el) return;
    const ro = new ResizeObserver(() => setCopyWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || !copyWidth) return;
    const v = smoothVelocity.get();
    if (v < -5) dir.current = -direction;
    else if (v > 5) dir.current = direction;
    const boost = Math.min(MARQUEE.maxBoost, 1 + Math.abs(v) * MARQUEE.velocityFactor);
    const target = pauseOnHover && hovered.current ? 0 : speed * boost;
    currentSpeed.current += (target - currentSpeed.current) * MARQUEE.smoothing;
    let next = x.get() - dir.current * currentSpeed.current * (delta / 1000);
    // wrap within one copy width
    if (next <= -copyWidth) next += copyWidth;
    if (next > 0) next -= copyWidth;
    x.set(next);
  });

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
      role={label ? "marquee" : undefined}
      aria-label={label}
    >
      <motion.div ref={trackRef} className="flex w-max" style={{ x, skewX: skew && !reduced ? skewX : 0 }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
