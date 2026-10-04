"use client";
import { haptic } from "@/lib/haptics";
import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { Splash, Welcome, SignUp, LogIn, EmailStep, SignedIn, TourAsk, Onboarding, StartChoice } from "@/screens/auth";
import { Prefs, Method, NameBody, BaseMeasures, MeasureBase, ScanPrep, ScanCam, Preview, EditMeasures, Ready } from "@/screens/setup";
import { Wizard, WizardStep, GroupDone, AllDone } from "@/screens/wizard";
import { Home, Bodies, Patterns, You, PatternView } from "@/screens/home";
import { PatSelectBody, Prompt, AIRead, Generating, Garment, Edits } from "@/screens/pattern";
import { Templates, TemplateDetail, TplBody, TplFit, TplResult } from "@/screens/templates";
import { Seam, Arrange, PrintMethod, Needs, PrintReady, MiniMap, Printed } from "@/screens/print";
import { Pill, cx } from "./ui";
import { Sidebar } from "./Sidebar";

// Screens shown full-bleed on desktop (no sidebar)
const FULL = new Set(["splash", "welcome", "signup", "login", "email", "signedin", "tourAsk", "onboarding", "start", "scanCam"]);
import { Icon } from "./icons";

type ScreenC = ComponentType<{ p?: Record<string, unknown> }>;
const SCREENS: Record<string, ScreenC> = {
  splash: Splash, welcome: Welcome, signup: SignUp, login: LogIn, email: EmailStep, signedin: SignedIn, tourAsk: TourAsk, onboarding: Onboarding, start: StartChoice,
  prefs: Prefs, name: NameBody, method: Method, measure: MeasureBase, base: BaseMeasures,
  scanPrep: ScanPrep, scanCam: ScanCam, preview: Preview, edit: EditMeasures, ready: Ready,
  wizard: Wizard, wstep: WizardStep, wdone: GroupDone, alldone: AllDone,
  home: Home, bodies: Bodies, patterns: Patterns, you: You, pattern: PatternView,
  patSelectBody: PatSelectBody, prompt: Prompt, ref: AIRead, ai: AIRead, generating: Generating, garment: Garment, edits: Edits,
  templates: Templates, template: TemplateDetail, tplBody: TplBody, tplFit: TplFit, tplResult: TplResult,
  seam: Seam, arrange: Arrange, printMethod: PrintMethod, needs: Needs, print: PrintReady, minimap: MiniMap, printed: Printed,
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
        <svg width="18" height="11" viewBox="0 0 18 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12"><rect x=".5" y=".5" width="20" height="11" rx="3" fill="none" stroke="#fff" opacity=".5" /><rect x="2" y="2" width="16" height="8" rx="1.8" fill="#fff" /><rect x="21.5" y="4" width="1.5" height="4" rx=".7" fill="#fff" opacity=".5" /></svg>
      </span>
    </div>
  );
}

const LIGHT_TOP = new Set(["home"]);
const CROWN_TOP = new Set(["welcome", "tourAsk", "onboarding", "start", "ready", "printed"]);
function useStatusTint(id: string) {
  useEffect(() => {
    const desk = window.matchMedia("(min-width: 1024px)").matches;
    const color = desk ? "#0b0c15" : LIGHT_TOP.has(id) ? "#f6f7fd" : CROWN_TOP.has(id) ? "#a7b1d3" : "#0b0c15";
    let m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.content = color;
    const t = setTimeout(() => document.querySelector(".device")?.setAttribute("data-top", LIGHT_TOP.has(id) ? "light" : "dark"), 0);
    return () => clearTimeout(t);
  }, [id]);
}

// TEMPORARY: measures the real viewport in the home-screen app (html.pwa only). Remove after the layout fix.
function PwaProbe() {
  const [info, setInfo] = useState("");
  useEffect(() => {
    if (!document.documentElement.classList.contains("pwa")) return;
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:0;right:0;bottom:0;height:env(safe-area-inset-bottom);top:auto;pointer-events:none";
    document.body.appendChild(probe);
    const f = () => {
      const dev = document.querySelector(".device")?.getBoundingClientRect();
      setInfo(`inner ${innerWidth}x${innerHeight} · screen ${screen.width}x${screen.height} · vv ${Math.round(visualViewport?.height ?? 0)} · client ${document.documentElement.clientHeight} · safeB ${Math.round(probe.getBoundingClientRect().height)} · device ${Math.round(dev?.top ?? -1)}→${Math.round(dev?.bottom ?? -1)} · appH ${getComputedStyle(document.documentElement).getPropertyValue("--app-h")}`);
    };
    f(); const t = setInterval(f, 1000); return () => { clearInterval(t); probe.remove(); };
  }, []);
  if (!info) return null;
  return (<>
    <div className="pointer-events-none fixed left-2 right-2 top-[60px] z-[999] rounded bg-black/80 p-2 text-[11px] leading-tight text-lime-300">{info}</div>
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[999] h-[3px] bg-red-500" />
  </>);
}

export default function App() {
  const [ready, setReady] = useState(false);
  const stack = useApp((s) => s.stack);
  const dir = useApp((s) => s.dir);
  const kiosk = useApp((s) => s.kiosk);
  const top = stack[stack.length - 1] ?? { id: "home" };
  const S = SCREENS[top.id] ?? Home;
  useStatusTint(top.id);
  const depth = useRef(stack.length);
  const [resetAsk, setResetAsk] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);

  // wait for localStorage rehydration to avoid flashes / mismatches
  useEffect(() => {
    const done = () => setReady(true);
    if (useApp.persist.hasHydrated()) done();
    const unsub = useApp.persist.onFinishHydration(done);
    const t = setTimeout(done, 600);
    return () => { unsub(); clearTimeout(t); };
  }, []);

  // browser / Android back button → in-app back
  useEffect(() => {
    if (!ready) return;
    if (stack.length > depth.current) { try { history.pushState({ v: stack.length }, ""); } catch {} }
    depth.current = stack.length;
  }, [stack.length, ready]);
  useEffect(() => {
    const onPop = () => { const s = useApp.getState(); if (s.stack.length > 1) { depth.current = s.stack.length - 1; s.back(); } };
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
      <PwaProbe />
      <div className="device">
        <StatusBar />
        <div className="flex h-full">
        {ready && !FULL.has(top.id) && <Sidebar route={top.id} />}
        <div className={cx("relative h-full flex-1 overflow-hidden")}>
        {ready && (
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div key={top.id + ":" + stack.length + ":" + JSON.stringify(top.p ?? {})} custom={dir} className="absolute inset-0"
              initial={{ x: dir > 0 ? 60 : -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: dir > 0 ? -60 : 60, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}>
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
            <div className="w-full max-w-sm rounded-[28px] border border-white/15 bg-[#161826] p-6 text-center">
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
