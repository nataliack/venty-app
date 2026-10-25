"use client";
// Lab · Natalia's cards on her profile (25 Oct 2026, round 2 from Jose's notes). Her two approved cards (Venty's, and
// her own) on the About page, three ways:
//   Deck    the two cards stacked, the one behind peeking over the top at full size; tap it (or switch) and they trade
//           places, the one behind lifting over the top and coming down in front
//   Fan     the three colourways of one card in a ring, the pick in the middle; tap a side one to bring it forward;
//           switching cards drops one ring and raises the other
//   Sleeve  the card tucked in a pocket; pull it up to take it out; put it back, or switch, and it slides home
// Cards are drawn in layers (see Card's layer), so the one in front never cuts into the one behind as it turns.
// Under each, the same controls, in the app's raised and pressed style: the card switch (the Venty wordmark and her
// nck, no labels), the colourways as swatches, turn it over, and save it (a picture of both faces, or her details as a
// contact). A new colourway comes in with one full turn of the card, swapped while it is edge on.
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LOGO } from "@/components/art";
import { cx } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CardStage, FlatFace, LiveCard, drawFlat, loadFonts, prefetchCard, SIZES, type El, type Pose, type Stock } from "./BusinessCard";
import { FAVOURITES, type Family } from "./designs";
import { NCK } from "./brand";

const FAMS: Family[] = ["venty", "natalia"];
type Card = { els: El[]; stock: Stock };
// every approved card, made once; and its flat version (for pictures)
const ALL = Object.fromEntries(FAMS.map((f) => [f, Object.fromEntries(FAVOURITES[f].ways.map((w) => [w.id, FAVOURITES[f].make(w.id)]))])) as Record<Family, Record<string, Card>>;
const FLAT = (f: Family, w: string): Card => FAVOURITES[f].make(w, true);
const FIRST: Record<Family, string> = { venty: FAVOURITES.venty.ways[0].id, natalia: FAVOURITES.natalia.ways[0].id };
// make the first colourway of each card ahead, then the rest, so a pick is ready when it is made
function usePrefetch() {
  useEffect(() => {
    for (const f of FAMS) prefetchCard(ALL[f][FIRST[f]].els, ALL[f][FIRST[f]].stock);
    for (const f of FAMS) for (const w of FAVOURITES[f].ways) prefetchCard(ALL[f][w.id].els, ALL[f][w.id].stock);
  }, []);
}

// ─── saving ───
const VCARD: Record<Family, { title: string; org?: string; url: string; file: string }> = {
  venty: { title: "Founder", org: "Venty", url: "https://app.venty.au", file: "Natalia Chamon, Venty card" },
  natalia: { title: "UI/UX design and front-end", url: "https://nataliachamon.com", file: "Natalia Chamon, card" },
};
function vcard(f: Family) {
  const v = VCARD[f];
  return ["BEGIN:VCARD", "VERSION:3.0", "N:Chamon;Natalia;;;", "FN:Natalia Chamon", `TITLE:${v.title}`, ...(v.org ? [`ORG:${v.org}`] : []),
    "TEL;TYPE=CELL:+61 420 991 942", "EMAIL;TYPE=INTERNET:natalia.chamom@gmail.com", `URL:${v.url}`, "ADR;TYPE=WORK:;;;Brisbane;QLD;;Australia", "END:VCARD"].join("\r\n");
}
// both faces, front over back, at print size (24 px per mm), on a clear background
async function cardPicture(c: Card): Promise<Blob> {
  const fonts = await loadFonts(), px = 24, S = SIZES[c.stock.size];
  const W = Math.round(S.w * px), H = Math.round(S.h * px), gap = Math.round(H * 0.08);
  const out = document.createElement("canvas"); out.width = W; out.height = H * 2 + gap;
  const ctx = out.getContext("2d")!;
  for (const [i, face] of (["front", "back"] as const).entries()) {
    const f = document.createElement("canvas"); drawFlat(f, c.els, c.stock, face, px, fonts);
    ctx.save(); ctx.beginPath(); ctx.roundRect(0, i * (H + gap), W, H, c.stock.corner * px); ctx.clip(); ctx.drawImage(f, 0, i * (H + gap)); ctx.restore();
  }
  return new Promise((res) => out.toBlob((b) => res(b!), "image/png"));
}
// the share sheet where there is one (a phone: Save Image, Save to Files, Contacts), a download where there isn't
async function hand(file: File): Promise<string> {
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: file.name }); return "Done"; } catch { return ""; }
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return "Saved to your downloads";
}

