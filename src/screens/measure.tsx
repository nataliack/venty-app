"use client";
// One measuring UI for every measure in the app (base and the extra 20), so it always reads the same way.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { BASE, WIZARD, GROUPS, type Measure } from "@/lib/data";
import { Screen, RB, Arrows, Sheet, Pill, FlowProgress, Glass, cx, useDesk } from "@/components/ui";
import { BodyFigure, Ruler } from "@/components/art";
import { Icon } from "@/components/icons";

// ─── Flow header: exit on the left, then labelled progress running to the right edge ───
export function FlowHeader({ steps, onClose }: { steps: { label: string; value: number }[]; onClose?: () => void }) {
  const exitFlow = useApp((s) => s.exitFlow);
  return (
    <div className="flex h-14 items-center gap-4">
      <RB icon="close" size={40} onClick={onClose ?? exitFlow} label="Close" />
      <FlowProgress steps={steps} className="flex-1 pt-[18px]" />
    </div>
  );
}

// Body setup: Body · Method · Measures · Review
export const BODY_STEPS = ["Body", "Method", "Measures", "Review"];
export const bodySteps = (step: number, sub = 0) => BODY_STEPS.map((label, i) => ({ label, value: i < step ? 1 : i === step ? sub : 0 }));

// Extra measures: Base (done) · Wraps · Lengths · Widths · Seated
export function useWizardSteps(curGroup?: string, curFrac?: number) {
  const body = useApp((s) => s.body());
  return [
    { label: "Base", value: 1 },
    ...GROUPS.map((g) => {
      const list = WIZARD.filter((w) => w.group === g.key);
      const done = list.filter((w) => body.done.includes(w.key)).length / list.length;
      return { label: g.short, value: g.key === curGroup && curFrac !== undefined ? Math.max(done, curFrac) : done };
    }),
  ];
}

