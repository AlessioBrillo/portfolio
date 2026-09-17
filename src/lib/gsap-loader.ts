/**
 * GSAP + ScrollTrigger dynamic loader.
 *
 * Separated into its own module so Vite creates a dedicated chunk
 * (`gsap-engine-[hash].js`) that is only loaded when the tonal engine
 * initialises — not in the entry chunk.
 *
 * Includes a single retry on chunk load failure to mitigate transient
 * network errors. If both attempts fail, the error propagates to the
 * tonal engine which falls back to the static gradient.
 *
 * Each attempt is bounded by an abort timeout to prevent indefinite
 * hangs on network partitions — a hung chunk load would leave the
 * tonal engine uninitialized and text illegible on dark backdrop.
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
  const MAX_RETRIES = 1;
  const RETRY_DELAY_MS = 500;
  const LOAD_TIMEOUT_MS = 10000;

  async function attemptLoad(attempt: number): Promise<{
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);

    try {
      const [gsapMod, stMod] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
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
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`GSAP chunk load timed out after ${LOAD_TIMEOUT_MS}ms`, { cause: error });
      }
      if (attempt < MAX_RETRIES) {
        console.warn(
          `GSAP chunk load failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return attemptLoad(attempt + 1);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return attemptLoad(0);
}
