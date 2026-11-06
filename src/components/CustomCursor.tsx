import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { CURSOR, EASE, SPRING } from "@/config/motion";
import { useRichMotion } from "@/lib/hooks";

/**
 * Butter-yellow dot + a soft trailing ring (outline only, never a filled shape over text).
 *   links    → the dot becomes a little heart
 *   buttons  → the dot becomes a little sparkle
 * Opt elements into other states with data attributes:
 *   data-cursor="view" → “View” bubble   (portfolio items)
 *   data-cursor="drag" → “Drag” bubble   (galleries)
 *   data-cursor="hide" → hide the cursor
 */
type CursorState = "default" | "link" | "button" | "view" | "drag" | "hide";

const LABELS: Partial<Record<CursorState, string>> = { view: "View", drag: "Drag" };

export default function CustomCursor() {
  const enabled = useRichMotion();
  if (!enabled) return null;
  return <CursorInner />;
}

function CursorInner() {
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, CURSOR.dotSpring);
  const dotY = useSpring(y, CURSOR.dotSpring);
  const ringX = useSpring(x, CURSOR.ringSpring);
  const ringY = useSpring(y, CURSOR.ringSpring);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      const tagged = el?.closest<HTMLElement>("[data-cursor]");
      if (tagged) return setState((tagged.dataset.cursor as CursorState) ?? "default");
      if (el?.closest("button, [role='button'], summary, select")) return setState("button");
      if (el?.closest("a, label")) return setState("link");
      setState("default");
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [x, y]);

  const label = LABELS[state];
  const isLabel = Boolean(label);
  const isIcon = state === "link" || state === "button";
  const ringScale = state === "hide" ? 0 : isLabel ? CURSOR.labelScale : isIcon ? CURSOR.hoverRingScale : 1;
  const transition = { duration: CURSOR.stateDuration, ease: EASE };
  const half = (n: number) => -n / 2;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden="true">
      {/* soft ring — outline only, so it never covers text */}
      <motion.div
        className="absolute top-0 left-0 rounded-full border-[1.5px]"
        style={{ x: ringX, y: ringY, width: CURSOR.ringSize, height: CURSOR.ringSize, marginLeft: half(CURSOR.ringSize), marginTop: half(CURSOR.ringSize) }}
        animate={{
          scale: pressed ? ringScale * 0.85 : ringScale,
          opacity: visible ? (isIcon ? 0.55 : 1) : 0,
          borderColor: isLabel ? "rgba(74,64,54,0)" : "rgba(74,64,54,0.35)",
          backgroundColor: isLabel ? "rgba(74,64,54,0.92)" : "rgba(255,233,160,0)",
        }}
        transition={transition}
      />

      {/* View / Drag label (separate layer so the text isn't scaled) */}
      <motion.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }}>
        <AnimatePresence>
          {label && visible && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={transition}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold tracking-[0.2em] uppercase text-cream whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* dot / heart / sparkle */}
      <motion.div className="absolute top-0 left-0" style={{ x: dotX, y: dotY }}>
        <motion.div
          className="absolute rounded-full bg-butter border-[1.5px] border-ink/70"
          style={{ width: CURSOR.dotSize, height: CURSOR.dotSize, left: half(CURSOR.dotSize), top: half(CURSOR.dotSize) }}
          animate={{ scale: isIcon || isLabel || state === "hide" ? 0 : pressed ? 0.8 : 1, opacity: visible ? 1 : 0 }}
          transition={transition}
        />
        <AnimatePresence>
          {isIcon && visible && (
            <motion.svg
              key={state}
              viewBox="0 0 24 24"
              className="absolute overflow-visible"
              // sits just below-right of the hotspot (like a native cursor tail) so it never hides the text being pointed at
              style={{ width: CURSOR.iconSize, height: CURSOR.iconSize, left: 6, top: 6 }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: pressed ? 0.8 : 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 30 }}
              transition={SPRING.pop}
            >
              {state === "link" ? (
                <path
                  d="M12 21 C 4.5 15.5, 1.5 11, 3 7 C 4.5 2.8, 9.5 2.8, 12 7.2 C 14.5 2.8, 19.5 2.8, 21 7 C 22.5 11, 19.5 15.5, 12 21 Z"
                  className="fill-apricot stroke-ink"
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M12 2 C 12.8 8.5, 15.5 11.2, 22 12 C 15.5 12.8, 12.8 15.5, 12 22 C 11.2 15.5, 8.5 12.8, 2 12 C 8.5 11.2, 11.2 8.5, 12 2 Z"
                  className="fill-butter stroke-ink"
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                />
              )}
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
