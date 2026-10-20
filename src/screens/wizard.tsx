"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { WIZARD, GROUPS, BASE, type Measure } from "@/lib/data";
import { Screen, HS, Lead, Arrows, Pill, Split, TextButton, cx } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { FlowHeader, MeasureStep, useWizardSteps } from "./measure";

const inGroup = (g: string) => WIZARD.filter((w) => w.group === g);

// Pause the extra measures: land on home, which offers "Finish your measures".
function useBreak() {
  const set = useApp((s) => s.set);
  const home = useApp((s) => s.home);
  const activeBody = useApp((s) => s.activeBody);
  return () => { set({ resumeBody: activeBody }); home(); };
}

function useProgress() {
  const body = useApp((s) => s.body());
  const doneIn = (g: string) => inGroup(g).filter((w) => body.done.includes(w.key)).length;
  const cur = GROUPS.findIndex((g) => doneIn(g.key) < inGroup(g.key).length); // -1 = all done
  return { body, doneIn, cur };
}

const TIPS: [IconName, string][] = [["tape", "Grab a soft tape measure"], ["friend", "Ask a friend to help with your back"], ["shirt", "Wear fitted clothes"]];

// Tips as a quiet hint: one line at a time, changing by itself. Plain words and an icon, nothing to tap, so it never
// reads like the cards below. Screen readers get all of them at once.
function Hints({ items, className }: { items: [IconName, string][]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % items.length), 3800); return () => clearInterval(t); }, [items.length]);
  const [ic, t] = items[i];
  return (
    <div className={cx("flex flex-col items-center lg:items-start", className)}>
      <ul className="sr-only">{items.map(([, x]) => <li key={x}>{x}</li>)}</ul>
      <div className="relative h-6 w-full" aria-hidden>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap text-[15px] text-white/70 lg:justify-start"><Icon name={ic} size={18} className="shrink-0 text-peri" />{t}</motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-2.5 flex gap-1" aria-hidden>{items.map((_, k) => <span key={k} className={cx("h-1 rounded-full transition-all duration-500", k === i ? "w-4 bg-white/55" : "w-1 bg-white/20")} />)}</div>
    </div>
  );
}

