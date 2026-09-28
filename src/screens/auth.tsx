"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/lib/store";
import { Screen, Pill, Field, Eyebrow, HS, Lead, Dots, Glow, Chip, Blob, RB, Glass, cx, useDesk } from "@/components/ui";
import { Motif, BodyFigure, Flat, Piece } from "@/components/art";
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
      <div className="absolute inset-x-0 top-[34%] flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 12, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }} className="ml-6">
          <Motif width={150} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9 }} className="serif -mt-4 text-[120px] leading-none lg:text-[180px]">Venty</motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="eyebrow mt-8 text-white/60">AI pattern studio</motion.div>
      </div>
      <div className="absolute bottom-[110px] left-1/2 h-[2px] w-[120px] -translate-x-1/2 overflow-hidden rounded bg-white/15">
        <motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.1, ease: "easeInOut" }} />
      </div>
    </button>
  );
}

export function Welcome() {
  const go = useApp((s) => s.go);
  const desk = useDesk();
  if (desk) return (
    <div className="absolute inset-0 grid grid-cols-[1.15fr_1fr]">
      <div className="relative overflow-hidden" style={{ background: "radial-gradient(120% 80% at 30% 10%, #8c9cf8 0%, #4f63e0 40%, #0b0c15 90%)" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.35) 1px, transparent 1.2px)", backgroundSize: "16px 16px" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="eyebrow text-white/80">AI pattern studio</div>
          <div className="ml-10 mt-6"><Motif width={150} /></div>
          <div className="serif -mt-4 text-[180px] leading-none">Venty</div>
        </div>
        <div className="absolute bottom-10 left-10 flex gap-2"><Chip>Photo</Chip><Chip>Pattern</Chip><Chip>Print</Chip></div>
      </div>
      <div className="relative flex items-center px-20">
        <div className="dotgrid" />
        <div className="max-w-[440px]">
          <h2 className="text-[48px] font-semibold leading-[1.05] tracking-tight">See a dress you love.<br />Wear it, made for you.</h2>
          <Lead className="mt-5 text-[17px]">Upload any photo from Pinterest or a magazine. Venty drafts a sewing pattern to your exact measurements, ready to print.</Lead>
          <Pill className="mt-10" onClick={() => go("signup")}>Get started</Pill>
          <button className="mt-4 h-10 w-full text-[15px] font-medium text-white/90" onClick={() => go("login")}>I already have an account</button>
        </div>
      </div>
    </div>
  );
  return (
    <Screen
      bg={<><div className="absolute inset-0" style={{ background: "radial-gradient(120% 70% at 30% 10%, #8c9cf8 0%, #4f63e0 35%, rgba(11,12,21,0) 75%)" }} /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg via-bg to-transparent" /></>}
      footer={<div className="flex flex-col items-center gap-4"><Pill onClick={() => go("signup")}>Get started</Pill><button className="h-10 text-[15px] font-medium text-white/90" onClick={() => go("login")}>I already have an account</button></div>}>
      <div className="flex min-h-full flex-col">
        <div className="mt-[14vh] flex flex-col items-center">
          <div className="eyebrow text-white/80">AI pattern studio</div>
          <div className="ml-6 mt-5"><Motif width={96} /></div>
          <div className="serif -mt-3 text-[104px] leading-none">Venty</div>
        </div>
        <div className="mt-auto">
          <h2 className="text-[26px] font-semibold leading-tight tracking-tight">See a dress you love.<br />Wear it, made for you.</h2>
          <Lead className="mt-3 text-[14px]">Upload any photo from Pinterest or a magazine. Venty drafts a sewing pattern to your exact measurements, ready to print.</Lead>
        </div>
      </div>
    </Screen>
  );
}

// Desktop: brand panel on the left, the form on the right. Phone: unchanged single column.
function AuthShell({ children }: { children: React.ReactNode }) {
  const desk = useDesk();
  if (!desk) return <Screen>{children}</Screen>;
  return (
    <div className="absolute inset-0 grid grid-cols-[1fr_1fr]">
      <div className="p-6">
        <Glow color="#687ef5" variant="fade" className="relative h-full rounded-[36px]">
          <div className="absolute left-10 top-10 flex items-end gap-2"><Motif width={48} className="mb-2" /><span className="serif text-[44px] leading-none">Venty</span></div>
          <div className="absolute inset-0 flex items-center justify-center gap-6"><BodyFigure width={170} garment="flutter" variant="solid" glow={false} /><div className="flex flex-col gap-4"><Piece k="bodiceFront" width={110} label="Bodice front" /><Piece k="skirtFront" width={90} label="Skirt front" /></div></div>
          <div className="absolute bottom-10 left-10 right-10"><div className="serif text-[40px] leading-tight">Your body. Your pattern.</div><div className="mt-2 text-[15px] text-white/70">Sewing patterns drafted to your exact measurements.</div></div>
        </Glow>
      </div>
      <div className="relative overflow-y-auto noscroll">
        <div className="dotgrid" />
        <div className="mx-auto flex min-h-full max-w-[440px] flex-col justify-center py-10">{children}</div>
      </div>
    </div>
  );
}

function Socials({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <Pill variant="white" onClick={onDone} icon={<AppleLogo />}>Continue with Apple</Pill>
      <Pill variant="glass" onClick={onDone} icon={<span className="grid h-6 w-6 place-items-center rounded-full bg-white"><GoogleLogo size={15} /></span>}>Continue with Google</Pill>
    </div>
  );
}
const Divider = ({ label }: { label: string }) => (
  <div className="my-5 flex items-center gap-3 text-[12px] text-white/45"><span className="h-px flex-1 bg-white/12" />{label}<span className="h-px flex-1 bg-white/12" /></div>
);

function useAuthDone() {
  const set = useApp((s) => s.set);
  const replace = useApp((s) => s.replace);
  return (name: string, email: string, guest = false) => {
    const clean = (name || email.split("@")[0] || "Ana").trim();
    const nice = clean.charAt(0).toUpperCase() + clean.slice(1);
    set({ user: { name: guest ? "there" : nice.split(/[\s._-]/)[0] || "Ana", email, guest } });
    replace(guest ? "onboarding" : "signedin");
  };
}

export function SignUp() {
  const go = useApp((s) => s.go);
  const done = useAuthDone();
  const [name, setName] = useState("Ana");
  const [email, setEmail] = useState("ana@venty.studio");
  const [pw, setPw] = useState("sewing123");
  return (
    <AuthShell>
      <div className="flex h-12 items-center"><RB icon="back" onClick={useApp.getState().back} /></div>
      <Eyebrow className="mt-2">Create account</Eyebrow>
      <HS className="mt-3">Make your<br />Venty account</HS>
      <Lead className="mt-3">Save your bodies and patterns in one place.</Lead>
      <div className="mt-6"><Socials onDone={() => done(name, email)} /></div>
      <Divider label="or with email" />
      <div className="flex flex-col gap-2">
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} inputMode="email" />
        <Field label="Password" value={pw} onChange={setPw} type="password" />
      </div>
      <Pill className="mt-5" onClick={() => done(name, email)}>Create account</Pill>
      <button className="mt-5 w-full text-center text-[14px] text-white/60" onClick={() => go("login")}>Already have an account? <span className="font-semibold text-white">Log in</span></button>
      <button className="mb-6 mt-3 w-full text-center text-[14px] font-medium" onClick={() => done("", "", true)}>Continue as guest →</button>
    </AuthShell>
  );
}

