"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, fmt } from "@/lib/store";
import { WIZARD, GROUPS, BASE, type Measure } from "@/lib/data";
import { Screen, HS, Lead, Arrows, Pill, Split, cx } from "@/components/ui";
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

// The list of groups: guides where you are. Not a menu; you go in order. Done groups open to show their numbers.
function GroupList({ open: initial = [], editable }: { open?: string[]; editable?: boolean }) {
  const { units, go } = useApp();
  const { body, doneIn, cur } = useProgress();
  const [open, setOpen] = useState<string[]>(initial);
  const rows: { key: string; title: string; desc: string; list: Measure[]; done: number }[] = [
    { key: "base", title: "Base measures", desc: "Height, bust, waist, hips", list: BASE, done: BASE.filter((b) => body.done.includes(b.key)).length },
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
          <div key={r.key} className={cx("rounded-[22px] border bg-white/[.04] transition-colors", next ? "border-primary" : "border-white/12")}>
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              {complete ? <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary"><Icon name="check" size={15} strokeWidth={2.6} /></span>
                : <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[13px]", next ? "border-white bg-white text-bg" : "border-white/25 text-white/50")}>{i}</span>}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className={cx("text-[17px] font-medium", !complete && !next && "text-white/60")}>{r.title}</span>{next && <span className="text-[13px] text-peri">Up next</span>}</div>
                <div className="truncate text-[14px] text-white/50">{r.desc}</div>
              </div>
              <span className="text-[15px] text-white/60" translate="no">{r.done}/{r.list.length}</span>
            </div>
            {complete && (
              <>
                <button onClick={() => setOpen(isOpen ? open.filter((k) => k !== r.key) : [...open, r.key])} aria-expanded={isOpen} className="flex w-full items-center justify-between border-t border-white/8 px-4 py-2.5 text-[14px] text-white/70">
                  View my measures<motion.span animate={{ rotate: isOpen ? 180 : 0 }}><Icon name="chevD" size={18} /></motion.span>
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
      footer={<Arrows ready onNext={cur === -1 ? () => go("alldone") : startAt} label={cur === -1 ? "Review all 24" : `Continue with ${GROUPS[cur].title}`} />}>
      <Split left={<>
        <HS className="mt-4 lg:mt-0">Let’s finish<br />your measures</HS>
        <Lead className="mt-3">{scan ? "AI estimated these from your photos. Check each one, in order." : "One at a time, in order. We show you where the tape goes, and save as you go."}</Lead>
        {!scan && <ul className="mt-6 flex flex-col gap-3">{TIPS.map(([ic, t]) => <li key={t} className="flex items-center gap-3 text-[16px] text-white/80"><Icon name={ic} size={22} className="shrink-0 text-peri" />{t}</li>)}</ul>}
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
  const g = GROUPS.find((x) => x.key === m.group)!;
  const list = inGroup(m.group);
  const k = list.findIndex((x) => x.key === m.key);
  const next = WIZARD[i + 1];
  const lastOfGroup = !next || next.group !== m.group;
  const steps = useWizardSteps(m.group, k / list.length);
  const onNext = () => (edit ? back() : lastOfGroup ? replace("wdone", { g: m.group }) : replace("wstep", { i: i + 1 }));
  const onPrev = () => (edit || k === 0 ? back() : replace("wstep", { i: i - 1 }));
  return <MeasureStep key={m.key} m={m} header={<FlowHeader steps={steps} onClose={edit ? back : takeBreak} />} onNext={onNext} onPrev={onPrev}
    nextLabel={edit ? "Save" : lastOfGroup ? `Finish ${g.title.toLowerCase()}` : `Next: ${next.label}`}
    cheer={edit ? undefined : lastOfGroup ? `That’s all the ${g.title.toLowerCase()}.` : `Nice. ${next.label} is next.`} />;
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
      footer={<><Arrows ready hidePrev onNext={cont} label={N ? `Continue with ${N.title}` : "Review all 24"} />{N && <button className="mt-1 h-11 w-full text-[15px] text-white/70" onClick={takeBreak}>Take a break, finish later</button>}</>}>
      <Split left={<>
        <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="mt-4 grid h-12 w-12 place-items-center rounded-full bg-primary lg:mt-0"><Icon name="check" size={24} strokeWidth={2.4} /></motion.span>
        <HS className="mt-4">{G.title} done</HS>
        <Lead className="mt-3">{doneIn(g)} of {inGroup(g).length} saved. {N ? `Next up: ${N.title.toLowerCase()}, about ${N.mins} minute${N.mins > 1 ? "s" : ""}.` : "That was the last group."} Your progress is saved if you stop now.</Lead>
      </>} right={<div className="mt-7 lg:mt-0"><GroupList /></div>} />
    </Screen>
  );
}

export function AllDone() {
  const { go } = useApp();
  const { body } = useProgress();
  const steps = useWizardSteps();
  const total = body.done.length;
  return (
    <Screen header={<FlowHeader steps={steps} onClose={() => go("ready")} />} bg={<div className="absolute inset-0" style={{ background: "radial-gradient(90% 40% at 50% 0%, rgba(104,126,245,.4), transparent 70%)" }} />}
      footer={<Pill onClick={() => go("ready")}>Save body</Pill>}>
      <Split left={<>
        <div className="mt-4 flex items-baseline gap-2 lg:mt-0"><span className="serif text-[64px] leading-none lg:text-[120px]">{total}/24</span><span className="text-[15px] text-white/60">measures saved</span></div>
        <HS className="mt-4">{total === 24 ? <>Fully<br />measured</> : "Nearly there"}</HS>
        <Lead className="mt-3">Open any group to see your numbers. Tap a number to change it.</Lead>
      </>} right={<div className="mt-7 lg:mt-0"><GroupList editable /></div>} />
    </Screen>
  );
}
