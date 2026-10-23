"use client";
// Lab: "Check your measurements" (after the photo scan). Today every estimate still to check has a periwinkle stroke and
// a white Check pill, and the number sits far right beside it. These versions are one clean row per card: the name, the
// number in one centred column (lined up card to card) and at most one small control. No caption line under the name.
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cx, FlowProgress, NextButton, RB } from "@/components/ui";

type V = "now" | "ring" | "vanish" | "snow" | "walk" | "number" | "bar";
const VARIANTS: { k: V; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "A periwinkle stroke round every estimate still to check, a white Check pill, and the number pushed to the right beside it." },
  { k: "ring", name: "1 · Checklist circle", note: "One round control on the right: an empty periwinkle ring while it is an estimate, filled periwinkle with a white tick (home's icon style) once checked. Tap the circle to confirm the estimate on the spot; in the app, tapping the rest of the card opens it to change the number. Once checked, a quiet Edit sits beside the filled circle." },
  { k: "vanish", name: "2 · Check, then nothing", note: "A periwinkle Check pill on every estimate. Once checked, the pill gives way to a quiet Edit, so the list gets calmer as you go." },
  { k: "snow", name: "2b · Check, then snow", note: "Version 2, and a checked card also turns the snow white of a chosen card, with ink words and number: done at a glance. The periwinkle Check is the action on every estimate; once checked, a quiet Edit (in ink) lets you change it later." },
  { k: "walk", name: "3 · One button walks you through", note: "No buttons on the cards. The main button names the next one (Check bust, Check waist…) and the card it is about is lit with a soft tint; checked cards show a quiet Edit. When all four are done it becomes Continue. One action on screen at a time." },
  { k: "number", name: "4 · The number says it", note: "Nothing on the right. An estimate is written in soft periwinkle with a small periwinkle dot before its name; once checked the number turns white, the dot goes and a quiet Edit appears on the right. Tap a card to check it." },
  { k: "bar", name: "5 · Progress above", note: "The count moves out of the cards into a slim four-part bar under the heading, which fills as you check. Each card ends in a chevron, or a quiet Edit once checked." },
];

