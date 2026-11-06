import type { ReactNode } from "react";
import { motion } from "motion/react";
import { EASE, t } from "@/config/motion";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  /**
   * "mount": animate when `play` becomes true (e.g. after the preloader)
   * "view":  animate when scrolled into view (once)
   */
  trigger?: "mount" | "view";
  play?: boolean;
  className?: string;
  as?: "div" | "p" | "span" | "li" | "section";
};

/** Fade + slide-up reveal used across the site. */
export default function Reveal({ children, delay = 0, y = 24, duration = t(0.8), trigger = "view", play = true, className, as = "div" }: Props) {
  const Tag = motion[as];
  const hidden = { opacity: 0, y };
  const shown = { opacity: 1, y: 0 };
  const transition = { duration, delay, ease: EASE };

  if (trigger === "mount") {
    return (
      <Tag className={className} initial={hidden} animate={play ? shown : hidden} transition={transition}>
        {children}
      </Tag>
    );
  }
  return (
    <Tag className={className} initial={hidden} whileInView={shown} viewport={{ once: true, amount: 0.2 }} transition={transition}>
      {children}
    </Tag>
  );
}
