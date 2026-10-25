"use client";
// Lab · Body ready (25 Oct 2026): "Well done! Your body is ready" refined. From 1 (the pressed label), kept: the ticked
// "Saved to your bodies" in a squarish container pressed into the paper, the heading and the line under it. New: the
// body's name in white on the 3D body's card, its bottom as far from the card's edge as the label is from the top of the
// paper (not a button); and under the text a ring of the measurements added, "18 of 24 / measurements added" inside it
// in the app's font, with "Complete measurements". Five ways to fit it, centred, in the room a phone leaves.
// Skeuomorphic like the look switch and the pattern tray: pressed into the paper, or raised off it, lit from above.
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
const GAP = 20; // the paper's top to the label; the name's bottom to the card's edge

type S = { name: string; count: number };
const Tick = ({ size = 22 }: { size?: number }) => <span className="grid shrink-0 place-items-center rounded-full text-white" style={{ ...KNOB, width: size, height: size }}><Icon name="check" size={Math.round(size * 0.55)} strokeWidth={3} /></span>;
const Saved = () => <div className="text-center"><span className="inline-flex h-11 items-center gap-2.5 rounded-[14px] pl-2.5 pr-4 text-[15px] text-[#12131c]/75" style={PRESSED}><Tick />Saved to your bodies</span></div>;
const Text = ({ name }: { name: string }) => (
  <div className="mt-5 text-center">
    <h1 className="h1 !text-[32px] text-[#12131c] [text-wrap:balance]">Well done! Your body is ready</h1>
    <p className="lead mx-auto mt-3 max-w-[320px] [text-wrap:pretty]">Every pattern you make for {name} will be drafted to these measurements.</p>
  </div>
);
const Complete = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <span className={cx("inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-medium text-[#12131c]", className)} style={{ ...RAISED, ...style }}><Icon name="ruler" size={17} />Complete measurements</span>
);

// the ring: a solid cornflower arc for the measurements added (no dashes) on a faint track, "18 of 24" and
// "measurements added" inside it in the app's font; full, with all 24
function Ring({ count, size = 108, light, arc = 1 }: { count: number; size?: number; light?: boolean; arc?: number }) {
  const w = 6, r = size / 2 - w, full = 2 * Math.PI * r, c = full * arc, all = count >= 24;
  const start = arc < 1 ? 90 + (360 * (1 - arc)) / 2 : -90; // a dial (arc < 1) opens at the bottom
  const ink = light ? "text-white" : "text-[#12131c]";
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={light ? "rgb(255 255 255 / .16)" : "rgb(18 19 28 / .09)"} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${c} ${full}`} transform={`rotate(${start} ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#687ef5" strokeWidth={w} strokeLinecap="round" strokeDasharray={`${(c * Math.min(count, 24)) / 24} ${full}`} transform={`rotate(${start} ${size / 2} ${size / 2})`} />
      </svg>
      {/* the words scale with the ring, so they always sit inside it */}
      <span className={cx("relative text-center leading-tight", arc < 1 ? "whitespace-nowrap" : "max-w-[74%]", ink)} style={arc < 1 ? { transform: `translateY(${-Math.round(size * 0.12)}px)` } : undefined}>
        <span className="block font-medium tabular-nums" style={{ fontSize: Math.round(size * 0.16) }}>{all ? "All 24" : `${count} of 24`}</span>
        <span className={cx("mt-0.5 block", light ? "text-white/70" : "text-[#12131c]/60")} style={{ fontSize: arc < 1 ? 11 : Math.max(9.5, +(size * 0.104).toFixed(1)) }}>measurements added</span>
      </span>
    </span>
  );
}

