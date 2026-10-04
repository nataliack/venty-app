"use client";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { Screen, Pill, Field, HS, Lead, Glow, Blob, RB, cx, useDesk } from "@/components/ui";
import { VentyLogo, BodyFigure, Flat, Piece } from "@/components/art";
import { AppleLogo, GoogleLogo, Icon } from "@/components/icons";

export function Splash() {
  const replace = useApp((s) => s.replace);
  useEffect(() => { const t = setTimeout(() => replace("welcome"), 2200); return () => clearTimeout(t); }, [replace]);
  return (
    <button className="absolute inset-0 overflow-hidden text-left" onClick={() => replace("welcome")} aria-label="Continue">
      <div className="absolute inset-y-0 left-1/2 w-[402px] -translate-x-1/2 lg:scale-125">
        <Blob className="left-[-60px] top-[170px] h-[360px] w-[360px] opacity-80" />
        <Blob className="left-[150px] top-[300px] h-[300px] w-[300px] opacity-50" color="#a0abca" />
        <Blob className="left-[40px] top-[430px] h-[220px] w-[260px] opacity-90" color="#4d5e85" />
      </div>
      <div className="absolute inset-x-0 top-[38%] flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}>
          <VentyLogo width={230} className="lg:h-auto lg:w-[320px]" />
        </motion.div>
      </div>
      <div className="absolute bottom-[110px] left-1/2 h-[2px] w-[120px] -translate-x-1/2 overflow-hidden rounded bg-white/15">
        <motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.1, ease: "easeInOut" }} />
      </div>
    </button>
  );
}

// Welcome sky: a periwinkle haze with three soft lights that drift slowly.
const Sky = () => <div className="sky"><span className="drift d1" /><span className="drift d2" /><span className="drift d3" /></div>;

const WELCOME_T = <>See a dress you love.<br />Create it. Wear it.</>;
const WELCOME_B = "Any photo, screenshot, magazine page or link. Venty drafts a sewing pattern to your exact measurements, ready to print at home.";

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
      <div className="relative flex h-full flex-col items-center px-6 text-center lg:px-16" style={{ paddingTop: "var(--top)", paddingBottom: "var(--bottom)" }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} className="mt-[13dvh] lg:mt-[10dvh]">
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

// Desktop: brand panel on the left, the form on the right. Phone: one column.
function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const desk = useDesk();
  if (!desk) return <Screen footer={footer}>{children}</Screen>;
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

// Three clear ways in. Email opens its own step.
function Ways({ onSocial, onEmail }: { onSocial: () => void; onEmail: () => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <Pill variant="white" onClick={onSocial} icon={<AppleLogo />}>Continue with Apple</Pill>
      <Pill variant="glass" onClick={onSocial} icon={<span className="grid h-6 w-6 place-items-center rounded-full bg-white"><GoogleLogo size={15} /></span>}>Continue with Google</Pill>
      <Pill variant="glass" onClick={onEmail} icon={<Icon name="mail" size={20} />}>Continue with email</Pill>
    </div>
  );
}

const Legal = () => <p className="text-center text-[13px] leading-snug text-white/45">By continuing you agree to Venty’s Terms and Privacy Policy.</p>;

export function SignUp() {
  const go = useApp((s) => s.go);
  const done = useAuthDone();
  return (
    <AuthShell footer={<Legal />}>
      <div className="flex h-12 items-center justify-between">
        <RB icon="back" onClick={useApp.getState().back} />
        <button className="h-11 rounded-full px-4 text-[16px] font-medium text-white/85 hover:text-white" onClick={() => done("", "", true)}>Skip for now</button>
      </div>
      <HS className="mt-6">Create your<br />account</HS>
      <Lead className="mt-3">Keep your bodies and patterns safe, on any device.</Lead>
      <div className="mt-8"><Ways onSocial={() => done("Ana", "ana@venty.studio")} onEmail={() => go("email", { mode: "signup" })} /></div>
    </AuthShell>
  );
}

export function LogIn() {
  const go = useApp((s) => s.go);
  const done = useAuthDone();
  return (
    <AuthShell footer={<button className="h-11 w-full text-center text-[15px] text-white/60" onClick={() => useApp.getState().replace("signup")}>New to Venty? <span className="font-medium text-white">Create an account</span></button>}>
      <div className="flex h-12 items-center"><RB icon="back" onClick={useApp.getState().back} /></div>
      <HS className="mt-6">Welcome back</HS>
      <Lead className="mt-3">Log in to pick up where you left off.</Lead>
      <div className="mt-8"><Ways onSocial={() => done("Ana", "ana@venty.studio")} onEmail={() => go("email", { mode: "login" })} /></div>
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
    <button className="absolute inset-0 flex flex-col items-center justify-center" onClick={() => replace("tourAsk")}>
      <Blob className="left-1/2 top-[26%] h-[260px] w-[260px] -translate-x-[65%] opacity-80" />
      <Blob className="left-1/2 top-[32%] h-[200px] w-[200px] -translate-x-[10%] opacity-50" color="#a0abca" />
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.45 }} className="relative grid h-[88px] w-[88px] place-items-center rounded-full bg-primary shadow-[0_0_60px_rgba(104,126,245,.7)]">
        <span className="absolute inset-0 rounded-full border-2 border-white/40" style={{ animation: "pulse-ring 1.6s ease-out infinite" }} />
        <Icon name="check" size={44} strokeWidth={2.4} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="h1 mt-24 !text-[42px] lg:!text-[64px]">Welcome, {name}.</motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="lead mt-2">Your studio is ready. Let’s show you around.</motion.p>
    </button>
  );
}

