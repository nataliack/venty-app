"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, DEMO_EMAIL } from "@/lib/store";
import type { PieceKey } from "@/lib/data";
import { Screen, Pill, Field, HS, Lead, Glow, RB, TextButton, TopAction, Crown, cx, useDesk } from "@/components/ui";
import { VentyLogo, BodyFigure, Flat, Piece } from "@/components/art";
import { AppleLogo, GoogleLogo, Icon } from "@/components/icons";

// Splash and "Welcome, Ana": the same Crown sky and logo position as Welcome, so the app opens straight into it.
// Only a slim loader sits at the bottom, where Welcome's buttons will appear.
let fromSplash = false;
function Loader({ ms }: { ms: number }) {
  return (
    <div className="flex w-full max-w-[380px] flex-col items-center gap-2 lg:mb-[6dvh]" aria-label="Loading">
      <div className="grid h-14 w-full place-items-center">
        <div className="h-[3px] w-[132px] overflow-hidden rounded-full bg-white/25">
          <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: ms / 1000, ease: "easeInOut" }} />
        </div>
      </div>
      <div className="h-11" />
    </div>
  );
}
function SkyFrame({ children, onTap, logoIn = true }: { children?: ReactNode; onTap: () => void; logoIn?: boolean }) {
  const desk = useDesk();
  return (
    <button className="absolute inset-0 overflow-hidden text-center" onClick={onTap} aria-label="Continue">
      <Crown />
      <div className="sky-floor" aria-hidden />
      <div className="relative flex h-full flex-col items-center px-6 lg:px-16" style={{ paddingTop: "var(--top)", paddingBottom: "var(--bottom)" }}>
        <motion.div initial={logoIn ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} className="mt-[13dvh] lg:mt-[10dvh]">
          <VentyLogo width={desk ? 300 : 190} />
        </motion.div>
        <div className="my-auto flex max-w-[620px] flex-col items-center pt-8">{children}</div>
        {/* the slot Welcome's buttons use */}
        <Loader ms={1900} />
      </div>
    </button>
  );
}

export function Splash() {
  const replace = useApp((s) => s.replace);
  const go = () => { fromSplash = true; replace("welcome"); };
  useEffect(() => { const t = setTimeout(() => { fromSplash = true; replace("welcome"); }, 2100); return () => clearTimeout(t); }, [replace]);
  return <SkyFrame onTap={go} />;
}

// Welcome: the Crown gradient (from the landing page).
const Sky = () => <Crown />;

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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="w-full max-w-[380px] lg:mb-[6dvh]">{actions}</motion.div>
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
// Placeholders for now (the landing page's renders); patterns are the app's own pieces on pattern paper.
type Look = { img: string } | { pieces: PieceKey[] };
const LOOKS: Look[] = [
  { img: "/auth/look-1.webp" },
  { pieces: ["bodiceFront", "skirtFront"] },
  { img: "/auth/look-4.webp" },
  { img: "/auth/look-5.webp" },
  { pieces: ["sleeve", "bodiceBack", "facing"] },
  { img: "/auth/look-3.webp" },
  { img: "/auth/look-6.webp" },
  { pieces: ["trouserFront", "waistband"] },
];
const CARD_W = 100, CARD_H = 134, GAP = 12;
function ArcCarousel() {
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
          {"img" in l
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={l.img} alt="" draggable={false} className="h-full w-full object-cover" />
            : <div className="pattern-mat flex h-full w-full flex-wrap content-center items-center justify-center gap-1.5 p-3">{l.pieces.map((k) => <Piece key={k} k={k} tone="light" width={l.pieces.length > 2 ? 34 : 44} />)}</div>}
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
  useEffect(() => { const t = setTimeout(() => replace("tourAsk"), 1900); return () => clearTimeout(t); }, [replace]);
  return (
    <SkyFrame onTap={() => replace("tourAsk")} logoIn={false}>
      <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.35, duration: 0.7 }} className="grid h-16 w-16 place-items-center rounded-full border border-white/50 bg-white/15 backdrop-blur-md">
        <Icon name="check" size={30} strokeWidth={2.4} />
      </motion.span>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="h1 mt-6 !text-[36px] lg:!text-[56px]">Welcome, {name}.</motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lead mt-2">Your account is ready. Let’s show you around.</motion.p>
    </SkyFrame>
  );
}

