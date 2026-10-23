"use client";
// Lab: the selected option card. Today a chosen card gets a periwinkle stroke and a gradient glow inside; these are
// other ways to dress it (like the primary button without its dots, or as a raised light tile), in three layouts.
// Two real screens from the garment check (fit and stretch), tappable, with the real Create my pattern button below.
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cx, FlowProgress, NextButton, RB } from "@/components/ui";
import { FITS } from "@/lib/data";

type V = "now" | "fill" | "soft" | "paper" | "snow";
const VARIANTS: { k: V; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "The chosen card gets a periwinkle stroke and a periwinkle glow rising inside it." },
  { k: "fill", name: "A · Filled", note: "The chosen card becomes the primary button: the same periwinkle gradient, the same light pooling at its edges and the fine white rim, without the dots. No stroke. The words turn white and the ring fills white with a periwinkle tick." },
  { k: "soft", name: "B · Lit from inside", note: "The card stays dark, and only the button's inner light comes on: a soft periwinkle glow pooling at the edges and a faint tint. No stroke and no full fill, so a choice is clear but quieter than the button." },
  { k: "paper", name: "C · Paper", note: "The chosen card turns to the warm paper of the tour card, with ink words. It is lit like a raised tile: brighter at the top, a touch deeper at the bottom, a crisp white highlight along the top edge, a fine shade along the bottom edge and a soft shadow under it. The ring fills ink with a white tick." },
  { k: "snow", name: "D · Snow", note: "The same raised tile in the cool white of the studio, faintly blue towards the bottom, with ink words and a periwinkle ring and tick, so it ties back to the button below." },
];
type L = "cards" | "wide" | "first";
const LAYOUTS: { k: L; name: string; note: string }[] = [
  { k: "cards", name: "Cards", note: "The layout the app has now: the fits in a 2 × 2 grid, the stretch options as rows." },
  { k: "wide", name: "Wide", note: "Every option one wide, fully rounded card, like the button itself; the fits stack in a column, each with its amount on the right." },
  { k: "first", name: "Wide, tick first", note: "Wide, with the ring at the start, so the choice reads left to right: tick, name, detail." },
];

// the button's look, without its dots: in a layer that fades in, since a gradient cannot be animated
const CSS = `
@layer components {
.lo { position: relative; isolation: isolate; overflow: hidden; cursor: pointer; background: var(--color-card); border: 1px solid rgb(255 255 255 / .1);
  transition: border-color .3s, box-shadow .35s ease, transform .4s cubic-bezier(.2,1.2,.4,1); -webkit-user-select: none; user-select: none; }
.lo::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; opacity: 0; transition: opacity .35s ease;
  background: linear-gradient(180deg, #7387f6, #687ef5 55%, #6479f2);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .3), inset 0 1px 0 rgb(255 255 255 / .6), inset 0 0 18px 3px rgb(206 214 255 / .55); }
.lo:active { transform: scale(.985); }
@media (hover: hover) { .lo:not(.on):hover { border-color: rgb(255 255 255 / .24); background: var(--color-card-hover); } }
.lo.on { border-color: transparent; box-shadow: 0 10px 30px -8px rgb(104 126 245 / .5); }
.lo.on::before { opacity: 1; }
.lo .lo-sub { color: rgb(255 255 255 / .58); transition: color .3s; }
.lo.on .lo-sub { color: rgb(255 255 255 / .85); }
.lo-ring { width: 22px; height: 22px; border-radius: 999px; border: 1.5px solid rgb(255 255 255 / .35); display: grid; place-items: center; flex-shrink: 0; transition: all .25s; }
.lo.on .lo-ring { border-color: #fff; background: #fff; color: #4f63e0; }
/* D: only the inner light, on the dark card */
.lo-soft::before { background: radial-gradient(120% 140% at 50% 120%, rgb(104 126 245 / .22), rgb(104 126 245 / .08) 60%, transparent);
  box-shadow: inset 0 0 22px 2px rgb(140 156 248 / .42), inset 0 1px 0 rgb(255 255 255 / .16); }
.lo-soft.on { box-shadow: 0 10px 30px -14px rgb(104 126 245 / .45); }
.lo-soft.on .lo-ring { color: #0b0c15; }
/* C and D: a raised light tile. Lit from the top (a white highlight on the top edge, the face brightest at the top),
   a fine shade on the bottom edge and a short, soft shadow under it, so it sits up off the dark page */
.lo { transition: border-color .3s, box-shadow .35s ease, color .3s, transform .4s cubic-bezier(.2,1.2,.4,1); }
.lo-paper::before { background: linear-gradient(180deg, #fffefb 0%, #f4f2ed 55%, #e8e5dd 100%);
  box-shadow: inset 0 1px 0 #fff, inset 0 0 0 1px rgb(255 255 255 / .7), inset 0 -1px 0 rgb(18 19 28 / .1), inset 0 -14px 22px -16px rgb(80 70 50 / .22); }
.lo-snow::before { background: linear-gradient(180deg, #ffffff 0%, #f5f6fd 55%, #e6e9f8 100%);
  box-shadow: inset 0 1px 0 #fff, inset 0 0 0 1px rgb(255 255 255 / .8), inset 0 -1px 0 rgb(40 50 110 / .12), inset 0 -14px 22px -16px rgb(79 99 224 / .25); }
.lo-paper.on, .lo-snow.on { color: #12131c; box-shadow: 0 1px 1px rgb(0 0 0 / .35), 0 6px 14px -6px rgb(0 0 0 / .55), 0 22px 40px -22px rgb(0 0 0 / .8); }
.lo-snow.on { box-shadow: 0 1px 1px rgb(0 0 0 / .35), 0 6px 14px -6px rgb(0 0 0 / .55), 0 22px 44px -20px rgb(104 126 245 / .45); }
.lo-paper.on .lo-sub, .lo-snow.on .lo-sub { color: rgb(18 19 28 / .6); }
.lo-paper.on .lo-ring { border-color: #12131c; background: #12131c; color: #fff; }
.lo-snow.on .lo-ring { border-color: #687ef5; background: linear-gradient(180deg, #7387f6, #6479f2); color: #fff; box-shadow: inset 0 1px 0 rgb(255 255 255 / .45); }
/* the stepper and the number inside a light card */
.lo-paper.on .rb, .lo-snow.on .rb { background: rgb(18 19 28 / .06); border-color: rgb(18 19 28 / .1); color: #12131c; backdrop-filter: none; }
.lo-paper.on .unit, .lo-snow.on .unit { color: rgb(18 19 28 / .55); }
}`;

