"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { WIZARD, GROUPS, BASE } from "@/lib/data";
import { Screen, TopBar, Eyebrow, H1, Lead, Pill, Glow, Glass, Chip, Stepper, Check, cx } from "@/components/ui";
import { BodyFigure, Ruler } from "@/components/art";
import { Icon } from "@/components/icons";
import { HowSheet } from "./setup";

const groupIdx = (g: string) => GROUPS.findIndex((x) => x.key === g);
const inGroup = (g: string) => WIZARD.filter((w) => w.group === g);

function useProgress() {
  const body = useApp((s) => s.body());
  const doneIn = (g: string) => inGroup(g).filter((w) => body.done.includes(w.key)).length;
  const doneGroups = GROUPS.map((g, i) => (doneIn(g.key) === inGroup(g.key).length ? i + 1 : 0)).filter(Boolean);
  return { body, doneIn, doneGroups };
}

export function Wizard() {
  const { go } = useApp();
  const { body, doneIn } = useProgress();
  const firstOpen = GROUPS.findIndex((g) => doneIn(g.key) < inGroup(g.key).length);
  const cur = firstOpen === -1 ? 3 : firstOpen;
  const startAt = () => {
    const g = GROUPS[cur]; const idx = WIZARD.findIndex((w) => w.group === g.key && !body.done.includes(w.key));
    go("wstep", { i: idx === -1 ? WIZARD.findIndex((w) => w.group === g.key) : idx });
  };
  const nextLabel = (() => { const g = GROUPS[cur]; const w = WIZARD.find((x) => x.group === g.key && !body.done.includes(x.key)) ?? inGroup(g.key)[0]; return `Start step ${cur + 1} · ${w.label}`; })();
  return (
    <Screen footer={firstOpen === -1 ? <Pill onClick={() => go("alldone")}>See all 24 measures</Pill> : <Pill onClick={startAt}>{nextLabel}</Pill>}>
      <TopBar left="back" eyebrow={`Body · ${body.name}`} />
      <H1 className="mt-4">Let’s finish<br />your measures</H1>
      <Lead className="mt-2 text-[14px]">Four short steps, one measure at a time. We show you exactly where to put the tape.</Lead>
      <div className="mt-4 flex gap-2 overflow-x-auto noscroll"><Chip icon="ruler">Soft tape</Chip><Chip icon="user">A friend helps</Chip><Chip icon="body">Fitted clothes</Chip></div>
      <div className="relative mt-5 flex flex-col gap-2.5 pl-10">
        <div className="absolute bottom-10 left-[14px] top-10 w-px bg-white/15" />
        {GROUPS.map((g, i) => {
          const n = inGroup(g.key).length; const d = doneIn(g.key); const done = d === n; const active = i === cur && !done;
          const card = (
            <div className="flex items-start justify-between">
              <div className="pr-3"><div className="text-[16px] font-semibold">{g.title}</div><div className="mt-1 text-[12px] leading-snug text-white/60">{g.desc}</div></div>
              <div className="text-right"><div className="serif text-[28px] leading-none">{d}/{n}</div><div className="eyebrow mt-5 text-[9px] text-white/50">{done ? "Done" : `${g.mins} min`}</div></div>
            </div>
          );
          return (
            <div key={g.key} className="relative">
              <span className={cx("absolute -left-10 top-1/2 grid h-[28px] w-[28px] -translate-y-1/2 place-items-center rounded-full text-[11px] font-semibold", done ? "bg-primary" : active ? "bg-white text-bg" : "border border-white/25 bg-bg text-white/50")}>{done ? <Icon name="check" size={14} strokeWidth={2.6} /> : i + 1}</span>
              {active ? (
                <Glow as="button" color="#687ef5" variant="edge" onClick={startAt} className="block w-full rounded-[22px] p-4">{card}</Glow>
              ) : (
                <Glass onClick={() => go("wstep", { i: WIZARD.findIndex((w) => w.group === g.key) })} className="block w-full rounded-[22px] p-4">{card}</Glass>
              )}
            </div>
          );
        })}
      </div>
      <Eyebrow className="mt-5 text-[10px] text-white/40">20 measures · about 8 minutes · saved as you go</Eyebrow>
    </Screen>
  );
}

