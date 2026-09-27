"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { BASE, WIZARD, ALL_MEASURES, defaultMeasures } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, HS, Lead, Pill, Glow, Glass, Chip, Arrows, RB, Check, Sheet, Num, cx, useToast, Blob } from "@/components/ui";
import { BodyFigure, Ruler } from "@/components/art";
import { Icon } from "@/components/icons";

const Mini = ({ light }: { light?: boolean }) => (
  <div className="flex h-7 items-end gap-[3px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("w-px", light ? "bg-white/80" : "bg-white/40")} style={{ height: i === 16 ? 28 : i % 5 === 0 ? 18 : 12, width: i === 16 ? 2 : 1 }} />)}</div>
);

export function Units() {
  const { units, set, go } = useApp();
  return (
    <Screen footer={<Arrows onNext={() => go("experience")} />}>
      <div className="h-12" />
      <Eyebrow>Set up · 01 / 02</Eyebrow>
      <H1 className="mt-4">How do you like<br />to measure?</H1>
      <Lead className="mt-3">We’ll use this for every body and pattern. Switch any time in Settings.</Lead>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {(["cm", "in"] as const).map((u) => (
          <Glow key={u} as="button" onClick={() => set({ units: u })} color={u === units ? "#687ef5" : "#3c4b63"} variant={u === units ? "fade" : "dim"} className="relative h-[240px] rounded-[26px] p-4">
            <div className="text-[16px] font-semibold">{u === "cm" ? "Centimetres" : "Inches"}</div>
            <div className="eyebrow mt-0.5 text-white/50">{u === "cm" ? "Metric" : "Imperial"}</div>
            {u === units && <Check className="absolute right-3.5 top-3.5" />}
            <div className="serif absolute inset-x-0 top-[88px] text-center text-[64px] leading-none">{u}</div>
            <div className="absolute inset-x-4 bottom-5"><Mini light={u === units} /></div>
          </Glow>
        ))}
      </div>
      <Glass className="mt-3 flex items-center justify-between rounded-[22px] px-5 py-4">
        <div><div className="eyebrow text-[10px]">Example</div><div className="mt-1 text-[15px] font-medium">Bust</div></div>
        <Num v={units === "cm" ? "88.0" : "34.6"} unit={units} size={34} />
      </Glass>
    </Screen>
  );
}

const EXP = [
  { t: "New to this", d: "Never made a garment", n: "01" },
  { t: "I’ve made a few things", d: "Follows patterns, sews them, doesn’t draft", n: "02", chips: ["Guided steps", "Plain language"] },
  { t: "I do this professionally", d: "Drafts, alters, knows the vocabulary", n: "03" },
];
export function Experience() {
  const { experience, set, go } = useApp();
  return (
    <Screen footer={<Arrows onNext={() => go("gender")} />}>
      <div className="h-12" />
      <Eyebrow>Set up · 02 / 02</Eyebrow>
      <HS className="mt-4">How much have<br />you sewn before?</HS>
      <Lead className="mt-3">We tune the guidance and vocabulary to you.</Lead>
      <div className="mt-6 flex flex-col gap-3">
        {EXP.map((e, i) => {
          const on = i === experience;
          return (
            <Glow key={i} as="button" onClick={() => set({ experience: i })} color={on ? "#687ef5" : "#3c4b63"} variant={on ? "edge" : "dim"} className={cx("relative w-full rounded-[26px] p-5 transition-all", on ? "min-h-[170px]" : "min-h-[104px]")}>
              <div className="pr-16 text-[17px] font-semibold">{e.t}</div>
              <div className="mt-1 max-w-[220px] text-[13px] text-white/60">{e.d}</div>
              <div className="serif absolute right-5 top-4 text-[40px] leading-none">{e.n}</div>
              {on && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex items-center justify-between">
                  <div className="flex gap-2">{(e.chips ?? ["Plain language"]).map((c) => <span key={c} className="rounded-full bg-white/15 px-3 py-1.5 text-[12px]">{c}</span>)}</div>
                  <Check />
                </motion.div>
              )}
            </Glow>
          );
        })}
      </div>
    </Screen>
  );
}

