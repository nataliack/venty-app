"use client";
// Lab · Natalia's business cards on her profile (25 Oct 2026, round 3 from Jose's notes). One screen, top to bottom:
// the app's back button and a centred title; the two cards by name (Venty, Natalia); the cards; their colourways as
// swatches; the actions (turn it over, save it). Over the foot of the cards, a view picker (like a camera's modes):
//   Card        the card on its own, to turn in your hand
//   Stack       both cards, the other peeking over the top; pick one and they trade places
//   Colours     the card's three colourways at once, cascaded; tap one to bring it forward (the swatches rest here)
//   Both sides  the front and the back together
//   Showcase    the card drifts and tilts on its own, turns right round now and then, and a light sweeps across it
// Cards move between views (the one you are holding goes to its new place); new ones arrive from below with a turn,
// old ones drop away. The background is the landing page's night sky (its slow glows along the bottom).
// Loading: nothing is shown half made. The 3D body's loader ring shows until every card the view needs is made (they
// are made in slices in the background, the first colourway of each card first, then the rest); then the cards come
// in. A colour picked before its card is made: the card waits, a small ring shows, and it turns to the new colour as
// soon as it is ready. (For the app, see the note in the lab: bake the maps at build time.)
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cx, RB } from "@/components/ui";
import { Icon } from "@/components/icons";
import { BodyLoader } from "@/components/BodyLoader";
import { CardStage, FlatFace, LiveCard, Sweep, drawFlat, loadFonts, prefetchCard, useCardsReady, SIZES, type El, type Pose, type Stock } from "./BusinessCard";
import { FAVOURITES, type Family } from "./designs";

const FAMS: Family[] = ["venty", "natalia"];
const NAME: Record<Family, string> = { venty: "Venty", natalia: "Natalia" };
type Card = { els: El[]; stock: Stock };
// every approved card, made once; and its flat version (for pictures)
const ALL = Object.fromEntries(FAMS.map((f) => [f, Object.fromEntries(FAVOURITES[f].ways.map((w) => [w.id, FAVOURITES[f].make(w.id)]))])) as Record<Family, Record<string, Card>>;
const FLAT = (f: Family, w: string): Card => FAVOURITES[f].make(w, true);
const FIRST: Record<Family, string> = { venty: FAVOURITES.venty.ways[0].id, natalia: FAVOURITES.natalia.ways[0].id };

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
        <h3 className="mt-5 text-[22px] font-normal tracking-[-.02em]">Save the card</h3>
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

