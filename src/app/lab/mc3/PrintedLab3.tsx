"use client";
// Lab (MC 3): "Your pattern is complete", round 3, from round 2's C (Tape it together), with Jose's notes. At the top, "All
// 13 sheets are printed" pressed into the paper with its tick on a raised knob (Body ready's build). Then a carousel of two
// slides you can drag: the sheets flying into place and taped together (numbered on solid badges, Show me again inside
// the slide), and, once the tape is on and a moment has passed, the fabric to buy on the night with the metres for each
// fabric width, what else you need and the three guides. Under it the pager from Add to home screen (a knob in a track
// pressed into the paper that follows the drag); then the title, View pattern map and Back to home.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon, type IconName } from "@/components/icons";
import { cx } from "@/components/ui";
import { Phone } from "./parts";
import { Printed, Today } from "./PrintedLab";
import { Page, Sheet, Title, raised, useMade } from "./PrintedLab2";

const SLIDE_H = 392, GAP = 12, AFTER = 2600, RATIO = 297 / 210;
// the pager: segments 34 wide; the knob is a segment less the 5px channel each side, the track its height plus 5 each side
const SEG = 34, CH = 5, KH = 12;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

// ─── slide 1: the sheets fly into place on a table pressed into the paper, one after another in the order to tape them,
// each on a solid numbered badge; then the tape goes on along the joins and the numbers go. Show me again replays it ───
function TapeTable({ m, run, taped, onAgain }: { m: ReturnType<typeof useMade>; run: number; taped: boolean; onAgain: () => void }) {
  const still = useReducedMotion();
  const rows = m.sheets.map(([r]) => r), cols = m.sheets.map(([, c]) => c);
  const r0 = Math.min(...rows), c0 = Math.min(...cols), nr = Math.max(...rows) - r0 + 1, nc = Math.max(...cols) - c0 + 1;
  const W = 305, H = SLIDE_H - 84;
  const cell = Math.floor(Math.min(W / nc, H / (nr * RATIO)));
  const gw = cell * nc, gh = cell * RATIO * nr;
  const at = (r: number, c: number) => ({ x: (c - c0) * cell - gw / 2, y: (r - r0) * cell * RATIO - gh / 2 });
  const on = new Set(m.sheets.map((s) => s.join("-")));
  const joins: { x: number; y: number; v: boolean }[] = [];
  m.sheets.forEach(([r, c]) => {
    const p = at(r, c);
    if (on.has(`${r}-${c + 1}`)) joins.push({ x: p.x + cell, y: p.y + (cell * RATIO) / 2, v: true });
    if (on.has(`${r + 1}-${c}`)) joins.push({ x: p.x + cell / 2, y: p.y + cell * RATIO, v: false });
  });
  return (
    <div className="relative h-full overflow-hidden rounded-[26px] bg-[#12131c]/[.045] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85)]">
      <div key={run} className="absolute left-1/2" style={{ top: 18 + H / 2 }}>
        {m.sheets.map(([r, c], i) => {
          const p = at(r, c);
          return (
            <motion.div key={`${r}-${c}`} className="absolute" style={{ left: p.x, top: p.y, zIndex: 10 + i }}
              initial={still ? false : { x: -p.x - cell / 2 + (i % 2 ? 8 : -8), y: gh / 2 + 60 - p.y, rotate: i % 2 ? 6 : -5, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.28, type: "spring", stiffness: 150, damping: 20 }}>
              <Sheet rc={[r, c]} cell={cell} m={m} style={{ position: "relative" }} />
              {/* the order to tape them, on a solid badge (nothing shows through it) */}
              <motion.span className="absolute left-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-[6px] bg-[#e9e7e2] px-1 text-[11px] font-medium tabular-nums text-[#12131c]/75 shadow-[inset_0_1px_2px_rgb(18_19_28/.18),0_1px_0_rgb(255_255_255/.9)]"
                animate={{ opacity: taped ? 0 : 1 }} transition={{ duration: 0.4 }}>{i + 1}</motion.span>
            </motion.div>
          );
        })}
        {joins.map((j, i) => (
          <motion.span key={i} className="absolute z-50 rounded-[2px] bg-white/70 shadow-[0_1px_2px_rgb(18_19_28/.18)] backdrop-blur-[1px]"
            style={{ left: j.x, top: j.y, width: j.v ? 10 : 30, height: j.v ? 30 : 10, translate: "-50% -50%", rotate: `${(i % 3) - 1}deg` }}
            initial={false} animate={{ opacity: taped ? 1 : 0, scale: taped ? 1 : 0.6 }} transition={{ delay: taped ? i * 0.05 : 0, duration: 0.3 }} />
        ))}
      </div>
      {/* Show me again, inside the slide, under the sheets */}
      <button onClick={onAgain} className={cx("absolute bottom-3.5 left-1/2 z-[60] flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-[#12131c]/70", raised)}>
        <Icon name="refresh" size={14} />Show me again
      </button>
    </div>
  );
}

