import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import profilePhoto from "@/assets/profile.png";
import { CUTE, EASE, HERO, SPRING, t } from "@/config/motion";
import { useRichMotion } from "@/lib/hooks";
import { useIntroReady } from "@/lib/intro";
import SplitText from "@/components/SplitText";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import { DoodleHeart, DoodleStar, ScribbleCircle, SparkleCluster, WavyUnderline } from "@/components/Doodles";
import LightBlob from "./LightBlob";
import TiltPhoto from "./TiltPhoto";
import FloatingCards from "./FloatingCards";
import Twinkles from "./Twinkles";

/** HERO — “a workspace coming to life” */
export default function Hero() {
  const play = useIntroReady();
  const rich = useRichMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // cursor, normalized (-0.5 … 0.5) for parallax, and in px for the light blob
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const snx = useSpring(nx, SPRING.soft);
  const sny = useSpring(ny, SPRING.soft);
  const spx = useSpring(px, SPRING.soft);
  const spy = useSpring(py, SPRING.soft);
  // the photo drifts gently against the chips for depth
  const photoX = useTransform(snx, (v) => v * -10);
  const photoY = useTransform(sny, (v) => v * -10);

  // park the light behind the photo until the mouse moves
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const park = () => {
      px.jump(el.clientWidth * (window.innerWidth >= 768 ? 0.7 : 0.5));
      py.jump(el.clientHeight * 0.5);
      spx.jump(px.get());
      spy.jump(py.get());
    };
    park();
    window.addEventListener("resize", park);
    return () => window.removeEventListener("resize", park);
  }, [px, py, spx, spy]);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!rich || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x);
    py.set(y);
    nx.set(x / r.width - 0.5);
    ny.set(y / r.height - 0.5);
  };
  const onPointerLeave = () => {
    nx.set(0);
    ny.set(0);
  };

  const press = { scale: CUTE.pressScale, transition: CUTE.pressSpring };

  return (
    <section
      ref={sectionRef}
      id="about"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative min-h-screen bg-sunshine overflow-hidden flex flex-col justify-center"
    >
      <LightBlob px={spx} py={spy} nx={snx} interactive={rich} />
      <Twinkles play={play} />

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-24 grid md:grid-cols-2 gap-12 items-center w-full">
        {/* Left: text */}
        <div>
          <div className="relative inline-block mb-8">
            <Reveal trigger="mount" play={play} delay={HERO.at.badge} y={16} className="inline-flex items-center gap-2 border border-ink/20 bg-cream/50 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-ink animate-dot-glow" />
              <span className="text-body text-xs tracking-widest uppercase font-medium">Available for hire</span>
            </Reveal>
            <ScribbleCircle play={play} delay={HERO.doodles.scribble} className="absolute -left-3 -top-2.5 w-[calc(100%+24px)] h-[calc(100%+20px)] stroke-ink/60" />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-ink leading-[1.05] mb-6">
            <span className="block mb-2">
              <span className="relative inline-block">
                <SplitText text="Regine" play={play} delay={HERO.at.first} stagger={HERO.letterStagger} duration={HERO.letterDuration} />
                <DoodleStar play={play} delay={HERO.doodles.star} className="absolute -right-8 md:-right-10 top-1 w-5 h-5 md:w-7 md:h-7 stroke-ink/70" fillClassName="fill-highlight" />
              </span>
            </span>
            <span className="block name-italic italic text-body">
              <span className="relative inline-block">
                <SplitText text="Paclibar" play={play} delay={HERO.at.last} stagger={HERO.letterStagger} duration={HERO.letterDuration} />
                <WavyUnderline play={play} delay={HERO.doodles.underline} className="absolute left-[2%] -bottom-[0.12em] w-[96%] h-[0.22em] stroke-apricot" />
              </span>
            </span>
          </h1>

          <Reveal trigger="mount" play={play} delay={HERO.at.tagline} y={16} className="flex items-center gap-3 mb-6">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={play ? { scaleX: 1 } : undefined}
              transition={{ duration: HERO.blockDuration, delay: HERO.at.tagline + t(0.1), ease: EASE }}
              className="h-px w-10 bg-ink/40 origin-left"
            />
            <p className="text-body text-sm tracking-widest uppercase font-medium">Virtual Assistant · Social Media Manager</p>
          </Reveal>

          <Reveal as="p" trigger="mount" play={play} delay={HERO.at.paragraph} className="text-body text-base leading-relaxed max-w-md mb-10">
            Hi! I'm Regine — a creative Virtual Assistant and Social Media Manager who brings both structure and artistry to every project. From managing your inbox to crafting stunning graphics, I keep businesses looking polished and running smoothly.
          </Reveal>

          {/* fixed 16px gap; magnetic travel is capped at 7px so buttons can never meet */}
          <Reveal trigger="mount" play={play} delay={HERO.at.buttons} className="flex flex-col sm:flex-row gap-4">
            <Magnetic>
              <motion.a
                href="#contact"
                whileTap={press}
                className="group w-full inline-flex items-center justify-center gap-2 bg-ink text-cream text-sm font-semibold px-7 py-3.5 rounded-full shadow-warm hover:bg-ink-deep transition-colors duration-200"
              >
                Let's Work Together
                <svg className="wiggle-x w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </motion.a>
            </Magnetic>
            <Magnetic>
              <motion.a
                href="#portfolio"
                whileTap={press}
                className="w-full inline-flex items-center justify-center gap-2 border border-ink/30 bg-cream/40 text-ink text-sm font-medium px-7 py-3.5 rounded-full hover:border-ink hover:bg-highlight transition-colors duration-200"
              >
                View My Work
              </motion.a>
            </Magnetic>
          </Reveal>
        </div>

        {/* Right: the workspace */}
        <div className="flex justify-center md:justify-end">
          <motion.div style={{ x: photoX, y: photoY }}>
            <TiltPhoto src={profilePhoto} alt="Regine Paclibar" play={play}>
              <SparkleCluster play={play} delay={HERO.doodles.sparkles} className="absolute -top-14 right-2 md:-right-4 w-12 h-12 md:w-14 md:h-14 stroke-ink/70" />
              <DoodleHeart play={play} delay={HERO.doodles.heart} className="absolute -bottom-12 right-10 w-7 h-7 stroke-ink/70" fillClassName="fill-blush" />
              <FloatingCards play={play} mx={snx} my={sny} />

              {/* sticker badge — springs in tilted, floats, wiggles on hover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 8, rotate: 8 }}
                animate={play ? { opacity: 1, scale: 1, y: 0, rotate: HERO.stickerRotate } : undefined}
                transition={{ ...SPRING.pop, delay: HERO.at.signature }}
                className="absolute -bottom-5 -left-5 z-10"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: HERO.at.signature + 0.6 }}
                >
                  <motion.div
                    whileHover={{ rotate: [0, -6, 5, -3, 2, 0], scale: 1.06 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="bg-ink text-cream text-xs font-semibold px-4 py-2 rounded-full border-[3px] border-cream shadow-warm-lg"
                  >
                    ✦ Creative & Reliable
                  </motion.div>
                </motion.div>
              </motion.div>
            </TiltPhoto>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 1 } : undefined}
        transition={{ duration: t(1), delay: HERO.at.scrollCue, ease: EASE }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-body"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-ink/60 to-transparent animate-scroll-line" />
      </motion.div>
    </section>
  );
}
