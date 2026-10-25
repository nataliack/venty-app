"use client";
// Lab · Body ready (25 Oct 2026): "Well done! Your body is ready" refined. No divider and no dashed progress; the count
// in one font (the app's, with even-width figures), or the number alone in Bigilla on a line of its own; the ticked
// "Saved to your bodies" in a squarish container pressed into the paper, at the top of the paper, clear of the body's
// card. Skeuomorphic like the look switch and the pattern tray: pressed into the paper, or raised off it, lit from above.
import { useState, type CSSProperties, type ReactNode } from "react";
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

type S = { name: string; count: number };
const Tick = ({ size = 22 }: { size?: number }) => <span className="grid shrink-0 place-items-center rounded-full text-white" style={{ ...KNOB, width: size, height: size }}><Icon name="check" size={Math.round(size * 0.55)} strokeWidth={3} /></span>;
const Heading = () => <h1 className="h1 !text-[32px] text-[#12131c] [text-wrap:balance]">Well done! Your body is ready</h1>;
const Lead = ({ name, className }: { name: string; className?: string }) => <p className={cx("lead mx-auto max-w-[320px] [text-wrap:pretty]", className)}>Every pattern you make for {name} will be drafted to these measurements.</p>;
const More = ({ left, className }: { left: number; className?: string }) => left > 0 ? <span className={cx("inline-flex items-center gap-1 text-[15px] font-medium text-primary-2", className)}>Add the other {left} for a closer fit<Icon name="chevR" size={16} /></span> : null;
const Count = ({ count }: { count: number }) => <span className="tabular-nums">{count === 24 ? "All 24 measurements" : `${count} of 24 measurements`}</span>;

// 1 · the pressed label, then the heading; the count a plain line in the app's font
function V1({ name, count }: S) {
  return (
    <div className="text-center">
      <span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75" style={PRESSED}><Tick />Saved to your bodies</span>
      <div className="mt-6"><Heading /></div>
      <Lead name={name} className="mt-3" />
      <div className="mt-5 text-[15px] text-[#12131c]/60">{name} · <Count count={count} /></div>
      <More left={24 - count} className="mt-2" />
    </div>
  );
}

// 2 · the pressed card: the tick, "Saved to your bodies" and the body's name and count in one well
function V2({ name, count }: S) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-[18px] p-3.5" style={PRESSED}>
        <Tick size={34} />
        <div className="min-w-0"><div className="text-[15px] font-medium text-[#12131c]">Saved to your bodies</div><div className="truncate text-[14px] text-[#12131c]/60">{name} · <Count count={count} /></div></div>
      </div>
      <div className="mt-6 text-center"><Heading /><Lead name={name} className="mt-3" /></div>
      {count < 24 && <div className="mt-5 flex justify-center"><span className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-medium text-[#12131c]" style={RAISED}><Icon name="plus" size={16} />Add the other {24 - count}</span></div>}
    </div>
  );
}

