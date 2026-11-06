import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useTransform, type MotionValue } from "motion/react";
import { CUTE, EASE, HERO, SPRING, t } from "@/config/motion";

type Pointer = { mx: MotionValue<number>; my: MotionValue<number> };

const chipDelay = (i: number) => HERO.at.chips + i * HERO.chipStagger;

/** Count a number into a text node without re-rendering React. */
function useCountTo(play: boolean, from: number, to: number, delay: number, duration: number, format: (v: number) => string) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!play || !ref.current) return;
    const node = ref.current;
    const controls = animate(from, to, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (v) => (node.textContent = format(v)),
    });
    return () => controls.stop();
    // runs once when `play` flips; the numeric args are static per chip
  }, [play]);
  return ref;
}

function Chip({ index, play, mx, my, className, children }: Pointer & { index: number; play: boolean; className: string; children: ReactNode }) {
  const depth = HERO.chipDepth[index] ?? 24;
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  const delay = chipDelay(index);

  return (
    <motion.div style={{ x, y }} className={`absolute z-10 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.4, y: 14 }}
        animate={play ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ ...SPRING.pop, delay, opacity: { duration: t(0.25), delay } }}
      >
        {/* hover bounce lives on its own layer so it never inherits the entrance delay */}
        <motion.div whileHover={CUTE.chipHover} transition={SPRING.pop}>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: HERO.chipFloat[index] ?? 5, repeat: Infinity, ease: "easeInOut", delay: index * 0.7 }}
            className="glass-chip flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 sm:pr-4 text-[11px] sm:text-xs font-medium text-ink whitespace-nowrap"
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const iconWrap = "grid place-items-center w-6 h-6 rounded-full bg-highlight text-ink shrink-0";

/** Small glassmorphism UI cards that tell the VA / social-media story around the photo. */
export default function FloatingCards({ play, mx, my }: Pointer & { play: boolean }) {
  const inbox = useCountTo(play, 9, 0, chipDelay(3) + t(0.4), t(1.6), (v) => String(Math.round(v)));
  const likes = useCountTo(play, 0, 2.4, chipDelay(2) + t(0.3), t(1.8), (v) => `${v.toFixed(1)}k`);

  return (
    <>
      {/* 1 — message answered */}
      <Chip index={0} play={play} mx={mx} my={my} className="-top-6 -left-4 sm:-left-12 lg:-left-20">
        <span className={iconWrap}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </span>
        <span>New message</span>
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={play ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: t(0.5), delay: chipDelay(0) + t(0.9), ease: EASE }}
          className="text-body"
        >
          ✓ replied
        </motion.span>
      </Chip>

      {/* 2 — post scheduled */}
      <Chip index={1} play={play} mx={mx} my={my} className="top-[60%] -right-7 sm:top-[16%] sm:-right-10 lg:-right-16">
        <span className={iconWrap}>📅</span>
        <span>Post scheduled · 9:00 AM</span>
      </Chip>

      {/* 3 — engagement */}
      <Chip index={2} play={play} mx={mx} my={my} className="top-[24%] -right-6 sm:top-auto sm:bottom-[20%] sm:-right-6 lg:-right-12">
        <motion.span
          className="grid place-items-center w-6 h-6 rounded-full bg-blush/70 text-ink text-sm leading-none"
          animate={play ? { scale: [1, 1, 1.4, 1] } : undefined}
          transition={{ duration: t(0.6), delay: chipDelay(2) + t(2.1), times: [0, 0.01, 0.4, 1] }}
        >
          ♥
        </motion.span>
        <span>
          <span ref={likes} className="tabular-nums">0.0k</span> likes
        </span>
      </Chip>

      {/* 4 — inbox zero */}
      <Chip index={3} play={play} mx={mx} my={my} className="top-[44%] -left-6 sm:-left-14 lg:-left-24">
        <span className="grid place-items-center w-6 h-6 rounded-full bg-highlight"><span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-apricot animate-dot-glow" />
        </span></span>
        <span>
          Inbox: <span ref={inbox} className="tabular-nums">9</span>
        </span>
      </Chip>
    </>
  );
}