// The list of groups: guides where you are. Not a menu; you go in order. Done groups open to show their numbers.
function GroupList({ open: initial = [], editable }: { open?: string[]; editable?: boolean }) {
  const { units, go } = useApp();
  const { body, doneIn, cur } = useProgress();
  const [open, setOpen] = useState<string[]>(initial);
  const rows: { key: string; title: string; desc: string; list: Measure[]; done: number }[] = [
    { key: "base", title: "Base measurements", desc: "Height, bust, waist and hips", list: BASE, done: BASE.filter((b) => body.done.includes(b.key)).length },
    ...GROUPS.map((g) => ({ key: g.key, title: g.title, desc: g.desc, list: inGroup(g.key), done: doneIn(g.key) })),
  ];
  const edit = (m: Measure) => (m.group === "base" ? go("measure", { key: m.key, edit: true }) : go("wstep", { i: WIZARD.findIndex((w) => w.key === m.key), edit: true }));
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r, i) => {
        const complete = r.done === r.list.length;
        const next = cur >= 0 && i === cur + 1;
        const isOpen = open.includes(r.key);
        return (
          <div key={r.key} className={cx("rounded-[22px] border bg-card transition-colors", next ? "border-primary" : "border-white/12")}>
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              {complete ? <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/12 text-white/85"><Icon name="check" size={15} strokeWidth={2.6} /></span>
                : <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[13px] font-medium leading-none tabular-nums", next ? "border-white bg-white text-bg" : "border-white/25 text-white/50")}>{i}</span>}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className={cx("text-[17px] font-medium", !complete && !next && "text-white/60")}>{r.title}</span>{next && <span className="text-[13px] text-peri">Up next</span>}</div>
                <div className="truncate text-[14px] text-white/50">{r.desc}</div>
              </div>
              <span className="text-[15px] text-white/60" translate="no">{r.done}/{r.list.length}</span>
            </div>
            {complete && (
              <>
                <button onClick={() => setOpen(isOpen ? open.filter((k) => k !== r.key) : [...open, r.key])} aria-expanded={isOpen} className="flex w-full items-center justify-between border-t border-white/8 px-4 py-2.5 text-[14px] text-white/70">
                  View my measurements<motion.span animate={{ rotate: isOpen ? 180 : 0 }}><Icon name="chevD" size={18} /></motion.span>
                </button>
                <AnimatePresence initial={false}>{isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-x-5 px-4 pb-3">{r.list.map((m) => (
                      <button key={m.key} disabled={!editable} onClick={() => edit(m)} className="flex items-baseline justify-between border-b border-white/6 py-2 text-left">
                        <span className="text-[14px] text-white/60">{m.label}</span><span className="flex items-baseline gap-1"><span className="serif text-[19px]" translate="no">{fmt(body.measures[m.key] ?? m.value, units)}</span><span className="text-[12px] text-white/45" translate="no">{units}</span></span>
                      </button>
                    ))}</div>
                  </motion.div>)}</AnimatePresence>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Wizard() {
  const { go } = useApp();
  const { body, cur } = useProgress();
  const takeBreak = useBreak();
  const steps = useWizardSteps();
  const scan = (body.est ?? []).length > 0;
  const startAt = () => { const g = GROUPS[cur]; const idx = WIZARD.findIndex((w) => w.group === g.key && !body.done.includes(w.key)); go("wstep", { i: idx }); };
  return (
    <Screen header={<FlowHeader steps={steps} onClose={takeBreak} />}
      footer={<Arrows ready onNext={cur === -1 ? () => go("alldone") : startAt} label={cur === -1 ? "Review all 24" : `Continue with ${GROUPS[cur].title.toLowerCase()}`} />}>
      <Split left={<>
        <div className="text-center lg:text-left">
          <HS className="mt-4 [text-wrap:balance] lg:mt-0">Let’s finish your measurements</HS>
          <Lead className="mx-auto mt-3 max-w-[340px] [text-wrap:pretty] lg:mx-0">{scan ? "AI estimated these from your photos. Check each one, in order." : "Group by group, in order. We show you where the tape goes and save as you go."}</Lead>
        </div>
        {!scan && <Hints items={TIPS} className="mt-5" />}
      </>} right={<div className="mt-7 lg:mt-0"><GroupList /></div>} />
    </Screen>
  );
}

export function WizardStep({ p }: { p?: Record<string, unknown> }) {
  const { replace, back } = useApp();
  const takeBreak = useBreak();
  const i = Math.min(WIZARD.length - 1, Math.max(0, Number(p?.i ?? 0)));
  const edit = !!p?.edit;
  const m = WIZARD[i];
  const list = inGroup(m.group);
  const k = list.findIndex((x) => x.key === m.key);
  const next = WIZARD[i + 1];
  const lastOfGroup = !next || next.group !== m.group;
  const steps = useWizardSteps(m.group, k / list.length);
  const onNext = () => (edit ? back() : lastOfGroup ? replace("wdone", { g: m.group }) : replace("wstep", { i: i + 1 }));
  const onPrev = () => (edit || k === 0 ? back() : replace("wstep", { i: i - 1 }));
  return <MeasureStep key={m.key} m={m} header={<FlowHeader steps={steps} onClose={edit ? back : takeBreak} />} onNext={onNext} onPrev={onPrev}
    nextLabel={edit ? "Save" : lastOfGroup ? "Finish" : `Next: ${next.label}`} />;
}

export function GroupDone({ p }: { p?: Record<string, unknown> }) {
  const { replace, go } = useApp();
  const { body, doneIn } = useProgress();
  const takeBreak = useBreak();
  const g = (p?.g as string) ?? "around";
  const gi = GROUPS.findIndex((x) => x.key === g);
  const G = GROUPS[gi];
  const steps = useWizardSteps();
  const nextOpen = GROUPS.findIndex((x) => doneIn(x.key) < inGroup(x.key).length);
  const N = nextOpen >= 0 ? GROUPS[nextOpen] : null;
  const cont = () => (N ? replace("wstep", { i: WIZARD.findIndex((w) => w.group === N.key && !body.done.includes(w.key)) }) : replace("alldone"));
  return (
    <Screen header={<FlowHeader steps={steps} onClose={takeBreak} />}
      footer={<><Arrows ready hidePrev onNext={cont} label={N ? `Continue with ${N.title.toLowerCase()}` : "Review all 24"} />{N && <TextButton className="mt-1" onClick={takeBreak}>Take a break, finish later</TextButton>}</>}>
      <Split left={
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }} className="text-center lg:text-left">
          <HS className="mt-4 [text-wrap:balance] lg:mt-0">{G.title} done</HS>
          <Lead className="mx-auto mt-3 max-w-[340px] lg:mx-0">{doneIn(g)} of {inGroup(g).length} saved. {N ? `Next up: ${N.title.toLowerCase()}.` : "That was the last group."}</Lead>
        </motion.div>} right={<div className="mt-7 lg:mt-0"><GroupList /></div>} />
    </Screen>
  );
}

// The 24 measurements as a dial of 24 ticks, like the marks on a tape, lighting up one after another; the count in
// the middle. White, not the primary blue: it is a moment, not a button.
function Dial24({ n }: { n: number }) {
  const R = 86, L = 14;
  return (
    <div className="relative mx-auto h-[196px] w-[196px] lg:mx-0 lg:h-[240px] lg:w-[240px]">
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const [c, s] = [Math.cos(a), Math.sin(a)];
          return <motion.line key={i} x1={c * (R - L)} y1={s * (R - L)} x2={c * R} y2={s * R} strokeWidth="3.2" strokeLinecap="round"
            initial={{ stroke: "rgb(255 255 255 / .12)" }} animate={{ stroke: i < n ? "rgb(255 255 255 / .92)" : "rgb(255 255 255 / .12)" }} transition={{ delay: 0.15 + i * 0.035, duration: 0.3 }} />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="serif text-[64px] leading-none lg:text-[80px]">{n}</span>
        <span className="mt-1.5 text-[14px] text-white/55">of 24</span>
      </div>
    </div>
  );
}

export function AllDone() {
  const { go } = useApp();
  const { body } = useProgress();
  const steps = useWizardSteps();
  const total = body.done.length;
  return (
    <Screen header={<FlowHeader steps={steps} onClose={() => go("ready")} />} bg={<div className="absolute inset-0" style={{ background: "radial-gradient(70% 34% at 50% 18%, rgb(140 156 248 / .16), transparent 75%)" }} />}
      footer={<Pill onClick={() => go("ready")}>Save body</Pill>}>
      <Split left={
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} className="pt-3 text-center lg:pt-0 lg:text-left">
          <Dial24 n={total} />
          <HS className="mt-5">{total === 24 ? "Fully measured" : "Nearly there"}</HS>
          <Lead className="mx-auto mt-2 max-w-[320px] lg:mx-0">Open a group to see or change any measurement.</Lead>
        </motion.div>} right={<div className="mt-7 lg:mt-0"><GroupList editable /></div>} />
    </Screen>
  );
}
