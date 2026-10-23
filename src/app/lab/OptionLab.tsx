"use client";
// Lab: the selected option card. Today a chosen card gets a periwinkle stroke and a gradient glow inside; these are
// ways to dress it like the primary button instead (its gradient, inner light and white edge, without the dots).
// Two real screens from the garment check (fit and stretch), tappable, with the real Create my pattern button below.
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cx, FlowProgress, NextButton, RB } from "@/components/ui";
import { FITS } from "@/lib/data";

type V = "now" | "fill" | "wide" | "lead" | "soft";
const VARIANTS: { k: V; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "The chosen card gets a periwinkle stroke and a periwinkle glow rising inside it." },
  { k: "fill", name: "A · Filled", note: "The chosen card becomes the primary button: the same periwinkle gradient, the same light pooling at its edges and the fine white rim, without the dots. No stroke. The words turn white and the ring fills white with a periwinkle tick." },
  { k: "wide", name: "B · Wide", note: "Filled as in A, and every option is one wide, fully rounded card, like the button itself: the fits stack in a column instead of a grid, each a single line with its amount on the right." },
  { k: "lead", name: "C · Filled, tick first", note: "Filled as in A, with the ring moved to the start of the card, so the choice reads left to right: tick, name, detail. The wide layout from B." },
  { k: "soft", name: "D · Lit from inside", note: "The card stays dark, and only the button's inner light comes on: a soft periwinkle glow pooling at the edges and a faint tint. No stroke and no full fill, so a choice is clear but quieter than the button." },
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
    <div role="radio" aria-checked={on} tabIndex={0} onClick={onClick} className={cx("lo text-left", v === "soft" && "lo-soft", on && "on", className)}>
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

function FitScreen({ v }: { v: V }) {
  const [fit, setFit] = useState<string | null>(null);
  const [own, setOwn] = useState(false);
  const [ease, setEase] = useState(6);
  const wide = v === "wide" || v === "lead";
  const ringAt = v === "lead" ? "start" : undefined;
  return (
    <Phone label="How should it fit?" footer={<Foot ready={!!fit || own} />}>
      <Head step={1} sub={fit || own ? 0.5 : 0} />
      <h1 className="h-serif mt-4 !text-[30px]">How should it fit?</h1>
      <p className="lead mt-2">How much room there is between your body and the dress. More room means a looser fit.</p>
      {wide
        ? <div className="mt-5 flex flex-col gap-2">{FITS.map((f) => (
            <Card key={f.key} v={v} on={!own && fit === f.key} onClick={() => { setOwn(false); setFit(f.key); }} ring={ringAt} className={cx("flex min-h-[64px] items-center rounded-full py-3", v === "lead" ? "pl-4 pr-6" : "pl-6 pr-14")}>
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
      <Card v={v} on={own} onClick={() => { setOwn(true); setFit(null); }} ring={ringAt} className={cx("mt-2.5 flex items-center gap-2 py-3", wide ? "min-h-[64px] rounded-full" : "rounded-[20px]", v === "lead" ? "pl-4 pr-3" : wide ? "pl-6 pr-14" : "pl-4 pr-12")}>
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

function StretchScreen({ v }: { v: V }) {
  const [k, setK] = useState<string | null>(null);
  const wide = v === "wide" || v === "lead";
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
        <Card key={key} v={v} on={k === key} onClick={() => setK(key)} ring={v === "lead" ? "start" : "end"} className={cx("flex min-h-[64px] py-3", wide ? "items-center rounded-full" : "flex-col justify-center rounded-[18px]", v === "lead" ? "pl-4 pr-6" : wide ? "pl-6 pr-14" : "pl-4 pr-12")}>
          <span className="min-w-0 flex-1"><span className="block text-[17px] font-medium leading-tight">{t}</span><span className={cx("mt-0.5 block text-[15px] leading-snug", v === "now" ? "text-white/60" : "lo-sub")}>{d}</span></span>
        </Card>
      ))}</div>
    </Phone>
  );
}

export function OptionLab() {
  const [v, setV] = useState<V>("fill");
  const cur = VARIANTS.find((x) => x.k === v)!;
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="h1 !text-[34px]">Selected card</h2>
      <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-white/65">Tap the cards to choose. The button below each phone is the real primary button, so you can compare the two.</p>
      <div className="mt-6 flex flex-wrap gap-2">{VARIANTS.map((x) => (
        <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
      ))}</div>
      <p className="mt-4 max-w-[720px] text-[16px] leading-snug text-white/65">{cur.note}</p>
      {/* a fresh pair per variant, so nothing carries over between them */}
      <div key={v} className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <FitScreen v={v} />
        <StretchScreen v={v} />
      </div>
    </section>
  );
}
