import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, TOOLS } from "@/config/motion";
import type { Tool } from "@/data/tools";
import ToolLogo from "./ToolLogo";

export type ChipVariant = "normal" | "favorite" | "tiny";

type Props = {
  tool: Tool;
  variant: ChipVariant;
  /** resting tilt in degrees */
  rotate: number;
  /** position in the visible list (pop-in stagger) */
  index: number;
  /** section is in view → pop in */
  show: boolean;
  /** lift / straighten on hover (off with reduced motion) */
  rich: boolean;
  /** precise hovering pointer → speech bubble; otherwise a tap opens the bottom sheet */
  finePointer: boolean;
  /** which side of the chip the speech bubble appears on */
  tipPlacement?: "top" | "bottom";
  /** animate position changes (tab switches) */
  layout?: boolean;
  onOpen: (tool: Tool, opener: HTMLElement) => void;
};

const TIP_W = 210; // px

/** 5 skill dots */
export function Level({ level, light = false }: { level: number; light?: boolean }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= level ? (light ? "bg-highlight" : "bg-ink/75") : light ? "bg-cream/25" : "bg-ink/15"}`} />
      ))}
    </span>
  );
}

const SIZE: Record<ChipVariant, string> = {
  normal: "h-(--chip-h) md:h-(--chip-h-md) w-full md:w-auto",
  favorite: "h-(--fav-h) md:h-(--fav-h-md) w-full md:w-auto",
  tiny: "size-(--tiny) md:size-(--tiny-md)",
};

/** Small cream sticker chip: logo + name (logo only when `tiny`). */
export default function ToolChip({ tool, variant, rotate, index, show, rich, finePointer, tipPlacement = "top", layout = true, onOpen }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [entered, setEntered] = useState(false);
  const [align, setAlign] = useState<"center" | "start" | "end">("center");

  const tip = (hovered || focused) && !dismissed;
  const tiny = variant === "tiny";
  const tipId = `tool-desc-${variant}-${tool.id}`;
  const delay = entered ? 0 : Math.min(index * TOOLS.enter.stagger, TOOLS.enter.maxDelay);

  // keep the bubble inside the viewport near the edges
  const measure = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const mid = r.left + r.width / 2;
    setAlign(mid - TIP_W / 2 < 8 ? "start" : mid + TIP_W / 2 > window.innerWidth - 8 ? "end" : "center");
  };

  const variants = {
    hidden: { opacity: 0, y: TOOLS.enter.y, scale: TOOLS.enter.scale, rotate },
    shown: { opacity: 1, y: 0, scale: 1, rotate, transition: { ...TOOLS.enter.spring, delay, opacity: { duration: 0.25, delay } } },
    lift: { opacity: 1, y: TOOLS.hover.y, scale: TOOLS.hover.scale, rotate: 0, transition: TOOLS.hover.spring },
  };

  return (
    <motion.div
      layout={layout ? "position" : false}
      variants={variants}
      initial="hidden"
      animate={!show ? "hidden" : tip && rich ? "lift" : "shown"}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: TOOLS.exit } }}
      transition={{ layout: TOOLS.layoutSpring }}
      onAnimationComplete={(def) => def === "shown" && setEntered(true)}
      style={{ zIndex: tip ? 30 : 1 }}
      className={`relative ${SIZE[variant]}`}
    >
      <motion.button
        ref={ref}
        type="button"
        aria-label={tiny ? tool.name : undefined}
        aria-describedby={tipId}
        aria-haspopup={finePointer ? undefined : "dialog"}
        whileTap={rich ? { scale: 0.96 } : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          measure();
          setDismissed(false);
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={(e) => {
          // keyboard focus shows the bubble; a tap (touch focus) doesn't
          if (!e.currentTarget.matches(":focus-visible")) return;
          measure();
          setDismissed(false);
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === "Escape" && tip && setDismissed(true)}
        onClick={(e) => !finePointer && onOpen(tool, e.currentTarget)}
        className={`flex h-full w-full items-center rounded-2xl bg-cream border border-white/80 sticker-shadow outline-none focus-visible:ring-4 focus-visible:ring-ink/30 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-cream)_70%,var(--color-highlight))] ${
          tiny ? "justify-center" : variant === "favorite" ? "gap-2 px-2 md:gap-2.5 md:px-3.5" : "gap-2 px-2 md:gap-2.5 md:px-3"
        }`}
      >
        <span
          className={`grid place-items-center shrink-0 ${tiny ? "" : variant === "favorite" ? "size-8 md:size-10 rounded-xl" : "size-7 md:size-8 rounded-xl"}`}
          style={tiny ? undefined : { background: `color-mix(in srgb, ${tool.brandColor} 12%, var(--color-cream))` }}
        >
          <ToolLogo tool={tool} size={variant === "favorite" ? 24 : 21} />
        </span>
        {!tiny && (
          <span className={`min-w-0 text-left font-semibold text-ink leading-tight line-clamp-2 md:line-clamp-none md:whitespace-nowrap ${variant === "favorite" ? "text-xs md:text-sm" : "text-[11px] md:text-[13px]"}`}>
            {tool.name}
          </span>
        )}
      </motion.button>

      {/* text for screen readers (outside the button so it isn't part of its name) */}
      <span id={tipId} className="sr-only">
        {tool.category}. {tool.usedFor}. Skill level {tool.level} of 5{tool.optional ? ". Optional" : ""}.
      </span>

      {/* speech bubble */}
      <AnimatePresence>
        {tip && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, y: tipPlacement === "top" ? 6 : -6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: TOOLS.tooltip, ease: EASE }}
            style={{ width: TIP_W, marginLeft: align === "center" ? -TIP_W / 2 : undefined }}
            className={`pointer-events-none absolute z-40 ${tipPlacement === "top" ? "bottom-full mb-3 origin-bottom" : "top-full mt-3 origin-top"} ${
              align === "center" ? "left-1/2" : align === "start" ? "left-0" : "right-0"
            }`}
          >
            <span className="relative block rounded-2xl bg-ink px-3 py-2.5 text-left text-cream shadow-warm-lg">
              {tiny && <span className="block text-xs font-semibold mb-1">{tool.name}</span>}
              <span className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-highlight">{tool.category}</span>
                <Level level={tool.level} light />
              </span>
              <span className="block text-[11px] leading-snug text-cream/90">
                {tool.usedFor}
                {tool.optional && <span className="text-cream/60"> (optional)</span>}
              </span>
              <span
                className={`absolute w-3 h-3 rotate-45 rounded-[2px] bg-ink ${tipPlacement === "top" ? "top-full -mt-1.5" : "bottom-full -mb-1.5"} ${
                  align === "center" ? "left-1/2 -ml-1.5" : align === "start" ? "left-4" : "right-4"
                }`}
              />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