export function Gender() {
  const { go } = useApp();
  const body = useApp((s) => s.body());
  const update = useApp((s) => s.updateBody);
  return (
    <Screen footer={<Arrows onNext={() => go("method")} />}>
      <div className="h-12" />
      <Eyebrow>Body · 01 / 04</Eyebrow>
      <HS className="mt-4">Who are we<br />fitting?</HS>
      <Lead className="mt-3">This sets the base block Venty drafts from.</Lead>
      <div className="mt-7 grid grid-cols-2 gap-3">
        {(["female", "male"] as const).map((s) => {
          const on = body.sex === s;
          return (
            <Glow key={s} as="button" onClick={() => update({ sex: s })} color={on ? "#687ef5" : "#3c4b63"} variant={on ? "fade" : "dim"} className="relative h-[min(330px,40dvh)] rounded-[26px]">
              {on && <Check className="absolute right-3.5 top-3.5" />}
              <div className={cx("serif absolute inset-0 grid place-items-center text-[170px] leading-none", !on && "text-white/55")}>{s === "female" ? "F" : "M"}</div>
              <div className="eyebrow absolute inset-x-0 bottom-5 text-center text-white/70">{s}</div>
            </Glow>
          );
        })}
      </div>
      <Glass className="mt-3 flex items-start gap-3 rounded-[22px] px-4 py-4 text-[13px] text-white/60"><Icon name="info" size={20} className="shrink-0" />Every measurement you enter still overrides the base block.</Glass>
    </Screen>
  );
}

const SIZES: Record<string, Partial<Record<string, number>>> = {
  XS: { bust: 80, waist: 62, hips: 88, height: 160 }, S: { bust: 84, waist: 66, hips: 92, height: 164 }, M: { bust: 88, waist: 70, hips: 96, height: 168 },
  L: { bust: 94, waist: 76, hips: 102, height: 170 }, XL: { bust: 100, waist: 82, hips: 108, height: 172 },
};
export function Method() {
  const { go, set } = useApp();
  const body = useApp((s) => s.body());
  const update = useApp((s) => s.updateBody);
  const [m, setM] = useState<"general" | "enter">("enter");
  const [size, setSize] = useState("M");
  const next = () => {
    if (m === "general") { update({ measures: { ...defaultMeasures(), ...(SIZES[size] as Record<string, number>) }, done: ["height", "bust", "waist", "hips"] }); set({}); }
    go("name", { method: m });
  };
  return (
    <Screen footer={<Arrows onNext={next} />}>
      <div className="h-12" />
      <Eyebrow>Body · 02 / 04</Eyebrow>
      <HS className="mt-4">How should we<br />build your body?</HS>
      <div className="mt-7 flex flex-col gap-3">
        <Glow as="button" onClick={() => setM("general")} color={m === "general" ? "#687ef5" : "#3c4b63"} variant={m === "general" ? "edge" : "dim"} className="relative w-full rounded-[26px] p-5">
          <div className="text-[17px] font-semibold">Use a general body</div>
          <div className="mt-1 max-w-[230px] text-[13px] text-white/60">Start from a standard size. Fastest, least exact.</div>
          <div className="mt-4 flex gap-2">{Object.keys(SIZES).map((s) => (
            <span key={s} role="button" onClick={(e) => { e.stopPropagation(); setM("general"); setSize(s); }} className={cx("grid h-9 w-9 place-items-center rounded-full text-[12px] font-semibold", m === "general" && size === s ? "bg-white text-bg" : "bg-white/10 text-white/70")}>{s}</span>
          ))}</div>
          {m === "general" && <Check className="absolute bottom-5 right-5" />}
        </Glow>
        <Glow as="button" onClick={() => setM("enter")} color={m === "enter" ? "#687ef5" : "#3c4b63"} variant={m === "enter" ? "edge" : "dim"} className="relative w-full rounded-[26px] p-5">
          <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[.08em]">Recommended</span>
          <div className="mt-3 text-[17px] font-semibold">Enter my measurements</div>
          <div className="mt-1 max-w-[240px] text-[13px] text-white/60">Four quick measures now, the rest later for a closer fit.</div>
          <div className="mt-4 flex items-baseline gap-2"><span className="serif text-[48px] leading-none">04</span><span className="eyebrow text-[10px] leading-tight text-white/60">Measures<br />to start</span></div>
          {m === "enter" && <Check className="absolute bottom-5 right-5" />}
        </Glow>
      </div>
      <p className="mt-4 text-[12px] text-white/40">{body.sex === "male" ? "Male" : "Female"} base block</p>
    </Screen>
  );
}