// ─── slide 2: the fabric to buy, on the night (the landing page's loading night, its lights drifting). The metres in
// Bigilla, large; a switch pressed into the night for the fabric's width, its knob raised, the metres changing with it;
// what else you need; and the three guides as raised tiles (Body ready's version A) ───
function Fabric({ m }: { m: ReturnType<typeof useMade> }) {
  const widths = [115, 140, 150];
  const [w, setW] = useState(140);
  const still = useReducedMotion();
  const guides: [IconName, string, string][] = [["book", "Sewing guide", `for this ${m.kind}`], ["layers", "Sewing words", "explained"], ["video", "Video", "taping the sheets"]];
  const at = widths.indexOf(w), seg = 64;
  return (
    <div className="relative h-full overflow-hidden rounded-[26px] text-white [clip-path:inset(0_round_26px)]">
      <div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
      <div className="relative flex h-full flex-col px-5 pb-4 pt-5">
        <div className="text-[14px] text-white/60">Fabric to buy</div>
        <div className="mt-1 flex items-baseline gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={w} className="serif text-[56px] leading-none" initial={still ? false : { y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }}>{m.metres(w)}</motion.span>
          </AnimatePresence>
          <span className="text-[17px] text-white/80">metres</span>
        </div>
        <div className="mt-1 text-[14px] text-white/60">{m.stretch === "A lot" ? "A stretchy fabric" : m.stretch === "No" ? "With no stretch" : "With a little stretch"}, {w} cm wide</div>
        {/* the width: a track pressed into the night, a raised knob that slides to the width chosen */}
        <div className="ruler-track relative mt-3 flex h-10 rounded-full p-[5px]" role="radiogroup" aria-label="Fabric width" style={{ width: seg * 3 + 10 }}>
          <motion.span className="knob absolute top-[5px] h-[30px] rounded-full" style={{ width: seg }} initial={false} animate={{ left: 5 + at * seg }} transition={still ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }} aria-hidden />
          {widths.map((x) => (
            <button key={x} role="radio" aria-checked={w === x} onClick={() => setW(x)} className={cx("relative z-10 h-[30px] text-[13px] font-medium transition-colors", w === x ? "text-white" : "text-white/50")} style={{ width: seg }}>{x} cm</button>
          ))}
        </div>
        <div className="mt-4 text-[13px] text-white/55">You will also need</div>
        <ul className="mt-1 space-y-0.5 text-[14px] leading-snug text-white/90">{m.extras.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/50" />{t}</li>)}</ul>
        <div className="flex-1" />
        <div className="grid grid-cols-3 gap-2">{guides.map(([ic, t, d]) => (
          <button key={t} className={cx("flex flex-col items-center gap-1 rounded-[18px] px-1.5 py-2.5 text-center text-[#12131c]", raised)}>
            <Icon name={ic} size={18} className="text-[#3c4b63]" /><span className="text-[13px] leading-tight">{t}<span className="block text-[11.5px] text-[#12131c]/50">{d}</span></span>
          </button>
        ))}</div>
      </div>
    </div>
  );
}

