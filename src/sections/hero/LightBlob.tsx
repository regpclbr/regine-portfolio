import { motion, useTransform, type MotionValue } from "motion/react";

type Props = {
  /** springed cursor position in px, relative to the hero */
  px: MotionValue<number>;
  py: MotionValue<number>;
  /** springed normalized cursor x (-0.5 … 0.5) */
  nx: MotionValue<number>;
  /** true when following the mouse; false = slow ambient drift (touch / reduced motion) */
  interactive: boolean;
};

const SIZE = 720;

/**
 * A soft creamy light source that follows the cursor, plus a warm apricot glow behind
 * the photo whose intensity shifts as the light moves across the hero.
 * Colors come from the theme tokens in index.css.
 */
export default function LightBlob({ px, py, nx, interactive }: Props) {
  const x = useTransform(px, (v) => v - SIZE / 2);
  const y = useTransform(py, (v) => v - SIZE / 2);
  const warm = useTransform(nx, [-0.5, 0.5], [0.3, 0.75]);
  const cool = useTransform(nx, [-0.5, 0.5], [0.8, 0.35]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* warm apricot glow anchored behind the photo */}
      <motion.div
        style={{ opacity: warm, background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-apricot) 55%, transparent), transparent 72%)" }}
        className="absolute top-1/2 right-[-10%] md:right-[2%] w-[560px] h-[560px] -translate-y-1/2 rounded-full"
      />
      {/* buttery highlight on the text side */}
      <motion.div
        style={{ opacity: cool, background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-highlight) 90%, transparent), transparent 72%)" }}
        className="absolute top-[30%] left-[-15%] w-[520px] h-[520px] rounded-full"
      />
      {/* the light source */}
      <motion.div
        style={{
          width: SIZE,
          height: SIZE,
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--color-cream) 95%, transparent), color-mix(in srgb, var(--color-cream) 35%, transparent) 45%, transparent 72%)",
          ...(interactive ? { x, y } : {}),
        }}
        className={`absolute rounded-full mix-blend-soft-light ${interactive ? "top-0 left-0" : "top-[5%] left-[20%] md:left-[40%] animate-blob-drift"}`}
      />
    </div>
  );
}