export function LogIn() {
  const go = useApp((s) => s.go);
  const done = useAuthDone();
  const [email, setEmail] = useState("ana@venty.studio");
  const [pw, setPw] = useState("sewing123");
  const [sent, setSent] = useState(false);
  return (
    <AuthShell>
      <div className="flex h-12 items-center"><RB icon="back" onClick={useApp.getState().back} /></div>
      <Eyebrow className="mt-2">Welcome back</Eyebrow>
      <HS className="mt-3">Good to see<br />you again</HS>
      <Lead className="mt-3">Log in to pick up where you left off.</Lead>
      <div className="mt-6 flex flex-col gap-2">
        <Field label="Email" value={email} onChange={setEmail} inputMode="email" />
        <Field label="Password" value={pw} onChange={setPw} type="password" />
      </div>
      <div className="mt-3 flex justify-end"><button className="text-[13px] font-medium text-white/70" onClick={() => setSent(true)}>{sent ? "Reset link sent ✓" : "Forgot password?"}</button></div>
      <Pill className="mt-4" onClick={() => done("", email)}>Log in</Pill>
      <Divider label="or" />
      <Socials onDone={() => done("", email)} />
      <button className="mt-6 w-full text-center text-[14px] text-white/60" onClick={() => go("signup")}>New here? <span className="font-semibold text-white">Create an account</span></button>
      <button className="mb-6 mt-3 w-full text-center text-[14px] font-medium" onClick={() => done("", "", true)}>Continue as guest →</button>
    </AuthShell>
  );
}