// ─── Onboarding: light, editorial, cinematic. Looks nothing like the app inside. ──────────────
const SLIDES = [
  { t: "Start with any look you love", b: "A photo, a screenshot, a magazine page, a link or your own sketch. If you can picture it, Venty can draft it.", fig: "Any picture, any source" },
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
        {/* link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="absolute flex items-center gap-1.5 rounded-[8px] bg-white/85 px-2.5 py-1.5 text-[12px] text-[#12131c]/80 shadow-xl" style={{ left: 40 * k, top: 205 * k }}><Icon name="link" size={13} />pin.it/midi-dress</motion.div>
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
  const skip = () => { set({ onboarded: true, tourSkipped: true }); replace("start"); };
  return (
    <div className="paper absolute inset-0 flex flex-col items-center px-6 text-center" style={{ paddingTop: "var(--top)", paddingBottom: "var(--bottom)" }}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="grain relative grid h-[148px] w-[148px] place-items-center overflow-hidden rounded-full lg:h-[200px] lg:w-[200px]" style={{ background: "radial-gradient(90% 70% at 30% 20%, #8c9cf8 0%, #4f63e0 45%, #1c2252 100%)" }}>
          <Flat g="flutter" size={96} stroke="#fff" fill="rgba(255,255,255,.18)" />
        </div>
        <h1 className="h1 mt-8 !text-[34px] text-[#12131c] [text-wrap:balance] lg:!text-[52px]">Want a quick tour?</h1>
        <p className="lead mt-3 max-w-[340px] [text-wrap:pretty] lg:max-w-[440px]">Three short pages on how Venty works: from your measurements to a pattern you can print at home.</p>
      </div>
      <div className="flex w-full max-w-[380px] flex-col items-center gap-1">
        <Pill onClick={() => replace("onboarding")}>Show me how it works</Pill>
        <button onClick={skip} className="h-12 px-4 text-[16px] font-medium text-[#12131c]/70 hover:text-[#12131c]">Skip the tour</button>
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
    <div className="grain relative h-full overflow-hidden" style={{ background: "radial-gradient(90% 70% at 30% 20%, #8c9cf8 0%, #4f63e0 45%, #1c2252 100%)" }}>
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
    <div className="flex items-center gap-3">
      <button onClick={prev} aria-label="Previous" className={cx("tap grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full border border-[#12131c]/15 text-[#12131c]", i === 0 && "invisible")}><Icon name="back" size={22} /></button>
      <Pill className="flex-1" onClick={next}>{i === 2 ? (fromApp ? "Done" : "Get started") : "Next"}</Pill>
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
      <div className="h-[56%] shrink-0 overflow-hidden rounded-b-[32px]">{image}</div>
      <div className="flex min-h-0 flex-1 flex-col px-6 pt-7" style={{ paddingBottom: "var(--bottom)" }}>
        {words}
        <div className="mt-auto pt-4">{controls}</div>
      </div>
    </div>
  );
}

// ─── After the tour: one clear next step. A pattern needs measurements, so the body comes first. ──────
export function StartChoice() {
  const startBody = useApp((s) => s.startBody);
  const home = useApp((s) => s.home);
  const user = useApp((s) => s.user);
  const desk = useDesk();
  const hi = user.guest ? "Welcome." : `Welcome, ${user.name}.`;
  const actions = <div className="flex w-full flex-col items-center gap-1 lg:max-w-[420px]"><Pill onClick={startBody}>Set up my body</Pill><button onClick={home} className="h-12 px-4 text-[16px] font-medium text-white/70 hover:text-white">Skip for now and go to home</button></div>;
  return (
    <Screen footer={desk ? undefined : actions}>
      <div className="flex min-h-full flex-col items-center text-center lg:justify-center">
        <div className="h-6 lg:h-0" />
        <HS className="[text-wrap:balance]">{hi}<br />Let’s set up your body</HS>
        <Lead className="mt-3 max-w-[360px] [text-wrap:pretty] lg:max-w-[480px]">Venty drafts every pattern to your measurements. Add them once and they’re saved as your body, ready for every pattern you make.</Lead>
        <div className="relative mt-6 h-[min(330px,40dvh)] w-full lg:mt-10 lg:h-[min(440px,48dvh)]">
          <Blob className="left-1/2 top-1/2 h-[240px] w-[200px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
          <BodyFigure width={desk ? 150 : 110} markers={[{ kind: "ring", y: 140, w: 100 }, { kind: "ring", y: 205, w: 72 }, { kind: "ring", y: 275, w: 110 }]} className="relative h-full w-full" />
        </div>
        {desk && <div className="mt-8 flex w-full justify-center">{actions}</div>}
      </div>
    </Screen>
  );
}
