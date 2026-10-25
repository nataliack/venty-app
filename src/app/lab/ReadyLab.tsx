"use client";
// Lab · Body ready (25 Oct 2026), round 3, from 10 (the dial). Kept: the ticked "Saved to your bodies" pressed into the
// paper, the heading and the line under it. The body's name in a small glass tag floating on the 3D body's card (a
// caption, not a button), as far from its edge as the label is from the top of the paper. Under the text, the dial: the
// ring opened at the bottom like a gauge, "18 of 24 / measurements added" in its middle in the app's font, Complete
// measurements sitting in the opening. Six skeuomorphic builds of it (a channel pressed into the paper and a raised
// fill, lit from above). While measurements are still to add, the body's card is shorter, so the dial has room; with
// all 24 added it keeps its full height and the dial closes, with no button.
import { useId, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@/components/icons";
import { cx, Crown } from "@/components/ui";
import { BodyLoader } from "@/components/BodyLoader";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false, loading: () => <BodyLoader /> });

// pressed into the paper: darker along the top inside edge, a white lip below
const PRESSED: CSSProperties = { background: "rgb(18 19 28 / .045)", boxShadow: "inset 0 2px 5px rgb(18 19 28 / .16), inset 0 1px 1.5px rgb(18 19 28 / .18), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9)" };
// raised off the paper: a light top edge, a soft shadow under
const RAISED: CSSProperties = { background: "linear-gradient(180deg, #ffffff, #f7f6f2)", boxShadow: "inset 0 1px 0 #fff, 0 0 0 1px rgb(18 19 28 / .05), 0 1px 2px rgb(18 19 28 / .12), 0 8px 18px -10px rgb(18 19 28 / .32)" };
// the tick on a small raised ink knob (the look switch's knob)
const KNOB: CSSProperties = { background: "linear-gradient(180deg, #2e3040, #1a1c28)", boxShadow: "0 2px 4px rgb(0 0 0 / .28), 0 1px 1px rgb(0 0 0 / .3), inset 0 1px 0 rgb(255 255 255 / .22)" };
const GAP = 20; // the paper's top to the label; the name tag's bottom to the card's edge

const Tick = ({ size = 22 }: { size?: number }) => <span className="grid shrink-0 place-items-center rounded-full text-white" style={{ ...KNOB, width: size, height: size }}><Icon name="check" size={Math.round(size * 0.55)} strokeWidth={3} /></span>;
const Saved = () => <div className="text-center"><span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75" style={PRESSED}><Tick />Saved to your bodies</span></div>;
const Text = ({ name }: { name: string }) => (
  <div className="mt-5 text-center">
    <h1 className="h1 !text-[32px] text-[#12131c] [text-wrap:balance]">Well done! Your body is ready</h1>
    <p className="lead mx-auto mt-3 max-w-[320px] [text-wrap:pretty]">Every pattern you make for {name} will be drafted to these measurements.</p>
  </div>
);
const Complete = ({ className }: { className?: string }) => (
  <span className={cx("inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[15px] font-medium text-[#12131c]", className)} style={RAISED}><Icon name="ruler" size={17} />Complete measurements</span>
);