// 3 · two square tiles under the text: the count pressed in (the number in Bigilla on its own, the words below it),
// and the way to add the rest, raised
function V3({ name, count }: S) {
  return (
    <div className="text-center">
      <span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75" style={PRESSED}><Tick />Saved to your bodies</span>
      <div className="mt-6"><Heading /></div>
      <Lead name={name} className="mt-3" />
      <div className={cx("mt-5 grid gap-3", count < 24 ? "grid-cols-2" : "grid-cols-1")}>
        <div className="flex h-[78px] flex-col items-center justify-center rounded-[18px]" style={PRESSED}>
          <span className="serif text-[28px] leading-none text-[#12131c]">{count}</span>
          <span className="mt-1.5 text-[13px] text-[#12131c]/60">{count === 24 ? "all measurements" : "of 24 measurements"}</span>
        </div>
        {count < 24 && (
          <div className="flex h-[78px] flex-col items-center justify-center rounded-[18px] px-3" style={RAISED}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white"><Icon name="plus" size={16} /></span>
            <span className="mt-2 text-[13px] font-medium leading-tight text-[#12131c]">Add the other {24 - count}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 4 · a gauge: a round well pressed into the paper, a solid cornflower ring for the measurements taken (no dashes), the
// number in Bigilla alone in the middle; the body's name and the way to add the rest beside it
function Gauge({ count }: { count: number }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <span className="relative grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full" style={PRESSED}>
      <svg viewBox="0 0 76 76" className="absolute inset-0" aria-hidden>
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgb(18 19 28 / .08)" strokeWidth="5" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#687ef5" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(c * count) / 24} ${c}`} transform="rotate(-90 38 38)" />
      </svg>
      <span className="serif relative text-[22px] leading-none text-[#12131c]">{count}</span>
    </span>
  );
}
function V4({ name, count }: S) {
  return (
    <div>
      <div className="text-center"><span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75" style={PRESSED}><Tick />Saved to your bodies</span></div>
      <div className="mt-6 text-center"><Heading /><Lead name={name} className="mt-3" /></div>
      <div className="mt-5 flex items-center gap-4 rounded-[22px] p-3 pr-4" style={RAISED}>
        <Gauge count={count} />
        <div className="min-w-0">
          <div className="truncate text-[16px] text-[#12131c]">{name}</div>
          <div className="text-[14px] text-[#12131c]/60"><Count count={count} /></div>
          {count < 24 && <span className="mt-1 inline-flex items-center gap-1 text-[14px] font-medium text-primary-2">Add the other {24 - count}<Icon name="chevR" size={15} /></span>}
        </div>
      </div>
    </div>
  );
}

// 5 · the body's card raised off the paper, its count over a track pressed into it with one solid raised fill (no dashes)
function V5({ name, count }: S) {
  return (
    <div>
      <div className="text-center"><span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75" style={PRESSED}><Tick />Saved to your bodies</span></div>
      <div className="mt-6 text-center"><Heading /><Lead name={name} className="mt-3" /></div>
      <div className="mt-5 rounded-[22px] px-4 pb-4 pt-3.5" style={RAISED}>
        <div className="flex items-baseline justify-between text-[15px]"><span className="text-[#12131c]">{name}</span><span className="text-[#12131c]/60"><Count count={count} /></span></div>
        <div className="mt-3 h-2.5 rounded-full p-[2px]" style={PRESSED}>
          <span className="block h-full rounded-full" style={{ width: `${(count / 24) * 100}%`, background: "linear-gradient(180deg, #7d90f7, #687ef5)", boxShadow: "inset 0 1px 0 rgb(255 255 255 / .45), 0 1px 1px rgb(28 36 84 / .25)" }} />
        </div>
        <More left={24 - count} className="mt-3" />
      </div>
    </div>
  );
}

// 6 · 2 refined (25 Oct 2026): the pressed card at the top holds only the tick, "Saved to your bodies" and the body's
// name; the count moves to a second pressed card under the text, with a solid ring (from 4) and plain words: how many
// of the 24 are added, how many are left; inside it a raised button to add the rest
function Ring({ count, size = 60 }: { count: number; size?: number }) {
  const w = 5, r = size / 2 - w, c = 2 * Math.PI * r, all = count >= 24;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(18 19 28 / .09)" strokeWidth={w} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#687ef5" strokeWidth={w} strokeLinecap="round" strokeDasharray={`${(c * Math.min(count, 24)) / 24} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      {all ? <Icon name="check" size={20} strokeWidth={2.6} className="relative text-[#687ef5]" /> : <span className="serif relative text-[20px] leading-none text-[#12131c]">{count}</span>}
    </span>
  );
}
function V6({ name, count }: S) {
  const left = 24 - count;
  return (
    <div>
      <div className="flex items-center gap-3 rounded-[18px] p-3" style={PRESSED}>
        <Tick size={34} />
        <div className="min-w-0"><div className="text-[15px] font-medium text-[#12131c]">Saved to your bodies</div><div className="truncate text-[14px] text-[#12131c]/60">{name}</div></div>
      </div>
      <div className="mt-5 text-center"><Heading /><Lead name={name} className="mt-3" /></div>
      <div className="mt-4 flex items-center gap-3.5 rounded-[18px] p-3" style={PRESSED}>
        <Ring count={count} />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium leading-snug text-[#12131c]"><span className="tabular-nums">{left > 0 ? `${count} of 24` : "All 24"}</span> measurements added</div>
          <div className="mt-0.5 text-[13px] leading-snug text-[#12131c]/60">{left > 0 ? `${left} to go for a closer fit` : "Every measurement Venty uses"}</div>
          {left > 0 && <span className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium text-[#12131c]" style={RAISED}><Icon name="plus" size={15} />Add the rest</span>}
        </div>
      </div>
    </div>
  );
}

const VERSIONS: { k: string; name: string; note: string; C: (p: S) => ReactNode }[] = [
  { k: "6", name: "6 · Pressed card, refined", note: "2, refined: the top card holds only the tick, \"Saved to your bodies\" and the body's name. The count moves to its own pressed card under the text: a solid cornflower ring (from 4) with the number in it, how many of the 24 are added and how many are left, and a raised button inside to add the rest. With all 24, the ring closes on a tick and the button goes.", C: V6 },
  { k: "1", name: "1 · Pressed label", note: "The ticked label in a squarish container pressed into the paper, centred at the top of the paper. The count is one plain line in the app's font; the way to add the rest under it.", C: V1 },
  { k: "2", name: "2 · Pressed card", note: "One well pressed into the paper holds the tick (on a raised ink knob, like the look switch's), \"Saved to your bodies\", the body's name and its count. Adding the rest is a raised button.", C: V2 },
  { k: "3", name: "3 · Two tiles", note: "Under the text, two square tiles: the count pressed in (the number alone in Bigilla, the words under it in the app's font) and the way to add the rest, raised.", C: V3 },
  { k: "4", name: "4 · Gauge", note: "The body's card raised off the paper, with a round well pressed into it: a solid cornflower ring for the measurements taken and the number alone in the middle.", C: V4 },
  { k: "5", name: "5 · Track", note: "The body's card raised off the paper; under its count, a track pressed into the card with one solid raised fill (no dashes).", C: V5 },
];

function Phone({ label, sex, children }: { label: string; sex: "female" | "male"; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="paper relative isolate flex h-[852px] w-[393px] shrink-0 flex-col overflow-hidden rounded-[46px] shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        {/* the art: the start screen's night card and the 3D body from the waist up, posed (as in the app) */}
        <div className="relative h-[40%] shrink-0 overflow-hidden rounded-b-[32px] text-white">
          <Crown />
          <div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
          <div className="absolute inset-0 pt-10"><Body3D sex={sex} focus="portrait" autoRotate={false} className="h-full w-full" /></div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 noscroll">{children}</div>
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
  const [count, setCount] = useState<"18" | "24">("18");
  const [sex, setSex] = useState<"female" | "male">("female");
  // the body's name is whatever the person called it ("Me, Spring 26" was only a made-up name); a long one shows how it fits
  const [name, setName] = useState("Me");
  return (
    <section>
      <h2 className="h1 !text-[34px]">Body ready</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">&quot;Well done! Your body is ready&quot;, refined: no divider, no dashed progress, the count in one font (the app&apos;s, with even-width figures) or the number alone in Bigilla on a line of its own, and the ticked label in a squarish container pressed into the paper, at the top of the paper, clear of the body&apos;s card. Five versions, on a phone at its real size (393 × 852); see each with some measurements still to add, or all 24.</p>
      <div className="mt-5 space-y-3">
        <div><div className="mb-2 text-[14px] text-white/50">Measurements</div><Pick items={[{ k: "18" as const, name: "18 of 24" }, { k: "24" as const, name: "All 24" }]} value={count} onChange={setCount} /></div>
        <div><div className="mb-2 text-[14px] text-white/50">Body&apos;s name</div><Pick items={[{ k: "Me", name: "Me" }, { k: "Ana", name: "Ana" }, { k: "Mum, wedding guest dress", name: "A long name" }]} value={name} onChange={setName} /></div>
        <div><div className="mb-2 text-[14px] text-white/50">Body</div><Pick items={[{ k: "female" as const, name: "Female" }, { k: "male" as const, name: "Male" }]} value={sex} onChange={setSex} /></div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {VERSIONS.map((v) => (
          <div key={v.k} className="flex w-[393px] flex-col gap-4">
            <Phone label={v.name} sex={sex}><v.C name={name} count={Number(count)} /></Phone>
            <p className="text-[14px] leading-snug text-white/55">{v.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