function Card({ v, on, onClick, children, className, ring = "end" }: { v: V; on: boolean; onClick: () => void; children: ReactNode; className?: string; ring?: "end" | "start" | "endTop" }) {
  if (v === "now") return (
    <div role="radio" aria-checked={on} tabIndex={0} onClick={onClick} className={cx("opt text-left", on && "on", className)}>
      {children}
      <span className={cx("radio absolute right-4", ring === "endTop" ? "top-4" : "top-1/2 -translate-y-1/2")}>{on && <Icon name="check" size={13} strokeWidth={3} />}</span>
    </div>
  );
  const dot = <span className="lo-ring">{on && <Icon name="check" size={13} strokeWidth={3} />}</span>;
  return (
    <div role="radio" aria-checked={on} tabIndex={0} onClick={onClick} className={cx("lo text-left", v !== "fill" && `lo-${v}`, on && "on", className)}>
      {ring === "start" && <span className="mr-3.5 flex items-center">{dot}</span>}
      {children}
      {ring !== "start" && <span className={cx("absolute right-4", ring === "endTop" ? "top-4" : "top-1/2 -translate-y-1/2")}>{dot}</span>}
    </div>
  );
}

function Phone({ label, children, footer }: { label: string; children: ReactNode; footer: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate flex h-[760px] w-[360px] shrink-0 flex-col overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        <div className="dotgrid" />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-12 noscroll">{children}</div>
        <div className="shrink-0 px-5 pb-8 pt-2">{footer}</div>
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

const Head = ({ step, sub }: { step: number; sub: number }) => (
  <div className="flex h-14 items-center gap-4">
    <RB icon="close" size={40} label="Close" />
    <FlowProgress steps={["Garment", "Fit", "Stretch"].map((label, i) => ({ label, value: i < step ? 1 : i === step ? sub : 0 }))} className="flex-1 pt-[18px]" />
  </div>
);

const Foot = ({ ready, label = "Next" }: { ready: boolean; label?: string }) => (
  <div className="flex items-center gap-3 pb-1">
    <RB icon="back" variant="dark" size={56} label="Back" />
    <NextButton ready={ready} label={label} className="flex-1" />
  </div>
);

function FitScreen({ v, l }: { v: V; l: L }) {
  const [fit, setFit] = useState<string | null>(null);
  const [own, setOwn] = useState(false);
  const [ease, setEase] = useState(6);
  const wide = l !== "cards";
  const first = l === "first";
  const ringAt = first ? "start" : undefined;
  return (
    <Phone label="How should it fit?" footer={<Foot ready={!!fit || own} />}>
      <Head step={1} sub={fit || own ? 0.5 : 0} />
      <h1 className="h-serif mt-4 !text-[30px]">How should it fit?</h1>
      <p className="lead mt-2">How much room there is between your body and the dress. More room means a looser fit.</p>
      {wide
        ? <div className="mt-5 flex flex-col gap-2">{FITS.map((f) => (
            <Card key={f.key} v={v} on={!own && fit === f.key} onClick={() => { setOwn(false); setFit(f.key); }} ring={ringAt} className={cx("flex min-h-[64px] items-center rounded-full py-3", first ? "pl-4 pr-6" : "pl-6 pr-14")}>
              <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium leading-tight">{f.label}</span><span className="lo-sub block text-[14px] leading-snug">{f.note}</span></span>
              <span className="text-[15px] tabular-nums" translate="no">+{f.ease} cm</span>
            </Card>
          ))}</div>
        : <div className="mt-5 grid grid-cols-2 gap-2.5">{FITS.map((f) => (
            <Card key={f.key} v={v} on={!own && fit === f.key} onClick={() => { setOwn(false); setFit(f.key); }} ring="endTop" className="flex flex-col justify-between rounded-[20px] p-3.5 pr-11">
              <span><span className="block text-[17px] font-medium leading-tight">{f.label}</span><span className={cx("mt-0.5 block whitespace-nowrap text-[14px]", v === "now" ? "text-white/75" : "lo-sub")} translate="no">+{f.ease} cm</span></span>
              <span className={cx("mt-1.5 text-[14px] leading-snug", v === "now" ? "text-white/55" : "lo-sub")}>{f.note}</span>
            </Card>
          ))}</div>}
      <Card v={v} on={own} onClick={() => { setOwn(true); setFit(null); }} ring={ringAt} className={cx("mt-2.5 flex items-center gap-2 py-3", wide ? "min-h-[64px] rounded-full" : "rounded-[20px]", first ? "pl-4 pr-3" : wide ? "pl-6 pr-14" : "pl-4 pr-12")}>
        <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium">Your own</span><span className={cx("block text-[14px]", v === "now" ? "text-white/55" : "lo-sub")}>Up to 30 cm</span></span>
        <span className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <RB icon="minus" size={36} className="rb-plain" onClick={() => { setOwn(true); setFit(null); setEase((e) => Math.max(0, e - 1)); }} label="Less room" />
          <span className="w-[46px] text-center"><span className="serif text-[22px] leading-none">{ease}</span><span className="unit ml-1" translate="no">cm</span></span>
          <RB icon="plus" size={36} className="rb-plain" onClick={() => { setOwn(true); setFit(null); setEase((e) => Math.min(30, e + 1)); }} label="More room" />
        </span>
      </Card>
    </Phone>
  );
}

function StretchScreen({ v, l }: { v: V; l: L }) {
  const [k, setK] = useState<string | null>(null);
  const wide = l !== "cards";
  const first = l === "first";
  return (
    <Phone label="How stretchy is your fabric?" footer={<Foot ready={!!k} label="Create my pattern" />}>
      <Head step={2} sub={k ? 0.5 : 0} />
      <h1 className="h-serif mt-4 !text-[30px]">How stretchy is your fabric?</h1>
      <p className="lead mt-3">Stretch changes how much room the pattern needs. Choose the fabric you plan to sew with.</p>
      <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">
        <Icon name="info" size={20} className="mt-0.5 shrink-0 text-white/55" />
        <div><div className="text-[16px] font-medium">For a relaxed fit: a little stretch</div><div className="mt-1 text-[15px] leading-snug text-white/60">A fabric that gives when you pull keeps it comfortable.</div></div>
      </div>
      <div className="mt-4 flex flex-col gap-2">{([["no", "No stretch", "It doesn’t move"], ["bit", "A little stretch", "It gives when you pull"], ["lot", "Stretchy", "Stretches and springs back"]] as const).map(([key, t, d]) => (
        <Card key={key} v={v} on={k === key} onClick={() => setK(key)} ring={first ? "start" : "end"} className={cx("flex min-h-[64px] py-3", wide ? "items-center rounded-full" : "flex-col justify-center rounded-[18px]", first ? "pl-4 pr-6" : wide ? "pl-6 pr-14" : "pl-4 pr-12")}>
          <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium leading-tight">{t}</span><span className={cx("mt-0.5 block text-[15px] leading-snug", v === "now" ? "text-white/60" : "lo-sub")}>{d}</span></span>
        </Card>
      ))}</div>
    </Phone>
  );
}

export function OptionLab() {
  const [v, setV] = useState<V>("paper");
  const [l, setL] = useState<L>("wide");
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="h1 !text-[34px]">Selected card</h2>
      <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-white/65">Tap the cards to choose. The button below each phone is the real primary button, so you can compare the two. Any style works with any layout.</p>
      <p className="mt-6 text-[15px] text-white/50">Style</p>
      <div className="mt-2">{pick(VARIANTS, v, setV)}</div>
      <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-white/65">{VARIANTS.find((x) => x.k === v)!.note}</p>
      <p className="mt-6 text-[15px] text-white/50">Layout</p>
      <div className="mt-2">{pick(LAYOUTS, l, setL)}</div>
      <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-white/65">{LAYOUTS.find((x) => x.k === l)!.note}</p>
      {/* a fresh pair per choice, so nothing carries over between them */}
      <div key={v + l} className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <FitScreen v={v} l={l} />
        <StretchScreen v={v} l={l} />
      </div>
    </section>
  );
}
