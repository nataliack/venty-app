// Images fetched before they are needed (31 Oct 2026, Jose). The splash waits for FIRST, the pictures of the screens a
// first visit goes through (sign-up's looks, the tour question, the onboarding, Start), so none of them appears late;
// its bar shows how far that has got. LATER, the pictures further in, are fetched once the app is idle. The service
// worker keeps whatever is fetched, so the next visit has them at once. Plain TypeScript, no imports.

export type Pic = { src: string; srcSet?: string; sizes?: string };

// sign-up and log-in: the arc of looks (four looks and four details, alternating)
export const LOOKS = [
  "/auth/look-street-green.webp",
  "/auth/detail-zip.webp",
  "/auth/look-limo-mauve.webp",
  "/auth/detail-corset.webp",
  "/auth/look-cliff-rust.webp",
  "/auth/detail-hems.webp",
  "/auth/look-street-burgundy.webp",
  "/auth/detail-bows.webp",
];
// the tour question's meadow
export const TOUR: Pic = { src: "/tour/meadow.webp", srcSet: "/tour/meadow-640.webp 640w, /tour/meadow.webp 1080w", sizes: "100vw" };
// the onboarding's three pictures: 1200 wide for a phone (393 pt at 3x), the full 1792 for the computer's panel
export const ONBOARDING: Pic[] = [1, 2, 3].map((n) => ({
  src: `/onboarding/slide-${n}.webp`,
  srcSet: `/onboarding/slide-${n}-1200.webp 1200w, /onboarding/slide-${n}.webp 1792w`,
  sizes: "(min-width: 1024px) 55vw, 100vw",
}));
// Start's mannequin
export const START: Pic = { src: "/start/mannequin.webp", srcSet: "/start/mannequin-1100.webp 1100w, /start/mannequin.webp 2000w", sizes: "(min-width: 1024px) 960px, 180vw" };

export const FIRST: Pic[] = [...LOOKS.map((src) => ({ src })), TOUR, ...ONBOARDING, START];
// further in: the body setup's forms and the body pictures
export const LATER: Pic[] = ["/forms/female.webp", "/forms/male.webp", ...[1, 2, 3].flatMap((n) => [`/bodies/female-${n}.webp`, `/bodies/male-${n}.webp`])].map((src) => ({ src }));

// one picture: an off-screen image with the same srcset and sizes as the screen's, so the browser picks (and keeps) the
// same file the screen will ask for; done once it is decoded, or failed (a missing picture never holds anything up)
const seen = new Map<string, Promise<void>>();
const held: HTMLImageElement[] = []; // kept, so the browser keeps them decoded
function load(p: Pic): Promise<void> {
  const key = p.srcSet ?? p.src;
  const had = seen.get(key);
  if (had) return had;
  const img = new Image();
  img.decoding = "async";
  if (p.sizes) img.sizes = p.sizes;
  if (p.srcSet) img.srcset = p.srcSet;
  img.src = p.src;
  held.push(img);
  const done = (img.decode ? img.decode() : new Promise<void>((ok, no) => { img.onload = () => ok(); img.onerror = no; })).catch(() => {});
  seen.set(key, done);
  return done;
}

// all of a list, telling how far it has got (0 to 1) as each picture is done
export function preload(list: Pic[], progress?: (k: number) => void): Promise<void> {
  if (typeof window === "undefined" || !list.length) { progress?.(1); return Promise.resolve(); }
  let n = 0;
  return Promise.all(list.map((p) => load(p).then(() => progress?.(++n / list.length)))).then(() => {});
}

// the rest, when the app has nothing else to do
export function preloadLater() {
  if (typeof window === "undefined") return;
  const go = () => { preload(LATER); };
  const idle = (window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(go, { timeout: 4000 }); else setTimeout(go, 2500);
}
