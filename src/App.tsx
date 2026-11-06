import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { CalendarCheck, ChatsCircle, FilmSlate, PaintBrush, PencilLine, Table, type Icon } from "@phosphor-icons/react";
import { CUTE, EASE as ease, SERVICE_ICONS } from "@/config/motion";
import { SOCIAL, mailtoHref } from "@/config/social";
import { IntroContext, type IntroPhase } from "@/lib/intro";
import Preloader from "@/components/Preloader";
import HelloToast from "@/components/HelloToast";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/sections/hero/Hero";
import Portfolio from "@/sections/portfolio/Portfolio";
import LazyMount from "@/components/LazyMount";

// below the fold: code-split and mounted when idle / near the viewport
const Tools = lazy(() => import("@/sections/tools/Tools"));
// measured section heights per breakpoint (update if you add/remove many tools)
const TOOLS_PLACEHOLDER = "min-h-[472px] md:min-h-[508px]";

const viewport = { once: true, amount: 0.2 } as const;

function fadeInView(delay = 0, y = 22) {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition: { duration: 0.8, delay, ease },
  };
}

// ── Nav ────────────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = ["About", "Services", "Tools", "Portfolio", "Contact"];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cream/90 backdrop-blur-md shadow-warm" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#about" className="font-serif italic text-ink text-xl tracking-tight select-none">
          rp<span className="not-italic text-honey">.</span>
        </a>
        <ul className="hidden md:flex gap-8 text-sm text-body font-medium tracking-widest uppercase">
          {links.map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} className="hover:text-ink transition-colors duration-200 relative group">
                {l}
                {/* transform-only underline: never affects layout */}
                <span className="absolute -bottom-1 left-0 w-full h-px bg-ink origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </a>
            </li>
          ))}
        </ul>
        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span className={`block w-6 h-0.5 bg-ink transition-transform duration-200 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-transform duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease }}
            className="md:hidden overflow-hidden bg-cream/95 border-t border-butter/40"
          >
            <ul className="flex flex-col gap-5 text-sm text-body tracking-widest uppercase px-6 pb-6 pt-4">
              {links.map((l) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="hover:text-ink transition-colors">{l}</a></li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ── Stats strip ────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: "6+", label: "Services Offered" },
    { value: "30+", label: "Designs Created" },
    { value: "100%", label: "Dedication" },
    { value: "1", label: "Happy Client So Far" },
  ];
  return (
    <div className="bg-peach py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeInView(i * 0.08, 16)}>
            <p className="font-serif text-4xl text-ink font-bold mb-1">{s.value}</p>
            <p className="text-body text-xs tracking-widest uppercase font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Services ───────────────────────────────────────────────────────────────
/**
 * Icon per service — swap any Phosphor icon here (https://phosphoricons.com,
 * rendered in the “duotone” weight). Keep each icon unique.
 */
const SERVICE_ICON: Record<string, Icon> = {
  "Content Scheduling": CalendarCheck,
  "Graphic Design (Canva)": PaintBrush,
  "Video Editing (CapCut)": FilmSlate,
  "Community Engagement": ChatsCircle,
  "Data Entry": Table,
  "Basic Copywriting / Caption Writing": PencilLine,
};

const services = [
  { label: "Content Scheduling", desc: "Planning and scheduling posts across platforms to keep your brand consistent and active." },
  { label: "Graphic Design (Canva)", desc: "Creating eye-catching graphics, social media posts, and promotional materials using Canva to keep your brand visually on-point." },
  { label: "Video Editing (CapCut)", desc: "Editing and polishing short-form videos and reels using CapCut to produce clean, engaging content ready to publish." },
  { label: "Community Engagement", desc: "Responding to comments, messages, and building genuine connections with your audience." },
  { label: "Data Entry", desc: "Accurate data organization, spreadsheet management, and record keeping." },
  { label: "Basic Copywriting / Caption Writing", desc: "Writing clear, on-brand captions and short copy for posts to boost engagement and reflect your brand's voice." },
];

/** Duotone icon on a tilted cream / butter sticker badge (56px). Pops in once; straightens + wiggles on card hover. */
function ServiceBadge({ icon: IconCmp, index }: { icon?: Icon; index: number }) {
  if (!IconCmp) return null;
  const rotate = SERVICE_ICONS.rotations[index % SERVICE_ICONS.rotations.length];
  const even = index % 2 === 0;
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0, scale: SERVICE_ICONS.pop.scale, rotate }}
      whileInView={{ opacity: 1, scale: 1, rotate, y: 0 }}
      viewport={viewport}
      variants={{ hover: { rotate: 0, y: SERVICE_ICONS.hover.y, transition: SERVICE_ICONS.hover.spring } }}
      transition={{ ...SERVICE_ICONS.pop.spring, delay: index * 0.07 + SERVICE_ICONS.pop.delay, opacity: { duration: 0.3, delay: index * 0.07 + SERVICE_ICONS.pop.delay } }}
      className={`duo-icon ${even ? "duo-blush bg-cream" : "duo-apricot bg-highlight"} -mt-3 mb-3 grid size-14 place-items-center rounded-[18px] border border-white/80 text-ink shadow-warm`}
    >
      <motion.span className="grid place-items-center" variants={{ hover: { rotate: SERVICE_ICONS.wiggle.rotate, transition: { duration: SERVICE_ICONS.wiggle.duration, ease: "easeInOut" } } }}>
        <IconCmp size={30} weight="duotone" aria-hidden="true" />
      </motion.span>
    </motion.span>
  );
}

function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
          <motion.div {...fadeInView(0)}>
            <p className="text-honey text-xs tracking-widest uppercase font-semibold mb-3">What I Offer</p>
            <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
              Services<br />
              <span className="italic text-honey">& Skills</span>
            </h2>
          </motion.div>
          <motion.p {...fadeInView(0.1)} className="text-body text-sm leading-relaxed max-w-xs">
            A complete toolkit to help your business thrive online — creatively and efficiently.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeInView(i * 0.07, 24)}
              whileHover="hover"
              variants={{ hover: { y: -4, transition: { duration: 0.45, ease } } }}
              className="group bg-cream border border-butter/40 rounded-3xl p-7 hover:bg-ink hover:border-ink cursor-default transition-colors duration-300"
            >
              <ServiceBadge icon={SERVICE_ICON[s.label]} index={i} />
              <h3 className="font-semibold text-ink group-hover:text-cream text-base mb-2 transition-colors duration-300">{s.label}</h3>
              <p className="text-sm text-body group-hover:text-peach leading-relaxed transition-colors duration-300">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Experience ─────────────────────────────────────────────────────────────
function Experience() {
  return (
    <section className="py-24 px-6 bg-cream relative overflow-hidden">
      {/* Big decorative text */}
      <div className="absolute -top-4 right-0 font-serif text-[120px] md:text-[180px] text-peach leading-none select-none pointer-events-none font-bold opacity-60">
        XP
      </div>
      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <motion.div {...fadeInView(0)} className="md:w-1/3 md:sticky md:top-32">
            <p className="text-honey text-xs tracking-widest uppercase font-semibold mb-3">Background</p>
            <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
              Work<br /><span className="italic text-honey">Experience</span>
            </h2>
          </motion.div>
          <div className="md:w-2/3">
            {/* Card */}
            <motion.div {...fadeInView(0.12, 28)} className="relative bg-ink text-cream rounded-[2rem] p-8 md:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-butter/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-butter/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                  <div>
                    <h3 className="font-serif text-2xl text-cream mb-1">Graphic Designer</h3>
                    <p className="text-butter text-sm font-medium tracking-wide">Joyful Gifting Ph</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-ink-deep border border-body text-cream text-xs px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-butter" />
                    Completed
                  </span>
                </div>
                <ul className="space-y-4">
                  {[
                    "Designed sticker labels for perfume, scented candles, hand soap, and alcohol products.",
                    "Created invitation graphics for birthdays, weddings, and various special occasions.",
                    "Managed inventory for papers and envelopes used in invitation production.",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-cream/90 leading-relaxed">
                      <span className="text-butter mt-0.5 shrink-0">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Contact ─────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-butter relative overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-ink/10 animate-breathe" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-ink/10 animate-breathe" style={{ animationDelay: "1.2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-ink/15 animate-breathe" style={{ animationDelay: "2.4s" }} />

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.p {...fadeInView(0)} className="text-body text-xs tracking-widest uppercase font-semibold mb-4">Get in Touch</motion.p>
        <motion.h2 {...fadeInView(0.08)} className="font-serif text-5xl md:text-7xl text-ink leading-tight mb-6">
          Let's Create<br />
          <span className="italic text-body">Together</span>
        </motion.h2>
        <motion.p {...fadeInView(0.16)} className="text-body text-base max-w-sm mx-auto mb-12 leading-relaxed">
          Looking for a reliable VA or social media manager? I'd love to hear about your project.
        </motion.p>
        <motion.div {...fadeInView(0.24)} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.a
            href={mailtoHref}
            whileHover={{ y: -2 }}
            whileTap={{ scale: CUTE.pressScale, transition: CUTE.pressSpring }}
            transition={{ duration: 0.3, ease }}
            className="flex items-center gap-3 bg-ink text-cream text-sm font-semibold px-8 py-4 rounded-full hover:bg-ink-deep transition-colors duration-200 shadow-warm-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {SOCIAL.email}
          </motion.a>
          <motion.a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Regine's LinkedIn profile (opens in a new tab)"
            whileHover={{ y: -2 }}
            whileTap={{ scale: CUTE.pressScale, transition: CUTE.pressSpring }}
            transition={{ duration: 0.3, ease }}
            className="flex items-center gap-3 border border-ink/30 text-ink text-sm font-medium px-8 py-4 rounded-full hover:border-ink hover:bg-highlight transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            LinkedIn Profile
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <motion.footer {...fadeInView(0, 12)} className="py-8 px-6 bg-cream border-t border-butter/30 text-center">
      <p className="font-serif italic text-ink text-lg mb-1">Regine Paclibar</p>
      <p className="text-body text-xs tracking-wider uppercase">Virtual Assistant · Social Media Manager · Graphic Designer</p>
      <p className="text-body/80 text-xs mt-4">© {new Date().getFullYear()} — All rights reserved</p>
    </motion.footer>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<IntroPhase>("loading");

  // always open on the hero so the preloader → hero story plays in order
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <IntroContext.Provider value={phase}>
      <SmoothScroll paused={phase === "loading"} />
      <CustomCursor />
      {phase !== "done" && <Preloader onReveal={() => setPhase("revealing")} onDone={() => setPhase("done")} />}
      <HelloToast show={phase === "done"} />
      <div className="min-h-full">
        <Nav />
        <Hero />
        <Stats />
        <Services />
        <LazyMount id="tools" placeholderClassName={TOOLS_PLACEHOLDER}>
          <Suspense fallback={<div id="tools" className={TOOLS_PLACEHOLDER} />}>
            <Tools />
          </Suspense>
        </LazyMount>
        <Portfolio />
        <Experience />
        <Contact />
        <Footer />
      </div>
      </IntroContext.Provider>
    </MotionConfig>
  );
}