export function NameBody({ p }: { p?: Record<string, unknown> }) {
  const { go } = useApp();
  const body = useApp((s) => s.body());
  const update = useApp((s) => s.updateBody);
  const [name, setName] = useState(body.name || "Me, Spring 26");
  const initials = useMemo(() => name.split(/[\s,·]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "ME", [name]);
  const next = () => { update({ name: name.trim() || "My body" }); go(p?.method === "general" ? "preview" : "base"); };
  return (
    <Screen footer={<Arrows onNext={next} />}>
      <div className="h-12" />
      <Eyebrow>Body · 03 / 04</Eyebrow>
      <H1 className="mt-4">Name this body</H1>
      <Lead className="mt-2">Make one for yourself, a client, or anyone you sew for.</Lead>
      <div className="mt-10 flex justify-center"><Glow color="#687ef5" variant="orb" className="grid h-[120px] w-[120px] place-items-center rounded-[30px]"><span className="serif text-[54px]">{initials}</span></Glow></div>
      <label className="glass mt-8 block rounded-[24px] px-5 py-4">
        <span className="eyebrow text-[10px]">Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-transparent text-[22px] font-medium outline-none caret-primary" />
      </label>
      <Eyebrow className="mt-6 text-white/40">Suggestions</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">{["Me", "Mum", "Client · Ana", "Sister"].map((s) => <Chip key={s} on={name === s} onClick={() => setName(s)}>{s}</Chip>)}</div>
      <Glass className="mt-6 flex items-center gap-3 rounded-[22px] px-4 py-4 text-[13px] text-white/60"><Icon name="layers" size={22} className="shrink-0" />Bodies are saved to your library. Make one per person you sew for.</Glass>
    </Screen>
  );
}

const feet = (cm: number) => { const inch = cm / 2.54; return `${Math.floor(inch / 12)}'${Math.round(inch % 12)}"`; };

export function BaseMeasures() {
  const { go, units } = useApp();
  const body = useApp((s) => s.body());
  const [sheet, setSheet] = useState(false);
  const M = body.measures; const d = (k: string) => body.done.includes(k);
  const extra = body.done.filter((k) => WIZARD.some((w) => w.key === k)).length;
  const v = (k: string) => (units === "in" ? (M[k] / 2.54).toFixed(0) : Math.round(M[k]).toString());
  const tile = (k: string, label: string, color: string, variant: "edge" | "fade" | "dim", viz: React.ReactNode) => (
    <Glow as="button" onClick={() => go("measure", { key: k })} color={color} variant={variant} className="relative h-[150px] rounded-[26px] p-4">
      <div className="text-[13px] font-medium">{label}</div>
      {d(k) && <span className="absolute right-3 top-3"><Check size={20} /></span>}
      <div className="mt-2">{viz}</div>
      <div className="absolute bottom-3.5 left-4"><Num v={v(k)} unit={units} size={36} /></div>
    </Glow>
  );
  return (
    <Screen footer={<Arrows onNext={() => setSheet(true)} />}>
      <div className="h-12" />
      <Eyebrow>Body · 04 / 04</Eyebrow>
      <H1 className="mt-4">Base measures</H1>
      <Lead className="mt-2 text-[14px]">Four to start. Tape snug, not tight, over light clothing.</Lead>
      <Glow as="button" onClick={() => go("measure", { key: "height" })} color="#687ef5" variant="side" className="relative mt-6 block h-[120px] w-full rounded-[26px] p-4">
        <div className="text-[13px] font-medium">Height</div>
        {d("height") && <span className="absolute left-[70px] top-3.5"><Check size={20} /></span>}
        <div className="absolute bottom-3.5 left-4"><Num v={v("height")} unit={units} size={40} /></div>
        <div className="absolute right-5 top-1/2 grid h-[76px] w-[76px] -translate-y-1/2 place-items-center rounded-full border border-white/40"><span className="serif text-[24px]">{feet(M.height)}</span></div>
      </Glow>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {tile("bust", "Bust", "#3c4b63", "dim", <div className="relative mt-3 h-px bg-white/60"><span className="absolute left-1/2 -top-1 h-2 w-px bg-white" /></div>)}
        {tile("waist", "Waist", "#687ef5", "fade", <div className="mt-4 flex gap-1.5">{Array.from({ length: 12 }, (_, i) => <span key={i} className="h-1 w-1 rounded-full bg-white/70" />)}</div>)}
        {tile("hips", "Hips", "#4d5e85", "dim", <Mini />)}
        <Glow as="button" onClick={() => go("wizard")} color="#8c9cf8" variant="orb" className="relative h-[150px] rounded-[26px] p-4">
          <div className="text-[13px] font-medium">All measures</div>
          <div className="mt-1 text-[11px] leading-snug text-white/60">Add them for a<br />closer fit</div>
          <div className="serif absolute bottom-3 left-4 text-[40px] leading-none">+{20 - extra}</div>
        </Glow>
      </div>
      <FinishSheet open={sheet} onClose={() => setSheet(false)} />
    </Screen>
  );
}

function FinishSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { go } = useApp();
  const body = useApp((s) => s.body());
  const n = Math.min(24, body.done.length + (body.done.length < 4 ? 4 - body.done.length : 0));
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-end gap-3"><span className="serif text-[60px] leading-none">{n}/24</span><span className="eyebrow mb-2 text-white/60">Measures done</span></div>
      <div className="mt-4 flex gap-[5px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("h-2 flex-1 rounded-full", i < n ? "bg-primary" : "bg-white/15")} />)}</div>
      <h3 className="mt-6 text-[22px] font-semibold leading-tight">Finish the rest of your<br />measures now?</h3>
      <p className="mt-2 text-[14px] leading-snug text-white/60">20 more — around, down and across you — give the closest fit. About 8 minutes with a tape.</p>
      <Pill className="mt-6" onClick={() => { onClose(); go("wizard"); }}>Yes, let’s finish</Pill>
      <Pill className="mt-2.5" variant="glass" onClick={() => { onClose(); go("scanIntro"); }}>Later — preview my body</Pill>
    </Sheet>
  );
}