// ─── the dial ───
// arc: how much of the circle it draws (it opens at the bottom); the fill is the share of the 24 added
type Build = "channel" | "thumb" | "bezel" | "scale" | "lit" | "well";
function Dial({ count, build, size = 172 }: { count: number; build: Build; size?: number }) {
  const id = useId().replace(/:/g, "");
  const all = count >= 24;
  const cx0 = size / 2, cy0 = size / 2;
  const W = build === "lit" ? 14 : 16; // the channel's width
  const r = size / 2 - W / 2 - (build === "scale" ? 12 : build === "bezel" ? 14 : 4);
  const arc = 0.72, sweep = 360 * arc, start = 90 + (360 - sweep) / 2; // degrees, 0 = right, clockwise (screen)
  const pt = (deg: number, rr = r) => [cx0 + rr * Math.cos((deg * Math.PI) / 180), cy0 + rr * Math.sin((deg * Math.PI) / 180)];
  const path = (a0: number, a1: number, rr = r) => { const [x0, y0] = pt(a0, rr), [x1, y1] = pt(a1, rr); return `M${x0} ${y0}A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`; };
  const end = start + sweep * Math.min(1, count / 24);
  const track = path(start, start + sweep), fill = path(start, Math.max(start + 0.01, end));
  const dark = build === "lit";
  const [tx, ty] = pt(end);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {build === "bezel" && <span aria-hidden className="absolute inset-0 rounded-full" style={RAISED} />}
      {build === "well" && <span aria-hidden className="absolute inset-[2px] rounded-full" style={PRESSED} />}
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 overflow-visible" aria-hidden>
        <defs>
          {/* a channel pressed into the paper: a shadow along its upper inside edge */}
          <filter id={`in${id}`} filterUnits="userSpaceOnUse" x={-20} y={-20} width={size + 40} height={size + 40}>
            <feOffset in="SourceAlpha" dy="2" result="o" /><feGaussianBlur in="o" stdDeviation="1.6" result="b" />
            <feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2="1" k3="-1" result="edge" />
            <feFlood floodColor="#12131c" floodOpacity={dark ? 0.7 : 0.32} /><feComposite in2="edge" operator="in" result="sh" />
            <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="sh" /></feMerge>
          </filter>
          {/* the fill raised out of it: a light top, a short shadow under */}
          <linearGradient id={`fg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8496f8" /><stop offset="1" stopColor="#5f74ef" /></linearGradient>
          <filter id={`up${id}`} filterUnits="userSpaceOnUse" x={-20} y={-20} width={size + 40} height={size + 40}><feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#1c2454" floodOpacity=".35" /></filter>
          <filter id={`glow${id}`} filterUnits="userSpaceOnUse" x={-20} y={-20} width={size + 40} height={size + 40}><feGaussianBlur stdDeviation="4" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* the scale: a fine mark for each of the 24, a longer one every six (a ruler round the dial, not the progress) */}
        {build === "scale" && Array.from({ length: 25 }, (_, i) => {
          const a = start + (sweep * i) / 24, long = i % 6 === 0;
          const [x0, y0] = pt(a, r + W / 2 + 3), [x1, y1] = pt(a, r + W / 2 + (long ? 10 : 6));
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#12131c" strokeOpacity={long ? 0.4 : 0.22} strokeWidth="1.2" strokeLinecap="round" />;
        })}
        {/* the channel */}
        <path d={track} fill="none" stroke={dark ? "#1b1c26" : "#e6e4de"} strokeWidth={W} strokeLinecap="round" filter={`url(#in${id})`} />
        {/* the fill */}
        {count > 0 && <path d={fill} fill="none" stroke={`url(#fg${id})`} strokeWidth={W - 6} strokeLinecap="round" filter={dark ? `url(#glow${id})` : `url(#up${id})`} />}
        {count > 0 && <path d={fill} fill="none" stroke="#fff" strokeOpacity={dark ? 0.35 : 0.45} strokeWidth="1.2" strokeLinecap="round" transform={`translate(0 ${-(W - 6) / 2 + 1.5})`} style={{ mixBlendMode: "screen" }} />}
        {/* the thumb: a raised knob where the fill ends */}
        {build === "thumb" && !all && <g filter={`url(#up${id})`}><circle cx={tx} cy={ty} r={W / 2 + 3} fill="#fff" /><circle cx={tx} cy={ty} r={3} fill="#687ef5" /></g>}
      </svg>
      {/* the words in the middle, a little above it (the button sits in the opening below) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ paddingBottom: size * (all ? 0.1 : 0.16) }}>
        <span className="font-medium leading-none tabular-nums tracking-[-.01em] text-[#12131c]" style={{ fontSize: size < 160 ? 18 : 22 }}>{all ? "All 24" : `${count} of 24`}</span>
        <span className="mt-1.5 whitespace-nowrap text-[#12131c]/60" style={{ fontSize: size < 160 ? 11 : 12 }}>measurements added</span>
      </div>
    </div>
  );
}

// the art: the start screen's night card and the 3D body from the waist up, posed (as in the app), and the body's name
// in a small glass tag floating at its foot (a caption, not a button). Shorter while measurements are still to add
function Art({ sex, name, short }: { sex: "female" | "male"; name: string; short: boolean }) {
  return (
    <div className={cx("relative shrink-0 overflow-hidden rounded-b-[32px] text-white transition-[height] duration-500", short ? "h-[31%]" : "h-[40%]")}>
      <Crown />
      <div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
      <div className="absolute inset-0 pt-9"><Body3D sex={sex} focus="portrait" autoRotate={false} className="h-full w-full" /></div>
      <div className="absolute inset-x-6 flex justify-center" style={{ bottom: GAP }}>
        <span className="max-w-full truncate rounded-[12px] px-3.5 py-2 text-[14px] font-medium text-white backdrop-blur-md"
          style={{ background: "rgb(13 14 24 / .5)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / .14), inset 0 1px 0 rgb(255 255 255 / .12)" }}>{name}</span>
      </div>
    </div>
  );
}

// the dial under the text; Complete measurements sitting in its opening while measurements are still to add
// (with all 24 the card is back to its full height and there is no button, so the dial is smaller)
function DialBlock({ count, build }: { count: number; build: Build }) {
  const size = count < 24 ? 188 : 150;
  return (
    <div className={cx("relative mx-auto", count < 24 ? "mt-4" : "mt-2")} style={{ width: size, height: count < 24 ? size * 0.9 : size * 0.8 }}>
      <Dial count={count} build={build} size={size} />
      {count < 24 && <div className="absolute inset-x-0 flex justify-center" style={{ bottom: 0 }}><Complete className={build === "bezel" ? "!h-10" : ""} /></div>}
    </div>
  );
}

const VERSIONS: { k: Build; name: string; note: string }[] = [
  { k: "channel", name: "A · Pressed channel", note: "10, built: the dial's track is a channel pressed into the paper (a shadow along its upper inside edge), the fill raised out of it in cornflower with a lit top edge." },
  { k: "thumb", name: "B · With a thumb", note: "The pressed channel and its raised fill, with a white knob where the fill ends, as on a slider." },
  { k: "bezel", name: "C · Raised bezel", note: "The dial set in a round bezel raised off the paper, like a watch face, its channel pressed into the bezel; the button tucked at its foot." },
  { k: "scale", name: "D · With a scale", note: "A fine scale round the outside of the channel, a mark for each of the 24 and a longer one every six, like a measuring dial (a ruler, not the progress)." },
  { k: "lit", name: "E · Lit gauge", note: "An instrument's lit gauge: the channel in ink, pressed in, the cornflower fill glowing in it." },
  { k: "well", name: "F · In a well", note: "The whole dial pressed into the paper in one round well, its channel and raised fill inside it." },
];

function Phone({ label, sex, name, count, build }: { label: string; sex: "female" | "male"; name: string; count: number; build: Build }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="paper relative isolate flex h-[852px] w-[393px] shrink-0 flex-col overflow-hidden rounded-[46px] shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        <Art sex={sex} name={name} short={count < 24} />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 noscroll" style={{ paddingTop: GAP }}>
          <Saved /><Text name={name} /><DialBlock count={count} build={build} />
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1 px-6 pb-6 pt-3">
          <span className="pill pill-primary w-full text-[16px] text-white">Choose what to make</span>
          <span className="h-11 px-4 pt-3 text-[16px] font-medium text-[#12131c]/65">Go to home</span>
        </div>
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}
function Pick<T extends string>({ items, value, onChange }: { items: { k: T; name: string }[]; value: T; onChange: (k: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">{items.map((x) => (
      <button key={x.k} onClick={() => onChange(x.k)} aria-pressed={value === x.k} className={cx("h-11 rounded-full px-5 text-[15px] font-medium transition-colors", value === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
}

export function ReadyLab() {
  const [state, setState] = useState<"18" | "24">("18");
  const [sex, setSex] = useState<"female" | "male">("female");
  // the body's name is whatever the person called it; a long one shows how the tag fits
  const [name, setName] = useState("Me");
  const count = Number(state);
  return (
    <section>
      <h2 className="h1 !text-[34px]">Body ready</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">Round 3, from 10 (the dial). The body&apos;s name in a small glass tag floating on the 3D body&apos;s card (a caption, not a button). The dial in six skeuomorphic builds: a channel pressed into the paper and a cornflower fill raised out of it, lit from above. While measurements are still to add, the body&apos;s card is shorter, so the dial and its button have room; with all 24 it keeps its full height and the dial closes on a tick. Switch the state with the tabs (they stay at the top while you scroll).</p>
      {/* the tabs: the two states of the screen, and the name and body to try; pinned while scrolling */}
      <div className="sticky top-0 z-30 -mx-6 mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 bg-[#05060b]/90 px-6 py-3 backdrop-blur">
        <div role="tablist" aria-label="Screen state" className="flex rounded-full bg-white/[.06] p-1">
          {([["18", "Still to add · 18 of 24"], ["24", "All added · 24 of 24"]] as const).map(([k, t]) => (
            <button key={k} role="tab" aria-selected={state === k} onClick={() => setState(k)} className={cx("h-10 rounded-full px-5 text-[15px] font-medium transition-colors", state === k ? "bg-white text-bg" : "text-white/70 hover:text-white")}>{t}</button>
          ))}
        </div>
        <Pick items={[{ k: "Me", name: "Me" }, { k: "Ana", name: "Ana" }, { k: "Mum, wedding guest dress", name: "A long name" }]} value={name} onChange={setName} />
        <Pick items={[{ k: "female" as const, name: "Female" }, { k: "male" as const, name: "Male" }]} value={sex} onChange={setSex} />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {VERSIONS.map((v) => (
          <div key={v.k} className="flex w-[393px] flex-col gap-4">
            <Phone label={v.name} sex={sex} name={name} count={count} build={v.k} />
            <p className="text-[14px] leading-snug text-white/55">{v.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
