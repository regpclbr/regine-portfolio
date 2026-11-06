import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { TOOLS } from "@/config/motion";
import type { Tool } from "@/data/tools";
import ToolLogo from "./ToolLogo";
import { Level } from "./ToolChip";

/** Touch devices: small bottom sheet with a tool's details. Closes on backdrop tap, ✕ or Escape. */
export default function ToolSheet({ tool, onClose }: { tool: Tool | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const last = useRef<Tool | null>(tool);
  if (tool) last.current = tool;
  const t = tool ?? last.current;

  useEffect(() => {
    if (!tool) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // the close button is the only control — keep focus inside the dialog
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, onClose]);

  return createPortal(
    <AnimatePresence>
      {tool && t && (
        <>
          <motion.div
            key="tool-sheet-backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-[60] bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="tool-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tool-sheet-title"
            className="fixed inset-x-0 bottom-0 z-[61] mx-auto max-w-md rounded-t-[28px] bg-cream px-5 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-warm-lg"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={TOOLS.sheetSpring}
          >
            <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-10 rounded-full bg-ink/15" />
            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-11 shrink-0 rounded-2xl sticker-shadow" style={{ background: `color-mix(in srgb, ${t.brandColor} 12%, var(--color-cream))` }}>
                <ToolLogo tool={t} size={26} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id="tool-sheet-title" className="font-serif text-xl text-ink leading-tight">
                  {t.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-highlight px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">{t.category}</span>
                  <Level level={t.level} />
                  <span className="sr-only">Skill level {t.level} of 5</span>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid place-items-center size-10 shrink-0 rounded-full bg-ink/5 text-ink outline-none focus-visible:ring-4 focus-visible:ring-ink/30"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-body">
              <span className="font-semibold text-ink">Used for: </span>
              {t.usedFor}
              {t.optional && <span className="text-body/70"> (optional)</span>}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
