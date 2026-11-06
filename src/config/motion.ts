/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MOTION CONFIG — every duration, delay, easing and spring lives here.
 *
 *  • SPEED scales *all* durations/delays at once (1 = default, 0.8 = snappier,
 *    1.25 = slower & dreamier).
 *  • Values are in seconds unless noted.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SPEED = 1;

/** Scale a duration/delay by the global SPEED. */
export const t = (seconds: number) => seconds * SPEED;

/** Signature easing — cubic-bezier(0.22, 1, 0.36, 1) */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Symmetric ease for drawing strokes / loops */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Reusable springs (springs are physics-based, so SPEED doesn't apply) */
export const SPRING = {
  /** springy “pop” for chips & badges */
  pop: { type: "spring", stiffness: 320, damping: 18, mass: 0.8 },
  /** soft follow for parallax / light blob */
  soft: { type: "spring", stiffness: 40, damping: 18, mass: 0.6 },
  /** letter hover lift */
  letter: { type: "spring", stiffness: 400, damping: 14 },
  /** 3D tilt */
  tilt: { type: "spring", stiffness: 150, damping: 18 },
} as const;

/* ── 1. Preloader ─────────────────────────────────────────────────────────── */
export const PRELOADER = {
  /** handwriting stroke duration */
  draw: t(1.5),
  /** pink dot pop after stroke */
  dotDelay: t(0.05),
  /** pause on the finished monogram */
  hold: t(0.35),
  /** curtain lift duration */
  curtain: t(1.0),
  /** second (cream) curtain lag */
  curtainLag: t(0.12),
  /** when the hero starts animating, relative to curtain start */
  heroCue: t(0.35),
  /** reduced-motion: simple fade */
  reducedFade: t(0.5),
};

/* ── 2. Cursor & magnetic ─────────────────────────────────────────────────── */
export const CURSOR = {
  dotSpring: { stiffness: 1000, damping: 60, mass: 0.3 },
  ringSpring: { stiffness: 170, damping: 22, mass: 0.6 },
  dotSize: 10, // px — butter dot
  ringSize: 34, // px — soft ring that trails behind
  hoverRingScale: 0.7, // ring shrinks around the heart/sparkle on links & buttons
  iconSize: 18, // px — heart (links) / sparkle (buttons)
  labelScale: 2.6, // “View” / “Drag” bubble
  stateDuration: t(0.35),
};

export const MAGNETIC = {
  /** fraction of the cursor's offset the element follows */
  strength: 0.18,
  /** hard cap on movement in px (any direction) — keeps buttons off their neighbours */
  max: 7,
  /** px beyond the element's own bounds where the pull starts */
  radius: 20,
  spring: { stiffness: 260, damping: 22, mass: 0.5 },
};

/* ── 3. Hero ──────────────────────────────────────────────────────────────── */
export const HERO = {
  /** gap between hero blocks (badge → name → tagline → paragraph → buttons) */
  step: t(0.12),
  blockDuration: t(0.8),
  /** per-letter stagger for the split name */
  letterStagger: t(0.04),
  letterDuration: t(0.9),
  /** relative start times (s after the curtain cue) */
  at: {
    badge: 0,
    first: t(0.1),
    last: t(0.32),
    tagline: t(0.62),
    paragraph: t(0.74),
    buttons: t(0.86),
    photo: t(0.2),
    frame: t(0.75),
    chips: t(1.15),
    signature: t(2.4),
    scrollCue: t(2.2),
  },
  /** gap between floating story chips */
  chipStagger: t(0.32),
  photoReveal: t(1.2),
  /** mouse parallax depth in px for the chips */
  chipDepth: [26, 40, 32, 20],
  chipFloat: [4.4, 5.2, 4.8, 5.6],
  photoRadius: 40, // px — keep in sync with rounded-[40px] on the photo frame
  photoHoverInset: "inset(3.5% 4.5% 3.5% 4.5% round 30px)",
  photoTilt: 8, // max degrees
  /** hand-drawn doodles: start time (s after curtain cue) + draw duration */
  doodles: {
    scribble: t(0.55),
    star: t(0.75),
    underline: t(1.0),
    sparkles: t(1.0),
    heart: t(2.7),
    draw: t(1.1),
  },
  /** sticker badge tilt in degrees */
  stickerRotate: -4,
};

/* ── Portfolio coverflow ──────────────────────────────────────────────────── */
export const COVERFLOW = {
  perspective: 1200, // px
  /** Y rotation of side cards (deg), facing the center */
  rotate: 40,
  rotateMobile: 24,
  /** horizontal distance as a fraction of card width: [first neighbour, each further card] */
  spacing: [0.62, 0.36] as const,
  spacingMobile: [0.6, 0.32] as const,
  /** scale of the 1st and 2nd neighbours (further cards keep shrinking a little) */
  scale: [0.8, 0.65] as const,
  /** px each step is pushed back in Z */
  depth: 140,
  /** max warm-dark overlay & blur on the farthest visible cards */
  dim: 0.5,
  blur: 2.5, // px
  /** cards beyond this offset fade out (≈5 visible on desktop, 3 on mobile) */
  visible: 2.6,
  visibleMobile: 1.6,
  /** card size: width in px (mobile = % of viewport, capped); height = width × aspect */
  cardWidth: { mobileVw: 0.62, mobileMax: 260, md: 280, lg: 320 },
  aspect: 5 / 4, // 4:5 portrait
  radius: 22, // px corner radius
  /** motion */
  spring: { type: "spring", stiffness: 170, damping: 26, mass: 0.9 } as const,
  reducedSlide: t(0.45),
  fanOut: t(1.3), // cards fan out from the center when the section enters
  reshuffleOut: t(0.32), // collapse before a filter change
  backgroundFade: t(0.9),
  /** autoplay interval in seconds (0 = off); pauses on hover / interaction */
  autoplay: 4.5,
  /** mouse parallax */
  tilt: 2.5, // deg — whole carousel
  imageShift: 12, // px — image inside the active card
  /** input */
  dragThreshold: 6, // px before a press becomes a drag
  inertia: 0.18, // how far a flick carries (seconds of velocity)
  wheelSnapDelay: 140, // ms of wheel silence before snapping
};

/* ── Tools I Use (compact sticker chips) ──────────────────────────────────── */
export const TOOLS = {
  /** resting tilt pattern (-1…1) — multiplied by TOOLS_LAYOUT.maxRotate, cycled by index */
  tiltPattern: [-1, 0.6, -0.35, 1, -0.7, 0.4, -0.5, 0.8, -0.9, 0.3],
  /** chips popping in (scroll-in + tab switch) */
  enter: {
    y: 10, // px
    scale: 0.9,
    stagger: t(0.03), // s between chips
    maxDelay: t(0.35), // s cap
    spring: { type: "spring", stiffness: 380, damping: 26 } as const,
  },
  exit: t(0.14),
  /** hover / keyboard focus: straighten, lift */
  hover: { y: -3, scale: 1.04, spring: { type: "spring", stiffness: 420, damping: 16 } as const },
  /** chips sliding into place when the tab changes */
  layoutSpring: { type: "spring", stiffness: 380, damping: 32 } as const,
  tooltip: t(0.18),
  /** mobile bottom sheet */
  sheetSpring: { type: "spring", stiffness: 380, damping: 36 } as const,
  /** how much brand colors are softened toward ink (0 = pure brand color) */
  logoSoften: 18, // %
};

/* ── Marquee (shared) ─────────────────────────────────────────────────────── */
export const MARQUEE = {
  speed: 36, // px per second at rest
  /** extra speed per px/s of scroll velocity */
  velocityFactor: 0.006,
  maxBoost: 5, // × base speed
  maxSkew: 6, // deg (when `skew` is enabled)
  /** easing toward the target speed (0–1 per frame) — also used for hover pause */
  smoothing: 0.08,
};

/* ── Cute details ─────────────────────────────────────────────────────────── */
export const CUTE = {
  /** button squish on press */
  pressScale: 0.96,
  pressSpring: { type: "spring", stiffness: 500, damping: 15 } as const,
  /** chip hover bounce */
  chipHover: { y: -4, scale: 1.05 },
  /** “hello ✿” after the preloader */
  helloDelay: t(0.2),
  helloHold: t(1.6),
};

/* ── Services icon badges ─────────────────────────────────────────────────── */
export const SERVICE_ICONS = {
  /** resting sticker tilt (deg), cycled by card index */
  rotations: [-4, 3, -2.5, 4, -3, 2.5],
  /** scroll-in pop (once) — starts a beat after the card fades in */
  pop: { scale: 0.6, delay: t(0.15), spring: { type: "spring", stiffness: 380, damping: 15 } as const },
  /** card hover: badge straightens and lifts */
  hover: { y: -3, spring: { type: "spring", stiffness: 420, damping: 14 } as const },
  /** card hover: tiny icon wiggle */
  wiggle: { rotate: [0, -12, 9, -5, 0], duration: t(0.55) },
};
