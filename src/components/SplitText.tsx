import { motion } from "motion/react";
import { EASE, SPRING } from "@/config/motion";

type Props = {
  text: string;
  /** start the reveal */
  play: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  /** letters lift on hover */
  hoverLift?: boolean;
  className?: string;
  letterClassName?: string;
};

/**
 * Splits text into letters that rise one by one from behind a mask.
 * Screen readers get the whole word via a visually hidden copy.
 */
export default function SplitText({
  text,
  play,
  delay = 0,
  stagger = 0.04,
  duration = 0.9,
  hoverLift = true,
  className = "",
  letterClassName = "",
}: Props) {
  const chars = Array.from(text);
  return (
    <span className={`inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      {chars.map((char, i) =>
        char === " " ? (
          <span key={i} className="inline-block w-[0.28em]" aria-hidden="true" />
        ) : (
          // mask: extra vertical padding so hover lift and descenders aren't clipped
          <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pt-[0.18em] -mt-[0.18em] pb-[0.14em] -mb-[0.14em] px-[0.04em] -mx-[0.04em]">
            <motion.span
              className="inline-block will-change-transform"
              initial={{ y: "130%", rotate: 6, opacity: 0 }}
              animate={play ? { y: "0%", rotate: 0, opacity: 1 } : undefined}
              transition={{ duration, delay: delay + i * stagger, ease: EASE, opacity: { duration: duration * 0.5, delay: delay + i * stagger } }}
            >
              <motion.span
                className={`inline-block ${letterClassName}`}
                whileHover={hoverLift ? { y: "-0.12em", x: "0.03em", rotate: -4 } : undefined}
                transition={SPRING.letter}
              >
                {char}
              </motion.span>
            </motion.span>
          </span>
        ),
      )}
    </span>
  );
}
