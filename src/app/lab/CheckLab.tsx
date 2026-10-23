"use client";
// Lab: "Check your measurements" (after the photo scan). Today every estimate still to check has a periwinkle stroke and
// a white Check pill, and the number sits far right beside it. These variations drop the stroke, make Check the one
// periwinkle action (in the style of home's start-card icons) and put the numbers in one centred column, aligned card
// to card. They differ in how a card still to check reads against a checked one. Tap Check to check a card.
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cx, FlowProgress, NextButton, RB } from "@/components/ui";

type V = "now" | "plain" | "pressed" | "tint" | "estimate";
const VARIANTS: { k: V; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "A periwinkle stroke round every estimate still to check, a white Check pill, and the number pushed to the right beside it." },
  { k: "plain", name: "A · Plain", note: "Every card is the same solid card; only the periwinkle Check marks what is left. Under each name, one quiet line: AI estimate, or Checked. The calmest." },
  { k: "pressed", name: "B · Pressed in", note: "A card still to check is pressed into the page, like the inset icon tiles: a floor a touch darker, a soft shade along its top edge. Once checked it rises to the normal solid card, so the list fills up as you go." },
  { k: "tint", name: "C · Soft tint", note: "A card still to check carries a faint periwinkle tint inside, with no edge; a checked card is the plain solid card. Clear at a glance, and quieter than a stroke." },
  { k: "estimate", name: "D · Estimate in periwinkle", note: "Plain cards, and the number tells the story: an estimate is written in a soft periwinkle, and turns white once you have checked it." },
];

const CSS = `
@layer components {
.ck { border-radius: 18px; background: var(--color-card); border: 1px solid rgb(255 255 255 / .1); transition: background-color .35s, box-shadow .35s, border-color .35s; }
.ck-pressed.todo { background: rgb(0 0 0 / .24); border-color: transparent;
  box-shadow: inset 0 3px 8px rgb(0 0 0 / .6), inset 0 1px 1.5px rgb(0 0 0 / .5), inset 0 -1px 0 rgb(255 255 255 / .06), 0 1px 0 rgb(255 255 255 / .06); }
.ck-pressed.done { box-shadow: inset 0 1px 0 rgb(255 255 255 / .06), 0 10px 24px -16px rgb(0 0 0 / .9); }
.ck-tint.todo { background: rgb(104 126 245 / .1); border-color: transparent; }
.ck-go { height: 32px; padding: 0 14px; border-radius: 999px; font-size: 14px; font-weight: 500; }
}`;

const BASE = [
  { key: "height", label: "Height", v: "168" },
  { key: "bust", label: "Bust", v: "88" },
  { key: "waist", label: "Waist", v: "70" },
  { key: "hips", label: "Hips", v: "96" },
];

// the number in a fixed-width column, right-aligned, so the units line up card to card
const Value = ({ v, soft }: { v: string; soft?: boolean }) => (
  <span className="flex items-baseline justify-center">
    <span className={cx("serif w-[64px] text-right text-[30px] leading-none transition-colors", soft && "text-[#a9b5fb]")} translate="no">{v}</span>
    <span className="unit ml-1.5 w-[22px]" translate="no">cm</span>
  </span>
);