export function MeasureBase({ p }: { p?: Record<string, unknown> }) {
  const { back, units } = useApp();
  const body = useApp((s) => s.body());
  const setMeasure = useApp((s) => s.setMeasure);
  const confirm = useApp((s) => s.confirmMeasure);
  const key = (p?.key as string) ?? "bust";
  const i = BASE.findIndex((b) => b.key === key);
  const m = BASE[i] ?? BASE[1];
  const nextM = BASE[i + 1];
  const val = body.measures[m.key] ?? m.value;
  const [help, setHelp] = useState(false);
  const save = () => { confirm(m.key); if (nextM) useApp.getState().replace("measure", { key: nextM.key }); else back(); };
  return (
    <Screen fixed footer={<Arrows onPrev={() => (i > 0 ? useApp.getState().replace("measure", { key: BASE[i - 1].key }) : back())} onNext={save} />}>
      <div className="flex items-start justify-between">
        <div className="pt-1"><Eyebrow>Base measure · 0{i + 1} / 04</Eyebrow><h1 className="mt-1.5 text-[26px] font-semibold tracking-tight">{m.label}</h1></div>
        <RB icon="help" onClick={() => setHelp(true)} />
      </div>
      <div className="relative mt-2 flex h-[min(360px,40dvh)] items-start">
        <div className="h-full shrink-0"><BodyFigure sex={body.sex} width={Math.min(150, 150)} markers={[m.marker]} className="h-full w-auto" /></div>
        <div className="flex-1 pl-2 pt-14">
          <div className="eyebrow text-[10px]">Current</div>
          <AnimatePresence mode="popLayout"><motion.div key={val} initial={{ y: 6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="serif text-[68px] leading-[1]">{fmt(val, units)}</motion.div></AnimatePresence>
          <div className="eyebrow mt-1 text-[10px] text-white/70">{units}  ·  {units === "cm" ? (val / 2.54).toFixed(1) + " in" : val.toFixed(1) + " cm"}</div>
          <p className="mt-5 text-[13px] leading-snug text-white/60">{m.hint}</p>
        </div>
      </div>
      <Glow color="#4d5e85" variant="edge" className="mt-3 rounded-[30px] px-5 pb-5 pt-4">
        <div className="flex items-center justify-between text-[11px] text-white/50"><span>{fmt(val - 0.5, units)}</span><span className="flex flex-col items-center gap-1 text-white/80"><Icon name="ruler" size={18} /><span className="text-[13px]">Slide to adjust</span></span><span>{fmt(val + 0.5, units)}</span></div>
        <Ruler value={val} min={m.min} max={m.max} onChange={(v) => setMeasure(m.key, v)} className="mt-1" />
        <div className="mt-2 flex items-center gap-3">
          <RB icon="refresh" onClick={() => setMeasure(m.key, m.value)} label="Reset" />
          <button onClick={save} className="tap glass-2 flex h-14 flex-1 items-center justify-between rounded-full pl-6 pr-2 text-[14px] font-medium">
            <span>{nextM ? `Save · next: ${nextM.label}` : "Save · all four done"}</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-bg"><Icon name="check" size={20} strokeWidth={2.4} /></span>
          </button>
        </div>
      </Glow>
      <HowSheet open={help} onClose={() => setHelp(false)} m={m} />
    </Screen>
  );
}

export function HowSheet({ open, onClose, m }: { open: boolean; onClose: () => void; m: (typeof ALL_MEASURES)[number] }) {
  const body = useApp((s) => s.body());
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex gap-4">
        <div className="glass grid h-[190px] w-[120px] shrink-0 place-items-center rounded-[22px]"><BodyFigure sex={body.sex} width={70} markers={[m.marker]} /></div>
        <div>
          <Eyebrow>How to measure</Eyebrow>
          <h3 className="mt-1 text-[24px] font-semibold">{m.label}</h3>
          <ol className="mt-3 flex flex-col gap-2.5">{m.how.map((h, i) => <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-white/75"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">{i + 1}</span>{h}</li>)}</ol>
        </div>
      </div>
      <Glass className="mt-5 flex items-center gap-3 rounded-[20px] p-3 text-[13px] text-white/70"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Icon name="video" size={18} /></span>Watch a 20-second video<span className="ml-auto text-white/40">0:20</span></Glass>
      <Pill className="mt-5" variant="white" onClick={onClose}>Got it</Pill>
    </Sheet>
  );
}

// ─── Photo scan (optional) ────────────────────────────────────────────
export function ScanIntro() {
  const { go } = useApp();
  return (
    <Screen footer={<><Pill onClick={() => go("scanPrep")}>Try photo scan</Pill><button className="mt-2 h-11 w-full text-[14px] font-medium" onClick={() => go("preview")}>Skip for now</button></>}>
      <TopBar left="back" eyebrow="Optional" />
      <H1 className="mt-5">Want an even<br />closer fit?</H1>
      <Lead className="mt-3">Photo scan reads your proportions from three photos and fills in the gaps.</Lead>
      <Glow color="#4d5e85" variant="edge" className="relative mx-auto mt-8 grid aspect-square w-full max-w-[330px] place-items-center rounded-[36px]">
        <svg viewBox="0 0 200 200" className="absolute h-[82%] w-[82%]" style={{ animation: "spin 30s linear infinite" }}>{Array.from({ length: 72 }, (_, i) => <line key={i} x1="100" y1="6" x2="100" y2={i % 6 === 0 ? 16 : 12} stroke="#fff" strokeOpacity={i % 6 === 0 ? 0.8 : 0.35} transform={`rotate(${i * 5} 100 100)`} />)}</svg>
        <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-bg shadow-[0_0_60px_rgba(255,255,255,.35)]"><Icon name="camera" size={34} /></div>
        <div className="eyebrow absolute bottom-6 text-white/70">Front · Back · Side</div>
      </Glow>
    </Screen>
  );
}

export function ScanPrep() {
  const { go } = useApp();
  const tips = [["01", "Wear fitted clothes", "#687ef5"], ["02", "Plain wall behind you", "#a0abca"], ["03", "Phone propped at hip height", "#8c9cf8"], ["04", "Three steps back", "#4f63e0"]];
  return (
    <Screen footer={<Pill onClick={() => go("scanCam")}>Open camera</Pill>}>
      <TopBar left="back" eyebrow="Photo scan · Prep" />
      <H1 className="mt-4">Before you scan</H1>
      <div className="mt-5 grid grid-cols-2 gap-3">{tips.map(([n, t, c]) => (
        <Glow key={n} color={c} variant="fade" className="h-[124px] rounded-[24px] p-4"><div className="serif text-[34px] leading-none">{n}</div><div className="absolute bottom-4 left-4 right-4 text-[14px] font-semibold leading-tight">{t}</div></Glow>
      ))}</div>
      <Glass className="mt-4 rounded-[22px] p-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold"><Icon name="lock" size={18} />Private by design</div>
        <p className="mt-1.5 text-[13px] leading-snug text-white/55">Photos are read on your phone, never uploaded, and deleted the moment you leave this screen.</p>
      </Glass>
      <Eyebrow className="mt-5 text-white/40">You’ll take</Eyebrow>
      <div className="mt-3 flex gap-2"><Chip icon="user">Full body · Front</Chip><Chip>Back</Chip><Chip>Side</Chip></div>
    </Screen>
  );
}

export function ScanCam() {
  const { replace, updateBody } = { replace: useApp((s) => s.replace), updateBody: useApp((s) => s.updateBody) };
  const body = useApp((s) => s.body());
  const video = useRef<HTMLVideoElement>(null);
  const [shot, setShot] = useState(0);
  const [live, setLive] = useState(false);
  const [reading, setReading] = useState(false);
  const views = ["Front", "Back", "Side"];
  useEffect(() => {
    let stream: MediaStream | null = null; let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        if (video.current) { video.current.srcObject = stream; await video.current.play().catch(() => {}); setLive(true); }
      } catch { /* no camera: keep the illustrated view */ }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, []);
  const snap = () => {
    try { navigator.vibrate?.(20); } catch {}
    if (shot < 2) setShot(shot + 1);
    else { setReading(true); setTimeout(() => { updateBody({ photoScan: true }); replace("preview"); }, 2200); }
  };
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#10121c]">
      <video ref={video} playsInline muted className={cx("absolute inset-0 h-full w-full object-cover transition-opacity", live ? "opacity-60" : "opacity-0")} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 50% at 50% 40%, rgba(104,126,245,.25), transparent 70%)" }} />
      <div className="absolute inset-x-0 top-[16%] flex justify-center opacity-70"><BodyFigure sex={body.sex} width={170} dim={0.8} /></div>
      <div className="absolute inset-x-0 top-[16%] h-[60%] overflow-hidden"><div className="h-1/3 w-full bg-gradient-to-b from-transparent via-primary/30 to-transparent" style={{ animation: "scan 2.4s ease-in-out infinite alternate" }} /></div>
      <div className="relative flex items-center justify-between px-6" style={{ paddingTop: "var(--top)" }}>
        <RB icon="close" onClick={() => useApp.getState().back()} />
        <span className="serif text-[34px]">{Math.min(3, shot + 1)}/3</span>
      </div>
      <div className="relative mt-3 flex justify-center"><div className="glass flex rounded-full p-1">{views.map((v, i) => <span key={v} className={cx("rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[.06em]", i === shot ? "bg-white text-bg" : "text-white/60")}>{v}</span>)}</div></div>
      <div className="absolute inset-x-0 bottom-[150px] flex justify-center"><div className="glass-2 rounded-full px-4 py-2.5 text-[13px]">{reading ? "Reading your proportions…" : `Step back — fit your whole body in the outline (${views[shot].toLowerCase()})`}</div></div>
      <div className="absolute inset-x-0 flex items-center justify-between px-10" style={{ bottom: "calc(var(--bottom) + 20px)" }}>
        <span className="h-11 w-11 rounded-xl border border-white/20 bg-white/10" />
        <button onClick={snap} disabled={reading} className="tap grid h-[78px] w-[78px] place-items-center rounded-full border-[3px] border-white">
          {reading ? <span className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin .8s linear infinite" }} /> : <span className="h-[62px] w-[62px] rounded-full bg-white" />}
        </button>
        <RB icon="flash" />
      </div>
    </div>
  );
}