function SaveSheet({ fam, way, onClose }: { fam: Family; way: string; onClose: () => void }) {
  const [card] = useState(() => FLAT(fam, way));
  const [pic, setPic] = useState<File | null>(null);
  const [note, setNote] = useState("");
  // the picture is made as the sheet opens, so the share sheet can open the moment it is tapped
  useEffect(() => { let live = true; cardPicture(card).then((b) => { if (live) setPic(new File([b], `${VCARD[fam].file}.png`, { type: "image/png" })); }); return () => { live = false; }; }, [card, fam]);
  const rows: { icon: "image" | "user"; title: string; line: string; go: () => Promise<string> }[] = [
    { icon: "image", title: "Save the picture", line: "Both faces, to Photos or Files", go: async () => (pic ? hand(pic) : "") },
    { icon: "user", title: "Add to contacts", line: "Name, phone, email, website and city", go: () => hand(new File([vcard(fam)], "Natalia Chamon.vcf", { type: "text/vcard" })) },
  ];
  return (
    <>
      <motion.div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute inset-x-0 bottom-0 z-50 rounded-t-[34px] bg-[#1b1c26] px-5 pb-8 pt-3 text-white shadow-[inset_0_1px_0_rgb(255_255_255/.12)]"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.12, duration: 0.5 }}>
        <div className="mx-auto h-[5px] w-12 rounded-full bg-white/15" />
        <h3 className="mt-5 text-[22px] font-normal tracking-[-.02em]">Save her card</h3>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <FlatFace els={card.els} stock={card.stock} face="front" px={3.4} className="w-full rounded-[3px] shadow-[0_0_0_1px_rgb(255_255_255/.1),0_10px_24px_-12px_rgb(0_0_0/.9)]" />
          <FlatFace els={card.els} stock={card.stock} face="back" px={3.4} className="w-full rounded-[3px] shadow-[0_0_0_1px_rgb(255_255_255/.1),0_10px_24px_-12px_rgb(0_0_0/.9)]" />
        </div>
        <div className="mt-5 space-y-2.5">
          {rows.map((r) => (
            <button key={r.title} type="button" onClick={async () => setNote(await r.go())} className="pill-dark flex w-full items-center gap-3.5 rounded-[20px] px-4 py-3.5 text-left">
              <span className="iconbadge grid h-10 w-10 shrink-0 place-items-center rounded-[12px]"><Icon name={r.icon} size={19} /></span>
              <span className="min-w-0 flex-1"><span className="block text-[15px]">{r.title}</span><span className="block text-[13px] text-white/50">{r.line}</span></span>
            </button>
          ))}
        </div>
        <p className="mt-3 h-5 text-center text-[13px] text-white/50" aria-live="polite">{note}</p>
      </motion.div>
    </>
  );
}

// ─── the controls under every version ───
// the switch: an inset track (the app's pressed-in tiles) with a raised snow thumb (the app's white secondary); the
// two cards are told apart by their marks, the Venty wordmark and her nck
const WordVenty = ({ h }: { h: number }) => <svg viewBox="0 666 2133 1120" height={h} fill="currentColor" aria-hidden>{LOGO.slice(0, 4).map((d, i) => <path key={i} d={d} />)}</svg>;
const WordNck = ({ h }: { h: number }) => <svg viewBox="0 0 247 129" height={h} fill="currentColor" aria-hidden><path d={NCK[0]} fillRule="evenodd" /></svg>;
const inset = "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .06), 0 1px 0 rgb(255 255 255 / .07)";
const raisedSnow = "inset 0 0 0 1px rgb(19 21 35 / .06), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(19 21 35 / .1), inset 0 0 12px 1px rgb(255 255 255 / .75), 0 1px 2px rgb(0 0 0 / .35), 0 6px 14px -6px rgb(0 0 0 / .6)";
function CardSwitch({ fam, setFam }: { fam: Family; setFam: (f: Family) => void }) {
  return (
    <div className="flex h-12 rounded-full p-1" style={{ background: "rgb(0 0 0 / .26)", boxShadow: inset }}>
      {FAMS.map((f) => (
        <button key={f} type="button" onClick={() => setFam(f)} aria-pressed={fam === f} aria-label={f === "venty" ? "Venty card" : "Her own card"} className="relative grid flex-1 place-items-center rounded-full">
          {fam === f && <motion.span layoutId="card-switch" className="absolute inset-0 rounded-full bg-snow" style={{ boxShadow: raisedSnow }} transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
          <span className={cx("relative transition-colors duration-300", fam === f ? "text-ink" : "text-white/50")}>{f === "venty" ? <WordVenty h={15} /> : <WordNck h={17} />}</span>
        </button>
      ))}
    </div>
  );
}
// a swatch per colourway: its paper as the eye sees it on the 3D card (Venty's with a hint of the glow), raised like the
// app's buttons; the pick is pressed in and ringed
const SWATCH: Record<Family, Record<string, string>> = {
  venty: {
    dark: "radial-gradient(130% 80% at 65% 115%, rgb(104 126 245 / .95), rgb(104 126 245 / .25) 45%, transparent 75%), #15161f",
    white: "radial-gradient(130% 80% at 65% 115%, rgb(140 156 248 / .8), rgb(140 156 248 / .2) 45%, transparent 75%), #f0f4fe",
    purple: "radial-gradient(130% 80% at 65% 115%, rgb(230 234 255 / .9), rgb(230 234 255 / .25) 45%, transparent 75%), #687ef5",
  },
  natalia: { green: "#202a22", brown: "#17130e", cream: "#fff7e2" },
};
function Swatches({ fam, way, setWay }: { fam: Family; way: string; setWay: (w: string) => void }) {
  return (
    <div className="flex justify-center gap-6">
      {FAVOURITES[fam].ways.map((w) => {
        const on = way === w.id;
        return (
          <button key={w.id} type="button" onClick={() => setWay(w.id)} aria-pressed={on} aria-label={`${w.name} colourway`} className="flex flex-col items-center gap-2">
            <motion.span animate={{ scale: on ? 0.94 : 1 }} transition={{ type: "spring", bounce: 0.3, duration: 0.35 }} className="block h-11 w-11 rounded-full"
              style={{ background: SWATCH[fam][w.id], boxShadow: on
                ? "inset 0 2px 5px rgb(0 0 0 / .45), inset 0 0 0 1px rgb(255 255 255 / .14), 0 0 0 3px #0b0c15, 0 0 0 4.5px rgb(255 255 255 / .92)"
                : "inset 0 0 0 1px rgb(255 255 255 / .14), inset 0 1px 0 rgb(255 255 255 / .35), inset 0 -1px 0 rgb(0 0 0 / .3), 0 2px 4px rgb(0 0 0 / .45), 0 8px 16px -8px rgb(0 0 0 / .7)" }} />
            <span className={cx("text-[12.5px] transition-colors", on ? "text-white" : "text-white/45")}>{w.name}</span>
          </button>
        );
      })}
    </div>
  );
}
function Controls({ fam, setFam, way, setWay, extra, onSave }: { fam: Family; setFam: (f: Family) => void; way: string; setWay: (w: string) => void; extra: ReactNode; onSave: () => void }) {
  return (
    <div className="px-5 pb-7">
      <CardSwitch fam={fam} setFam={setFam} />
      <div className="mt-5"><Swatches fam={fam} way={way} setWay={setWay} /></div>
      <div className="mt-5 flex gap-2.5">
        {extra}
        <button type="button" onClick={onSave} className="pill pill-primary h-12 flex-1 text-[15px]"><Icon name="download" size={18} />Save card</button>
      </div>
    </div>
  );
}
const sec = "pill pill-dark h-12 px-4 text-[15px]";
const turnBtn = (on: () => void) => <button type="button" onClick={on} className={cx(sec, "w-12 !px-0")} aria-label="Turn it over"><Icon name="rotate" size={18} /></button>;

// the screen: the About page's section on her
function Screen({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-1.5 px-4 pt-[52px] text-white/60"><Icon name="back" size={20} /><span className="text-[15px]">About Venty</span></div>
      <h2 className="h1 mt-8 px-5 !text-[30px] text-white">{title}</h2>
      {children}
    </div>
  );
}

// ─── Deck ───
// the one behind sits just behind and a little higher, at nearly full size (layers keep the two apart)
const FRONT: Pose = { y: -0.16 }, BEHIND: Pose = { x: 0.08, y: 0.42, z: -0.05, rz: -0.045, s: 0.96 }, OVER: Pose = { y: 2.25, z: 0.05, s: 0.97 }, UNDER: Pose = { y: -0.32, z: -0.05, s: 0.96 };
function Deck() {
  usePrefetch();
  const [fam, setFam] = useState<Family>("venty");
  const [way, setWay] = useState(FIRST);
  const [flip, setFlip] = useState({ venty: 0, natalia: 0 });
  const [step, setStep] = useState<"" | "over">("");
  const [save, setSave] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  // trading places: the one behind lifts over the top while the front one sinks back, then it comes down in front
  // (the old front card stays the top layer until the new one is above it)
  const swap = (f: Family) => { if (f === fam) return; setFam(f); setStep("over"); clearTimeout(t.current); t.current = setTimeout(() => setStep(""), 340); };
  const pose = (f: Family): Pose => (f === fam ? (step === "over" ? OVER : FRONT) : step === "over" ? UNDER : BEHIND);
  const top = (f: Family) => (step === "over" ? f !== fam : f === fam);
  return (
    <Screen title="Her cards">
      <CardStage dist={0.9} className="relative mt-2 min-h-0 flex-1">
        {FAMS.map((f) => <LiveCard key={f} {...ALL[f][way[f]]} pose={pose(f)} layer={top(f) ? 1 : 0} spin interactive={f === fam} flip={flip[f]} onTap={f !== fam ? () => swap(f) : undefined} />)}
      </CardStage>
      <Controls fam={fam} setFam={swap} way={way[fam]} setWay={(w) => setWay((x) => ({ ...x, [fam]: w }))} onSave={() => setSave(true)}
        extra={turnBtn(() => setFlip((x) => ({ ...x, [fam]: x[fam] + 1 })))} />
      <AnimatePresence>{save && <SaveSheet fam={fam} way={way[fam]} onClose={() => setSave(false)} />}</AnimatePresence>
    </Screen>
  );
}

// ─── Fan ───
function Fan() {
  usePrefetch();
  const [fam, setFam] = useState<Family>("venty");
  const [leaving, setLeaving] = useState<Family | null>(null);
  const [way, setWay] = useState(FIRST);
  const [flip, setFlip] = useState(0);
  const [save, setSave] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  // switching: this ring drops away and the other rises
  const go = (f: Family) => { if (f === fam) return; setLeaving(fam); setFam(f); clearTimeout(t.current); t.current = setTimeout(() => setLeaving(null), 700); };
  const hands = leaving ? [leaving, fam] : [fam];
  return (
    <Screen title="Her cards">
      <CardStage dist={0.95} className="relative mt-2 min-h-0 flex-1">
        {hands.map((f) => {
          const ways = FAVOURITES[f].ways, sel = ways.findIndex((w) => w.id === way[f]);
          return ways.map((w, i) => {
            const n = ways.length, off = ((i - sel + 1 + n) % n) - 1, gone = f === leaving; // a ring: the pick in the middle, one either side
            const pose: Pose = gone ? { x: off * 0.8, y: -4.2, rz: -off * 0.2, s: 0.8 } : { x: off * 1.02, y: off === 0 ? 0.08 : -0.12, z: off === 0 ? 0 : -0.05, rz: -off * 0.11, s: off === 0 ? 1 : 0.88 };
            return <LiveCard key={`${f}-${w.id}`} {...ALL[f][w.id]} pose={pose} enter={{ y: -4.2, x: off * 0.8 }} layer={!gone && off === 0 ? 1 : 0} interactive={!gone && off === 0} flip={off === 0 ? flip : 0} onTap={!gone && off !== 0 ? () => setWay((x) => ({ ...x, [f]: w.id })) : undefined} />;
          });
        })}
      </CardStage>
      <Controls fam={fam} setFam={go} way={way[fam]} setWay={(w) => setWay((x) => ({ ...x, [fam]: w }))} onSave={() => setSave(true)} extra={turnBtn(() => setFlip((x) => x + 1))} />
      <AnimatePresence>{save && <SaveSheet fam={fam} way={way[fam]} onClose={() => setSave(false)} />}</AnimatePresence>
    </Screen>
  );
}

// ─── Sleeve ───
// the stage's height in scene units, worked out the way the camera frames it (CardStage's Lens), so the card can be
// placed against the sleeve, which is HTML laid over the stage
const SLEEVE = 0.5, DIST = 0.9;
function useWorldHeight(ref: React.RefObject<HTMLDivElement | null>) {
  const [hw, setHw] = useState(4.6);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => { const a = el.clientWidth / Math.max(1, el.clientHeight), tan = Math.tan((15 * Math.PI) / 180); const d = Math.max(5.2, 3.9 / (2 * tan * a)) * DIST; setHw(2 * d * tan); };
    const ro = new ResizeObserver(fit); ro.observe(el); fit(); return () => ro.disconnect();
  }, [ref]);
  return hw;
}
function Sleeve() {
  usePrefetch();
  const [fam, setFam] = useState<Family>("venty");
  const [way, setWay] = useState(FIRST);
  const [out, setOut] = useState(false);
  const [pull, setPull] = useState(0); // how far it is being pulled, 0–1
  const [flip, setFlip] = useState(0);
  const [save, setSave] = useState(false);
  const drag = useRef<{ y: number; h: number } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (ms: number, f: () => void) => { t.current.push(setTimeout(f, ms)); };
  // switching: the card slides home, the other comes up out of the same sleeve
  const go = (f: Family) => {
    if (f === fam) return;
    t.current.forEach(clearTimeout); t.current = [];
    const was = out; setOut(false);
    later(was ? 380 : 0, () => setFam(f));
    if (was) later(820, () => setOut(true));
  };
  const box = useRef<HTMLDivElement>(null), hw = useWorldHeight(box);
  const cardH = (55 / 30) * 0.96, lip = -hw / 2 + SLEEVE * hw; // the sleeve's top edge
  const tucked = lip + 0.42 * cardH - cardH / 2; // two fifths of the card above it
  const y = out ? 0.1 : tucked + pull * cardH * 0.6;
  return (
    <Screen title="Her cards">
      <div ref={box} className="relative mt-2 min-h-0 flex-1"
        onPointerDown={(e) => { if (out) return; drag.current = { y: e.clientY, h: e.currentTarget.clientHeight }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { const d = drag.current; if (d) setPull(Math.max(0, Math.min(1, (d.y - e.clientY) / (d.h * 0.45)))); }}
        onPointerUp={() => { if (!drag.current) return; drag.current = null; if (pull > 0.3) setOut(true); setPull(0); }}
        onPointerCancel={() => { drag.current = null; setPull(0); }}>
        <CardStage dist={DIST} touch={out ? "pan-y" : "none"} className="absolute inset-0">
          <LiveCard key={fam} {...ALL[fam][way[fam]]} pose={{ y, s: out ? 1 : 0.96 }} enter={{ y: -2.6, s: 0.96 }} spin interactive={out} flip={flip} />
        </CardStage>
        {/* the sleeve: a soft pocket over the lower half, raised like the app's dark secondary (a light rim along its
            top, an inner glow); it slips away once the card is out */}
        <motion.div className="pointer-events-none absolute inset-x-2 bottom-0 rounded-t-[30px]" animate={{ y: out ? "105%" : "0%", opacity: out ? 0 : 1 }} transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
          style={{ height: `${SLEEVE * 100}%`, background: "linear-gradient(180deg, rgb(255 255 255 / .07), rgb(255 255 255 / 0) 45%) #1b1c26", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / .1), inset 0 1px 0 rgb(255 255 255 / .22), inset 0 0 18px 1px rgb(255 255 255 / .04), 0 -18px 40px -14px rgb(0 0 0 / .95)" }}>
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white/45">
            <span className="h-[5px] w-12 rounded-full" style={{ background: "rgb(0 0 0 / .3)", boxShadow: "inset 0 1px 2px rgb(0 0 0 / .6), 0 1px 0 rgb(255 255 255 / .08)" }} />
            <span className="text-[14px]">Pull her card out</span>
          </div>
        </motion.div>
      </div>
      <Controls fam={fam} setFam={go} way={way[fam]} setWay={(w) => setWay((x) => ({ ...x, [fam]: w }))} onSave={() => setSave(true)}
        extra={out
          ? <>{turnBtn(() => setFlip((x) => x + 1))}<button type="button" onClick={() => setOut(false)} className={sec}>Put away</button></>
          : <button type="button" onClick={() => setOut(true)} className={sec}>Take it out</button>} />
      <AnimatePresence>{save && <SaveSheet fam={fam} way={way[fam]} onClose={() => setSave(false)} />}</AnimatePresence>
    </Screen>
  );
}

// ─── the lab section ───
const WAYS = [
  { k: "deck", name: "Deck", note: "Both cards stacked, the one behind peeking over the top at full size. Tap it, or switch, and they trade places: it lifts over the top and comes down in front. Drag the front card to turn it; it never cuts into the one behind." },
  { k: "fan", name: "Fan", note: "The three colourways of a card in a ring, the pick in the middle. Tap a side one to bring it forward; switching drops this ring and raises the other. Drag the middle card to turn it." },
  { k: "sleeve", name: "Sleeve", note: "The card tucked in a soft pocket. Pull it up (or tap Take it out) and the pocket slips away; switching slides it home and brings the other up." },
] as const;
export function ProfileCards() {
  const [k, setK] = useState<(typeof WAYS)[number]["k"]>("deck");
  const w = WAYS.find((x) => x.k === k)!;
  return (
    <section>
      <h2 className="h1 !text-[34px]">On her profile</h2>
      <p className="mt-2 max-w-[640px] text-[15px] leading-snug text-white/55">Her two cards on the About page, three ways. Under each: the card switch, its colourways as swatches, turn it over, and save it (a picture of both faces to Photos or Files, or her details to Contacts). A new colourway comes in with a full turn of the card, swapped while it is edge on.</p>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="max-w-[520px]">
          <div className="flex flex-wrap gap-2">{WAYS.map((x) => (
            <button key={x.k} type="button" onClick={() => setK(x.k)} aria-pressed={k === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", k === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
          ))}</div>
          <p className="mt-4 text-[15px] leading-snug text-white/65">{w.note}</p>
          <p className="mt-6 text-[13.5px] leading-snug text-white/40">Saving opens the phone&apos;s share sheet (Save Image, Save to Files, Contacts); on a computer it downloads. The picture is the flat card, with Venty&apos;s dark paper in the app&apos;s card colour so it reads as it does in 3D. An Apple Wallet pass would need a signed pass from a server, so it is left for when Venty has one.</p>
        </div>
        <div className="relative isolate h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
          {k === "deck" ? <Deck /> : k === "fan" ? <Fan /> : <Sleeve />}
        </div>
      </div>
    </section>
  );
}
