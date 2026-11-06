import { useRef, useState, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { EASE, HERO, SPRING, t } from "@/config/motion";
import { useRichMotion } from "@/lib/hooks";

type Props = {
  src: string;
  alt: string;
  play: boolean;
  /** things that float around the photo (chips, badge) — not tilted */
  children?: ReactNode;
};

const CLIP_HIDDEN = `inset(100% 0% 0% 0% round ${HERO.photoRadius}px)`;
const CLIP_SHOWN = `inset(0% 0% 0% 0% round ${HERO.photoRadius}px)`;

/**
 * Profile photo: wipes up on entry (clip-path), then on hover it “mats” itself
 * inside the frame (clip-path inset) and tilts in 3D toward the cursor.
 */
export default function TiltPhoto({ src, alt, play, children }: Props) {
  const rich = useRichMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [entered, setEntered] = useState(false);
  const rotateX = useSpring(0, SPRING.tilt);
  const rotateY = useSpring(0, SPRING.tilt);

  const onMove = (e: React.PointerEvent) => {
    if (!rich || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotateY.set(px * 2 * HERO.photoTilt);
    rotateX.set(-py * 2 * HERO.photoTilt);
  };
  const onLeave = () => {
    setHover(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  const matted = rich && hover && entered;
  const hoverT = { duration: t(0.7), ease: EASE };
  const entryT = { duration: HERO.photoReveal, delay: HERO.at.photo + t(0.1), ease: EASE };

  return (
    <div className="relative" style={{ perspective: 1100 }}>
      {/* offset outline frame — slides into place after the photo */}
      <motion.div
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={play ? { opacity: 1, x: 16, y: 16 } : undefined}
        transition={{ duration: t(0.9), delay: HERO.at.frame, ease: EASE }}
        className="absolute inset-0 rounded-[40px] border-2 border-butter bg-highlight/50 shadow-warm"
      />

      <motion.div
        ref={ref}
        onPointerEnter={() => setHover(true)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: t(1), delay: HERO.at.photo, ease: EASE }}
        className="relative w-72 h-80 md:w-80 md:h-96 rounded-[40px] bg-cream border-[3px] border-cream shadow-warm-lg"
      >
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ clipPath: CLIP_HIDDEN }}
          animate={play ? { clipPath: matted ? HERO.photoHoverInset : CLIP_SHOWN } : undefined}
          transition={entered ? hoverT : entryT}
          onAnimationComplete={() => play && setEntered(true)}
        >
          <motion.img
            src={src}
            alt={alt}
            draggable={false}
            initial={{ scale: 1.18 }}
            animate={play ? { scale: matted ? 1.07 : 1 } : undefined}
            transition={entered ? hoverT : entryT}
            className="w-full h-full object-cover select-none"
          />
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
}
