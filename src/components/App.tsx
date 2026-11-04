"use client";
import { haptic } from "@/lib/haptics";
import { Component, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { Splash, Welcome, SignUp, LogIn, EmailStep, SignedIn, TourAsk, Onboarding, StartChoice } from "@/screens/auth";
import { Prefs, Method, NameBody, BaseMeasures, MeasureBase, ScanPrep, ScanCam, Preview, EditMeasures, Ready } from "@/screens/setup";
import { Wizard, WizardStep, GroupDone, AllDone } from "@/screens/wizard";
import { Home, PatternView } from "@/screens/home";
import { Bodies, BodyPage } from "@/screens/bodies";
import { Patterns } from "@/screens/library";
import { You, ProfileEdit, Info } from "@/screens/profile";
import { PatSelectBody, AIRead, Generating, Garment, Edits } from "@/screens/pattern";
import { Prompt } from "@/screens/studio";
import { Templates, TemplateDetail, TplBody, TplFit, TplResult } from "@/screens/templates";
import { Seam, Arrange, PrintMethod, PrintReady, MiniMap } from "@/screens/print";
import { Printed } from "@/screens/printed";
import { About, Credits } from "@/screens/about";
import dynamic from "next/dynamic";
import { Pill, cx } from "./ui";
import { InstallGuide, useAppIconLinks } from "./Install";
import { preloadLater } from "@/lib/preload";
import { Sidebar } from "./Sidebar";
import { PhoneFrame } from "./PhoneFrame";
import { isFramed, isPhone, isStandalone } from "@/lib/device";

// Screens shown full-bleed on desktop (no sidebar)
const FULL = new Set(["splash", "welcome", "signup", "login", "email", "signedin", "tourAsk", "onboarding", "start", "scanCam"]);
import { Icon } from "./icons";
// Natalia's business cards: the 3D and the card maker load only when the screen is opened (the page's dark meanwhile)
const Cards = dynamic(() => import("@/screens/cards").then((m) => m.Cards), { ssr: false, loading: () => <div className="absolute inset-0 bg-bg" /> });

type ScreenC = ComponentType<{ p?: Record<string, unknown> }>;
const SCREENS: Record<string, ScreenC> = {
  splash: Splash, welcome: Welcome, signup: SignUp, login: LogIn, email: EmailStep, signedin: SignedIn, tourAsk: TourAsk, onboarding: Onboarding, start: StartChoice,
  prefs: Prefs, name: NameBody, method: Method, measure: MeasureBase, base: BaseMeasures,
  scanPrep: ScanPrep, scanCam: ScanCam, preview: Preview, edit: EditMeasures, ready: Ready,
  wizard: Wizard, wstep: WizardStep, wdone: GroupDone, alldone: AllDone,
  home: Home, bodies: Bodies, bodyPage: BodyPage, patterns: Patterns, you: You, profileEdit: ProfileEdit, info: Info, pattern: PatternView,
  patSelectBody: PatSelectBody, prompt: Prompt, ref: AIRead, ai: AIRead, generating: Generating, garment: Garment, edits: Edits,
  templates: Templates, template: TemplateDetail, tplBody: TplBody, tplFit: TplFit, tplResult: TplResult,
  install: InstallGuide,
  seam: Seam, arrange: Arrange, printMethod: PrintMethod, print: PrintReady, minimap: MiniMap, printed: Printed,
  about: About, credits: Credits, cards: Cards,
};

// If any screen throws, never show a broken page: offer a way home.
class Guard extends Component<{ children: ReactNode; k: string }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidUpdate(prev: { k: string }) { if (prev.k !== this.props.k && this.state.err) this.setState({ err: false }); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div className="h1">Oops, a loose thread.</div>
        <p className="mt-2 text-[15px] text-white/60">Let’s pick up from home.</p>
        <Pill className="mt-6" onClick={() => { this.setState({ err: false }); useApp.getState().home(); }}>Go to home</Pill>
      </div>
    );
  }
}

