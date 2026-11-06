import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { COVERFLOW, EASE, EASE_IN_OUT, SPRING } from "@/config/motion";
import { CATEGORIES, PROJECTS, coverOf } from "@/data/projects";
import { useFinePointer } from "@/lib/hooks";
import Reveal from "@/components/Reveal";
import { SparkleCluster } from "@/components/Doodles";
import CoverCard, { type CardLayout } from "./CoverCard";
import ProjectDetail from "./ProjectDetail";

type Filter = (typeof CATEGORIES)[number];

/** only filters that have projects (plus “All”); hidden entirely when there's a single category */
const FILTERS = CATEGORIES.filter((c) => c === "All" || PROJECTS.some((p) => p.category === c));
const SHOW_FILTERS = FILTERS.length > 2;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const startIndex = (n: number) => Math.max(0, Math.floor((n - 1) / 2));

/** Card size from the viewport (values in COVERFLOW.cardWidth). */
function readLayout(reduced: boolean): CardLayout {
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const { mobileVw, mobileMax, md, lg } = COVERFLOW.cardWidth;
  const mobile = vw < 768;
  return { width: mobile ? Math.min(vw * mobileVw, mobileMax) : vw < 1024 ? md : lg, mobile, reduced };
}

function useCardLayout(reduced: boolean): CardLayout {
  const [layout, setLayout] = useState(() => readLayout(reduced));
  useEffect(() => {
    const onResize = () => setLayout(readLayout(reduced));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [reduced]);
  return layout;
}

/** Section heading (shared by the carousel and the empty state). */
function PortfolioHeading() {
  return (
    <Reveal className="mb-10 text-center">
      <p className="text-honey text-xs tracking-widest uppercase font-semibold mb-3">My Creative Work</p>
      <h2 className="font-serif text-4xl md:text-6xl text-ink leading-tight mb-4">Portfolio</h2>
      <p className="text-ink text-lg font-medium max-w-md mx-auto leading-snug">"Turning brands into visuals people remember."</p>
      <p className="text-body text-sm max-w-sm mx-auto leading-relaxed mt-3">
        Social media graphics, branding, and creative support for growing businesses — see my work below.
      </p>
    </Reveal>
  );
}

/** No projects yet → a cute “coming soon” card instead of the carousel. */
function ComingSoon() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <section id="portfolio" className="relative py-24 overflow-hidden bg-sunshine">
      <div className="relative max-w-6xl mx-auto px-6">
        <PortfolioHeading />
        <Reveal delay={0.08} className="mx-auto max-w-md">
          <div ref={ref} className="relative rounded-[2rem] bg-cream border border-white/80 shadow-warm-lg px-7 py-10 md:px-10 text-center">
            <SparkleCluster play={inView} delay={0.3} className="absolute -top-5 -right-3 w-12 h-12 stroke-ink/70" />
            <p className="font-serif text-2xl md:text-3xl text-ink leading-snug">My portfolio is being polished&nbsp;✿</p>
            <p className="text-body text-sm leading-relaxed mt-3">Case studies and samples are on the way. Want to see something specific? Message me.</p>
            <motion.a
              href="#contact"
              whileTap={{ scale: 0.96 }}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-wider text-cream shadow-warm transition-colors duration-200 hover:bg-ink-deep"
            >
              Message me <span aria-hidden="true">→</span>
            </motion.a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Portfolio() {
  return PROJECTS.length === 0 ? <ComingSoon /> : <Coverflow />;
}

function Coverflow() {
  const reduced = Boolean(useReducedMotion());
  const finePointer = useFinePointer();
  const layout = useCardLayout(reduced);
  const cardH = layout.width * COVERFLOW.aspect;
  const stepPx = layout.width * (layout.mobile ? COVERFLOW.spacingMobile[0] : COVERFLOW.spacing[0]);

  const [filter, setFilter] = useState<Filter>("All");
  const items = useMemo(() => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter)), [filter]);
  const n = items.length;

  // ── carousel position (float, in cards) ──
  const pos = useMotionValue(startIndex(PROJECTS.length));
  const entry = useMotionValue(reduced ? 1 : 0);
  const [active, setActive] = useState(startIndex(PROJECTS.length));
  const activeRef = useRef(active);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const nRef = useRef(n);
  nRef.current = n;

  useEffect(
    () =>
      pos.on("change", (v) => {
        const i = clamp(Math.round(v), 0, nRef.current - 1);
        if (i !== activeRef.current) {
          activeRef.current = i;
          setActive(i);
        }
      }),
    [pos],
  );

  const lastInteraction = useRef(0);
  const touch = () => (lastInteraction.current = Date.now());

  const go = useCallback(
    (target: number, velocity = 0) => {
      const to = clamp(Math.round(target), 0, nRef.current - 1);
      anim.current?.stop();
      anim.current = animate(pos, to, reduced ? { duration: COVERFLOW.reducedSlide, ease: EASE } : { ...COVERFLOW.spring, velocity });
    },
    [pos, reduced],
  );

  // ── detail view ──
  const [openId, setOpenId] = useState<string | null>(null);
  const openProject = items.find((p) => p.id === openId) ?? null;
  const closeDetail = useCallback(() => setOpenId(null), []);

  // ── click / drag ──
  const dragged = useRef(false);
  const select = (i: number) => {
    if (dragged.current) return;
    touch();
    if (i === activeRef.current) setOpenId(items[i].id);
    else go(i);
  };

  const stageRef = useRef<HTMLDivElement>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || openId) return;
    anim.current?.stop();
    touch();
    const startX = e.clientX;
    const startPos = pos.get();
    let lastX = startX;
    let lastT = performance.now();
    let velocity = 0; // cards per second
    dragged.current = false;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!dragged.current && Math.abs(dx) < COVERFLOW.dragThreshold) return;
      dragged.current = true;
      let p = startPos - dx / stepPx;
      const max = nRef.current - 1;
      if (p < 0) p *= 0.35; // rubber-band at the ends
      if (p > max) p = max + (p - max) * 0.35;
      pos.set(p);
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = 0.8 * velocity + 0.2 * ((-(ev.clientX - lastX) / stepPx / dt) * 1000);
      lastX = ev.clientX;
      lastT = now;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      touch();
      if (dragged.current) {
        go(pos.get() + velocity * COVERFLOW.inertia, velocity);
        // let the click that follows a drag be ignored, then reset
        setTimeout(() => (dragged.current = false), 0);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  // ── horizontal wheel / trackpad ──
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let snap = 0;
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return; // vertical wheel keeps scrolling the page
      e.preventDefault();
      e.stopPropagation(); // keep Lenis out of horizontal gestures
      anim.current?.stop();
      touch();
      pos.set(clamp(pos.get() + dx / (stepPx * 1.2), -0.3, nRef.current - 0.7));
      clearTimeout(snap);
      snap = window.setTimeout(() => go(pos.get()), COVERFLOW.wheelSnapDelay);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(snap);
      el.removeEventListener("wheel", onWheel);
    };
  }, [go, pos, stepPx]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };
    if (e.key in keys) {
      e.preventDefault();
      touch();
      go(activeRef.current + keys[e.key]);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      go(e.key === "Home" ? 0 : nRef.current - 1);
    }
  };

  // ── fan out when the section enters the viewport ──
  const inView = useInView(stageRef, { once: true, amount: 0.3 });
  useEffect(() => {
    if (!inView) return;
    if (reduced) entry.set(1);
    else animate(entry, 1, { duration: COVERFLOW.fanOut, ease: EASE });
  }, [entry, inView, reduced]);

  // ── filters: collapse to the center, swap the set, fan out again ──
  const busy = useRef(false);
  const changeFilter = async (f: Filter) => {
    if (f === filter || busy.current) return;
    busy.current = true;
    anim.current?.stop();
    touch();
    if (!reduced) await animate(entry, 0, { duration: COVERFLOW.reshuffleOut, ease: EASE_IN_OUT });
    const next = f === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === f);
    const start = startIndex(next.length);
    nRef.current = next.length;
    activeRef.current = start;
    pos.set(start);
    setActive(start);
    setFilter(f);
    if (!reduced) await animate(entry, 1, { duration: COVERFLOW.fanOut * 0.8, ease: EASE });
    else entry.set(1);
    busy.current = false;
  };

  // ── autoplay (pauses on hover, interaction, detail view, hidden tab, reduced motion) ──
  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    if (!COVERFLOW.autoplay || reduced || !inView || hovering || openId || n < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden || Date.now() - lastInteraction.current < COVERFLOW.autoplay * 1000) return;
      go(activeRef.current >= nRef.current - 1 ? 0 : activeRef.current + 1);
    }, COVERFLOW.autoplay * 1000);
    return () => window.clearInterval(id);
  }, [go, hovering, inView, n, openId, reduced]);

  // ── mouse parallax: subtle tilt of the whole carousel + image shift on the active card ──
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, SPRING.soft);
  const my = useSpring(myRaw, SPRING.soft);
  const tiltY = useTransform(mx, (v) => v * COVERFLOW.tilt * 2);
  const tiltX = useTransform(my, (v) => -v * COVERFLOW.tilt * 2);
  const parallax = finePointer && !reduced;
  const onSectionMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!parallax || e.pointerType !== "mouse" || openId) return;
    const r = e.currentTarget.getBoundingClientRect();
    mxRaw.set((e.clientX - r.left) / r.width - 0.5);
    myRaw.set((e.clientY - r.top) / r.height - 0.5);
  };
  useEffect(() => {
    if (!openId) return;
    mxRaw.set(0);
    myRaw.set(0);
  }, [mxRaw, myRaw, openId]);

  const progress = useTransform(pos, (p) => (clamp(p, 0, Math.max(0, nRef.current - 1)) + 1) / Math.max(1, nRef.current));
  const current = items[active] ?? items[0];
  const pad = (v: number) => String(v).padStart(2, "0");

  return (
    <section
      id="portfolio"
      onPointerMove={onSectionMove}
      onPointerLeave={() => {
        mxRaw.set(0);
        myRaw.set(0);
      }}
      className="relative py-24 overflow-hidden bg-sunshine"
    >
      {/* blurred, darkened copy of the active card, tinted butter-yellow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <AnimatePresence initial={false}>
          {current && (
            <motion.img
              key={current.id}
              src={coverOf(current).thumb}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: COVERFLOW.backgroundFade, ease: EASE }}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-[48px] brightness-[0.7] saturate-[1.2]"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 portfolio-tint" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <PortfolioHeading />

        {/* Filters (only categories that have projects) */}
        {SHOW_FILTERS ? (
          <Reveal delay={0.08} className="flex flex-wrap justify-center gap-2 mb-12" as="div">
            <div role="group" aria-label="Filter projects" className="contents">
              {FILTERS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  onClick={() => changeFilter(c)}
                  aria-pressed={filter === c}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-200 ${
                    filter === c ? "text-cream" : "text-ink bg-cream/60 border border-ink/15 hover:bg-highlight"
                  }`}
                >
                  {filter === c && <motion.span layoutId="portfolio-filter" className="absolute inset-0 rounded-full bg-ink shadow-warm" transition={SPRING.pop} />}
                  <span className="relative">{c}</span>
                </motion.button>
              ))}
            </div>
          </Reveal>
        ) : (
          <div className="mb-2" />
        )}
      </div>

      {/* Stage */}
      <div className="relative">
        <div
          ref={stageRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Portfolio projects"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          data-cursor="drag"
          className="relative mx-auto select-none touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-3xl"
          // extra room below the cards for the reflection (≈20% of the card) + glow
          style={{ height: cardH * 1.22 + 24, perspective: reduced ? undefined : COVERFLOW.perspective }}
        >
          {/* soft glow under the center card */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 rounded-[50%] blur-2xl"
            style={{ top: cardH - 10, width: layout.width * 1.3, height: 60, background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-highlight) 85%, transparent), transparent)" }}
          />
          <motion.div className="absolute inset-0" style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: reduced ? undefined : "preserve-3d" }}>
            {items.map((p, i) => (
              <CoverCard
                key={p.id}
                project={p}
                index={i}
                pos={pos}
                entry={entry}
                mx={mx}
                layout={layout}
                isActive={i === active}
                tabbable={Math.abs(i - active) <= 2}
                total={n}
                onSelect={select}
                onFocusCard={(idx) => go(idx)}
              />
            ))}
          </motion.div>
        </div>

        {/* arrows (not needed for a single project) */}
        {n > 1 && (
          <div className="pointer-events-none absolute inset-x-0 flex justify-between px-2 md:px-8 max-w-6xl mx-auto" style={{ top: cardH / 2 - 24 }}>
            {([-1, 1] as const).map((dir) => {
              const disabled = dir < 0 ? active <= 0 : active >= n - 1;
              return (
                <motion.button
                  key={dir}
                  type="button"
                  onClick={() => {
                    touch();
                    go(active + dir);
                  }}
                  disabled={disabled}
                  aria-label={dir < 0 ? "Previous project" : "Next project"}
                  whileTap={{ scale: 0.92 }}
                  className="glass-chip pointer-events-auto grid place-items-center w-11 h-11 md:w-14 md:h-14 rounded-full text-ink transition-opacity duration-200 disabled:opacity-35"
                >
                  <svg viewBox="0 0 24 24" className={`w-5 h-5 ${dir < 0 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* counter + progress (hidden for a single project; keeps its height so the section doesn't jump) */}
      <div className={`relative mt-4 flex items-center justify-center gap-4 text-ink ${n > 1 ? "" : "invisible"}`} aria-hidden={n > 1 ? undefined : true}>
        <span className="font-serif text-lg tabular-nums">{pad(active + 1)}</span>
        <span className="relative h-[2px] w-32 md:w-48 rounded-full bg-ink/15 overflow-hidden">
          <motion.span className="absolute inset-0 origin-left rounded-full bg-ink" style={{ scaleX: progress }} />
        </span>
        <span className="font-serif text-lg tabular-nums text-body">{pad(n)}</span>
      </div>
      <p className="sr-only" aria-live="polite">
        {current ? `Project ${active + 1} of ${n}: ${current.title}` : ""}
      </p>

      <AnimatePresence>{openProject && <ProjectDetail key={openProject.id} project={openProject} onClose={closeDetail} />}</AnimatePresence>
    </section>
  );
}
