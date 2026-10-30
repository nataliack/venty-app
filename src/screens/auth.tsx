"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, DEMO_EMAIL } from "@/lib/store";
import { Screen, Pill, Field, HS, Lead, Glow, RB, TextButton, TopAction, Crown, cx, useDesk } from "@/components/ui";
import { VentyLogo, BodyFigure, Piece } from "@/components/art";
import { FIRST, LOOKS, ONBOARDING, START, TOUR, preload } from "@/lib/preload";
import { AppleLogo, GoogleLogo, Icon } from "@/components/icons";

// Splash and "Welcome, Ana": the same logo position as Welcome, so the app opens straight into it. The splash is on
// Crown with a slim loader at the bottom, where Welcome's buttons will appear; "Welcome, Ana" is on Haze (below).
// Since 31 Oct 2026 the splash has a job: while it is up, the pictures of the screens a first visit goes through are
// fetched (FIRST in lib/preload.ts), and its bar shows how far that has got (p, 0 to 1).
let fromSplash = false;
function Loader({ p }: { p: number }) {
  return (
    <div className="flex w-full max-w-[380px] flex-col items-center gap-2 lg:mb-[6dvh]" aria-label="Loading">
      <div className="grid h-14 w-full place-items-center">
        <div className="h-[3px] w-[132px] overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${p * 100}%` }} />
        </div>
      </div>
      <div className="h-11" />
    </div>
  );
}
// "Welcome, Ana" (from the lab, version F, 26 Oct 2026): in the spirit of the landing page's loading screen, in white on
// Haze. Over the heading a tick of light draws itself, foot to tip; at the foot the filament fills, the word for what it
// is doing under its start (Setting up, Saving, Ready, each rising from its mask) and the percentage under its end. The
// line fills in FILL_MS and holds on Ready until the screen moves on (SIGNED_MS).
const FILL_MS = 1400, SIGNED_MS = 2000;
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function useFill(ms: number) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / ms); setP(easeInOut(k)); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ms]);
  return p;
}
const FIL_WORDS = ["Setting up", "Saving", "Ready"];
// the word, rising from its mask as it changes (the last one leaves upward)
function FilRoll({ i }: { i: number }) {
  const [prev, setPrev] = useState(-1);
  const [cur, setCur] = useState(i);
  if (i !== cur) { setPrev(cur); setCur(i); }
  return (
    <p className="fil-roll">{FIL_WORDS.map((t, k) => <span key={t} aria-hidden data-state={k === i ? "in" : k === prev ? "out" : "wait"}>{t}</span>)}</p>
  );
}
function FilamentLoader({ p }: { p: number }) {
  return (
    <div className="flex w-full max-w-[380px] flex-col items-center gap-2 lg:mb-[6dvh]" aria-hidden>
      <div className="grid h-14 w-full place-items-center">
        <div className="flex w-[200px] flex-col gap-2.5 lg:w-[240px]">
          <div className="fil-bar w-full">
            <div className="fil-fill" style={{ width: `${p * 100}%`, opacity: p > 0.005 ? 1 : 0 }}>
              <span className="fil-sweep"><span className="fil-pulse" /></span>
              <span className="fil-head" />
            </div>
          </div>
          <div className="flex items-center justify-between"><FilRoll i={p >= 1 ? 2 : p < 0.5 ? 0 : 1} /><p className="fil-roll">{Math.round(p * 100)}%</p></div>
        </div>
      </div>
      <div className="h-11" />
    </div>
  );
}
// the tick of light: one fine line that draws itself from its foot to its tip (k: 0 to 1)
function TickOfLight({ k, size }: { k: number; size: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} className="fil-glow" aria-hidden>
      <path d="M14 29.5 L24 39 L43 18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
    </svg>
  );
}