// ─── the controls ───
// the two cards by name: an inset track (the app's pressed-in tiles) with a raised snow thumb (the white secondary)
const inset = "inset 0 3px 7px rgb(0 0 0 / .65), inset 0 1px 1.5px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .06), 0 1px 0 rgb(255 255 255 / .07)";
const raisedSnow = "inset 0 0 0 1px rgb(19 21 35 / .06), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(19 21 35 / .1), inset 0 0 12px 1px rgb(255 255 255 / .75), 0 1px 2px rgb(0 0 0 / .35), 0 6px 14px -6px rgb(0 0 0 / .6)";
function Tabs({ fam, setFam }: { fam: Family; setFam: (f: Family) => void }) {
  return (
    <div className="flex h-11 rounded-full p-1" style={{ background: "rgb(0 0 0 / .26)", boxShadow: inset }}>
      {FAMS.map((f) => (
        <button key={f} type="button" onClick={() => setFam(f)} aria-pressed={fam === f} className="relative flex-1 rounded-full text-[15px] font-medium">
          {fam === f && <motion.span layoutId="card-tabs" className="absolute inset-0 rounded-full bg-snow" style={{ boxShadow: raisedSnow }} transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
          <span className={cx("relative transition-colors duration-300", fam === f ? "text-ink" : "text-white/55")}>{NAME[f]}</span>
        </button>
      ))}
    </div>
  );
}
// a swatch per colourway: its paper as the eye sees it on the 3D card (Venty's with a hint of the glow), raised like the
// app's buttons; the pick is pressed in and ringed. In Colours they rest (every colourway is on screen already)
const SWATCH: Record<Family, Record<string, string>> = {
  venty: {
    dark: "radial-gradient(130% 80% at 65% 115%, rgb(104 126 245 / .95), rgb(104 126 245 / .25) 45%, transparent 75%), #15161f",
    white: "radial-gradient(130% 80% at 65% 115%, rgb(140 156 248 / .8), rgb(140 156 248 / .2) 45%, transparent 75%), #f0f4fe",
    purple: "radial-gradient(130% 80% at 65% 115%, rgb(230 234 255 / .9), rgb(230 234 255 / .25) 45%, transparent 75%), #687ef5",
  },
  natalia: { green: "#202a22", brown: "#17130e", cream: "#fff7e2" },
};
function Swatches({ fam, way, setWay, rest }: { fam: Family; way: string; setWay: (w: string) => void; rest: boolean }) {
  return (
    <div className={cx("flex justify-center gap-6 transition-opacity duration-300", rest && "pointer-events-none opacity-30")} aria-disabled={rest}>
      {FAVOURITES[fam].ways.map((w) => {
        const on = way === w.id && !rest;
        return (
          <button key={w.id} type="button" onClick={() => setWay(w.id)} aria-pressed={on} aria-label={`${w.name} colourway`} tabIndex={rest ? -1 : 0} className="flex flex-col items-center gap-2">
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
type View = "card" | "stack" | "colours" | "sides" | "show";
const VIEWS: { k: View; name: string }[] = [{ k: "card", name: "Card" }, { k: "stack", name: "Stack" }, { k: "colours", name: "Colours" }, { k: "sides", name: "Both sides" }, { k: "show", name: "Showcase" }];
// the view picker, like a camera's modes: words in a row over the foot of the cards, the one in use bright with a dot
function Views({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="flex justify-center gap-[18px]">
      {VIEWS.map((v) => (
        <button key={v.k} type="button" onClick={() => setView(v.k)} aria-pressed={view === v.k} className="relative pb-2.5 text-[13px] font-medium">
          <span className={cx("transition-colors duration-300", view === v.k ? "text-white" : "text-white/40 hover:text-white/70")}>{v.name}</span>
          {view === v.k && <motion.span layoutId="view-dot" className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-peri" transition={{ type: "spring", bounce: 0.25, duration: 0.4 }} />}
        </button>
      ))}
    </div>
  );
}

// ─── what is on the stage in each view ───
type Slot = { key: string; fam: Family; way: string; pose: Pose; layer: number; interactive?: boolean; spin?: boolean; flip?: number; startBack?: boolean; show?: boolean; onTap?: () => void };
const OUT: Pose = { y: -3.6, s: 0.85 }; // where cards arrive from and drop away to
// Stack: the one behind sits just behind and a little higher, at nearly full size (layers keep the two apart)
const FRONT: Pose = { y: -0.16 }, BEHIND: Pose = { x: 0.08, y: 0.42, z: -0.05, rz: -0.045, s: 0.96 }, OVER: Pose = { y: 2.25, z: 0.05, s: 0.97 }, UNDER: Pose = { y: -0.32, z: -0.05, s: 0.96 };
// Colours: a cascade, the pick in front and lowest, the others stepping up and back behind it
const CASCADE: Pose[] = [{ x: -0.34, y: 0.5, z: -0.1, rz: 0.035, s: 0.86 }, { x: -0.12, y: 0.18, z: -0.05, rz: 0.015, s: 0.9 }, { x: 0.1, y: -0.16, s: 0.94 }];
function useLeaving(items: Slot[]) {
  // cards taken off the stage stay a moment, dropping away, before they go
  const [gone, setGone] = useState<Slot[]>([]);
  const prev = useRef<Slot[]>(items);
  const keys = items.map((i) => i.key).join("|");
  useEffect(() => {
    const now = new Set(items.map((i) => i.key)), left = prev.current.filter((i) => !now.has(i.key));
    prev.current = items;
    const a = setTimeout(() => setGone((g) => [...g.filter((x) => !now.has(x.key)), ...left.map((i) => ({ ...i, pose: OUT, interactive: false, onTap: undefined, layer: 0 }))]), 0);
    const b = setTimeout(() => setGone((g) => g.filter((x) => !left.some((l) => l.key === x.key))), 650);
    return () => { clearTimeout(a); clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys]);
  return gone.filter((g) => !items.some((i) => i.key === g.key));
}

export function CardsScreen() {
  const [fam, setFam] = useState<Family>("venty");
  const [way, setWay] = useState(FIRST);
  const [view, setView] = useState<View>("card");
  const [flips, setFlips] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"" | "over">("");
  const [save, setSave] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flip = (k: string) => flips[k] ?? 0;
  const turn = (...ks: string[]) => setFlips((f) => { const n = { ...f }; for (const k of ks) n[k] = (n[k] ?? 0) + 1; return n; });
  // switching cards: in Stack they trade places over the top (the old front card stays the top layer until the new one
  // is above it); elsewhere the old card drops away and the new one arrives
  const pick = (f: Family) => { if (f === fam) return; setFam(f); if (view === "stack") { setStep("over"); clearTimeout(t.current); t.current = setTimeout(() => setStep(""), 340); } };

  // made ahead: each card's first colourway, then the rest
  useEffect(() => { for (const f of FAMS) prefetchCard(ALL[f][FIRST[f]].els, ALL[f][FIRST[f]].stock); for (const f of FAMS) for (const w of FAVOURITES[f].ways) prefetchCard(ALL[f][w.id].els, ALL[f][w.id].stock); }, []);

  const main = (f: Family): Slot => ({ key: `main-${f}`, fam: f, way: way[f], pose: { y: -0.04 }, layer: 1, interactive: true, spin: true, flip: flip(`main-${f}`) });
  let slots: Slot[];
  if (view === "card") slots = [main(fam)];
  else if (view === "show") slots = [{ ...main(fam), pose: { y: 0.02, s: 1.02 }, show: true }];
  else if (view === "stack") slots = FAMS.map((f) => {
    const front = f === fam, top = step === "over" ? !front : front;
    return { ...main(f), pose: front ? (step === "over" ? OVER : FRONT) : step === "over" ? UNDER : BEHIND, layer: top ? 1 : 0, interactive: front, onTap: front ? undefined : () => pick(f) };
  });
  else if (view === "sides") slots = [
    { ...main(fam), pose: { x: -0.1, y: 0.66, rz: 0.03, s: 0.84 }, layer: 0 },
    { key: `back-${fam}`, fam, way: way[fam], pose: { x: 0.1, y: -0.66, rz: -0.03, s: 0.84 }, layer: 1, interactive: false, spin: true, startBack: true, flip: flip(`back-${fam}`) },
  ];
  else {
    // Colours: the pick last (in front); the others behind it in order
    const ws = FAVOURITES[fam].ways.map((w) => w.id), order = [...ws.filter((w) => w !== way[fam]), way[fam]];
    slots = order.map((w, r) => ({ key: `col-${fam}-${w}`, fam, way: w, pose: CASCADE[r], layer: r, interactive: r === 2, flip: r === 2 ? flip(`col-${fam}-${w}`) : 0, onTap: r === 2 ? undefined : () => setWay((x) => ({ ...x, [fam]: w })) }));
  }
  const leaving = useLeaving(slots);

  // nothing half made: the loader until every card this view needs is made; then they come in
  const needed = slots.map((s) => ALL[s.fam][s.way]);
  const ready = useCardsReady(needed);
  const [shown, setShown] = useState(false);
  if (ready && !shown) setShown(true);

  const turnNow = () => {
    if (view === "sides") turn(`main-${fam}`, `back-${fam}`);
    else if (view === "colours") turn(`col-${fam}-${way[fam]}`);
    else turn(`main-${fam}`);
  };
  return (
    <div className="relative flex h-full flex-col text-white">
      {/* the landing page's night sky: the slow glows gather along the bottom */}
      <div className="night" aria-hidden><span className="drift n1" /><span className="drift n2" /><span className="drift n3" /></div>
      <div className="relative flex h-full flex-col">
        <div className="relative flex h-11 items-center px-4 pt-[52px] box-content">
          <RB icon="back" label="Back" />
          <h2 className="pointer-events-none absolute inset-x-0 bottom-0 flex h-11 items-center justify-center text-[18px] font-normal tracking-[-.02em]">Business cards</h2>
        </div>
        <div className="mt-6 px-5"><Tabs fam={fam} setFam={pick} /></div>
        <div className="relative mt-2 min-h-0 flex-1">
          <CardStage dist={view === "colours" ? 1.02 : view === "sides" ? 1.0 : 0.9} className="absolute inset-0">
            <Sweep on={view === "show"} />
            {shown && [...leaving, ...slots].map((s) => (
              <LiveCard key={s.key} {...ALL[s.fam][s.way]} madeOnly pose={s.pose} enter={OUT} turnIn layer={s.layer} interactive={!!s.interactive} spin={s.spin}
                flip={s.flip ?? 0} startBack={s.startBack} show={s.show} onTap={s.onTap} />
            ))}
          </CardStage>
          <BodyLoader show={!shown} />
          {/* a colour picked before its card is made: a small ring while it is made */}
          <div className={cx("pointer-events-none absolute right-5 top-2 transition-opacity duration-300", shown && !ready ? "opacity-100" : "opacity-0")} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 28 28" className="body-loader-ring"><circle cx="14" cy="14" r="11" fill="none" stroke="rgb(255 255 255 / .12)" strokeWidth="2.6" /><circle cx="14" cy="14" r="11" fill="none" stroke="rgb(240 244 254 / .8)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="17 52" /></svg>
          </div>
          <div className="absolute inset-x-0 bottom-1"><Views view={view} setView={setView} /></div>
        </div>
        <div className="mt-4 px-5"><Swatches fam={fam} way={way[fam]} setWay={(w) => setWay((x) => ({ ...x, [fam]: w }))} rest={view === "colours"} /></div>
        <div className="mt-5 flex gap-2.5 px-5 pb-7">
          <button type="button" onClick={turnNow} className="pill pill-dark h-12 w-12 shrink-0 !px-0" aria-label="Turn it over"><Icon name="rotate" size={18} /></button>
          <button type="button" onClick={() => setSave(true)} className="pill pill-primary h-12 flex-1 text-[15px]"><Icon name="download" size={18} />Save card</button>
        </div>
      </div>
      <AnimatePresence>{save && <SaveSheet fam={fam} way={way[fam]} onClose={() => setSave(false)} />}</AnimatePresence>
    </div>
  );
}

// ─── the lab section ───
export function ProfileCards() {
  return (
    <section>
      <h2 className="h1 !text-[34px]">On her profile</h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="max-w-[540px] space-y-4 text-[15px] leading-snug text-white/65">
          <p>One screen: the back button and a centred title, the two cards by name, the cards, their colourways, then turn and save. The words over the foot of the cards change the view:</p>
          <ul className="space-y-1.5 text-white/55">
            <li><span className="text-white/85">Card</span>: the card on its own, to turn in your hand.</li>
            <li><span className="text-white/85">Stack</span>: both cards, the other peeking over the top; pick one and they trade places.</li>
            <li><span className="text-white/85">Colours</span>: all three colourways at once; tap one to bring it forward (the swatches rest).</li>
            <li><span className="text-white/85">Both sides</span>: the front and the back together.</li>
            <li><span className="text-white/85">Showcase</span>: it drifts and tilts on its own, turns right round now and then, and a light sweeps across it.</li>
          </ul>
          <p>Cards move between views; new ones arrive from below with a turn. Nothing is shown half made: the 3D body&apos;s loader ring shows until the cards are ready, and a colour picked early turns in as soon as it is made.</p>
          <p className="text-[13.5px] text-white/40">For the app: bake each card&apos;s maps at build time (a script renders them to compressed images in /public), so the screen only downloads and shows them, a few hundred KB a card, instead of making them on the phone. Preload the first colourway of each card when the profile opens, the rest after; keep only the cards on screen in memory. Saving opens the phone&apos;s share sheet (Save Image, Save to Files, Contacts); an Apple Wallet pass would need a signed pass from a server.</p>
        </div>
        <div className="relative isolate h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
          <CardsScreen />
        </div>
      </div>
    </section>
  );
}
