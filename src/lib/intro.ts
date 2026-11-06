import { createContext, useContext } from "react";

/**
 * loading   → preloader is drawing the monogram (page locked)
 * revealing → curtain is lifting; hero animations may start
 * done      → preloader removed
 */
export type IntroPhase = "loading" | "revealing" | "done";

export const IntroContext = createContext<IntroPhase>("done");

export const useIntroPhase = () => useContext(IntroContext);
export const useIntroReady = () => useContext(IntroContext) !== "loading";