// sky: Crown (the splash) or Haze ("Welcome, Ana"); loader: what sits in the foot's slot (the splash's slim bar by default)
function SkyFrame({ children, onTap, logoIn = true, sky = "crown", loader }: { children?: ReactNode; onTap: () => void; logoIn?: boolean; sky?: "crown" | "haze"; loader?: ReactNode }) {
  const desk = useDesk();
  return (
    <button className="absolute inset-0 overflow-hidden text-center" onClick={onTap} aria-label="Continue">
      {sky === "haze" ? <div className="sky sky-haze" aria-hidden><span className="drift d1" /><span className="drift d2" /><span className="drift d3" /><span className="drift d4" /></div> : <Crown live />}
      <div className="sky-floor" aria-hidden />
      <div className="relative flex h-full flex-col items-center px-6 lg:px-16" style={{ paddingTop: "var(--top)", paddingBottom: "var(--bottom)" }}>
        <motion.div initial={logoIn ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} className="mt-[13dvh] lg:mt-[10dvh]">
          <VentyLogo width={desk ? 300 : 190} />
        </motion.div>
        <div className="my-auto flex max-w-[620px] flex-col items-center pt-8">{children}</div>
        {/* the slot Welcome's buttons use */}
        {loader ?? <Loader p={1} />}
      </div>
    </button>
  );
}

// the splash stays at least as long as it always has (the bar's least time, SPLASH_MS), until the first pictures are in,
// and never longer than SPLASH_MAX whatever the network; a tap moves on at once
const SPLASH_MS = 1900, SPLASH_MAX = 6000;
export function Splash() {
  const replace = useApp((s) => s.replace);
  const left = useRef(false);
  const go = () => { if (left.current) return; left.current = true; fromSplash = true; replace("welcome"); };
  const t = useFill(SPLASH_MS); // the least time, as the bar used to fill
  const [loaded, setLoaded] = useState(0);
  useEffect(() => { let on = true; preload(FIRST, (k) => { if (on) setLoaded(k); }); return () => { on = false; }; }, []);
  const p = Math.min(t, loaded), full = p >= 1;
  useEffect(() => { if (!full) return; const id = setTimeout(go, 150); return () => clearTimeout(id); }, [full]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const id = setTimeout(go, SPLASH_MAX); return () => clearTimeout(id); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <SkyFrame onTap={go} loader={<Loader p={p} />} />;
}

// Welcome: the Crown gradient (from the landing page).
const Sky = () => <Crown live />;

const WELCOME_T = <>If you can imagine it,<br />you can wear it.</>;
const WELCOME_B = "Start from a photo, a sketch or a few words. Venty drafts the sewing pattern to your measurements, ready to print at home.";

export function Welcome() {
  const go = useApp((s) => s.go);
  const desk = useDesk();
  const actions = (
    <div className="flex flex-col items-center gap-2">
      <Pill onClick={() => go("signup")}>Get started</Pill>
      <button className="h-11 px-4 text-[16px] font-medium text-white/90 transition-colors hover:text-white" onClick={() => go("login")}>I already have an account</button>
    </div>
  );
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Sky />
      <div className="sky-floor" aria-hidden />
      <div className="relative flex h-full flex-col items-center px-6 text-center lg:px-16" style={{ paddingTop: "var(--top)", paddingBottom: "var(--bottom)" }}>
        <motion.div initial={fromSplash ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} className="mt-[13dvh] lg:mt-[10dvh]">
          <VentyLogo width={desk ? 300 : 190} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8 }} className="my-auto flex max-w-[620px] flex-col items-center pt-8">
          <h2 className="h1 !text-[32px] lg:!text-[56px]">{WELCOME_T}</h2>
          <Lead className="mt-4 max-w-[340px] lg:max-w-[520px]">{WELCOME_B}</Lead>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.55, type: "spring", bounce: 0.25, duration: 0.9 }} className="w-full max-w-[380px] lg:mb-[6dvh]">{actions}</motion.div>
      </div>
    </div>
  );
}

