import { motion } from "motion/react";
import { EASE_IN_OUT, HERO } from "@/config/motion";

type DoodleProps = {
  play: boolean;
  delay?: number;
  duration?: number;
  className?: string;
};

type BaseProps = DoodleProps & {
  paths: string[];
  viewBox: string;
  strokeWidth?: number;
  /** stretch to the container (uses non-scaling strokes) */
  stretch?: boolean;
  /** optional fill that fades in once the stroke is drawn */
  fillClassName?: string;
};

/** Hand-drawn SVG that draws itself in (stroke-dashoffset via pathLength). */
function Doodle({ play, delay = 0, duration = HERO.doodles.draw, className = "", paths, viewBox, strokeWidth = 1.6, stretch, fillClassName }: BaseProps) {
  const step = duration / paths.length;
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={stretch ? "none" : undefined}
      className={`pointer-events-none overflow-visible ${className}`}
      fill="none"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect={stretch ? "non-scaling-stroke" : undefined}
          className={fillClassName}
          style={{ fillOpacity: 0 }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={play ? { pathLength: 1, opacity: 1, fillOpacity: fillClassName ? 1 : 0 } : undefined}
          transition={{
            pathLength: { duration: step, delay: delay + i * step, ease: EASE_IN_OUT },
            opacity: { duration: 0.1, delay: delay + i * step },
            fillOpacity: { duration: 0.5, delay: delay + duration },
          }}
        />
      ))}
    </svg>
  );
}

/** Loose scribbled loop — wrap it around a pill (stretches to its container). */
export function ScribbleCircle(props: DoodleProps) {
  return (
    <Doodle
      {...props}
      stretch
      viewBox="0 0 200 60"
      strokeWidth={1.4}
      paths={["M34 9 C 80 1, 162 3, 189 19 C 205 33, 172 54, 100 56 C 40 58, 3 47, 7 30 C 11 15, 52 6, 98 6 C 126 5, 152 9, 170 16"]}
    />
  );
}

/** Wavy underline (stretches to its container's width). */
export function WavyUnderline(props: DoodleProps) {
  return (
    <Doodle
      {...props}
      stretch
      viewBox="0 0 300 20"
      strokeWidth={2.4}
      paths={["M4 12 C 30 3, 50 3, 74 11 S 120 20, 146 11 S 194 3, 220 11 S 268 19, 296 8"]}
    />
  );
}

/** A little cluster of ✦ sparkles. */
export function SparkleCluster(props: DoodleProps) {
  return (
    <Doodle
      {...props}
      viewBox="0 0 60 60"
      strokeWidth={1.5}
      paths={[
        "M30 8 C31 20 34 23 46 24 C34 25 31 28 30 40 C29 28 26 25 14 24 C26 23 29 20 30 8 Z",
        "M50 38 C50.5 43 52 44.5 57 45 C52 45.5 50.5 47 50 52 C49.5 47 48 45.5 43 45 C48 44.5 49.5 43 50 38 Z",
        "M11 42 C11.3 45.5 12 46.3 15.5 46.6 C12 47 11.3 47.7 11 51.2 C10.7 47.7 10 47 6.5 46.6 C10 46.3 10.7 45.5 11 42 Z",
      ]}
    />
  );
}

/** Tiny heart: drawn outline, then a soft fill. */
export function DoodleHeart(props: DoodleProps & { fillClassName?: string }) {
  return (
    <Doodle
      {...props}
      viewBox="0 0 32 30"
      strokeWidth={1.5}
      paths={["M16 26.5 C 6 19.5, 2.5 14, 4 9 C 5.8 3.2, 12.8 3, 16 8.8 C 19.2 3, 26.2 3.2, 28 9 C 29.5 14, 26 19.5, 16 26.5 Z"]}
    />
  );
}

/** Small hand-drawn star. */
export function DoodleStar(props: DoodleProps & { fillClassName?: string }) {
  return (
    <Doodle
      {...props}
      viewBox="0 0 30 30"
      strokeWidth={1.5}
      paths={["M15 3.5 L18.4 11 L26.6 11.7 L20.4 17 L22.4 25.4 L15 21 L7.6 25.4 L9.6 17 L3.4 11.7 L11.6 11 Z"]}
    />
  );
}