function Complete() {
  const m = useMade();
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0); // where the carousel is, in slides
  const [run, setRun] = useState(0);
  const [taped, setTaped] = useState(false);
  const touched = useRef(false), self = useRef(false);
  const step = () => (ref.current ? ref.current.clientWidth - 48 + GAP : 1); // a slide and the gap after it
  const go = (i: number) => { self.current = true; setTimeout(() => { self.current = false; }, 900); ref.current?.scrollTo({ left: i * step(), behavior: still ? "auto" : "smooth" }); };
  // the tape goes on once every sheet is down; a moment later the carousel moves on to the fabric, unless it was touched
  const total = 0.2 + m.sheets.length * 0.28 + 0.4;
  useEffect(() => {
    const t = setTimeout(() => setTaped(true), still ? 0 : total * 1000);
    return () => clearTimeout(t);
  }, [run, still, total]);
  useEffect(() => {
    if (!taped || touched.current) return;
    const t = setTimeout(() => { if (!touched.current) go(1); }, AFTER);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taped]);
  const again = () => { touched.current = true; setTaped(false); setRun((x) => x + 1); };
  const fc = Math.min(1, Math.max(0, f)), i = Math.floor(fc), t = fc - i;
  const front = i + ease(clamp(t * 2)), back = i + ease(clamp(t * 2 - 1));
  return (
    <Page>
      <div className="mt-2 text-center"><Printed n={m.sheets.length} /></div>
      <div className="min-h-3 flex-1" />
      {/* two slides, dragged or moved on by themselves; each the column's width (the row's width less its 24px start
          padding, which the width is measured within, less the end's 24px), the last ending on the page's padding */}
      <div ref={ref} onScroll={(e) => { setF(e.currentTarget.scrollLeft / step()); if (!self.current) touched.current = true; }}
        onPointerDown={() => { touched.current = true; }} onWheel={() => { touched.current = true; }}
        className="-mx-6 flex shrink-0 snap-x snap-mandatory gap-3 overflow-x-auto pl-6 noscroll" style={{ scrollPaddingLeft: 24 }}>
        <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}><TapeTable m={m} run={run} taped={taped} onAgain={again} /></div>
        <div className="shrink-0 snap-start" style={{ height: SLIDE_H, width: "calc(100% - 24px)" }}><Fabric m={m} /></div>
        <span className="w-3 shrink-0" aria-hidden />
      </div>
      {/* the pager: a knob in a track pressed into the paper, following the drag */}
      <div className="relative mx-auto mt-3 shrink-0 rounded-full bg-[#12131c]/[.07] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)]"
        style={{ width: SEG * 2, height: KH + 2 * CH }} role="tablist" aria-label="Slides">
        <span className="pill-white absolute rounded-full" aria-hidden style={{ background: "#f3f1ec", left: CH + back * SEG, top: CH, width: SEG - 2 * CH + (front - back) * SEG, height: KH }} />
        {["Tape it together", "Fabric to buy"].map((s, n) => (
          <button key={s} role="tab" aria-selected={Math.round(fc) === n} aria-label={s} onClick={() => { touched.current = true; go(n); }} className="absolute top-0 h-full" style={{ left: n * SEG, width: SEG }} />
        ))}
      </div>
      <div className="min-h-3 flex-1" />
      <Title line={<>Now you can start making your {m.kind}.</>}>Your pattern is complete</Title>
      <div className="min-h-2 flex-1" />
    </Page>
  );
}

export function PrintedLab3() {
  const [k, setK] = useState(0);
  return (
    <section>
      <h2 className="h1 !text-[34px]">Your pattern is complete, round 3</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">From round 2&apos;s C (Tape it together), with your notes: the printed label pressed in at the top; a carousel you can drag, the taping first (solid number badges, Show me again inside it), then the fabric to buy on the night with the metres for each width, what else you need and the three guides; the pager from Add to home screen under it.</p>
      <button onClick={() => setK((x) => x + 1)} className="mt-4 h-10 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/75 hover:text-white">Start again</button>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        <Phone label="Round 3"><Complete key={k} /></Phone>
        <Phone label="Today"><Today /></Phone>
      </div>
    </section>
  );
}