// ─── Onboarding: light, editorial, cinematic. Looks nothing like the app inside. ──────────────
const SLIDES = [
  { t: "Start with any look you love", b: "A photo, a screenshot, a magazine page or your own sketch. If you can picture it, Venty can draft it.", fig: "Any picture, any source" },
  { t: "Drafted to your exact body", b: "Venty turns the look into a sewing pattern built from your own measurements, not a standard size.", fig: "Your measurements, not a size chart" },
  { t: "Tweak the fit, then print at home", b: "Adjust ease and length, see it on your body, then print on A4 sheets that tape together.", fig: "Printed on A4, taped together" },
];

function Plate({ i, big }: { i: number; big: boolean }) {
  const k = big ? 1.5 : 1;
  if (i === 0) return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative" style={{ width: 300 * k, height: 260 * k }}>
        {/* photo */}
        <motion.div initial={{ opacity: 0, y: 20, rotate: -12 }} animate={{ opacity: 1, y: 0, rotate: -8 }} transition={{ delay: 0.1, duration: 0.8 }} className="absolute overflow-hidden rounded-[18px] bg-[#c9cff0] shadow-2xl" style={{ left: 10 * k, top: 30 * k, width: 120 * k, height: 160 * k }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 40% 30%, #eef0ff, #9aa6e6 60%, #5b6bd0)" }} />
          <div className="absolute inset-0 grid place-items-center"><Flat g="flutter" size={88 * k} stroke="#1c2040" fill="rgba(255,255,255,.55)" /></div>
          <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-medium text-[#12131c]">Photo</span>
        </motion.div>
        {/* screenshot on a phone */}
        <motion.div initial={{ opacity: 0, y: 20, rotate: 10 }} animate={{ opacity: 1, y: 0, rotate: 6 }} transition={{ delay: 0.25, duration: 0.8 }} className="absolute rounded-[20px] border-[3px] border-[#12131c] bg-[#12131c] p-1 shadow-2xl" style={{ left: 150 * k, top: 8 * k, width: 100 * k, height: 190 * k }}>
          <div className="relative h-full overflow-hidden rounded-[15px] bg-[#f3f1ec]">
            <div className="grid grid-cols-2 gap-1 p-1.5">{(["slip", "wrap", "aline", "cami"] as const).map((g) => <div key={g} className="grid aspect-[3/4] place-items-center rounded-[6px] bg-[#dfe2f4]"><Flat g={g} size={30 * k} stroke="#1c2040" fill="rgba(104,126,245,.25)" /></div>)}</div>
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#12131c] px-2 py-0.5 text-[10px] text-white">Screenshot</span>
          </div>
        </motion.div>
        {/* sketch */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="absolute rounded-[6px] bg-[#f3f1ec] shadow-xl" style={{ left: 205 * k, top: 182 * k, width: 74 * k, height: 70 * k, rotate: "4deg" }}><svg viewBox="0 0 74 70" className="h-full w-full"><path d="M30 12 Q37 18 44 12 L46 30 L56 60 Q37 64 18 60 L28 30 Z M28 30 Q37 33 46 30" fill="none" stroke="#2a2f48" strokeWidth="1.6" strokeLinejoin="round" /></svg></motion.div>
      </div>
    </div>
  );
  if (i === 1) return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 lg:gap-14">
      <div className="relative">
        <BodyFigure width={big ? 190 : 118} markers={[{ kind: "ring", y: 140, w: 100 }, { kind: "ring", y: 205, w: 72 }, { kind: "ring", y: 275, w: 110 }]} />
        {[["Bust", "88", 0.25], ["Waist", "70", 0.37], ["Hips", "96", 0.5]].map(([l, v, y], j) => (
          <motion.div key={l as string} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + j * 0.15 }} className="absolute -right-12 flex items-baseline gap-1 rounded-full bg-white px-2.5 py-1 text-[#12131c] shadow-lg lg:-right-20" style={{ top: `${(y as number) * 100}%` }}>
            <span className="serif text-[18px] leading-none" translate="no">{v}</span><span className="text-[11px]" translate="no">cm</span>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col gap-3"><Piece k="bodiceFront" width={big ? 140 : 84} label="Bodice front" /><Piece k="skirtFront" width={big ? 110 : 64} label="Skirt front" /></motion.div>
    </div>
  );
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="grid grid-cols-3 gap-1.5" style={{ scale: k }}>{Array.from({ length: 9 }, (_, n) => <motion.div key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: n * 0.05 }} className="h-[84px] w-[62px] rounded-md border border-dashed border-white/40 bg-white/[.06]" />)}</div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute" style={{ scale: k }}><Piece k="bodiceFront" width={140} label="Bodice front" /></motion.div>
    </div>
  );
}