// ─── Body preview / edit / ready ──────────────────────────────────────
export function Preview() {
  const { go, units } = useApp();
  const body = useApp((s) => s.body());
  const [view, setView] = useState(0); // 0 front 1 side 2 back
  const views = ["Front", "Side", "Back"];
  const count = Math.max(4, body.done.length);
  const sx = view === 1 ? 0.55 : 1;
  const dragStart = useRef<number | null>(null);
  const M = body.measures;
  const shape = Math.min(1.12, Math.max(0.9, ((M.bust + M.hips) / 2 - M.waist * 0.3) / 71));
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => go("edit")}>Edit measures</Pill><Pill className="flex-1" onClick={() => go("ready")}>Save body</Pill></div>}>
      <TopBar left="back" eyebrow="Body preview" right="more" onRight={() => go("edit")} />
      <H1 className="mt-3">{body.name}</H1>
      <Eyebrow className="mt-1 text-[10px]">{count}/24 measures{body.photoScan ? " · Photo scan on" : ""}</Eyebrow>
      <div className="relative mt-2 flex h-[min(430px,50dvh)] touch-none items-center justify-center"
        onPointerDown={(e) => (dragStart.current = e.clientX)} onPointerUp={(e) => { if (dragStart.current !== null) { const dx = e.clientX - dragStart.current; if (Math.abs(dx) > 30) setView((v) => (v + (dx < 0 ? 1 : 2)) % 3); } dragStart.current = null; }}>
        <Blob className="left-1/2 top-1/2 h-[300px] w-[220px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
        <motion.div animate={{ scaleX: sx, opacity: 1 }} transition={{ type: "spring", bounce: 0.2 }} className="relative h-full">
                    <div className="relative flex h-full justify-center"><BodyFigure sex={body.sex} width={170} variant="solid" scaleX={shape} className="h-full w-auto" /></div>
        </motion.div>
        <RB icon="back" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={() => setView((v) => (v + 2) % 3)} />
        <RB icon="chevR" className="absolute right-0 top-1/2 -translate-y-1/2" onClick={() => setView((v) => (v + 1) % 3)} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><span className="glass-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.08em]">3D · {views[view]} · drag to rotate</span></div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">{BASE.map((b) => (
        <Glass key={b.key} onClick={() => go("edit", { key: b.key })} className="rounded-[18px] px-3 py-3"><div className="eyebrow text-[9px]">{b.label}</div><div className="serif mt-2 text-[28px] leading-none">{units === "in" ? (M[b.key] / 2.54).toFixed(0) : Math.round(M[b.key])}</div></Glass>
      ))}</div>
    </Screen>
  );
}

