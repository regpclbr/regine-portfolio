import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "motion/react";
import { SPRING, TOOLS } from "@/config/motion";
import { TOOL_CATEGORIES, TOOLS_LIST, type Tool, type ToolCategory } from "@/data/tools";
import { useFinePointer, useMediaQuery } from "@/lib/hooks";
import Reveal from "@/components/Reveal";
import { SparkleCluster, WavyUnderline } from "@/components/Doodles";
import ToolChip from "./ToolChip";
import ToolSheet from "./ToolSheet";

type Tab = ToolCategory | "All";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TOOLS LAYOUT — every size / limit for this section lives here.
 *  (The tools themselves are in src/data/tools.ts.)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const TOOLS_LAYOUT = {
  /** tab order (categories come from TOOL_CATEGORIES) */
  tabs: [...TOOL_CATEGORIES, "All"] as Tab[],
  defaultTab: "Design" as Tab,
  /** tool ids shown in the ★ Favorites row */
  favorites: ["canva", "capcut", "notion"],
  /** chip heights in px */
  chipHeight: { mobile: 48, desktop: 56 },
  favoriteHeight: { mobile: 52, desktop: 64 },
  /** logo-only chips on the “All” tab (square, px) */
  tinySize: { mobile: 40, desktop: 48 },
  /** gap between logo-only chips on mobile (px) — tighter so the “All” tab stays compact */
  tinyGapMobile: 6,
  /** chip columns on mobile (desktop wraps freely) */
  mobileColumns: 3,
  /** gap between chips in px */
  gap: { mobile: 8, desktop: 10 },
  /** max resting sticker tilt in degrees (±) */
  maxRotate: 1.5,
  /** width where the two-column desktop layout starts — keep in sync with Tailwind `md:` */
  desktopFrom: 768,
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const tiltOf = (tool: Tool) => TOOLS.tiltPattern[TOOLS_LIST.indexOf(tool) % TOOLS.tiltPattern.length] * TOOLS_LAYOUT.maxRotate;
const countOf = (tab: Tab) => (tab === "All" ? TOOLS_LIST.length : TOOLS_LIST.filter((t) => t.category === tab).length);

// reserve room for the fullest category on mobile so switching tabs doesn't make the page jump
const MOBILE_ROWS = Math.ceil(Math.max(...TOOL_CATEGORIES.map(countOf)) / TOOLS_LAYOUT.mobileColumns);
const MOBILE_PANEL_MIN = MOBILE_ROWS * TOOLS_LAYOUT.chipHeight.mobile + (MOBILE_ROWS - 1) * TOOLS_LAYOUT.gap.mobile;

const FAVORITES = TOOLS_LAYOUT.favorites.map((id) => TOOLS_LIST.find((t) => t.id === id)).filter((t): t is Tool => Boolean(t));

const CSS_VARS = {
  "--chip-h": `${TOOLS_LAYOUT.chipHeight.mobile}px`,
  "--chip-h-md": `${TOOLS_LAYOUT.chipHeight.desktop}px`,
  "--fav-h": `${TOOLS_LAYOUT.favoriteHeight.mobile}px`,
  "--fav-h-md": `${TOOLS_LAYOUT.favoriteHeight.desktop}px`,
  "--tiny": `${TOOLS_LAYOUT.tinySize.mobile}px`,
  "--tiny-md": `${TOOLS_LAYOUT.tinySize.desktop}px`,
  "--tool-cols": TOOLS_LAYOUT.mobileColumns,
  "--tool-gap": `${TOOLS_LAYOUT.gap.mobile}px`,
  "--tiny-gap": `${TOOLS_LAYOUT.tinyGapMobile}px`,
  "--tool-gap-md": `${TOOLS_LAYOUT.gap.desktop}px`,
  "--panel-min": `${MOBILE_PANEL_MIN}px`,
} as CSSProperties;

/** TOOLS I USE — compact sticker chips grouped by category tabs. */
export default function Tools() {
  const reduced = Boolean(useReducedMotion());
  const rich = !reduced;
  const finePointer = useFinePointer();
  const isDesktop = useMediaQuery(`(min-width: ${TOOLS_LAYOUT.desktopFrom}px)`);

  const [tab, setTab] = useState<Tab>(TOOLS_LAYOUT.defaultTab);
  const [sheetTool, setSheetTool] = useState<Tool | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const visible = useMemo(() => (tab === "All" ? TOOLS_LIST : TOOLS_LIST.filter((t) => t.category === tab)), [tab]);
  const isAll = tab === "All";

  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.6 });
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyInView = useInView(bodyRef, { once: true, amount: 0.15 });
  const tabsRef = useRef<HTMLDivElement>(null);

  // mobile: keep the active pill visible in the horizontal scroller (without scrolling the page)
  useEffect(() => {
    const c = tabsRef.current;
    const el = c?.querySelector<HTMLElement>("[aria-selected='true']");
    if (!c || !el || isDesktop) return;
    const pad = 16;
    if (el.offsetLeft - pad < c.scrollLeft || el.offsetLeft + el.offsetWidth + pad > c.scrollLeft + c.clientWidth) {
      c.scrollTo({ left: el.offsetLeft - pad, behavior: reduced ? "auto" : "smooth" });
    }
  }, [tab, isDesktop, reduced]);

  const selectTab = (next: Tab, focus = false) => {
    setTab(next);
    if (focus) tabsRef.current?.querySelector<HTMLElement>(`#tools-tab-${slug(next)}`)?.focus({ preventScroll: true });
  };

  // roving focus: arrows / Home / End move between tabs
  const onTabsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = TOOLS_LAYOUT.tabs;
    const i = tabs.indexOf(tab);
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    selectTab(tabs[(map[e.key] + tabs.length) % tabs.length], true);
  };

  const openSheet = useCallback((tool: Tool, opener: HTMLElement) => {
    openerRef.current = opener;
    setSheetTool(tool);
  }, []);
  const closeSheet = useCallback(() => {
    setSheetTool(null);
    openerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section id="tools" style={CSS_VARS} className="relative py-10 md:py-16 bg-peach overflow-x-clip">
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        {/* Heading + favorites */}
        <div ref={headingRef} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 mb-4 md:mb-8">
          <Reveal>
            <p className="text-honey text-[11px] tracking-widest uppercase font-semibold mb-1.5">My Toolkit</p>
            <h2 className="relative inline-block font-serif text-3xl md:text-4xl text-ink leading-[1.1]">
              Tools{" "}
              <span className="relative inline-block italic text-body">
                I Use
                <WavyUnderline play={headingInView} delay={0.3} className="absolute left-0 -bottom-[0.1em] w-full h-[0.2em] stroke-apricot" />
              </span>
              <SparkleCluster play={headingInView} delay={0.5} className="absolute -right-8 -top-3 w-7 h-7 stroke-ink/70" />
            </h2>
            <p className="text-body text-xs md:text-sm mt-1.5">The apps behind the smooth workflow</p>
          </Reveal>

          <Reveal delay={0.05} className="relative">
            <div role="group" aria-label="Favorite tools" className="relative rounded-[22px] bg-highlight/70 border border-dashed border-ink/20 p-2 md:p-2.5">
              <span aria-hidden="true" className="absolute -top-2.5 left-4 z-[2] -rotate-3 rounded-md bg-ink px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cream shadow-warm">
                ★ Favorites
              </span>
              <div className="grid grid-cols-3 gap-(--tool-gap) md:flex md:gap-(--tool-gap-md)">
                {FAVORITES.map((tool, i) => (
                  <ToolChip
                    key={tool.id}
                    tool={tool}
                    variant="favorite"
                    rotate={tiltOf(tool)}
                    index={i}
                    show={headingInView}
                    rich={rich}
                    finePointer={finePointer}
                    tipPlacement="bottom"
                    layout={false}
                    onOpen={openSheet}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Tabs + chips */}
        <div ref={bodyRef} className="md:grid md:grid-cols-[176px_minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)] md:gap-8 lg:gap-10">
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Tool categories"
            aria-orientation={isDesktop ? "vertical" : "horizontal"}
            onKeyDown={onTabsKey}
            className="no-scrollbar relative -mx-4 px-4 mb-3 flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-px-4 md:mx-0 md:px-0 md:mb-0 md:flex-col md:gap-1 md:overflow-visible md:snap-none"
          >
            {TOOLS_LAYOUT.tabs.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  id={`tools-tab-${slug(t)}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="tools-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectTab(t)}
                  className={`relative shrink-0 snap-start h-10 px-4 rounded-full flex items-center justify-between gap-2.5 text-[11px] md:text-xs font-semibold uppercase tracking-wider whitespace-nowrap outline-none focus-visible:ring-4 focus-visible:ring-ink/30 transition-colors duration-200 ${
                    active ? "text-cream" : "text-ink bg-cream/70 border border-ink/15 hover:bg-highlight md:bg-transparent md:border-transparent md:hover:bg-cream/70"
                  }`}
                >
                  {active && <motion.span layoutId="tools-tab-pill" className="absolute inset-0 rounded-full bg-ink shadow-warm" transition={SPRING.pop} />}
                  <span className="relative">{t}</span>
                  <span className={`relative text-[10px] tabular-nums ${active ? "text-cream/70" : "text-body/70"}`}>{countOf(t)}</span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id="tools-panel" aria-labelledby={`tools-tab-${slug(tab)}`} className="min-w-0">
            <LayoutGroup id="tools-chips">
              <div
                className={`relative min-h-(--panel-min) md:min-h-0 md:gap-(--tool-gap-md) md:flex md:flex-wrap md:content-start ${
                  isAll ? "flex flex-wrap content-start gap-(--tiny-gap)" : "grid grid-cols-[repeat(var(--tool-cols),minmax(0,1fr))] content-start gap-(--tool-gap)"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {visible.map((tool, i) => (
                    <ToolChip
                      key={tool.id}
                      tool={tool}
                      variant={isAll ? "tiny" : "normal"}
                      rotate={tiltOf(tool)}
                      index={i}
                      show={bodyInView}
                      rich={rich}
                      finePointer={finePointer}
                      onOpen={openSheet}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </LayoutGroup>
            {isAll && <p className="hidden md:block mt-2.5 text-[11px] text-body">{finePointer ? "Hover" : "Tap"} a logo to see what it is.</p>}
          </div>
        </div>
      </div>

      <ToolSheet tool={sheetTool} onClose={closeSheet} />
    </section>
  );
}
