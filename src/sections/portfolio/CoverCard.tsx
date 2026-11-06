import { motion, useTransform, type MotionValue } from "motion/react";
import { COVERFLOW } from "@/config/motion";
import { coverOf, type Project } from "@/data/projects";

export type CardLayout = {
  width: number;
  mobile: boolean;
  reduced: boolean;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Pure coverflow math: card offset from center (in cards) → transform values. */
export function coverflowAt(o: number, { width, mobile, reduced }: CardLayout) {
  const a = Math.abs(o);
  const s = Math.sign(o);
  if (reduced) {
    // no 3D: a gentle slide + fade, only the active card is really visible
    return { x: o * width * 0.25, rotateY: 0, scale: 1 - Math.min(a, 1) * 0.05, z: 0, dim: 0, blur: 0, opacity: clamp01(1 - a * 1.2) };
  }
  const [s1, s2] = mobile ? COVERFLOW.spacingMobile : COVERFLOW.spacing;
  const [sc1, sc2] = COVERFLOW.scale;
  const visible = mobile ? COVERFLOW.visibleMobile : COVERFLOW.visible;
  return {
    x: s * (Math.min(a, 1) * s1 + Math.max(a - 1, 0) * s2) * width,
    rotateY: -s * Math.min(a, 1) * (mobile ? COVERFLOW.rotateMobile : COVERFLOW.rotate),
    scale: a <= 1 ? lerp(1, sc1, a) : a <= 2 ? lerp(sc1, sc2, a - 1) : Math.max(0.4, sc2 - (a - 2) * 0.08),
    z: -Math.min(a, 4) * COVERFLOW.depth,
    dim: (Math.min(a, 2) / 2) * COVERFLOW.dim,
    blur: (Math.min(a, 2) / 2) * COVERFLOW.blur,
    opacity: clamp01(1 - (a - (visible - 0.6)) / 0.6),
  };
}

type Props = {
  project: Project;
  index: number;
  /** carousel position (float, in cards) */
  pos: MotionValue<number>;
  /** 0 → 1 fan-out progress */
  entry: MotionValue<number>;
  /** springed mouse x, -0.5 … 0.5 */
  mx: MotionValue<number>;
  layout: CardLayout;
  isActive: boolean;
  /** only cards near the center take keyboard focus */
  tabbable: boolean;
  total: number;
  onSelect: (index: number) => void;
  onFocusCard: (index: number) => void;
};

export default function CoverCard({ project, index, pos, entry, mx, layout, isActive, tabbable, total, onSelect, onFocusCard }: Props) {
  const height = layout.width * COVERFLOW.aspect;
  const cover = coverOf(project);

  // offset from the center, scaled by the (per-card staggered) fan-out progress
  const offset = useTransform([pos, entry], ([p, e]: number[]) => {
    const raw = index - p;
    const delay = Math.min(Math.abs(raw), 3) * 0.08;
    const k = clamp01((e - delay) / (1 - 0.24));
    return raw * (1 - Math.pow(1 - k, 3));
  });
  const at = (key: keyof ReturnType<typeof coverflowAt>) => (o: number) => coverflowAt(o, layout)[key];

  const x = useTransform(offset, at("x"));
  const rotateY = useTransform(offset, at("rotateY"));
  const scale = useTransform(offset, at("scale"));
  const z = useTransform(offset, at("z"));
  const dim = useTransform(offset, at("dim"));
  const filter = useTransform(offset, (o) => {
    const b = coverflowAt(o, layout).blur;
    return b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none";
  });
  const opacity = useTransform([offset, entry], ([o, e]: number[]) => coverflowAt(o, layout).opacity * clamp01(e * 2.5));
  const zIndex = useTransform(offset, (o) => 100 - Math.round(Math.abs(o) * 10));
  const pointerEvents = useTransform(opacity, (v) => (v < 0.15 ? "none" : "auto"));
  const infoOpacity = useTransform(offset, (o) => clamp01(1 - Math.abs(o) * 1.6));
  const imageX = useTransform([mx, offset], ([m, o]: number[]) => m * COVERFLOW.imageShift * (1 - Math.min(Math.abs(o), 1)));

  const label = `${project.title} — ${project.subtitle}. Project ${index + 1} of ${total}.${isActive ? " Open details." : ""}`;

  return (
    <motion.div
      className="absolute top-0 left-1/2"
      style={{ width: layout.width, height, marginLeft: -layout.width / 2, x, z, rotateY, scale, opacity, zIndex, pointerEvents }}
    >
      <motion.button
        type="button"
        aria-label={label}
        aria-current={isActive ? "true" : undefined}
        tabIndex={tabbable ? 0 : -1}
        data-cursor={isActive ? "view" : undefined}
        onClick={() => onSelect(index)}
        onFocus={(e) => {
          // keyboard focus brings the card to the center (mouse clicks are handled by onClick)
          if (e.currentTarget.matches(":focus-visible")) onFocusCard(index);
        }}
        style={{ filter, borderRadius: COVERFLOW.radius }}
        className={`group relative block w-full h-full outline-none focus-visible:ring-4 focus-visible:ring-ink/40 ${isActive ? "cover-reflect" : ""}`}
      >
        <motion.div
          layoutId={isActive ? `project-media-${project.id}` : undefined}
          style={{ borderRadius: COVERFLOW.radius }}
          className="absolute inset-0 overflow-hidden border-2 border-cream/90 bg-peach shadow-warm-lg"
        >
          <motion.img
            src={cover.thumb}
            alt={cover.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{ x: imageX, scale: 1.08 }}
            className="absolute inset-0 w-full h-full object-cover select-none"
          />

          {/* warm-dark dim for side cards */}
          <motion.div className="absolute inset-0 bg-ink" style={{ opacity: dim }} />

          {project.isSample && (
            <span className="absolute top-3 right-3 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">Sample</span>
          )}

          {project.type === "video" && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid place-items-center w-14 h-14 rounded-full bg-cream/95 shadow-warm-lg transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5 fill-ink"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
              </span>
            </span>
          )}

          {/* title overlay (active card) */}
          <motion.div style={{ opacity: infoOpacity }} className="absolute inset-x-0 bottom-0 p-4 md:p-5 pt-24 text-left bg-gradient-to-t from-ink/90 via-ink/60 to-transparent">
            <span className="inline-block rounded-full bg-cream/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink mb-2">{project.category}</span>
            <p className="font-serif text-xl md:text-2xl leading-tight text-cream">{project.title}</p>
            <p className="mt-1 text-[11px] md:text-xs text-cream/85">{project.subtitle}</p>
            {project.type === "video" && (
              <span className="mt-3 flex items-center gap-2 text-[10px] tabular-nums text-cream/85">
                <span className="relative h-[3px] flex-1 rounded-full bg-cream/30 overflow-hidden">
                  <span className="absolute inset-y-0 left-0 w-[35%] rounded-full bg-cream" />
                </span>
                0:00 / {project.duration ?? "0:30"}
              </span>
            )}
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
