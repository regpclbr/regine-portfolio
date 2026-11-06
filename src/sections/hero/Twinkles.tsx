import { motion } from "motion/react";
import { EASE, t } from "@/config/motion";

type Kind = "sparkle" | "star" | "dot";

/**
 * Tiny decorations that twinkle at different timings.
 * Positions are picked to sit in empty space (never over the text column);
 * the ones near the middle only appear on md+ where the layout is two columns.
 */
const ITEMS: { kind: Kind; className: string; size: number; dur: number; delay: number }[] = [
  { kind: "star", className: "top-[13%] right-[9%]", size: 14, dur: 3.4, delay: 0 },
  { kind: "dot", className: "top-[10%] right-[34%] md:right-[44%]", size: 7, dur: 2.8, delay: 0.9 },
  { kind: "sparkle", className: "hidden md:block top-[20%] left-[48%]", size: 16, dur: 3.8, delay: 0.4 },
  { kind: "dot", className: "hidden md:block top-[34%] right-[3%]", size: 9, dur: 3.1, delay: 1.6 },
  { kind: "sparkle", className: "hidden md:block bottom-[13%] right-[16%]", size: 13, dur: 3.5, delay: 2.1 },
  { kind: "dot", className: "hidden md:block bottom-[24%] left-[47%]", size: 6, dur: 2.6, delay: 1.2 },
  { kind: "star", className: "hidden md:block bottom-[9%] left-[7%]", size: 12, dur: 4.1, delay: 0.7 },
  { kind: "dot", className: "hidden lg:block top-[62%] left-[50%]", size: 8, dur: 3.6, delay: 2.5 },
];

function Shape({ kind, size }: { kind: Kind; size: number }) {
  if (kind === "dot") {
    return <span className="block rounded-full bg-butter ring-1 ring-cream" style={{ width: size, height: size }} />;
  }
  if (kind === "star") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className="fill-apricot">
        <path d="M12 2.5 L14.8 8.8 L21.6 9.4 L16.4 13.9 L18 20.6 L12 17 L6 20.6 L7.6 13.9 L2.4 9.4 L9.2 8.8 Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="fill-ink/45">
      <path d="M12 1 C 12.8 8.5, 15.5 11.2, 23 12 C 15.5 12.8, 12.8 15.5, 12 23 C 11.2 15.5, 8.5 12.8, 1 12 C 8.5 11.2, 11.2 8.5, 12 1 Z" />
    </svg>
  );
}

export default function Twinkles({ play }: { play: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {ITEMS.map((it, i) => (
        <motion.div
          key={i}
          className={`absolute ${it.className}`}
          initial={{ opacity: 0 }}
          animate={play ? { opacity: 1 } : undefined}
          transition={{ duration: t(0.8), delay: t(1.4) + i * 0.12, ease: EASE }}
        >
          <span className="block animate-twinkle" style={{ animationDuration: `${it.dur}s`, animationDelay: `${it.delay}s` }}>
            <Shape kind={it.kind} size={it.size} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}