export function WizardStep({ p }: { p?: Record<string, unknown> }) {
  const { replace, units, go } = useApp();
  const setMeasure = useApp((s) => s.setMeasure);
  const confirm = useApp((s) => s.confirmMeasure);
  const { body, doneGroups } = useProgress();
  const i = Math.min(WIZARD.length - 1, Math.max(0, Number(p?.i ?? 0)));
  const m = WIZARD[i];
  const gi = groupIdx(m.group);
  const list = inGroup(m.group);
  const k = list.findIndex((x) => x.key === m.key);
  const next = WIZARD[i + 1];
  const lastOfGroup = !next || next.group !== m.group;
  const val = body.measures[m.key] ?? m.value;
  const [typing, setTyping] = useState(false);
  const [help, setHelp] = useState(false);
  const advance = (save: boolean) => {
    if (save) confirm(m.key);
    if (lastOfGroup) replace("wdone", { g: m.group }); else replace("wstep", { i: i + 1 });
  };
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="!w-[120px]" onClick={() => advance(false)}>Skip</Pill><Pill className="flex-1" onClick={() => advance(true)}>{lastOfGroup ? `Finish step ${gi + 1}` : `Next · ${next.label}`}</Pill></div>}>
      <TopBar left="close" onLeft={() => go("wizard")} eyebrow={`Measure · Step ${gi + 1} of 4`} center right="info" onRight={() => setHelp(true)} />
      <div className="mt-4"><Stepper step={gi + 1} done={doneGroups as number[]} /></div>
      <div className="mt-5 flex gap-1.5">{list.map((x, j) => <span key={x.key} className={cx("h-[3px] flex-1 rounded-full transition-colors", j < k ? "bg-primary" : j === k ? "bg-white" : "bg-white/15")} />)}</div>
      <AnimatePresence mode="wait">
        <motion.div key={m.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}>
          <Eyebrow className="mt-4 text-[10px]">{k + 1} of {list.length}</Eyebrow>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight">{m.label}</h1>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Glass className="flex h-[min(260px,30dvh)] items-center justify-center overflow-hidden rounded-[22px]"><BodyFigure sex={body.sex} width={96} markers={[m.marker]} label="HERE" className="h-[92%] w-auto" /></Glass>
            <Glass className="rounded-[22px] p-3.5">
              <Eyebrow className="text-[9px]">How to</Eyebrow>
              <ol className="mt-2.5 flex flex-col gap-3">{m.how.map((h, j) => <li key={j} className="flex gap-2 text-[12px] leading-snug text-white/80"><span className="mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-primary text-[9px] font-semibold">{j + 1}</span>{h}</li>)}</ol>
            </Glass>
          </div>
        </motion.div>
      </AnimatePresence>
      <Glow color="#687ef5" variant="fade" className="mt-2.5 rounded-[26px] px-4 pb-1 pt-3">
        <div className="flex items-center justify-between">
          {typing ? (
            <input autoFocus inputMode="decimal" defaultValue={fmt(val, units)} onBlur={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) setMeasure(m.key, Math.min(m.max, Math.max(m.min, units === "in" ? n * 2.54 : n))); setTyping(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} className="serif w-[150px] bg-transparent text-[44px] leading-none outline-none" />
          ) : (
            <span className="flex items-baseline gap-3"><span className="serif text-[44px] leading-none">{fmt(val, units)}</span><span className="text-[11px] uppercase text-white/60">{units}</span></span>
          )}
          <button onClick={() => setTyping(true)} className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium">Type it</button>
        </div>
        <Ruler value={val} min={m.min} max={m.max} onChange={(v) => setMeasure(m.key, v)} />
      </Glow>
      <HowSheet open={help} onClose={() => setHelp(false)} m={m} />
    </Screen>
  );
}

