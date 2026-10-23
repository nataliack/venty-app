"use client";
// Lab: secondary buttons. The primary is periwinkle with light pooling at its edges, a fine rim and a dot grid; the
// secondary buttons (the round back and close, Cancel, Done, the onboarding back) are flat today. These give them the
// same build (a rim, a highlight along the top, light inside) in their own colours and without the dots, a dark one
// for the dark screens and a white one, so they read as buttons while the primary stays the loudest.
// Only buttons with a shape get this; a bare icon (the chevron on home's start cards) stays as it is.
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { cx, Crown, FlowProgress } from "@/components/ui";

type S = "now" | "a" | "b" | "c";
const DARK: { k: S; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "Flat: the card colour (or a faint white glass) with a thin edge." },
  { k: "a", name: "A · Rim", note: "The card colour, a touch lighter at the top, a fine light rim all round, a brighter line along the top edge and a soft shadow under it. Built like the primary, with no glow." },
  { k: "b", name: "B · Rim and inner light", note: "A, plus a soft white light pooling inside the edges, the way the primary's light pools, much fainter." },
  { k: "c", name: "C · Periwinkle inner light", note: "A, with the inner light tinted periwinkle, so it is clearly the primary's quieter sibling." },
];
const WHITE: { k: S; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "The onboarding back is an outline; Done, Got it and Skip are flat white." },
  { k: "a", name: "A · Rim", note: "White, a touch cooler at the bottom, a fine ink rim, a bright line along the top edge and a soft shadow under it." },
  { k: "b", name: "B · Rim and inner light", note: "A, plus a pale periwinkle light pooling inside the edges, like the primary's, much softer." },
  { k: "c", name: "C · Periwinkle inner light", note: "A stronger pale periwinkle light inside and a periwinkle tint in the rim: white, but clearly from the same family as the primary." },
];

const CSS = `
@layer components {
.sd { color: #fff; transition: transform .35s cubic-bezier(.2,1.4,.4,1), filter .15s; }
.sd:active, .sw:active { transform: scale(.965); }
.sd-now { background: rgb(255 255 255 / .08); box-shadow: inset 0 0 0 1px rgb(255 255 255 / .12); }
.sd-now.sd-solid { background: var(--color-card); box-shadow: inset 0 0 0 1px rgb(255 255 255 / .08); }
.sd-a, .sd-b, .sd-c { background: linear-gradient(180deg, #262735, #1b1c26 60%, #191a23);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .12), inset 0 1px 0 rgb(255 255 255 / .2), 0 10px 22px -12px rgb(0 0 0 / .9); }
.sd-b { box-shadow: inset 0 0 0 1px rgb(255 255 255 / .12), inset 0 1px 0 rgb(255 255 255 / .22), inset 0 0 16px 2px rgb(255 255 255 / .07), 0 10px 22px -12px rgb(0 0 0 / .9); }
.sd-c { box-shadow: inset 0 0 0 1px rgb(255 255 255 / .13), inset 0 1px 0 rgb(255 255 255 / .24), inset 0 0 18px 3px rgb(140 156 248 / .17), 0 10px 22px -12px rgb(0 0 0 / .9); }
@media (hover: hover) { .sd:hover, .sw:hover { filter: brightness(1.06); } }
.sw { color: #12131c; transition: transform .35s cubic-bezier(.2,1.4,.4,1), filter .15s; }
.sw-now { background: #fff; }
.sw-now.sw-line { background: transparent; box-shadow: inset 0 0 0 1px rgb(18 19 28 / .15); }
.sw-a, .sw-b, .sw-c { background: linear-gradient(180deg, #ffffff, #f4f5fa 60%, #eceef7);
  box-shadow: inset 0 0 0 1px rgb(19 21 35 / .08), inset 0 1px 0 #fff, 0 8px 18px -10px rgb(28 34 82 / .45); }
.sw-b { box-shadow: inset 0 0 0 1px rgb(19 21 35 / .08), inset 0 1px 0 #fff, inset 0 0 14px 2px rgb(206 214 255 / .5), 0 8px 18px -10px rgb(28 34 82 / .45); }
.sw-c { box-shadow: inset 0 0 0 1px rgb(104 126 245 / .2), inset 0 1px 0 #fff, inset 0 0 18px 3px rgb(206 214 255 / .8), 0 8px 18px -10px rgb(28 34 82 / .45); }
}`;

const Round = ({ s, kind, icon, size = 56, solid, line, label }: { s: S; kind: "d" | "w"; icon: IconName; size?: number; solid?: boolean; line?: boolean; label: string }) => (
  <button aria-label={label} className={cx(kind === "d" ? `sd sd-${s}` : `sw sw-${s}`, solid && "sd-solid", line && "sw-line", "grid shrink-0 place-items-center rounded-full")} style={{ width: size, height: size }}>
    <Icon name={icon} size={Math.round(size * 0.42)} />
  </button>
);
const Wide = ({ s, kind, children, className }: { s: S; kind: "d" | "w"; children: ReactNode; className?: string }) => (
  <button className={cx(kind === "d" ? `sd sd-${s} sd-solid` : `sw sw-${s}`, "h-14 rounded-full px-6 text-[16px] font-medium", className)}>{children}</button>
);
const Primary = ({ children, className }: { children: ReactNode; className?: string }) => <button className={cx("pill pill-primary px-6", className)}>{children}</button>;

function Phone({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("relative isolate flex h-[760px] w-[360px] shrink-0 flex-col overflow-hidden rounded-[46px] shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]", className)}>{children}</div>;
}