// Desktop: brand panel on the left, the form on the right. Phone: one column, with the ways in (`actions`) at the
// bottom, in thumb reach, above the footer line.
function AuthShell({ children, footer, actions }: { children: ReactNode; footer?: ReactNode; actions?: ReactNode }) {
  const desk = useDesk();
  if (!desk) return <Screen fill footer={actions || footer ? <>{actions}{footer && <div className={actions ? "mt-4" : ""}>{footer}</div>}</> : undefined}>{children}</Screen>;
  if (actions) children = <>{children}<div className="mt-8">{actions}</div></>;
  return (
    <div className="absolute inset-0 grid grid-cols-[1fr_1fr]">
      <div className="p-6">
        <Glow color="#687ef5" variant="fade" className="relative h-full rounded-[36px]">
          <div className="absolute left-10 top-10"><VentyLogo width={96} /></div>
          <div className="absolute inset-0 flex items-center justify-center gap-6"><BodyFigure width={170} garment="flutter" glow={false} /><div className="flex flex-col gap-4"><Piece k="bodiceFront" width={110} label="Bodice front" /><Piece k="skirtFront" width={90} label="Skirt front" /></div></div>
          <div className="absolute bottom-10 left-10 right-10"><div className="h1 !text-[40px]">Your body. Your pattern.</div><div className="mt-2 text-[16px] text-white/70">Sewing patterns drafted to your exact measurements.</div></div>
        </Glow>
      </div>
      <div className="relative overflow-y-auto noscroll">
        <div className="dotgrid" />
        <div className="mx-auto flex min-h-full max-w-[440px] flex-col justify-center py-10">{children}{footer && <div className="mt-8">{footer}</div>}</div>
      </div>
    </div>
  );
}

function useAuthDone() {
  const set = useApp((s) => s.set);
  const replace = useApp((s) => s.replace);
  return (name: string, email: string, guest = false) => {
    const clean = (name || email.split("@")[0] || "Ana").trim();
    const nice = clean.charAt(0).toUpperCase() + clean.slice(1);
    set({ user: { name: guest ? "there" : nice.split(/[\s._-]/)[0] || "Ana", email, guest } });
    replace(guest ? "tourAsk" : "signedin");
  };
}

// The heading and its line: on phones centred in the room above the ways in, like a title card; on a computer, on
// top of the form column.
// On phones the arc of looks sits above it, and the group is centred in the room above the ways in, with clear air
// before the first button.
const Hero = ({ title, lead }: { title: ReactNode; lead: string }) => (
  <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-2 text-center lg:block lg:pb-0 lg:pt-0 lg:text-left">
    <ArcCarousel />
    <HS className="mt-9 [text-wrap:balance] lg:mt-6">{title}</HS>
    <Lead className="mt-4 max-w-[330px] [text-wrap:balance] lg:max-w-none">{lead}</Lead>
  </div>
);