export function HowSheet({ open, onClose, m }: { open: boolean; onClose: () => void; m: Measure }) {
  const body = useApp((s) => s.body());
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex gap-4">
        <div className="glass grid h-[190px] w-[120px] shrink-0 place-items-center rounded-[22px]"><BodyFigure sex={body.sex} width={70} markers={[m.marker]} /></div>
        <div>
          <div className="text-[14px] text-white/55">How to measure</div>
          <h3 className="mt-1 text-[26px] font-normal tracking-[-.03em]">{m.label}</h3>
          <ol className="mt-3 flex flex-col gap-2.5">{m.how.map((h, i) => <li key={i} className="flex gap-2.5 text-[15px] leading-snug text-white/80"><span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/15 text-[12px] font-medium">{i + 1}</span>{h}</li>)}</ol>
        </div>
      </div>
      <Pill className="mt-6" variant="white" onClick={onClose}>Got it</Pill>
    </Sheet>
  );
}

// Value control: − [ value ] + , then the ruler. Empty until the user sets it.
function ValueControl({ m, val, set, onSet }: { m: Measure; val: number | null; set: (v: number) => void; onSet: () => void }) {
  const units = useApp((s) => s.units);
  const [typing, setTyping] = useState(false);
  const base = val ?? m.value;
  const step = 0.5;
  const bump = (d: number) => { set(Math.min(m.max, Math.max(m.min, (val === null ? m.value : base + d)))); onSet(); };
  const other = units === "cm" ? `${(base / 2.54).toFixed(1)} in` : `${base.toFixed(1)} cm`;
  return (
    <div className={cx("field relative overflow-hidden !rounded-[26px] px-3 pt-3", val === null && "!border-white/25")}>
      <div className="flex items-center justify-between gap-2">
        <RB icon="minus" size={48} onClick={() => bump(-step)} label={`Minus ${step} ${units}`} />
        <button onClick={() => setTyping(true)} className="flex min-w-0 flex-1 flex-col items-center" aria-label="Type a value">
          {typing ? (
            <input autoFocus inputMode="decimal" defaultValue={val === null ? "" : fmt(base, units)} placeholder={fmt(m.value, units)}
              onBlur={(e) => { const n = parseFloat(e.target.value.replace(",", ".")); if (!isNaN(n)) { set(Math.min(m.max, Math.max(m.min, units === "in" ? n * 2.54 : n))); onSet(); } setTyping(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className="serif w-[180px] bg-transparent text-center text-[56px] leading-none outline-none placeholder:text-white/20" />
          ) : (
            <span className="flex items-baseline gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={val === null ? "empty" : base} initial={{ y: 6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className={cx("serif text-[56px] leading-none", val === null && "text-white/25")} translate="no">{val === null ? "—" : fmt(base, units)}</motion.span>
              </AnimatePresence>
              <span className="unit" translate="no">{units}</span>
            </span>
          )}
          <span className="mt-1 text-[13px] text-white/45" translate="no">{val === null ? "Tap to type, or slide below" : other}</span>
        </button>
        <RB icon="plus" size={48} onClick={() => bump(step)} label={`Plus ${step} ${units}`} />
      </div>
      <div className={cx("-mx-3 mt-1 transition-opacity", val === null && "opacity-45")}>
        <Ruler value={base} min={m.min} max={m.max} onChange={(v) => { set(v); onSet(); }} />
      </div>
    </div>
  );
}

export function MeasureStep({ m, header, nextLabel, onNext, onPrev, cheer }: { m: Measure; header: ReactNode; nextLabel: string; onNext: () => void; onPrev: () => void; cheer?: string }) {
  const body = useApp((s) => s.body());
  const setMeasure = useApp((s) => s.setMeasure);
  const confirm = useApp((s) => s.confirmMeasure);
  const isEst = (body.est ?? []).includes(m.key);
  const [touched, setTouched] = useState(body.done.includes(m.key) || isEst);
  const val = touched ? body.measures[m.key] ?? m.value : null;
  const [help, setHelp] = useState(false);
  const desk = useDesk();
  const go = () => { confirm(m.key); onNext(); };
  const label = isEst && touched ? `Looks right · ${nextLabel}` : nextLabel;
  // a moment after a value is set, the Next button pulses and a line invites the next measure
  const [nudge, setNudge] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSet = () => { setTouched(true); if (t.current) clearTimeout(t.current); setNudge(false); t.current = setTimeout(() => setNudge(true), 900); };
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);

  const title = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="h1 !text-[32px] lg:!text-[48px]">{m.label}</h1>
        <p className="mt-1.5 text-[16px] leading-snug text-white/60">{m.hint}</p>
      </div>
      <RB icon="help" size={40} onClick={() => setHelp(true)} label="How to measure" className="shrink-0" />
    </div>
  );
  // the how-to steps live only in the help sheet; the screen shows the figure, full width and centred
  // (svg fills its box and centres itself through the viewBox, so it never drifts off-centre)
  const figure = (h: string) => (
    <Glass className={cx("overflow-hidden", h)}><BodyFigure sex={body.sex} width={120} markers={[m.marker]} className="h-full w-full py-[4%]" /></Glass>
  );
  const est = isEst && (
    <div className="mb-2 flex items-center gap-2 text-[14px] text-peri"><Icon name="sparkle" size={16} />AI estimate from your photos. Check it, change it if needed.</div>
  );
  const footer = (
    <div>
      <AnimatePresence>{nudge && cheer && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
          <div className="flex items-center justify-end gap-2 pb-2.5 text-[15px] text-white/75"><span className="grid h-5 w-5 place-items-center rounded-full bg-primary"><Icon name="check" size={12} strokeWidth={3} /></span>{cheer}</div>
        </motion.div>)}</AnimatePresence>
      <Arrows onPrev={onPrev} onNext={go} ready={val !== null} label={label} nudge={nudge} />
    </div>
  );
  return (
    <Screen header={header} footer={footer}>
      <AnimatePresence mode="wait">
        <motion.div key={m.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}
          className="lg:mt-6 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
          {desk ? (
            <>
              {figure("h-[min(600px,64dvh)] rounded-[32px]")}
              <div className="lg:self-center">{title}<div className="mt-8">{est}<ValueControl m={m} val={val} set={(v) => setMeasure(m.key, v)} onSet={onSet} /></div></div>
            </>
          ) : (
            <>
              <div className="mt-3">{title}</div>
              <div className="mt-4">{figure("h-[min(340px,38dvh)] rounded-[24px]")}</div>
              <div className="mt-4">{est}<ValueControl m={m} val={val} set={(v) => setMeasure(m.key, v)} onSet={onSet} /></div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <HowSheet open={help} onClose={() => setHelp(false)} m={m} />
    </Screen>
  );
}

// Base measure route: { key, edit? }  — in the flow it walks height → bust → waist → hips → review.
export function MeasureBase({ p }: { p?: Record<string, unknown> }) {
  const { back, replace } = useApp();
  const body = useApp((s) => s.body());
  const key = (p?.key as string) ?? "height";
  const edit = !!p?.edit;
  const i = Math.max(0, BASE.findIndex((b) => b.key === key));
  const m = BASE[i];
  const nextM = BASE[i + 1];
  const doneN = BASE.filter((b) => body.done.includes(b.key)).length;
  const reviewing = edit || !!body.photoScan;
  const header = <FlowHeader steps={bodySteps(reviewing ? 3 : 2, reviewing ? doneN / 4 : i / 4)} />;
  const onNext = () => (edit ? back() : nextM ? replace("measure", { key: nextM.key }) : replace("base"));
  const onPrev = () => (edit || i === 0 ? back() : replace("measure", { key: BASE[i - 1].key }));
  return <MeasureStep key={m.key} m={m} header={header} onNext={onNext} onPrev={onPrev}
    nextLabel={edit ? "Save" : nextM ? `Next: ${nextM.label}` : "Review"} cheer={edit ? undefined : nextM ? `Nice. ${nextM.label} is next.` : "All four done. Let’s review."} />;
}