function StatusBar() {
  const [t, setT] = useState("9:41");
  useEffect(() => { const f = () => { const d = new Date(); setT(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`); }; f(); const i = setInterval(f, 30000); return () => clearInterval(i); }, []);
  return (
    <div className="fakestatus pointer-events-none absolute inset-x-0 top-0 z-[60] hidden h-[50px] items-center justify-between px-8 pt-1 text-[15px] font-semibold">
      <span>{t}</span>
      <span className="absolute left-1/2 top-[11px] h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12"><rect x=".5" y=".5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="16" height="8" rx="1.8" fill="currentColor" /><rect x="21.5" y="4" width="1.5" height="4" rx=".7" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  );
}

// light screens: the colour at their top (Safari's bar follows it) and at their bottom
const LIGHT_TOP: Record<string, string> = { home: "#f0f4fe", you: "#f0f4fe", prompt: "#f0f4fe", generating: "#f0f4fe", start: "#f3f1ec", install: "#eff4ff", printed: "#f3f1ec" };
// splash, welcome and "Welcome, Ana" share one sky, so they cross-fade in place instead of sliding
const SKY = new Set(["splash", "welcome", "signedin"]);
// the tab bar's pages: from one to another they cross-fade in place (no slide), so the bar holds still and the current
// tab's circle glides to the next tab, like a native tab bar
const TAB_PAGES = new Set(["home", "bodies", "patterns", "you"]);
const CROWN_TOP = new Set(["splash", "welcome", "ready"]);
// the onboarding's photographs under their shade at the top (31 Oct 2026): the three tops average this
const ONBOARDING_TOP = "#6e7383";
// "Welcome, Ana" is on Haze (26 Oct 2026): its colour at the top and at the bottom
const HAZE_TOP = "#96a7f9", HAZE_BOTTOM = "#7086ec";
// before the screen paints (a layout effect), so Safari's bars never show the colour of the screen before; and kept
// (venty-tint) so a reload starts in it too (FRAME_BOOT, lib/device.ts)
function useStatusTint(id: string) {
  useLayoutEffect(() => {
    const desk = window.matchMedia("(min-width: 1024px)").matches;
    const color = desk ? "#0b0c15" : LIGHT_TOP[id] ?? (id === "signedin" ? HAZE_TOP : CROWN_TOP.has(id) ? "#a7b1d3" : id === "onboarding" ? ONBOARDING_TOP : id === "tourAsk" ? "#4a525d" : "#0b0c15");
    let m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.content = color;
    const PAPER = new Set(["onboarding", "start", "ready", "printed"]), CLOUD = new Set(["install"]);
    // On a short iOS 26 window (html.vp-short) the strip under the app shows this colour (flat colours only, gradients are
    // ignored), so it matches each screen's bottom: paper, the sky's blue floor (.sky-floor), or the dark page.
    // Tab screens in the home-screen app: the bar is docked, so the strip continues the bar's own bottom colour.
    const TABS = new Set(["home", "bodies", "patterns", "you"]);
    const pwa = document.documentElement.classList.contains("pwa");
    const bottom = pwa && TABS.has(id) ? "#f0f4fe" : id === "prompt" || id === "generating" ? LIGHT_TOP.prompt : PAPER.has(id) ? "#f3f1ec" : CLOUD.has(id) ? "#eff4ff" : id === "tourAsk" ? "#636e7b" : id === "signedin" ? HAZE_BOTTOM : SKY.has(id) ? "#262c5e" : "#0b0c15";
    // Safari 26 (theme-color is ignored) paints its status bar from this colour, since .device has none of its own
    // (see globals.css): in Safari it is each screen's top colour, so the bar runs on from the screen as if see-through.
    // The home-screen app has a see-through status bar already, so there it keeps the bottom strip's colour.
    const fill = pwa ? bottom : color;
    document.documentElement.style.background = fill; document.body.style.background = fill;
    try { localStorage.setItem("venty-tint", fill); } catch {}
    const t = setTimeout(() => document.querySelector(".device")?.setAttribute("data-top", id in LIGHT_TOP ? "light" : "dark"), 0);
    return () => clearTimeout(t);
  }, [id]);
}

// Links that open a screen (app.venty.au/install: Add Venty to your home screen). The screen goes on top of wherever you
// were, so leaving it takes you back there (on a first visit, to the splash and the intro), and the address goes back to
// "/" so a reload, or the app added to the home screen, starts as usual. A phone-only screen opens only on a phone's
// browser (a real phone, told by the device itself, lib/device.ts, never by the window's width); on a tablet or a
// computer (where the app runs inside the phone frame), or inside the home-screen app, the link simply opens Venty.
const LINKS: Record<string, { id: string; phoneOnly?: boolean }> = { "/install": { id: "install", phoneOnly: true } };
const onPhoneBrowser = () => isPhone() && !isStandalone();
function openFromLink() {
  const link = LINKS[location.pathname.replace(/\/+$/, "")];
  if (!link) return;
  history.replaceState(history.state, "", "/" + location.search);
  if (link.phoneOnly && !onPhoneBrowser()) return;
  const s = useApp.getState();
  if (s.stack[s.stack.length - 1]?.id !== link.id) s.go(link.id, { from: "link" });
}

// how the screens change: forwards or back, in place (a tab switch), or at once (the browser has shown it)
type Move = { dir: number; still: boolean; instant: boolean };

// On a tablet or a computer the page shows the app on a phone (PhoneFrame: the app runs in a frame inside it); anywhere
// else, the app itself. Read from the page (set before the app starts, lib/device.ts); the server draws neither.
const noSub = () => () => {};
export default function App() {
  const mode = useSyncExternalStore(noSub, () => (isFramed() ? "frame" : "app"), () => null);
  if (mode === "frame") return <PhoneFrame />;
  if (mode === "app") return <VentyApp />;
  return <div className="stage"><div className="device" /></div>;
}

function VentyApp() {
  const [ready, setReady] = useState(false);
  const stack = useApp((s) => s.stack);
  const dir = useApp((s) => s.dir);
  const kiosk = useApp((s) => s.kiosk);
  const top = stack[stack.length - 1] ?? { id: "home" };
  const S = SCREENS[top.id] ?? Home;
  useStatusTint(top.id);
  useAppIconLinks();
  // the pictures further in, fetched once the app is idle (the splash fetches the first screens' own)
  useEffect(() => { preloadLater(); }, []);
  // Each screen keeps where it was scrolled to (by its depth, id and details): taken as it leaves, given back when it is
  // shown again (back, a swipe back, or a tab you return to); a screen closed (the stack shorter) forgets it
  const scrollKey = `${stack.length}:${top.id}:${JSON.stringify(top.p ?? {})}`;
  const scrolls = useRef(new Map<string, number[]>());
  useLayoutEffect(() => {
    const k = scrollKey, depth = stack.length, kept = scrolls.current; // one map for the app's life
    for (const key of kept.keys()) if (Number(key.split(":")[0]) > depth) kept.delete(key);
    const areas = () => Array.from(document.querySelectorAll<HTMLElement>(`[data-k="${CSS.escape(k)}"] :is(.scroller, .overflow-y-auto)`));
    const was = kept.get(k);
    let raf = 0;
    if (was) {
      // again for a few frames, as a screen's content can still be growing
      let n = 0;
      const put = () => { areas().forEach((el, i) => { if (was[i]) el.scrollTop = was[i]; }); if (++n < 4) raf = requestAnimationFrame(put); };
      put();
    }
    return () => { cancelAnimationFrame(raf); const tops = areas().map((el) => el.scrollTop); if (tops.some((t) => t > 0)) kept.set(k, tops); else kept.delete(k); };
  }, [scrollKey]); // eslint-disable-line react-hooks/exhaustive-deps
  // the browser's history kept in step with the screens (below): how deep it is, and its own moves still to come back
  const hist = useRef({ depth: 0, ignore: 0, until: 0 });
  // a move the browser has already shown (the iPhone's swipe from the left edge, Android's back): no slide of our own
  const [instant, setInstant] = useState(false);
  useEffect(() => { if (!instant) return; const t = setTimeout(() => setInstant(false), 60); return () => clearTimeout(t); }, [instant]);
  // the page shown before this one, to tell a switch between tabs from any other move
  const [shown, setShown] = useState(top.id);
  const [from, setFrom] = useState(top.id);
  if (shown !== top.id) { setFrom(shown); setShown(top.id); }
  const tabSwap = TAB_PAGES.has(top.id) && TAB_PAGES.has(from);
  const [resetAsk, setResetAsk] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);

  // the boot's colour (html.booting, lib/device.ts) gives way once the app has drawn its screen
  useEffect(() => { if (ready) document.documentElement.classList.remove("booting"); }, [ready]);
  // wait for localStorage rehydration to avoid flashes / mismatches
  useEffect(() => {
    const done = () => { openFromLink(); setReady(true); };
    if (useApp.persist.hasHydrated()) done();
    const unsub = useApp.persist.onFinishHydration(done);
    const t = setTimeout(done, 600);
    return () => { unsub(); clearTimeout(t); };
  }, []);

  // Back with the browser (4 Nov 2026): the history has one entry per screen, each knowing how deep it is (state.venty), so
  // the browser's back (the iPhone's swipe from the left edge, Android's back button) lands on exactly the screen before,
  // and the app does not slide a second time over the browser's own move (instant). A screen opened adds entries; the
  // app's own back (and Home, Log out, Reset) steps the history back the same way, its moves not taken for the user's.
  useEffect(() => {
    if (!ready) return;
    const h = hist.current, len = stack.length;
    if (!h.depth) { h.depth = len; try { history.replaceState({ ...(history.state ?? {}), venty: len }, ""); } catch {} return; }
    if (len > h.depth) { for (let d = h.depth + 1; d <= len; d++) { try { history.pushState({ venty: d }, ""); } catch {} } }
    else if (len < h.depth) { h.ignore++; h.until = Date.now() + 1500; try { history.go(len - h.depth); } catch { h.ignore--; } }
    h.depth = len;
  }, [stack.length, ready]);
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const h = hist.current;
      if (h.ignore > 0 && Date.now() < h.until) { h.ignore--; return; }
      h.ignore = 0;
      const s = useApp.getState(), at = Math.max(1, Number((e.state as { venty?: number } | null)?.venty) || 1);
      if (at < s.stack.length) { h.depth = at; setInstant(true); useApp.setState({ stack: s.stack.slice(0, at), dir: -1 }); }
      // forward (a swipe from the right edge): that screen is gone, so the history steps back to where the app is
      else if (at > s.stack.length) { h.ignore++; h.until = Date.now() + 1500; try { history.go(s.stack.length - at); } catch { h.ignore--; } }
    };
    window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop);
  }, []);

  // expo mode: reset after 2 minutes idle
  useEffect(() => {
    if (!kiosk) return;
    let t: ReturnType<typeof setTimeout>;
    const arm = () => { clearTimeout(t); t = setTimeout(() => { const s = useApp.getState(); if (s.stack[s.stack.length - 1]?.id !== "splash") s.reset(); }, 120000); };
    const ev = ["pointerdown", "keydown", "wheel", "touchstart"]; ev.forEach((e) => window.addEventListener(e, arm, { passive: true })); arm();
    return () => { clearTimeout(t); ev.forEach((e) => window.removeEventListener(e, arm)); };
  }, [kiosk]);

  // service worker for offline use
  // haptic tick on every button press (Android vibrates; iPhone gets the system switch tick)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("button, [role=button], a, [role=switch], [role=tab]");
      if (!el || (el as HTMLButtonElement).disabled) return;
      haptic(el.matches(".chip, [role=switch], [role=tab]") ? "select" : "tap");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  useEffect(() => { if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);

  return (
    <div className="stage">
      <div className="device">
        <StatusBar />
        <div className="flex h-full">
        {ready && !FULL.has(top.id) && <Sidebar route={top.id} />}
        <div className={cx("relative h-full flex-1 overflow-hidden")}>
        {ready && (
          <AnimatePresence initial={false} custom={{ dir, still: tabSwap, instant }} mode="popLayout">
            <motion.div key={top.id + ":" + stack.length + ":" + JSON.stringify(top.p ?? {})} data-k={scrollKey} custom={{ dir, still: tabSwap, instant }} className="absolute inset-0"
              variants={{
                // instant: the browser has already shown the move (a swipe back), so the screens change at once
                enter: (c: Move) => (c.instant ? { x: 0, opacity: 1 } : { x: SKY.has(top.id) || c.still ? 0 : c.dir > 0 ? 60 : -60, opacity: 0 }),
                shown: (c: Move) => ({ x: 0, opacity: 1, transition: c.instant ? { duration: 0 } : { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } }),
                // the leaving page reads the move from AnimatePresence's custom, so a tab switch leaves in place too
                gone: (c: Move) => (c.instant ? { opacity: 0, transition: { duration: 0 } } : { x: SKY.has(top.id) || c.still ? 0 : c.dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } }),
              }}
              initial="enter" animate="shown" exit="gone">
              <Guard k={top.id + stack.length}><S p={top.p} /></Guard>
            </motion.div>
          </AnimatePresence>
        )}
        </div>
        </div>
        {/* hidden reset: press and hold the top-left corner for 2 s */}
        <div className="absolute left-0 top-0 z-[70] h-11 w-11" onPointerDown={() => { hold.current = setTimeout(() => setResetAsk(true), 2000); }} onPointerUp={() => hold.current && clearTimeout(hold.current)} onPointerLeave={() => hold.current && clearTimeout(hold.current)} />
        <AnimatePresence>{resetAsk && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 px-8 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[28px] border border-white/15 bg-card p-6 text-center">
              <Icon name="refresh" size={28} className="mx-auto" />
              <div className="mt-3 text-[20px] font-semibold">Reset for the next visitor?</div>
              <Pill className="mt-5" onClick={() => { setResetAsk(false); useApp.getState().reset(); }}>Reset Venty</Pill>
              <Pill variant="dark" className="mt-2" onClick={() => setResetAsk(false)}>Cancel</Pill>
            </div>
          </motion.div>)}</AnimatePresence>
      </div>
    </div>
  );
}
