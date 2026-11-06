import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Subscribe to a CSS media query. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** True on devices with a precise hovering pointer (desktop mouse/trackpad). */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** Heavy, pointer-driven effects: desktop pointer AND no reduced-motion preference. */
export function useRichMotion() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return fine && !reduced;
}