export function EditMeasures({ p }: { p?: Record<string, unknown> }) {
  const { back, units } = useApp();
  const body = useApp((s) => s.body());
  const setMeasure = useApp((s) => s.setMeasure);
  const list = [...BASE, WIZARD[0], WIZARD[1], WIZARD[5], WIZARD[2]];
  const [sel, setSel] = useState<string>((p?.key as string) ?? "waist");
  const m = ALL_MEASURES.find((x) => x.key === sel)!;
  const v = body.measures[sel] ?? m.value;
  const { toast, node } = useToast();
  return (
    <Screen footer={<Pill onClick={() => { toast("Changes saved"); setTimeout(back, 700); }}>Save changes</Pill>}>
      <TopBar left="back" eyebrow={body.name} />
      <H1 className="mt-3">Edit measures</H1>
      <div className="mt-4 flex gap-3">
        <div className="flex w-[40%] justify-center pt-2"><BodyFigure sex={body.sex} width={130} markers={[m.marker]} /></div>
        <div className="flex flex-1 flex-col gap-2">{list.map((x) => (
          <Glass key={x.key} onClick={() => setSel(x.key)} selected={x.key === sel} className="flex h-[46px] items-center justify-between rounded-[14px] px-3.5">
            <span className="text-[12px] text-white/70">{x.label}</span><span className="serif text-[22px]">{fmt(body.measures[x.key] ?? x.value, units).replace(/\.0$/, "")}</span>
          </Glass>
        ))}</div>
      </div>
      <Glow color="#687ef5" variant="fade" className="mt-4 rounded-[28px] p-4">
        <div className="text-[15px] font-semibold">{m.label}</div>
        <div className="eyebrow text-[9px] text-white/60">{m.hint.slice(0, 44)}</div>
        <div className="mt-2 flex items-center justify-between">
          <RB icon="back" size={36} onClick={() => setMeasure(sel, Math.max(m.min, v - 0.5))} />
          <span className="serif text-[52px] leading-none">{fmt(v, units)}</span>
          <RB icon="chevR" size={36} onClick={() => setMeasure(sel, Math.min(m.max, v + 0.5))} />
        </div>
        <Ruler value={v} min={m.min} max={m.max} onChange={(nv) => setMeasure(sel, nv)} className="mt-1" />
      </Glow>
      {node}
    </Screen>
  );
}