// ─── Before the tour: ask. Nobody is pushed through it. ─────────────────────────────────────
export function TourAsk() {
  const replace = useApp((s) => s.replace);
  const set = useApp((s) => s.set);
  const desk = useDesk();
  const skip = () => { set({ onboarded: true, tourSkipped: true }); replace("start"); };
  // A question, so it is laid out as one: the Crown sky fills the screen with three garments fanned out on it, and the
  // question sits on a paper card floating over the sky (on a computer, beside the garments). The tour itself is a
  // picture above paper, so the two never look alike.
  const fan = (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-end justify-center">
      {(["slip", "wrap", "aline"] as const).map((g, i) => (
        <motion.div key={g} initial={{ opacity: 0, y: 18, rotate: 0 }} animate={{ opacity: 1, y: i === 1 ? -14 : 0, rotate: (i - 1) * 9 }} transition={{ delay: 0.15 + i * 0.12, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className={cx("grid place-items-center rounded-[22px] border border-white/25 bg-white/12 backdrop-blur-sm", i === 1 ? "z-10 -mx-3 h-[168px] w-[124px] lg:h-[280px] lg:w-[206px]" : "h-[140px] w-[104px] lg:h-[230px] lg:w-[170px]")}>
          <Flat g={g} size={desk ? (i === 1 ? 168 : 132) : i === 1 ? 100 : 80} stroke="#fff" fill="rgba(255,255,255,.14)" />
        </motion.div>
      ))}
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
    <div className="absolute inset-0 overflow-hidden"><Crown />
      <div className="relative grid h-full grid-cols-[1.1fr_0.9fr] items-center px-16">{fan}<div className="flex justify-center">{card}</div></div>
    </div>
  );
  return (
    <div className="absolute inset-0 overflow-hidden"><Crown />
      <div className="relative flex h-full flex-col px-3" style={{ paddingTop: "var(--top)", paddingBottom: "max(12px, calc(var(--bottom) - 18px))" }}>
        <div className="grid min-h-0 flex-1 place-items-center">{fan}</div>
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
  const skip = <button onClick={() => finish(true)} className="tap h-10 shrink-0 rounded-full bg-white px-5 text-[15px] font-medium text-[#12131c] shadow-lg">{fromApp ? "Close" : "Skip"}</button>;

  const image = (
    <div className="relative h-full overflow-hidden text-white">
      <Crown />
      <AnimatePresence mode="wait"><motion.div key={i} className="pointer-events-none absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}><Plate i={i} big={desk} /></motion.div></AnimatePresence>
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
          className="tap grid h-[56px] shrink-0 place-items-center overflow-hidden rounded-full border border-[#12131c]/15 text-[#12131c]"><Icon name="back" size={22} /></motion.button>
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
  // Its own layout (not the tour's picture-over-paper): paper all the way, the greeting at the top, left-aligned, then
  // the body on a Crown card taking the room in between, one line on why, and the buttons in thumb reach.
  const figure = (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative h-full min-h-[180px] overflow-hidden rounded-[28px] text-white lg:rounded-[36px]">
      <Crown />
      <div className="absolute inset-0 p-5 lg:p-10"><BodyFigure width={desk ? 170 : 100} markers={[{ kind: "ring", y: 140, w: 100 }, { kind: "ring", y: 205, w: 72 }, { kind: "ring", y: 275, w: 110 }]} className="h-full w-full" /></div>
    </motion.div>
  );
  const words = (
    <>
      <h1 className="h1 !text-[34px] text-[#12131c] [text-wrap:balance] lg:!text-[52px]">{hi}<br />Let’s set up your body</h1>
    </>
  );
  const why = <p className="lead max-w-[400px] [text-wrap:pretty]">Every pattern is drafted to your measurements. Add them once and they’re saved, ready for everything you make.</p>;
  const actions = <><Pill onClick={startBody}>Set up my body</Pill><TextButton tone="paper" className="mt-1" onClick={home}>Skip for now and go to home</TextButton></>;
  if (desk) return (
    <div className="paper absolute inset-0 grid grid-cols-[0.95fr_1.05fr]">
      <div className="flex flex-col justify-center px-16"><div className="max-w-[480px]">{words}<div className="mt-4">{why}</div><div className="mt-10">{actions}</div></div></div>
      <div className="p-5">{figure}</div>
    </div>
  );
  return (
    // the words together at the top, the body in between, the buttons alone at the bottom with room around them
    <div className="paper absolute inset-0 flex flex-col px-6" style={{ paddingTop: "calc(var(--top) + 20px)", paddingBottom: "var(--bottom)" }}>
      {words}
      <div className="mt-3">{why}</div>
      <div className="mt-6 min-h-0 flex-1">{figure}</div>
      <div className="mt-8">{actions}</div>
    </div>
  );
}
