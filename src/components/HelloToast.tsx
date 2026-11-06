import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CUTE, EASE, t } from "@/config/motion";

/** A tiny “hello ✿” that greets the visitor right after the preloader, then fades away. */
export default function HelloToast({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    const inT = setTimeout(() => setVisible(true), CUTE.helloDelay * 1000);
    const outT = setTimeout(() => setVisible(false), (CUTE.helloDelay + CUTE.helloHold) * 1000);
    return () => {
      clearTimeout(inT);
      clearTimeout(outT);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: t(0.6), ease: EASE }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
        >
          <span className="glass-chip block rounded-full px-4 py-1.5 font-serif italic text-sm text-ink">hello ✿</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
