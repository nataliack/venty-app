"use client";
// One measuring UI for every measure in the app (base and the extra 20), so it always reads the same way.
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { BASE, WIZARD, GROUPS, type Measure } from "@/lib/data";
import { Screen, RB, Arrows, Sheet, Pill, FlowProgress, Glass, cx, useDesk } from "@/components/ui";
import { BodyFigure, SeatedFigure, Ruler } from "@/components/art";
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
        <div className="glass grid h-[190px] w-[120px] shrink-0 place-items-center overflow-hidden rounded-[22px] p-2">{m.group === "sitting" ? <SeatedFigure className="h-full w-full" /> : <BodyFigure sex={body.sex} width={70} markers={[m.marker]} />}</div>
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

// Value control: − [ value ] + , then the ruler flush along the card's bottom edge. Empty until the user sets it.
// The value row has a fixed height, so the card never changes size between empty, set and typing.
function ValueControl({ m, val, set, onSet }: { m: Measure; val: number | null; set: (v: number) => void; onSet: () => void }) {
  const units = useApp((s) => s.units);
  const [typing, setTyping] = useState(false);
  const base = val ?? m.value;
  const step = 0.5;
  // with no value yet, − and + open the keyboard instead of jumping to an average (nothing is pre-filled)
  const bump = (d: number) => { if (val === null) { setTyping(true); return; } set(Math.min(m.max, Math.max(m.min, base + d))); onSet(); };
  return (
    <div data-need={val === null ? "1" : "0"} className="dial">
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <RB icon="minus" size={48} onClick={() => bump(-step)} label={`Minus ${step} ${units}`} className="rb-plain" />
        <button onClick={() => setTyping(true)} className="flex h-[60px] min-w-0 flex-1 items-center justify-center" aria-label={val === null ? "Type a value" : `${fmt(base, units)} ${units}. Type a value`}>
          {typing ? (
            <span className="flex items-baseline gap-2">
              <input inputMode="decimal" defaultValue={val === null ? "" : fmt(base, units)} placeholder="—"
              // focus with the old value selected, so typing replaces it instead of adding to the end of it
              ref={(el) => { if (el && document.activeElement !== el) { el.focus(); el.select(); setTimeout(() => el.select(), 0); } }}
              onFocus={(e) => e.currentTarget.select()}
                onBlur={(e) => { const n = parseFloat(e.target.value.replace(",", ".")); if (!isNaN(n)) { set(Math.min(m.max, Math.max(m.min, units === "in" ? n * 2.54 : n))); onSet(); } setTyping(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                className="serif h-[60px] w-[130px] bg-transparent text-center text-[44px] leading-none outline-none placeholder:text-white/20" />
              <span className="unit" translate="no">{units}</span>
            </span>
          ) : val === null ? (
            <span className="text-[16px] text-white/50">Slide or tap to type</span>
          ) : (
            <span className="flex items-baseline gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={base} initial={{ y: 6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="serif text-[44px] leading-none" translate="no">{fmt(base, units)}</motion.span>
              </AnimatePresence>
              <span className="unit" translate="no">{units}</span>
            </span>
          )}
        </button>
        <RB icon="plus" size={48} onClick={() => bump(step)} label={`Plus ${step} ${units}`} className="rb-plain" />
      </div>
      <Ruler value={base} min={m.min} max={m.max} onChange={(v) => { set(v); onSet(); }} className={cx("mt-2 transition-opacity", val === null && "opacity-50")} />
    </div>
  );
}

// A design dial (length, neckline depth). It works like the measuring control: − and + either side of the value, a
// tape-measure ruler with centimetre numbers to slide, and words under it saying which way is which ("Shorter" on the
// left, "Longer" on the right), so it reads as a control, not decoration.
export function MiniDial({ label, value, unit = "cm", min, max, step = 1, less, more, onChange }: { label: string; value: number; unit?: string; min: number; max: number; step?: number; less: string; more: string; onChange: (v: number) => void }) {
  const bump = (d: number) => onChange(Math.min(max, Math.max(min, value + d)));
  return (
    <div className="dial">
      <div className="px-4 pt-3 text-[14px] text-white/60">{label}</div>
      <div className="flex items-center justify-between gap-2 px-3 pt-1">
        <RB icon="minus" size={44} onClick={() => bump(-step)} label={`${less}, minus ${step} ${unit}`} className={cx("rb-plain", value <= min && "opacity-40")} />
        <span className="flex items-baseline gap-1.5">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={value} initial={{ y: 6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="serif text-[36px] leading-none" translate="no">{value}</motion.span>
          </AnimatePresence>
          <span className="unit" translate="no">{unit}</span>
        </span>
        <RB icon="plus" size={44} onClick={() => bump(step)} label={`${more}, plus ${step} ${unit}`} className={cx("rb-plain", value >= max && "opacity-40")} />
      </div>
      <Ruler value={value} min={min} max={max} step={step} px={10} h={50} numbers onChange={onChange} className="mt-1" />
      <div className="flex justify-between px-4 pb-2.5 pt-1 text-[13px] text-white/50">
        <span className="flex items-center gap-1"><Icon name="chevR" size={14} className="rotate-180" />{less}</span>
        <span className="flex items-center gap-1">{more}<Icon name="chevR" size={14} /></span>
      </div>
    </div>
  );
}

export function MeasureStep({ m, header, nextLabel, onNext, onPrev }: { m: Measure; header: ReactNode; nextLabel: string; onNext: () => void; onPrev: () => void }) {
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
  const onSet = () => setTouched(true);

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
    <Glass className={cx("overflow-hidden", h)}>{m.group === "sitting" ? <SeatedFigure className="h-full w-full p-[7%]" /> : <BodyFigure sex={body.sex} width={120} markers={[m.marker]} className="h-full w-full py-[4%]" />}</Glass>
  );
  const est = isEst && (
    <div className="mt-3 flex items-center gap-2 text-[14px] text-peri"><Icon name="sparkle" size={16} className="shrink-0" />AI estimate from your photos. Check it, change it if needed.</div>
  );
  const footer = <Arrows onPrev={onPrev} onNext={go} ready={val !== null} label={label} />;
  return (
    <Screen header={header} footer={footer}>
      <AnimatePresence mode="wait">
        <motion.div key={m.key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}
          className="lg:mt-6 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
          {desk ? (
            <>
              {figure("h-[min(600px,64dvh)] rounded-[32px]")}
              <div className="lg:self-center">{title}<div className="mt-8"><ValueControl m={m} val={val} set={(v) => setMeasure(m.key, v)} onSet={onSet} />{est}</div></div>
            </>
          ) : (
            <>
              <div className="mt-3">{title}</div>
              <div className="mt-4">{figure("h-[min(340px,38dvh)] rounded-[24px]")}</div>
              <div className="mt-4"><ValueControl m={m} val={val} set={(v) => setMeasure(m.key, v)} onSet={onSet} />{est}</div>
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
    nextLabel={edit ? "Save" : nextM ? `Next: ${nextM.label}` : "Review"} />;
}
