import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** placeholder classes until mounted — give it the section's real (responsive) height so anchors & scroll positions stay stable */
  placeholderClassName: string;
  /** start loading this far before the section reaches the viewport */
  rootMargin?: string;
  /** anchor id kept on the wrapper so nav links work before the section loads */
  id?: string;
};

/**
 * Mounts heavy, below-the-fold children when the browser is idle or when the
 * placeholder gets near the viewport — whichever comes first.
 */
export default function LazyMount({ children, placeholderClassName, rootMargin = "800px", id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setMounted(true), { rootMargin });
    if (el) io.observe(el);
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(() => setMounted(true), { timeout: 4000 }) : setTimeout(() => setMounted(true), 2500);
    return () => {
      io.disconnect();
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle);
    };
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} id={mounted ? undefined : id} className={mounted ? undefined : placeholderClassName}>
      {mounted ? children : null}
    </div>
  );
}