// ─── The arc of looks: garments and their patterns on cards along a gentle arch, drifting right to left forever ───
// Four editorial looks and four close-ups of their sewing details (all generated with Higgsfield from the designer's
// prompts, one campaign), alternating: a garment, then the craft in it.
const CARD_W = 100, CARD_H = 134, GAP = 12;
export function ArcCarousel() {
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = CARD_W + GAP, loop = LOOKS.length * step;
    let off = 0, last = 0, raf = 0;
    // each card's place on the arch: lower and turned outwards towards the ends, a touch smaller, as if on a curve
    const place = () => {
      const W = el.clientWidth, cx = W / 2, reach = W / 2 + step;
      cards.current.forEach((c, i) => {
        if (!c) return;
        const x = (((i * step - off) % loop) + loop) % loop - step; // wraps off screen on the left
        const d = Math.max(-1.4, Math.min(1.4, (x + CARD_W / 2 - cx) / reach));
        c.style.transform = `translate3d(${x}px, ${40 * d * d}px, 0) rotate(${d * 12}deg) scale(${1 - 0.07 * d * d})`;
      });
    };
    const tick = (t: number) => { if (last) off += Math.min(64, t - last) * 0.03; last = t; place(); raf = requestAnimationFrame(tick); };
    place();
    if (!still) raf = requestAnimationFrame(tick);
    window.addEventListener("resize", place);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", place); };
  }, []);
  return (
    // full bleed: it runs past the page margins to the screen edges, fading out softly at both sides
    <div ref={box} aria-hidden className="relative -mx-6 w-[calc(100%+3rem)] shrink-0 overflow-hidden lg:hidden" style={{ height: CARD_H + 64, maskImage: "linear-gradient(90deg, transparent, #000 16%, #000 84%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 16%, #000 84%, transparent)" }}>
      {LOOKS.map((l, i) => (
        <div key={i} ref={(n) => { cards.current[i] = n; }} className="absolute left-0 top-3 overflow-hidden rounded-[20px] border border-white/15 bg-card shadow-[0_18px_40px_-18px_rgb(0_0_0/.9)] will-change-transform"
          style={{ width: CARD_W, height: CARD_H, transformOrigin: "50% 100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l} alt="" draggable={false} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

// Three clear ways in. Email opens its own step.
function Ways({ onSocial, onEmail }: { onSocial: () => void; onEmail: () => void }) {
  return (
    <div className="flex flex-col">
      <Pill variant="white" onClick={onEmail} icon={<Icon name="mail" size={20} />}>Continue with email</Pill>
      <div className="my-4 flex items-center gap-4 text-[14px] text-white/45 lg:my-6"><span className="h-px flex-1 bg-white/15" />or<span className="h-px flex-1 bg-white/15" /></div>
      <div className="flex flex-col gap-2.5">
        <Pill variant="glass" onClick={onSocial} icon={<AppleLogo />}>Continue with Apple</Pill>
        <Pill variant="glass" onClick={onSocial} icon={<span className="grid h-6 w-6 place-items-center rounded-full bg-white"><GoogleLogo size={15} /></span>}>Continue with Google</Pill>
      </div>
    </div>
  );
}

const Legal = () => <p className="text-center text-[13px] leading-snug text-white/45">By continuing you agree to Venty’s Terms and Privacy Policy.</p>;

export function SignUp() {
  const go = useApp((s) => s.go);
  const done = useAuthDone();
  return (
    <AuthShell footer={<Legal />} actions={<Ways onSocial={() => done("Ana", DEMO_EMAIL)} onEmail={() => go("email", { mode: "signup" })} />}>
      <div className="flex h-12 items-center justify-between">
        <RB icon="back" onClick={useApp.getState().back} />
        <TopAction onClick={() => done("", "", true)}>Skip for now</TopAction>
      </div>
      <Hero title={<>Create your<br />account</>} lead="Keep your bodies and patterns safe, on any device." />
    </AuthShell>
  );
}

export function LogIn() {
  const go = useApp((s) => s.go);
  const done = useAuthDone();
  return (
    <AuthShell footer={<button className="h-11 w-full text-center text-[15px] text-white/60" onClick={() => useApp.getState().replace("signup")}>New to Venty? <span className="font-medium text-white">Create an account</span></button>}
      actions={<Ways onSocial={() => done("Ana", DEMO_EMAIL)} onEmail={() => go("email", { mode: "login" })} />}>
      <div className="flex h-12 items-center"><RB icon="back" onClick={useApp.getState().back} /></div>
      <Hero title="Welcome back" lead="Log in to pick up where you left off." />
    </AuthShell>
  );
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export function EmailStep({ p }: { p?: Record<string, unknown> }) {
  const login = p?.mode === "login";
  const done = useAuthDone();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = emailOk(email) && pw.length >= (login ? 1 : 8) && (login || name.trim().length > 0);
  const submit = () => valid && done(name, email);
  return (
    <AuthShell footer={<Pill onClick={submit} disabled={!valid}>{login ? "Log in" : "Create account"}</Pill>}>
      <div className="flex h-12 items-center"><RB icon="back" onClick={useApp.getState().back} /></div>
      <HS className="mt-6">{login ? "Log in with email" : "Sign up with email"}</HS>
      <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        {!login && <Field label="Your name" value={name} onChange={setName} placeholder="First name" autoComplete="given-name" />}
        <Field label="Email" value={email} onChange={setEmail} inputMode="email" type="email" placeholder="you@example.com" autoComplete="email" error={email && !emailOk(email) ? "Check your email address" : undefined} />
        <div className="relative">
          <Field label="Password" value={pw} onChange={setPw} type={show ? "text" : "password"} placeholder={login ? "Your password" : "At least 8 characters"} autoComplete={login ? "current-password" : "new-password"} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute bottom-0 right-1 grid h-14 w-12 place-items-center text-white/55"><Icon name="eye" size={20} /></button>
        </div>
        {login && <button type="button" className="self-end text-[15px] font-medium text-white/70" onClick={() => setSent(true)}>{sent ? "Reset link sent" : "Forgot password?"}</button>}
        <button type="submit" className="hidden" />
      </form>
    </AuthShell>
  );
}

export function SignedIn() {
  const replace = useApp((s) => s.replace);
  const name = useApp((s) => s.user.name);
  const desk = useDesk();
  const p = useFill(FILL_MS);
  useEffect(() => { const t = setTimeout(() => replace("tourAsk"), SIGNED_MS); return () => clearTimeout(t); }, [replace]);
  return (
    <SkyFrame onTap={() => replace("tourAsk")} logoIn={false} sky="haze" loader={<FilamentLoader p={p} />}>
      <TickOfLight k={Math.min(1, p * 2.6)} size={desk ? 72 : 60} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="h1 mt-6 !text-[36px] lg:!text-[56px]">Welcome, {name}.</motion.h2>
      {/* on two rows, never a widow */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lead mt-2 !text-white/80">Your account is ready.<br />Let’s show you around.</motion.p>
    </SkyFrame>
  );
}

// ─── Onboarding: light, editorial, cinematic. Looks nothing like the app inside. ──────────────
const SLIDES = [
  { t: "Start with any look you love", b: "A photo, a screenshot, a magazine page or your own sketch. If you can picture it, Venty can draft it.", fig: "Any picture, any source" },
  { t: "Drafted to your exact body", b: "Venty turns the look into a sewing pattern built from your own measurements, not a standard size.", fig: "Your measurements, not a size chart" },
  { t: "Tweak the fit, then print at home", b: "Adjust the fit and length, see it on your body, then print on A4 sheets that tape together.", fig: "Printed on A4, taped together" },
];

// Jose's three photographs (31 Oct 2026), each covering the picture panel, zoomed a little towards its subject (the
// references, the mannequin, the taped sheets) and placed for the phone's panel, which is nearly the photos' own 3:4
const SLIDE_PICS = [
  { pos: "50% 57%", zoom: 1.16 },
  { pos: "50% 52%", zoom: 1.1 },
  { pos: "56% 60%", zoom: 1.1 },
];
function SlidePic({ i }: { i: number }) {
  const pic = ONBOARDING[i], at = SLIDE_PICS[i];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={pic.src} srcSet={pic.srcSet} sizes={pic.sizes} alt="" draggable={false} decoding="async"
      className="absolute inset-0 h-full w-full select-none object-cover" style={{ objectPosition: at.pos, transform: `scale(${at.zoom})`, transformOrigin: at.pos }} />
  );
}

// ─── Before the tour: ask. Nobody is pushed through it. ─────────────────────────────────────
export function TourAsk() {
  const replace = useApp((s) => s.replace);
  const set = useApp((s) => s.set);
  const desk = useDesk();
  const skip = () => { set({ onboarded: true, tourSkipped: true }); replace("start"); };
  // A question, so it is laid out as one: a full-bleed photograph fills the screen (no margins), and the question sits
  // on a paper card floating over it (on a computer, at the right). The tour itself is a picture above paper, so the
  // two never look alike.
  const photo = (
    <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }} className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={TOUR.src} srcSet={TOUR.srcSet} sizes={TOUR.sizes} alt="" draggable={false} className="h-full w-full object-cover" style={{ objectPosition: "50% 30%" }} />
      {/* a soft shade under the status bar, so its clock stays readable over the photo */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0b0c15]/45 to-transparent" />
    </motion.div>
  );
  const card = (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="paper rounded-[32px] px-6 pb-3 pt-7 text-center shadow-[0_30px_80px_-30px_rgb(11_12_21/.7)] lg:w-[460px] lg:px-10 lg:pb-6 lg:pt-10">
      <h1 className="h1 !text-[32px] text-[#12131c] [text-wrap:balance] lg:!text-[44px]">Want a quick tour?</h1>
      <p className="lead mx-auto mt-3 max-w-[330px] [text-wrap:pretty]">See how Venty works, from taking your measurements to printing your first pattern.</p>
      <Pill className="mt-6" onClick={() => replace("onboarding")}>Show me how it works</Pill>
      <TextButton tone="paper" className="mt-1" onClick={skip}>Skip the tour</TextButton>
    </motion.div>
  );
  if (desk) return (
    <div className="absolute inset-0 overflow-hidden bg-[#636e7b]">{photo}
      <div className="relative flex h-full items-center justify-end px-16">{card}</div>
    </div>
  );
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#636e7b]">{photo}
      <div className="relative flex h-full flex-col justify-end px-3" style={{ paddingTop: "var(--top)", paddingBottom: "max(12px, calc(var(--bottom) - 18px))" }}>
        {card}
      </div>
    </div>
  );
}

export function Onboarding({ p }: { p?: Record<string, unknown> }) {
  const replace = useApp((s) => s.replace);
  const set = useApp((s) => s.set);
  const fromApp = p?.from === "app";
  const [i, setI] = useState(0);
  const desk = useDesk();
  const finish = (skipped: boolean) => {
    set({ onboarded: true, tourSkipped: skipped && !fromApp ? true : false });
    if (fromApp) useApp.getState().back(); else replace("start");
  };
  const next = () => (i < 2 ? setI(i + 1) : finish(false));
  const prev = () => setI(Math.max(0, i - 1));
  const s = SLIDES[i];

  // progress: each bar fills as the reader reaches that page. Nothing moves on by itself; only Next and Back do.
  const bars = (
    <div className="flex flex-1 gap-1.5" aria-label={`Page ${i + 1} of 3`}>
      {SLIDES.map((_, k) => (
        <span key={k} className="block h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
          <motion.span className="block h-full bg-white" initial={false} animate={{ width: k <= i ? "100%" : "0%" }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }} />
        </span>
      ))}
    </div>
  );
  const skip = <button onClick={() => finish(true)} className="pill-white tap h-10 shrink-0 rounded-full px-5 text-[15px] font-medium">{fromApp ? "Close" : "Skip"}</button>;

  const image = (
    <div className="relative h-full overflow-hidden text-white">
      <Crown />
      <AnimatePresence mode="wait"><motion.div key={i} className="pointer-events-none absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}><SlidePic i={i} /></motion.div></AnimatePresence>
      {/* a soft shade from the top, so the bars and Skip read over a light sky, and one from the foot under the caption */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[170px] bg-gradient-to-b from-[#0b0c15]/50 via-[#0b0c15]/20 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-t from-[#0b0c15]/45 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 top-0 flex items-center gap-4 px-5 lg:px-8" style={{ paddingTop: "var(--top)" }}>{bars}{skip}</div>
      <div className="absolute bottom-5 left-5 right-5 flex items-baseline gap-2 text-white/85 lg:bottom-8 lg:left-8"><span className="text-[14px]">Fig.&nbsp;<span className="serif">{i + 1}</span></span><span className="text-[14px] italic">{s.fig}</span></div>
    </div>
  );
  const words = (
    <AnimatePresence mode="wait">
      <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="text-center">
        <h1 className="h1 !text-[34px] text-[#12131c] [text-wrap:balance] lg:!text-[56px]">{s.t}</h1>
        <p className="lead mx-auto mt-3 max-w-[460px] [text-wrap:pretty]">{s.b}</p>
      </motion.div>
    </AnimatePresence>
  );
  const controls = (
    <div className="flex items-center">
      <AnimatePresence initial={false}>{i > 0 && (
        <motion.button key="prev" onClick={prev} aria-label="Previous" initial={{ width: 0, marginRight: 0, opacity: 0 }} animate={{ width: 56, marginRight: 12, opacity: 1 }} exit={{ width: 0, marginRight: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="sec-dark tap grid h-[56px] shrink-0 place-items-center overflow-hidden rounded-full"><Icon name="back" size={22} /></motion.button>
      )}</AnimatePresence>
      <Pill className="min-w-0 flex-1" onClick={next}>{i === 2 ? (fromApp ? "Done" : "Get started") : "Next"}</Pill>
    </div>
  );
  if (desk) return (
    <div className="paper absolute inset-0 grid grid-cols-[1.1fr_0.9fr] gap-0">
      <div className="p-5"><div className="h-full overflow-hidden rounded-[36px]">{image}</div></div>
      <div className="flex flex-col justify-center px-16">{words}<div className="mx-auto mt-12 w-full max-w-[460px]">{controls}</div></div>
    </div>
  );
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <div className="h-[62%] shrink-0 overflow-hidden rounded-b-[32px]">{image}</div>
      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4" style={{ paddingBottom: "var(--bottom)" }}>
        {/* the heading and text sit in the middle of the paper, between the picture and the buttons */}
        <div className="flex min-h-0 flex-1 flex-col justify-center py-2">{words}</div>
        <div className="pt-2">{controls}</div>
      </div>
    </div>
  );
}

// ─── After the tour: one clear next step, still in the onboarding's paper-and-violet look. A pattern needs measurements, so the body comes first. ──────
export function StartChoice() {
  const startBody = useApp((s) => s.startBody);
  const home = useApp((s) => s.home);
  const user = useApp((s) => s.user);
  const desk = useDesk();
  const hi = user.guest ? "Welcome." : `Welcome, ${user.name}.`;
  // Its own layout (not the tour's picture-over-paper): paper all the way, the greeting and one line on why centred at
  // the top, then the mannequin on a night card taking the room in between, and the buttons in thumb reach.
  // The mannequin (a cut-out with a transparent background) is sized to the card's height, so it grows with the card on
  // a taller phone. It comes out of the card at the top (a little: never into the words) and at the sides (the arms run
  // off the screen), and is cut cleanly along the card's bottom edge and its rounded bottom corners.
  const r = desk ? 36 : 28;
  const arc = (cx: string, cy: string, from: number) => Array.from({ length: 13 }, (_, i) => {
    const t = ((from + i * 7.5) * Math.PI) / 180;
    return `calc(${cx} + ${(r * Math.cos(t)).toFixed(2)}px) calc(${cy} + ${(r * Math.sin(t)).toFixed(2)}px)`;
  }).join(", ");
  const far = "2000px";
  const cut = `polygon(-${far} -${far}, calc(100% + ${far}) -${far}, calc(100% + ${far}) calc(100% - ${r}px), ${arc(`100% - ${r}px`, `100% - ${r}px`, 0)}, ${arc(`0% + ${r}px`, `100% - ${r}px`, 90)}, -${far} calc(100% - ${r}px))`;
  const figure = (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative h-full min-h-[240px]">
      {/* the landing page's loading-screen night: flat night, soft cornflower lights roaming its lower part. Clipped by
          clip-path as well as its rounded corners: Safari does not clip blurred, moving layers to a border radius, and the
          glow showed in the square corners as flickering triangles */}
      <div className="night rounded-[28px] lg:rounded-[36px]" style={{ clipPath: `inset(0 round ${r}px)` }} aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
      <div className="pointer-events-none absolute inset-0" style={{ clipPath: cut }} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={START.src} srcSet={START.srcSet} sizes={START.sizes} alt="" draggable={false}
          className="absolute left-1/2 top-[-2.4%] h-[127%] w-auto max-w-none -translate-x-1/2 select-none" />
      </div>
    </motion.div>
  );
  const words = (
    <>
      <h1 className="h1 !text-[34px] text-[#12131c] [text-wrap:balance] lg:!text-[52px]">{hi}<br />Let’s set up your body</h1>
    </>
  );
  const why = <p className="lead mx-auto max-w-[296px] [text-wrap:pretty] lg:mx-0 lg:max-w-[400px]">Every pattern is drafted to your measurements. Add them once and they’re saved, ready for everything you make.</p>;
  const actions = <><Pill onClick={startBody}>Set up my body</Pill><TextButton tone="paper" className="mt-1" onClick={home}>Skip for now and go to home</TextButton></>;
  if (desk) return (
    <div className="paper absolute inset-0 grid grid-cols-[0.95fr_1.05fr]">
      <div className="relative z-10 flex flex-col justify-center px-16"><div className="max-w-[480px]">{words}<div className="mt-4">{why}</div><div className="mt-10">{actions}</div></div></div>
      {/* a card in the reference's proportions, so the mannequin comes out of it the same way; the arms reach into the gap */}
      <div className="flex items-center justify-center p-10"><div className="aspect-[345/382] w-[min(100%,520px)]">{figure}</div></div>
    </div>
  );
  return (
    // the words together at the top, centred; the mannequin's card in between, taking whatever room is left (so it
    // grows on a taller phone); the buttons alone at the bottom with room around them. Nothing scrolls sideways: the
    // arms run off the screen's edges
    <div className="paper absolute inset-0 flex flex-col overflow-hidden px-6" style={{ paddingTop: "calc(var(--top) + 30px)", paddingBottom: "var(--bottom)" }}>
      <div className="text-center">{words}</div>
      <div className="mt-5 text-center">{why}</div>
      <div className="mt-11 min-h-0 flex-1">{figure}</div>
      <div className="mt-8">{actions}</div>
    </div>
  );
}