// the art: the start screen's night card and the 3D body from the waist up, posed (as in the app), the body's name in
// white at its foot (a caption, not a button); over: anything else laid on the card
function Art({ sex, name, align = "center", over }: { sex: "female" | "male"; name: string; align?: "center" | "left"; over?: ReactNode }) {
  return (
    <div className="relative h-[40%] shrink-0 overflow-hidden rounded-b-[32px] text-white">
      <Crown />
      <div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
      <div className="absolute inset-0 pt-10"><Body3D sex={sex} focus="portrait" autoRotate={false} className="h-full w-full" /></div>
      {/* a soft shade under the name, so white reads on the body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(180deg, transparent, rgb(11 12 21 / .55))" }} />
      <div className={cx("absolute inset-x-6 truncate text-[17px] font-medium tracking-[-.01em]", align === "center" ? "text-center" : "text-left")} style={{ bottom: GAP }}>{name}</div>
      {over}
    </div>
  );
}

// 1 · today's pressed label (for comparison): the count a plain line under the text
function V1({ name, count }: S) {
  return (
    <>
      <Saved /><Text name={name} />
      <div className="mt-5 text-center text-[15px] text-[#12131c]/60">{name} · <span className="tabular-nums">{count === 24 ? "All 24 measurements" : `${count} of 24 measurements`}</span></div>
      {count < 24 && <div className="mt-2 text-center"><span className="inline-flex items-center gap-1 text-[15px] font-medium text-primary-2">Add the other {24 - count} for a closer fit<Icon name="chevR" size={16} /></span></div>}
    </>
  );
}

// 7 · the ring and the button side by side, centred under the text
function V7({ name, count }: S) {
  return (
    <>
      <Saved /><Text name={name} />
      <div className="mt-5 flex items-center justify-center gap-4"><Ring count={count} />{count < 24 && <Complete />}</div>
    </>
  );
}

// 8 · the same pair in one well pressed into the paper, so the ring and its button read as one thing
function V8({ name, count }: S) {
  return (
    <>
      <Saved /><Text name={name} />
      <div className="mx-auto mt-5 flex w-fit items-center gap-4 rounded-[30px] p-2 pr-3" style={PRESSED}>
        <Ring count={count} size={96} />{count < 24 ? <Complete /> : <span className="pr-3 text-[14px] text-[#12131c]/60">Every measurement<br />Venty uses</span>}
      </div>
    </>
  );
}

// 9 · on the card: the ring in the night card's corner, in white, level with the name (a film's caption and its dial);
// under the text only the button, centred
function V9({ name, count }: S) {
  return (
    <>
      <Saved /><Text name={name} />
      {count < 24 && <div className="mt-6 flex justify-center"><Complete /></div>}
    </>
  );
}
const over9 = (count: number) => <div className="absolute right-5" style={{ bottom: GAP - 8 }}><Ring count={count} size={100} light /></div>;

// 10 · a dial: the ring opened at the bottom like a gauge, the words in its middle, the button sitting in the gap
function V10({ name, count }: S) {
  return (
    <>
      <Saved /><Text name={name} />
      <div className="relative mx-auto mt-3 h-[110px] w-[150px]">
        <div className="absolute inset-x-0 top-0 flex justify-center"><Ring count={count} size={124} arc={0.72} /></div>
        {count < 24 && <div className="absolute inset-x-0 bottom-0 flex justify-center"><Complete className="!h-10 !px-3.5 !text-[14px]" /></div>}
      </div>
    </>
  );
}

// 11 · the ring as a dial raised off the paper (a knob, like the look switch's), the button a tab tucked under its foot
function V11({ name, count }: S) {
  return (
    <>
      <Saved /><Text name={name} />
      <div className="relative mx-auto mt-2 flex w-fit flex-col items-center">
        <span className="grid place-items-center rounded-full p-1.5" style={RAISED}><span className="grid place-items-center rounded-full" style={PRESSED}><Ring count={count} size={90} /></span></span>
        {count < 24 && <Complete className="-mt-5 !h-10 !px-3.5 !text-[14px]" />}
      </div>
    </>
  );
}

const VERSIONS: { k: string; name: string; note: string; C: (p: S) => ReactNode; align?: "center" | "left"; over?: (count: number) => ReactNode }[] = [
  { k: "7", name: "7 · Ring and button", note: "The ring and Complete measurements side by side, centred under the text. The name sits in white at the foot of the body's card, centred.", C: V7 },
  { k: "8", name: "8 · In one well", note: "The same pair held in one well pressed into the paper, so the ring and its button read as one thing to tap.", C: V8 },
  { k: "9", name: "9 · On the card", note: "The most cinematic: the ring in white in the night card's corner, level with the name on the left, like a film's caption and its dial. Under the text, only the button.", C: V9, align: "left", over: over9 },
  { k: "10", name: "10 · Dial", note: "The ring opened at the bottom like a gauge, the words in its middle and the button sitting in the opening.", C: V10 },
  { k: "11", name: "11 · Raised dial", note: "The ring set in a dial raised off the paper (a knob, like the look switch's), with the button tucked under its foot like a tab.", C: V11 },
  { k: "1", name: "1 · Pressed label (before)", note: "Version 1 as it was, to compare: the count as a plain line under the text.", C: V1 },
];

function Phone({ label, sex, name, count, v }: { label: string; sex: "female" | "male"; name: string; count: number; v: (typeof VERSIONS)[number] }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="paper relative isolate flex h-[852px] w-[393px] shrink-0 flex-col overflow-hidden rounded-[46px] shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        <Art sex={sex} name={name} align={v.align} over={v.over?.(count)} />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 noscroll" style={{ paddingTop: GAP }}><v.C name={name} count={count} /></div>
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
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">From 1 (the pressed label): the same Saved to your bodies label, heading and line under it. The body&apos;s name now sits in white at the foot of the 3D body&apos;s card (as far from its edge as the label is from the top of the paper; a caption, not a button). Under the text, a ring of the measurements added with &quot;18 of 24 / measurements added&quot; inside it in the app&apos;s font, and Complete measurements. Five ways to fit it, centred, on a phone at its real size (393 × 852), with 1 as it was to compare.</p>
      <div className="mt-5 space-y-3">
        <div><div className="mb-2 text-[14px] text-white/50">Measurements</div><Pick items={[{ k: "18" as const, name: "18 of 24" }, { k: "24" as const, name: "All 24" }]} value={count} onChange={setCount} /></div>
        <div><div className="mb-2 text-[14px] text-white/50">Body&apos;s name</div><Pick items={[{ k: "Me", name: "Me" }, { k: "Ana", name: "Ana" }, { k: "Mum, wedding guest dress", name: "A long name" }]} value={name} onChange={setName} /></div>
        <div><div className="mb-2 text-[14px] text-white/50">Body</div><Pick items={[{ k: "female" as const, name: "Female" }, { k: "male" as const, name: "Male" }]} value={sex} onChange={setSex} /></div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-12">
        {VERSIONS.map((v) => (
          <div key={v.k} className="flex w-[393px] flex-col gap-4">
            <Phone label={v.name} sex={sex} name={name} count={Number(count)} v={v} />
            <p className="text-[14px] leading-snug text-white/55">{v.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