export function SignedIn() {
  const replace = useApp((s) => s.replace);
  const name = useApp((s) => s.user.name);
  useEffect(() => { const t = setTimeout(() => replace("onboarding"), 1900); return () => clearTimeout(t); }, [replace]);
  return (
    <button className="absolute inset-0 flex flex-col items-center justify-center" onClick={() => replace("onboarding")}>
      <Blob className="left-1/2 top-[26%] h-[260px] w-[260px] -translate-x-[65%] opacity-80" />
      <Blob className="left-1/2 top-[32%] h-[200px] w-[200px] -translate-x-[10%] opacity-50" color="#a0abca" />
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.45 }} className="relative grid h-[88px] w-[88px] place-items-center rounded-full bg-primary shadow-[0_0_60px_rgba(104,126,245,.7)]">
        <span className="absolute inset-0 rounded-full border-2 border-white/40" style={{ animation: "pulse-ring 1.6s ease-out infinite" }} />
        <Icon name="check" size={44} strokeWidth={2.4} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="serif mt-24 text-[46px] lg:text-[72px]">Welcome, {name}.</motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="lead mt-2">Your studio is ready. Let’s show you around.</motion.p>
    </button>
  );
}

// ─── Onboarding carousel ──────────────────────────────────────────────
const SLIDES = [
  { t: "Start with a dress\nyou love", b: "Screenshot it from Pinterest, snap it in a magazine, or pick one of our templates.", c: "#687ef5", v: "edge" as const },
  { t: "Drafted to\nyour body", b: "Venty turns the look into a sewing pattern built from your own measurements.", c: "#4f63e0", v: "fade" as const },
  { t: "Tweak it,\nthen print it", b: "Adjust the fit, preview it on you, and print it at home on A4.", c: "#3e4db8", v: "edge" as const },
];

export function Onboarding() {
  const replace = useApp((s) => s.replace);
  const set = useApp((s) => s.set);
  const [i, setI] = useState(0);
  const next = () => (i < 2 ? setI(i + 1) : (set({ onboarded: true }), replace("start")));
  const prev = () => setI(Math.max(0, i - 1));
  const s = SLIDES[i];
  const desk = useDesk();
  const visual = (
    <Glow color={s.c} variant={s.v} className="relative h-[min(400px,46dvh)] rounded-[32px] lg:h-[min(620px,78dvh)] lg:rounded-[40px]">
      {i === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="glass-2 -rotate-6 rounded-[22px] p-4 animate-floaty"><Flat g="slip" size={desk ? 200 : 130} /></div>
          <div className="absolute bottom-5 flex gap-2 lg:bottom-8"><Chip>Pinterest</Chip><Chip>Magazine</Chip><Chip>Camera</Chip></div>
        </div>
      )}
      {i === 1 && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 lg:gap-10">
          <BodyFigure width={desk ? 190 : 120} />
          <div className="flex flex-col gap-3"><Piece k="bodiceFront" width={desk ? 140 : 92} label="Bodice front" /><Piece k="skirtFront" width={desk ? 110 : 70} label="Skirt front" /></div>
        </div>
      )}
      {i === 2 && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid grid-cols-3 gap-1.5 lg:scale-150">{Array.from({ length: 9 }, (_, k) => <div key={k} className="h-[88px] w-[66px] rounded-md border border-dashed border-white/35 bg-white/5" />)}</div>
          <div className="absolute lg:scale-150"><Piece k="bodiceFront" width={150} label="Bodice front" /></div>
          <div className="absolute bottom-4 grid h-10 w-10 place-items-center rounded-full bg-white text-bg lg:bottom-8"><Icon name="printer" size={20} /></div>
        </div>
      )}
    </Glow>
  );
  if (desk) return (
    <Screen>
      <div className="grid min-h-[calc(100dvh-var(--top)-40px)] grid-cols-[1.1fr_0.9fr] items-center gap-16">
        <AnimatePresence mode="wait"><motion.div key={"v" + i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35 }}>{visual}</motion.div></AnimatePresence>
        <div>
          <div className="mb-10 flex justify-end"><button className="text-[15px] font-medium text-white/70" onClick={() => { set({ onboarded: true }); replace("start"); }}>Skip</button></div>
          <AnimatePresence mode="wait"><motion.div key={"t" + i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            <Eyebrow>0{i + 1} / 03</Eyebrow>
            <HS className="mt-4 whitespace-pre-line">{s.t}</HS>
            <Lead className="mt-4 max-w-[420px]">{s.b}</Lead>
          </motion.div></AnimatePresence>
          <Dots n={3} i={i} className="mt-10 !justify-start" />
          <div className="mt-10 flex max-w-[420px] gap-3">
            {i > 0 && <Pill variant="dark" className="!w-[140px]" onClick={prev}>Back</Pill>}
            <Pill className="flex-1" onClick={next}>{i === 2 ? "Get started" : "Next"}</Pill>
          </div>
        </div>
      </div>
    </Screen>
  );
  return (
    <Screen footer={<div className="flex items-center justify-between pb-1"><RB icon="back" variant="dark" size={42} onClick={prev} label="Previous" className={i === 0 ? "invisible" : ""} /><Dots n={3} i={i} /><RB icon="chevR" variant={i === 2 ? "primary" : "dark"} size={42} onClick={next} label="Next" /></div>}>
      <div className="flex h-12 items-center justify-end"><button className="text-[14px] font-medium text-white/70" onClick={() => { set({ onboarded: true }); replace("start"); }}>Skip</button></div>
      <motion.div className="mt-2" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={(_, info) => { if (info.offset.x < -60) next(); else if (info.offset.x > 60) prev(); }}>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
            {visual}
            <Eyebrow className="mt-7">0{i + 1} / 03</Eyebrow>
            <HS className="mt-3 whitespace-pre-line">{s.t}</HS>
            <Lead className="mt-3 max-w-[330px]">{s.b}</Lead>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Screen>
  );
}