export function GroupDone({ p }: { p?: Record<string, unknown> }) {
  const { replace, go, units } = useApp();
  const { body, doneIn, doneGroups } = useProgress();
  const g = (p?.g as string) ?? "around";
  const gi = groupIdx(g);
  const G = GROUPS[gi];
  const list = inGroup(g);
  const nextG = GROUPS[gi + 1];
  const nextStart = nextG ? WIZARD.findIndex((w) => w.group === nextG.key) : -1;
  return (
    <Screen footer={<>{nextG ? <Pill onClick={() => replace("wstep", { i: nextStart })}>Start step {gi + 2} · {nextG.title}</Pill> : <Pill onClick={() => replace("alldone")}>See all 24 measures</Pill>}<button className="mt-2 h-10 w-full text-[14px] text-white/70" onClick={() => go("wizard")}>Take a break</button></>}>
      <TopBar left="close" onLeft={() => go("wizard")} eyebrow={`Measure · Step ${gi + 1} of 4`} center />
      <div className="mt-4"><Stepper step={Math.min(4, gi + 2)} done={doneGroups as number[]} /></div>
      <Glow color="#687ef5" variant="side" className="mt-6 rounded-[28px] p-5">
        <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-white text-bg"><Icon name="check" size={24} strokeWidth={2.4} /></span><span className="serif text-[34px] leading-none">{doneIn(g)}/{list.length}</span></div>
        <div className="mt-5 text-[22px] font-semibold">{G.title}, done.</div>
        <div className="mt-1 text-[13px] text-white/65">{doneIn(g)} of {list.length} {g === "around" ? "circumferences" : g === "down" ? "lengths" : g === "across" ? "widths" : "measures"} saved.</div>
      </Glow>
      <Glass className="mt-3 rounded-[24px] p-4">
        <div className="flex justify-between"><Eyebrow className="text-[9px]">Your numbers</Eyebrow><button onClick={() => replace("wstep", { i: WIZARD.findIndex((w) => w.group === g) })}><Icon name="pencil" size={16} className="text-white/60" /></button></div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">{list.map((w) => (
          <div key={w.key} className="flex items-baseline justify-between"><span className="text-[12px] text-white/60">{w.label}</span><span className="serif text-[22px]">{fmt(body.measures[w.key] ?? w.value, units)}</span></div>
        ))}</div>
      </Glass>
      {nextG && (
        <Glass className="mt-3 rounded-[24px] p-4 sel">
          <Eyebrow className="text-[9px]">Next up · Step {gi + 2}</Eyebrow>
          <div className="mt-2 flex justify-between"><div className="text-[18px] font-semibold">{nextG.title}</div><span className="serif text-[26px] text-white/60">0/{inGroup(nextG.key).length}</span></div>
          <p className="mt-1 text-[12px] leading-snug text-white/55">{nextG.desc}. About {nextG.mins} minutes.</p>
        </Glass>
      )}
    </Screen>
  );
}

export function AllDone() {
  const { go } = useApp();
  const { body, doneIn } = useProgress();
  const baseDone = BASE.filter((b) => body.done.includes(b.key)).length;
  const total = Math.min(24, doneIn("around") + doneIn("down") + doneIn("across") + doneIn("sitting") + Math.max(4, baseDone));
  return (
    <Screen bg={<div className="absolute inset-0" style={{ background: "radial-gradient(90% 40% at 50% 0%, rgba(104,126,245,.45), transparent 70%)" }} />}
      footer={<><Pill variant="dark" onClick={() => go("edit")}>Edit a measure</Pill><Pill className="mt-2.5" onClick={() => go("scanIntro")}>Save and continue</Pill></>}>
      <TopBar left="close" onLeft={() => go("wizard")} />
      <div className="mt-4"><Stepper step={4} done={[1, 2, 3, 4].filter((n) => doneIn(GROUPS[n - 1].key) === inGroup(GROUPS[n - 1].key).length)} /></div>
      <div className="serif mt-7 text-[72px] leading-none">{total}/24</div>
      <Eyebrow className="mt-2 text-[10px]">Measures saved</Eyebrow>
      <h1 className="mt-3 text-[24px] font-semibold tracking-tight">{total === 24 ? "Your body is fully measured." : "Nearly there."}</h1>
      <Lead className="mt-1 text-[13px]">Tap any group to check or change a number.</Lead>
      <div className="mt-5 flex flex-col gap-2">
        {[...GROUPS.map((g) => ({ t: g.title, d: doneIn(g.key), n: inGroup(g.key).length, i: WIZARD.findIndex((w) => w.group === g.key) })), { t: "Base measures", d: Math.max(4, baseDone), n: 4, i: -1 }].map((r) => (
          <Glass key={r.t} onClick={() => (r.i === -1 ? go("base") : go("wstep", { i: r.i }))} className="flex h-[52px] items-center gap-3 rounded-[18px] px-4">
            <Check on={r.d === r.n} size={22} className={r.d === r.n ? "!bg-primary !text-white" : ""} /><span className="flex-1 text-[14px] font-medium">{r.t}</span><span className="serif text-[24px]">{r.d}/{r.n}</span><Icon name="chevR" size={18} className="text-white/50" />
          </Glass>
        ))}
      </div>
    </Screen>
  );
}
