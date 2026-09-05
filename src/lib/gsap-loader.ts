/**
 * GSAP + ScrollTrigger dynamic loader.
 *
 * Separated into its own module so Vite creates a dedicated chunk
 * (`gsap-engine-[hash].js`) that is only loaded when the tonal engine
 * initialises — not in the entry chunk.
 */
export async function loadGsap(): Promise<{
  gsap: {
    registerPlugin: (plugin: unknown) => void;
    context: (fn: () => void, el: Element) => { revert: () => void };
    fromTo: (el: Element, from: object, to: object) => { scrollTrigger: unknown };
    set: (el: Element, vars: object) => void;
  };
  ScrollTrigger: {
    refresh: () => void;
    getAll: () => Array<{ kill: () => void }>;
    create: (options: unknown) => void;
  };
}> {
  const [gsapMod, stMod] = await Promise.all([
    import('gsap' /* @vite-ignore */),
    import('gsap/ScrollTrigger' /* @vite-ignore */),
  ]);
  const gsap = (gsapMod.default ?? gsapMod) as {
    registerPlugin: (plugin: unknown) => void;
    context: (fn: () => void, el: Element) => { revert: () => void };
    fromTo: (el: Element, from: object, to: object) => { scrollTrigger: unknown };
    set: (el: Element, vars: object) => void;
  };
  const ScrollTrigger = (stMod.default ?? stMod) as {
    refresh: () => void;
    getAll: () => Array<{ kill: () => void }>;
    create: (options: unknown) => void;
  };
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