function Card({ v, b, ok, onCheck }: { v: V; b: (typeof BASE)[number]; ok: boolean; onCheck: () => void }) {
  if (v === "now") return (
    <button onClick={onCheck} className={cx("field tap flex h-[72px] w-full items-center gap-3 px-5 text-left", !ok && "!border-primary/60")}>
      <span className="flex flex-1 items-center gap-2.5 text-[17px]">{ok && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/12 text-white/85"><Icon name="check" size={12} strokeWidth={3} /></span>}{b.label}</span>
      <span className="flex items-baseline gap-1.5"><span className="serif text-[30px] leading-none" translate="no">{b.v}</span><span className="unit" translate="no">cm</span></span>
      {ok ? <span className="flex w-[58px] items-center justify-end gap-1 text-[14px] font-medium text-white/60"><Icon name="pencil" size={14} />Edit</span>
        : <span className="flex w-[58px] justify-end"><span className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-bg">Check</span></span>}
    </button>
  );
  return (
    <button onClick={onCheck} className={cx("ck tap grid h-[72px] w-full grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] items-center px-5 text-left", `ck-${v}`, ok ? "done" : "todo")}>
      <span className="min-w-0">
        <span className="block text-[17px] leading-tight">{b.label}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[13px] text-white/50">{ok ? <><Icon name="check" size={12} strokeWidth={2.6} />Checked</> : "AI estimate"}</span>
      </span>
      <Value v={b.v} soft={v === "estimate" && !ok} />
      <span className="flex justify-end">
        {ok ? <span className="flex items-center gap-1 text-[14px] font-medium text-white/55"><Icon name="pencil" size={14} />Edit</span>
          : <span className="ck-go icon-primary inline-flex items-center">Check</span>}
      </span>
    </button>
  );
}

function Phone({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="relative isolate flex h-[760px] w-[360px] shrink-0 flex-col overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
      <div className="dotgrid" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-12 noscroll">{children}</div>
      <div className="shrink-0 px-5 pb-8 pt-2">{footer}</div>
    </div>
  );
}

function CheckScreen({ v }: { v: V }) {
  const [done, setDone] = useState<string[]>(["height"]);
  const n = done.length;
  return (
    <figure className="flex flex-col items-center gap-3">
      <Phone footer={<div className="flex items-center gap-3 pb-1"><RB icon="back" variant="dark" size={56} label="Back" /><NextButton ready={n === 4} label="Continue" className="flex-1" /></div>}>
        <div className="flex h-14 items-center gap-4">
          <RB icon="close" size={40} label="Close" />
          <FlowProgress steps={["Body", "Method", "Measures", "Review"].map((label, i) => ({ label, value: i < 3 ? 1 : n / 4 }))} className="flex-1 pt-[18px]" />
        </div>
        <h1 className="h-serif mt-4 !text-[30px]">Check your<br />measurements</h1>
        <p className="lead mt-3">AI estimated these from your photos. Tap each one to check it. {n} of 4 checked.</p>
        <div className="mt-7 flex flex-col gap-2.5">{BASE.map((b) => (
          <Card key={b.key} v={v} b={b} ok={done.includes(b.key)} onCheck={() => setDone((d) => (d.includes(b.key) ? d : [...d, b.key]))} />
        ))}</div>
        <div className="mt-4 flex items-center gap-3 py-2">
          <span className="flex -space-x-3">{[0, 1, 2].map((i) => <span key={i} className="h-12 w-9 rounded-[8px] border-2 border-bg bg-gradient-to-b from-[#d9dcea] to-[#9aa1bd]" />)}</span>
          <span className="flex-1 text-[15px] text-white/70">Your scan photos</span><Icon name="chevR" size={18} className="text-white/45" />
        </div>
      </Phone>
      <button onClick={() => setDone(["height"])} className="text-[14px] text-white/55 hover:text-white">Start again</button>
    </figure>
  );
}

export function CheckLab() {
  const [v, setV] = useState<V>("plain");
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="h1 !text-[34px]">Check your measurements</h2>
      <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-white/65">The screen after the photo scan. Tap Check on a card to check it. In every new version the numbers sit in one centred column, lined up card to card, and Check is the periwinkle action.</p>
      <div className="mt-6 flex flex-wrap gap-2">{VARIANTS.map((x) => (
        <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
      ))}</div>
      <p className="mt-4 max-w-[720px] text-[16px] leading-snug text-white/65">{VARIANTS.find((x) => x.k === v)!.note}</p>
      <div key={v} className="mt-10 flex justify-center"><CheckScreen v={v} /></div>
    </section>
  );
}