export function StartChoice() {
  const go = useApp((s) => s.go);
  const newBody = useApp((s) => s.newBody);
  const desk = useDesk();
  return (
    <Screen>
      <div className="h-12" />
      <div className="lg:mx-auto lg:max-w-[980px]">
      <Eyebrow>You’re in</Eyebrow>
      <HS className="mt-3">Where do you<br />want to start?</HS>
      <Lead className="mt-3">You can always do the other one later.</Lead>
      <div className="lg:mt-10 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-5">
      <Glow color="#687ef5" variant="fade" as="button" onClick={() => { newBody(); go("units"); }} className="mt-7 block h-[236px] w-full rounded-[30px] p-5 lg:mt-0 lg:h-[400px] lg:p-8">
        <span className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.08em]">Recommended</span>
        <div className="mt-5 text-[24px] font-semibold lg:mt-8 lg:text-[32px]">Set up my body</div>
        <div className="mt-1 text-[14px] leading-snug text-white/65 lg:text-[16px]">4 quick measurements.<br />About 2 minutes.</div>
        <div className="mt-5 flex items-baseline gap-2 lg:absolute lg:bottom-8"><span className="serif text-[52px] leading-none lg:text-[80px]">04</span><span className="eyebrow text-white/60">Measures</span></div>
        <div className="absolute bottom-3 right-4 opacity-90 lg:bottom-6 lg:right-8"><BodyFigure width={desk ? 120 : 64} /></div>
      </Glow>
      <Glass onClick={() => go("templates")} className="relative mt-3 block h-[150px] w-full rounded-[28px] p-5 lg:mt-0 lg:h-[400px] lg:p-8">
        <div className="text-[22px] font-semibold lg:mt-12 lg:text-[28px]">Explore templates</div>
        <div className="mt-2 text-[14px] leading-snug text-white/60 lg:text-[15px]">Dresses, tops, pants and skirts,<br />ready to fit to a body.</div>
        <div className="mt-4 text-[12px] font-medium text-white/50 lg:absolute lg:bottom-8">10 styles</div>
        <div className="absolute right-4 top-3 lg:bottom-6 lg:right-8 lg:top-auto"><Flat g="aline" size={desk ? 170 : 86} /></div>
      </Glass>
      </div>
      </div>
      <div className={cx("h-8")} />
    </Screen>
  );
}