// a dark working screen: close in the top left, the group list with a finished card, back and the primary below
function DarkFlow({ d, w, tick }: { d: S; w: S; tick: "w" | "d" }) {
  return (
    <Phone className="bg-bg text-white">
      <div className="dotgrid" />
      <div className="min-h-0 flex-1 px-5 pt-12">
        <div className="flex h-14 items-center gap-4">
          <Round s={d} kind="d" icon="close" size={40} label="Close" />
          <FlowProgress steps={["Base", "Around", "Lengths", "Widths", "Seated"].map((label, i) => ({ label, value: i === 0 ? 1 : 0 }))} className="flex-1 pt-[18px]" />
        </div>
        <h1 className="h-serif mt-8 text-center !text-[30px] [text-wrap:balance]">Let’s finish your measurements</h1>
        <div className="mt-8 flex flex-col gap-2.5">
          <div className="flex items-center gap-3.5 rounded-[22px] bg-[var(--color-snow)] px-4 py-3.5 text-[#131523]">
            {/* the finished card's tick, in the secondary style */}
            <span className={cx(tick === "w" ? `sw sw-${w}` : `sd sd-${d}`, "grid h-7 w-7 shrink-0 place-items-center rounded-full", d === "now" && tick === "d" && "!bg-[#131523]", w === "now" && tick === "w" && "!bg-[rgb(19_21_35/.1)]")}><Icon name="check" size={15} strokeWidth={2.6} /></span>
            <div className="min-w-0 flex-1"><div className="text-[17px] font-medium">Base measurements</div><div className="text-[14px] text-[#131523]/60">Height, bust, waist and hips</div></div>
            <span className="text-[15px] text-[#131523]/60">4/4</span>
          </div>
          <div className="flex items-center gap-3.5 rounded-[22px] border border-white/12 bg-card px-4 py-3.5">
            <span className="icon-primary grid h-7 w-7 shrink-0 place-items-center rounded-full pb-[1.5px] text-[13px] font-medium">2</span>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[17px] font-medium">Around the body</span><span className="text-[13px] text-peri">Up next</span></div><div className="truncate text-[14px] text-white/50">Circumferences: neck, ribs, arm…</div></div>
            <span className="text-[15px] text-white/60">0/7</span>
          </div>
        </div>
        {/* a sheet's pair: the secondary Cancel beside a primary */}
        <p className="mt-8 text-[14px] text-white/45">In a sheet</p>
        <div className="mt-2 flex gap-3"><Wide s={d} kind="d" className="flex-1">Cancel</Wide><Primary className="flex-1">Delete</Primary></div>
        <div className="mt-3"><Wide s={w} kind="w" className="w-full">Done</Wide></div>
      </div>
      <div className="flex items-center gap-3 px-5 pb-8 pt-2">
        <Round s={d} kind="d" icon="back" solid label="Back" />
        <Primary className="flex-1">Continue: Around the body</Primary>
      </div>
    </Phone>
  );
}

// the onboarding: the picture with Skip on it, the paper below with back and Next
function PaperFlow({ w }: { w: S }) {
  return (
    <Phone className="paper">
      <div className="relative h-[54%] shrink-0 overflow-hidden rounded-b-[32px] text-white">
        <Crown />
        <div className="absolute inset-x-0 top-0 flex justify-end px-5 pt-12"><Wide s={w} kind="w" className="!h-10 !px-5 !text-[15px]">Skip</Wide></div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-6 pt-6">
        <h1 className="h1 !text-[30px] text-[#12131c]">Measure once</h1>
        <p className="lead mt-2">Your body is saved, and every pattern is drafted to it.</p>
      </div>
      <div className="flex items-center gap-3 px-6 pb-8">
        <Round s={w} kind="w" icon="back" line label="Previous" />
        <Primary className="flex-1">Next</Primary>
      </div>
    </Phone>
  );
}

export function ButtonLab() {
  const [d, setD] = useState<S>("b");
  const [w, setW] = useState<S>("b");
  const [tick, setTick] = useState<"w" | "d">("w");
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="h1 !text-[34px]">Secondary buttons</h2>
      <p className="mt-3 max-w-[720px] text-[16px] leading-snug text-white/65">Built like the primary (a rim, a highlight along the top, light inside) but in their own colours, with no dot grid and less light, so the primary stays the loudest. Only buttons with a shape change; a bare icon like the chevron on home&apos;s start cards stays as it is.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div><p className="text-[15px] text-white/50">Dark</p><div className="mt-2">{pick(DARK, d, setD)}</div><p className="mt-3 text-[15px] leading-snug text-white/65">{DARK.find((x) => x.k === d)!.note}</p></div>
        <div><p className="text-[15px] text-white/50">White</p><div className="mt-2">{pick(WHITE, w, setW)}</div><p className="mt-3 text-[15px] leading-snug text-white/65">{WHITE.find((x) => x.k === w)!.note}</p></div>
        <div><p className="text-[15px] text-white/50">The tick on a finished card</p><div className="mt-2">{pick([{ k: "w" as const, name: "White" }, { k: "d" as const, name: "Dark" }], tick, setTick)}</div><p className="mt-3 text-[15px] leading-snug text-white/65">The tick on Base measurements once it is done, in the white or the dark secondary style.</p></div>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <figure className="flex flex-col items-center gap-3"><DarkFlow d={d} w={w} tick={tick} /><figcaption className="text-[14px] text-white/55">A dark working screen</figcaption></figure>
        <figure className="flex flex-col items-center gap-3"><PaperFlow w={w} /><figcaption className="text-[14px] text-white/55">The onboarding</figcaption></figure>
      </div>
    </section>
  );
}
