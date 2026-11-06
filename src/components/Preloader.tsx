import { useEffect, useRef } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { EASE, EASE_IN_OUT, PRELOADER, SPRING } from "@/config/motion";

/** Single-stroke handwritten “rp” — drawn with stroke-dashoffset (motion's pathLength). */
const MONOGRAM_PATH =
  "M10 64 C17 57 22 47 26 38 C25 47 23 56 22 64 C24 54 28 44 33 40 C37 37 43 37 48 38 C46 56 44 74 41 92 C43 76 46 57 50 45 C56 35 73 35 72 48 C71 61 56 65 48 57 C58 61 70 61 79 54";

type Props = {
  /** curtain starts lifting — hero may begin animating */
  onReveal: () => void;
  /** preloader finished and can unmount */
  onDone: () => void;
};

export default function Preloader({ onReveal, onDone }: Props) {
  const [scope, animate] = useAnimate();
  const reduced = useReducedMotion();
  const callbacks = useRef({ onReveal, onDone });
  callbacks.current = { onReveal, onDone };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (reduced) {
        await animate(scope.current, { opacity: [1, 0] }, { duration: PRELOADER.reducedFade, delay: 0.2 });
        callbacks.current.onReveal();
        callbacks.current.onDone();
        return;
      }
      // 1. handwriting
      await animate("[data-stroke]", { pathLength: [0, 1], opacity: [0, 1] }, { duration: PRELOADER.draw, ease: EASE_IN_OUT, opacity: { duration: 0.15 } });
      if (cancelled) return;
      // 2. the dot pops + caption
      animate("[data-caption]", { opacity: [0, 1], y: [6, 0] }, { duration: 0.6, ease: EASE });
      await animate("[data-dot]", { scale: [0, 1], opacity: [0, 1] }, { ...SPRING.pop, delay: PRELOADER.dotDelay });
      await new Promise((r) => setTimeout(r, PRELOADER.hold * 1000));
      if (cancelled) return;
      // 3. curtains lift
      const lift = { duration: PRELOADER.curtain, ease: EASE_IN_OUT };
      animate("[data-mark]", { y: -60, opacity: 0 }, { duration: PRELOADER.curtain * 0.6, ease: EASE });
      animate("[data-curtain='front']", { y: "-125%" }, lift);
      const back = animate("[data-curtain='back']", { y: "-125%" }, { ...lift, delay: PRELOADER.curtainLag });
      setTimeout(() => !cancelled && callbacks.current.onReveal(), PRELOADER.heroCue * 1000);
      await back;
      if (!cancelled) callbacks.current.onDone();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [animate, reduced, scope]);

  return (
    <div ref={scope} className="fixed inset-0 z-[100] pointer-events-auto" aria-hidden="true">
      {/* back curtain (cream) trails slightly behind */}
      <div data-curtain="back" className="absolute inset-0 bg-cream">
        <div className="absolute top-full -left-[10%] w-[120%] h-[18vh] bg-cream rounded-b-[50%]" />
      </div>
      {/* front curtain (warm butter) with a soft curved lip */}
      <div data-curtain="front" className="absolute inset-0 bg-butter">
        <div className="absolute top-full -left-[10%] w-[120%] h-[18vh] bg-butter rounded-b-[50%]" />
        <div data-mark className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <svg viewBox="0 0 100 100" className="w-40 h-40 md:w-48 md:h-48 overflow-visible" fill="none">
            <motion.path
              data-stroke
              d={MONOGRAM_PATH}
              stroke="var(--color-ink)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
            />
            <motion.circle data-dot cx={88} cy={62} r={3.8} fill="var(--color-cream)" initial={{ scale: 0, opacity: 0 }} style={{ transformOrigin: "88px 62px" }} />
          </svg>
          <motion.p data-caption initial={{ opacity: 0 }} className="font-serif italic text-ink/80 text-sm tracking-[0.3em] uppercase">
            Regine Paclibar
          </motion.p>
        </div>
      </div>
    </div>
  );
}