const CSS = `
@layer components {
.ck { border-radius: 18px; background: var(--color-card); border: 1px solid rgb(255 255 255 / .1); transition: background-color .35s, border-color .35s; }
.ck.lit { background: rgb(104 126 245 / .12); border-color: transparent; }
.ck-ring { width: 30px; height: 30px; border-radius: 999px; display: grid; place-items: center; box-shadow: inset 0 0 0 1.5px #687ef5; transition: transform .3s cubic-bezier(.2,1.4,.4,1); }
.ck-ring:active { transform: scale(.9); }
.ck-ring.icon-primary { box-shadow: inset 0 1px 0 rgb(255 255 255 / .35), inset 0 0 0 1px rgb(255 255 255 / .18), 0 8px 18px -8px rgb(104 126 245 / .7); }
/* 2b: a checked card is snow white, like a chosen option card; its words, number and Edit turn to ink */
.ck.snow { background: var(--color-snow); border-color: transparent; color: var(--color-ink); }
.ck.snow .unit { color: rgb(19 21 35 / .55); }
.ck-edit { color: rgb(255 255 255 / .55); transition: color .2s; }
.ck-edit:hover { color: #fff; }
.ck.snow .ck-edit { color: rgb(19 21 35 / .55); }
.ck.snow .ck-edit:hover { color: var(--color-ink); }
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
    <span className={cx("serif w-[64px] text-right text-[30px] leading-none transition-colors duration-300", soft && "text-[#a9b5fb]")} translate="no">{v}</span>
    <span className="unit ml-1.5 w-[22px]" translate="no">cm</span>
  </span>
);
// after a card is checked: a quiet Edit, to change the number later (in the app it opens the measure; here it does nothing)
const Edit = ({ label }: { label: string }) => (
  <span role="button" tabIndex={0} aria-label={`Edit ${label.toLowerCase()}`} onClick={(e) => e.stopPropagation()} className="ck-edit flex items-center gap-1 text-[14px] font-medium">
    <Icon name="pencil" size={14} />Edit
  </span>
);

function Today({ b, ok, onCheck }: { b: (typeof BASE)[number]; ok: boolean; onCheck: () => void }) {
  return (
    <button onClick={onCheck} className={cx("field tap flex h-[72px] w-full items-center gap-3 px-5 text-left", !ok && "!border-primary/60")}>
      <span className="flex flex-1 items-center gap-2.5 text-[17px]">{ok && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/12 text-white/85"><Icon name="check" size={12} strokeWidth={3} /></span>}{b.label}</span>
      <span className="flex items-baseline gap-1.5"><span className="serif text-[30px] leading-none" translate="no">{b.v}</span><span className="unit" translate="no">cm</span></span>
      {ok ? <span className="flex w-[58px] items-center justify-end gap-1 text-[14px] font-medium text-white/60"><Icon name="pencil" size={14} />Edit</span>
        : <span className="flex w-[58px] justify-end"><span className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-bg">Check</span></span>}
    </button>
  );
}

function Row({ v, b, ok, lit, onCheck }: { v: V; b: (typeof BASE)[number]; ok: boolean; lit: boolean; onCheck: () => void }) {
  const end = (() => {
    if (v === "ring") return (
      <span className="flex items-center gap-2.5">
      {ok && <Edit label={b.label} />}
      <span role="checkbox" aria-checked={ok} aria-label={`Confirm ${b.label.toLowerCase()}`} onClick={(e) => { e.stopPropagation(); onCheck(); }} className={cx("ck-ring", ok && "icon-primary")}>
        {ok && <Icon name="check" size={15} strokeWidth={3} />}
      </span>
      </span>
    );
    if (ok) return <Edit label={b.label} />;
    if (v === "vanish" || v === "snow") return <span className="ck-go icon-primary inline-flex items-center">Check</span>;
    if (v === "bar") return <Icon name="chevR" size={18} className="text-white/40" />;
    return null;
  })();
  return (
    <button onClick={onCheck} className={cx("ck tap grid h-[64px] w-full grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] items-center px-5 text-left", lit && "lit", v === "snow" && ok && "snow")}>
      <span className="flex min-w-0 items-center gap-2 text-[17px]">
        {v === "number" && <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full bg-primary transition-opacity duration-300", ok && "opacity-0")} />}
        {b.label}
      </span>
      <Value v={b.v} soft={v === "number" && !ok} />
      <span className="flex justify-end">{end}</span>
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
  const check = (k: string) => setDone((d) => (d.includes(k) ? d : [...d, k]));
  const next = BASE.find((b) => !done.includes(b.key));
  const lead = v === "bar" ? "AI estimated these from your photos. Tap each one to check it."
    : v === "walk" ? "AI estimated these from your photos. Check each one."
    : `AI estimated these from your photos. Tap each one to check it. ${n} of 4 checked.`;
  const footer = v === "walk" && next
    ? <NextButton ready label={`Check ${next.label.toLowerCase()}`} onClick={() => check(next.key)} className="flex-1" />
    : <NextButton ready={n === 4} label="Continue" className="flex-1" />;
  return (
    <figure className="flex flex-col items-center gap-3">
      <Phone footer={<div className="flex items-center gap-3 pb-1"><RB icon="back" variant="dark" size={56} label="Back" />{footer}</div>}>
        <div className="flex h-14 items-center gap-4">
          <RB icon="close" size={40} label="Close" />
          <FlowProgress steps={["Body", "Method", "Measures", "Review"].map((label, i) => ({ label, value: i < 3 ? 1 : n / 4 }))} className="flex-1 pt-[18px]" />
        </div>
        <h1 className="h-serif mt-4 !text-[30px]">Check your<br />measurements</h1>
        <p className="lead mt-3">{lead}</p>
        {v === "bar" && (
          <div className="mt-5 flex gap-1.5" aria-label={`${n} of 4 checked`}>{BASE.map((b, i) => (
            <span key={b.key} className="h-1 flex-1 overflow-hidden rounded-full bg-white/12"><span className={cx("block h-full rounded-full bg-primary transition-[width] duration-500", i < n ? "w-full" : "w-0")} /></span>
          ))}</div>
        )}
        <div className={cx("flex flex-col gap-2.5", v === "bar" ? "mt-5" : "mt-7")}>{BASE.map((b) => v === "now"
          ? <Today key={b.key} b={b} ok={done.includes(b.key)} onCheck={() => check(b.key)} />
          : <Row key={b.key} v={v} b={b} ok={done.includes(b.key)} lit={v === "walk" && next?.key === b.key} onCheck={() => check(b.key)} />
        )}</div>
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
  const [v, setV] = useState<V>("snow");
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="h1 !text-[34px]">Check your measurements</h2>
      <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-white/65">The screen after the photo scan. It opens with Height already checked; tap to check the others, and Start again resets it. Every new version is one clean row per card, the numbers in one centred column lined up card to card, and no line of text under the names.</p>
      <div className="mt-6 flex flex-wrap gap-2">{VARIANTS.map((x) => (
        <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
      ))}</div>
      <p className="mt-4 max-w-[720px] text-[16px] leading-snug text-white/65">{VARIANTS.find((x) => x.k === v)!.note}</p>
      <div key={v} className="mt-10 flex justify-center"><CheckScreen v={v} /></div>
    </section>
  );
}
