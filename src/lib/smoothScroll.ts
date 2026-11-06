import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let instance: Lenis | null = null;
const tick = (time: number) => instance?.raf(time * 1000);

export const getLenis = () => instance;

/** Create Lenis and drive it from GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll() {
  if (instance) return instance;
  instance = new Lenis({
    lerp: 0.1,
    anchors: { offset: -72 }, // nav links glide to sections (offset ≈ nav height)
  });
  instance.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return instance;
}

export function destroySmoothScroll() {
  if (!instance) return;
  gsap.ticker.remove(tick);
  instance.destroy();
  instance = null;
}

export { gsap, ScrollTrigger };
