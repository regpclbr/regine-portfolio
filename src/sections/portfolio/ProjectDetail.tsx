import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { COVERFLOW, EASE, t } from "@/config/motion";
import { coverOf, resultsOf, type Project } from "@/data/projects";
import { scrollLock } from "@/lib/scrollLock";

type Props = { project: Project; onClose: () => void };

/**
 * Detail view. The media box shares its layoutId with the active card, so the card
 * expands into place; everything else fades in around it.
 */
export default function ProjectDetail({ project, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState(project.cover ?? 0);
  const image = project.images[selected] ?? coverOf(project);
  // show the light thumbnail instantly, then swap in the full-size original once loaded
  const [src, setSrc] = useState(image.thumb);

  useEffect(() => {
    setSrc(image.thumb);
    if (image.full === image.thumb) return;
    const img = new Image();
    img.decoding = "async";
    img.src = image.full;
    img.onload = () => setSrc(image.full);
    return () => {
      img.onload = null;
    };
  }, [image.full, image.thumb]);

  // lock page scroll, focus the close button, close on Escape, restore focus on exit
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    scrollLock.lock();
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      scrollLock.unlock();
      window.removeEventListener("keydown", onKey);
      previous?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8, transition: { duration: t(0.2) } },
    transition: { duration: t(0.5), delay, ease: EASE },
  });

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-8" role="dialog" aria-modal="true" aria-labelledby="project-detail-title">
      <motion.div
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: t(0.4), ease: EASE }}
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] grid md:grid-cols-[1.1fr_1fr] gap-3 p-3">
        {/* panel background (fades; the media flies in on top of it) */}
        <motion.div
          className="absolute inset-0 rounded-[30px] bg-cream shadow-warm-lg"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: t(0.45), ease: EASE }}
        />

        {/* shared media */}
        <motion.div
          layoutId={`project-media-${project.id}`}
          style={{ borderRadius: COVERFLOW.radius }}
          className="relative z-10 overflow-hidden bg-peach min-h-[38vh] md:min-h-[60vh] max-h-[50vh] md:max-h-none"
        >
          {project.type === "video" && project.video ? (
            <video src={project.video} poster={image.thumb} controls autoPlay playsInline className="absolute inset-0 w-full h-full object-contain bg-ink" />
          ) : (
            <motion.img layout src={src} alt={image.alt} decoding="async" className="absolute inset-0 w-full h-full object-contain" />
          )}
        </motion.div>

        {/* info */}
        <div className="relative z-10 overflow-y-auto max-h-[44vh] md:max-h-[calc(92vh-24px)] px-3 py-4 md:px-6 md:py-8" data-lenis-prevent>
          <motion.span {...fade(0.15)} className="inline-block rounded-full bg-highlight px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">
            {project.category}
            {project.isSample && " · Sample"}
          </motion.span>
          <motion.h3 {...fade(0.2)} id="project-detail-title" className="font-serif text-3xl md:text-4xl text-ink leading-tight mt-4">
            {project.title}
          </motion.h3>
          <motion.p {...fade(0.24)} className="text-body text-sm mt-1">
            {project.subtitle}
          </motion.p>
          <motion.p {...fade(0.28)} className="text-body leading-relaxed mt-5">
            {project.description}
          </motion.p>

          <motion.div {...fade(0.32)} className="mt-6">
            <p className="text-honey text-xs tracking-widest uppercase font-semibold mb-2">Tools</p>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool) => (
                <span key={tool} className="rounded-full border border-ink/15 bg-sun-top px-3 py-1 text-xs font-medium text-ink">
                  {tool}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(0.36)} className="mt-6">
            <p className="text-honey text-xs tracking-widest uppercase font-semibold mb-2">Results</p>
            <ul className="space-y-1.5">
              {resultsOf(project).map((r) => (
                <li key={r} className="flex gap-2 text-sm text-body">
                  <span className="text-honey">✦</span>
                  {r}
                </li>
              ))}
            </ul>
          </motion.div>

          {project.images.length > 1 && (
            <motion.div {...fade(0.4)} className="mt-6">
              <p className="text-honey text-xs tracking-widest uppercase font-semibold mb-2">More from this project</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {project.images.map((img, i) => (
                  <button
                    key={img.full}
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-label={`Show ${img.alt}`}
                    aria-pressed={i === selected}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 ${i === selected ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={img.thumb} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <motion.button
          ref={closeRef}
          {...fade(0.1)}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          whileTap={{ scale: 0.92 }}
          className="glass-chip absolute z-20 top-5 right-5 grid place-items-center w-11 h-11 rounded-full text-ink"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