export function Ready() {
  const { go, home, set, activeBody } = useApp();
  const body = useApp((s) => s.body());
  const count = Math.max(4, body.done.length);
  return (
    <Screen footer={<><Pill onClick={() => { useApp.getState().newDraft({ bodyId: activeBody }); go("prompt"); }}>Start a pattern</Pill><Pill variant="dark" className="mt-2.5" onClick={() => { set({}); home(); }}>Go to home</Pill></>}
      bg={<div className="absolute inset-0" style={{ background: "radial-gradient(80% 45% at 50% 20%, rgba(104,126,245,.55), transparent 70%)" }} />}>
      <div className="flex h-[min(360px,44dvh)] justify-center pt-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}><BodyFigure sex={body.sex} width={140} variant="solid" className="h-full w-auto" /></motion.div></div>
      <span className="mt-4 inline-block rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.08em]">Saved to bodies</span>
      <h1 className="mt-3 text-[28px] font-semibold tracking-tight">Your body is ready.</h1>
      <Lead className="mt-1 text-[14px]">Want to turn a dress you love into a pattern now?</Lead>
      <Glass className="mt-5 flex items-center justify-between rounded-[20px] px-5 py-4"><span className="text-[15px] font-medium">{body.name}</span><span className="serif text-[30px]">{count}/24</span></Glass>
    </Screen>
  );
}

