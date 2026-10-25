"use client";
// Lab · Natalia's business cards on her profile (25 Oct 2026, round 4 from Jose's notes). One screen, top to bottom:
// the app's back button, a centred title and her details (a sheet with everything on the cards, each to tap or copy,
// and Add to contacts); the two cards by name (Venty, Natalia); the cards; the views; the colourways (swatches only);
// then turn and Save card. The app's page behind: its dark and its dot grid.
// The views, as icons that draw how the cards sit, in an inset track with a raised thumb:
//   One card       the card on its own: it drifts, tilts and floats, a light sweeps across it now and then; drag
//                  to turn it
//   Stacked        both cards, the other peeking over the top, its shadow on the one below; pick one and they
//                  shuffle: they part, swap once apart, and come together
//   All its colours  the three colourways cascaded; tap one to bring it forward (the swatches rest)
//   Front and back the two faces together
// Motion is slow and quiet: cards arrive one after another from far back, lying almost flat in deep perspective, and
// land slowly; a new colourway is another card, so it comes in as the cards and the views do: the old one slides off
// as the new one slides in, the way the swatches go; cards glide between views. No full turns.
// Loading: nothing is shown half made. The 3D body's loader ring shows until every card the view needs is made (they
// are made in slices in the background, the first colourway of each card first, then the rest); then they arrive. A
// colour picked before its card is made waits, with a small ring, and slides in as soon as it is ready. (For the app:
// bake the maps at build time; see the lab's note.)
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
    <div className="flex h-11 rounded-full p-1" style={{ background: "#08090f", boxShadow: inset }}>
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
    <div className={cx("flex justify-center gap-5 transition-opacity duration-500", rest && "pointer-events-none opacity-30")} aria-disabled={rest}>
      {FAVOURITES[fam].ways.map((w) => {
        const on = way === w.id && !rest;
        return (
          <button key={w.id} type="button" onClick={() => setWay(w.id)} aria-pressed={on} aria-label={`${w.name} colourway`} tabIndex={rest ? -1 : 0} className="grid h-12 w-12 place-items-center">
            <motion.span animate={{ scale: on ? 0.92 : 1 }} transition={{ type: "spring", bounce: 0.25, duration: 0.6 }} className="block h-10 w-10 rounded-full"
              style={{ background: SWATCH[fam][w.id], boxShadow: on
                ? "inset 0 2px 5px rgb(0 0 0 / .45), inset 0 0 0 1px rgb(255 255 255 / .14), 0 0 0 3px #0b0c15, 0 0 0 4.5px rgb(255 255 255 / .92)"
                : "inset 0 0 0 1px rgb(255 255 255 / .14), inset 0 1px 0 rgb(255 255 255 / .35), inset 0 -1px 0 rgb(0 0 0 / .3), 0 2px 4px rgb(0 0 0 / .45), 0 8px 16px -8px rgb(0 0 0 / .7)" }} />
          </button>
        );
      })}
    </div>
  );
}
type View = "card" | "stack" | "colours" | "sides";
// each view's icon draws how its cards sit (24 grid, 1.6 strokes, the cards in the back drawn only where they show)
const VIEWS: { k: View; name: string; icon: ReactNode }[] = [
  { k: "card", name: "One card", icon: <rect x="3" y="6.5" width="18" height="11" rx="2.2" /> },
  { k: "stack", name: "Both cards, stacked", icon: <><path d="M6 9.5V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-.5" /><rect x="3" y="9.5" width="15.5" height="10" rx="2" /></> },
  { k: "colours", name: "All its colours", icon: <><path d="M8.2 7.9V7.3a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.6" /><path d="M5.6 10.5V9.9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H16" /><rect x="3" y="10.5" width="13" height="9" rx="2" /></> },
  { k: "sides", name: "Front and back", icon: <><rect x="4" y="3.5" width="16" height="7.5" rx="1.8" /><rect x="4" y="13" width="16" height="7.5" rx="1.8" /><path d="M7 16.2h5.5M7 18h3.5" /></> },
];
function ViewSwitch({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="flex h-12 rounded-full p-1" style={{ background: "#08090f", boxShadow: inset }} role="group" aria-label="View">
      {VIEWS.map((v) => (
        <button key={v.k} type="button" onClick={() => setView(v.k)} aria-pressed={view === v.k} aria-label={v.name} title={v.name} className="relative grid flex-1 place-items-center rounded-full">
          {view === v.k && <motion.span layoutId="view-thumb" className="absolute inset-0 rounded-full bg-snow" style={{ boxShadow: raisedSnow }} transition={{ type: "spring", bounce: 0.16, duration: 0.6 }} />}
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden
            className={cx("relative transition-colors duration-500", view === v.k ? "text-ink" : "text-white/55")}>{v.icon}</svg>
        </button>
      ))}
    </div>
  );
}

// ─── her details: everything on the cards, to tap (call, write, open) or copy ───
const COPY = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.4" /><path d="M15.5 8.5V6.4A2.4 2.4 0 0 0 13.1 4H6.4A2.4 2.4 0 0 0 4 6.4v6.7a2.4 2.4 0 0 0 2.4 2.4h2.1" /></svg>;
const TICK = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
type Detail = { icon: "phone" | "mail" | "link" | "user" | "map"; label: string; value: string; href: string };
function details(f: Family): Detail[] {
  return [
    { icon: "phone", label: "Phone", value: "0420 991 942", href: "tel:+61420991942" },
    { icon: "mail", label: "Email", value: "natalia.chamom@gmail.com", href: "mailto:natalia.chamom@gmail.com" },
    ...(f === "venty" ? [{ icon: "link" as const, label: "Venty", value: "app.venty.au", href: "https://app.venty.au" }] : []),
    { icon: "link", label: "Website", value: "nataliachamon.com", href: "https://nataliachamon.com" },
    { icon: "user", label: "LinkedIn", value: "linkedin.com/in/natalia-c", href: "https://www.linkedin.com/in/natalia-c-8201a8226/" },
    { icon: "map", label: "Based in", value: "Brisbane, Australia", href: "https://maps.apple.com/?q=Brisbane%20QLD" },
  ];
}
function DetailsSheet({ fam, onClose }: { fam: Family; onClose: () => void }) {
  const [copied, setCopied] = useState("");
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copy = (v: string) => { navigator.clipboard?.writeText(v).then(() => { setCopied(v); clearTimeout(t.current); t.current = setTimeout(() => setCopied(""), 1600); }).catch(() => {}); };
  return (
    <>
      <motion.div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={onClose} />
      <motion.div className="absolute inset-x-0 bottom-0 z-50 max-h-[88%] overflow-y-auto rounded-t-[34px] bg-[#1b1c26] px-5 pb-8 pt-3 text-white shadow-[inset_0_1px_0_rgb(255_255_255/.12)]"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0.1, duration: 0.7 }}>
        <div className="mx-auto h-[5px] w-12 rounded-full bg-white/15" />
        <div className="mt-5 flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lab/ui/natalia-face.webp" srcSet="/lab/ui/natalia-face.webp 1x, /lab/ui/natalia-face@2x.webp 2x" width={56} height={56} alt="" className="h-14 w-14 rounded-full object-cover shadow-[0_0_0_1px_rgb(255_255_255/.12)]" />
          <div className="min-w-0"><h3 className="text-[22px] font-normal leading-tight tracking-[-.02em]">Natalia Chamon</h3><p className="text-[14px] text-white/55">{fam === "venty" ? "Founder, Venty" : "UI/UX design and front-end"}</p></div>
        </div>
        <div className="mt-5 space-y-2">
          {details(fam).map((d) => (
            <div key={d.label} className="pill-dark flex items-center rounded-[20px] pr-2">
              <a href={d.href} target={d.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="flex min-w-0 flex-1 items-center gap-3.5 px-3.5 py-3">
                <span className="iconbadge grid h-10 w-10 shrink-0 place-items-center rounded-[12px]"><Icon name={d.icon} size={18} /></span>
                <span className="min-w-0"><span className="block text-[12.5px] text-white/45">{d.label}</span><span className="block text-[15px] leading-snug [overflow-wrap:anywhere]">{d.value}</span></span>
              </a>
              <button type="button" onClick={() => copy(d.value)} aria-label={`Copy ${d.label.toLowerCase()}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:text-white">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={copied === d.value ? "tick" : "copy"} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.25 }} className={copied === d.value ? "text-peri" : ""}>
                    {copied === d.value ? TICK : COPY}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => hand(new File([vcard(fam)], "Natalia Chamon.vcf", { type: "text/vcard" }))} className="pill pill-primary mt-5 h-12 w-full text-[15px]"><Icon name="user" size={18} />Add to contacts</button>
        <p className="mt-3 h-4 text-center text-[13px] text-white/50" aria-live="polite">{copied ? "Copied" : ""}</p>
      </motion.div>
    </>
  );
}

// ─── what is on the stage in each view ───
type Slot = { key: string; fam: Family; way: string; pose: Pose; layer: number; interactive?: boolean; spin?: boolean; flip?: number; startBack?: boolean; show?: boolean; onTap?: () => void; opacity?: number; lean?: number };
// Stacked: the one behind sits just behind and a little higher, at nearly full size (layers keep the two apart).
// Trading places is a shuffle in two beats. First they part: the front card drops down and to the right to make room
// while the one behind rises a little and to the left, both easing back a touch, until they no longer overlap; there
// they swap layers (so the swap is never seen); then they come together, the new one settling in front and the old
// one tucking in behind it
const FRONT: Pose = { y: -0.16 }, BEHIND: Pose = { x: 0.08, y: 0.42, rz: -0.045, s: 0.96 }, GAP = 1.9;
const PART_DOWN: Pose = { x: 0.32, y: -1.02, rz: -0.07, s: 0.9 }, PART_UP: Pose = { x: -0.3, y: 1.0, rz: 0.06, s: 0.9 };
// All its colours: a cascade, the pick in front and lowest, the others stepping up and back behind it
const CASCADE: Pose[] = [{ x: -0.34, y: 0.5, rz: 0.035, s: 0.86 }, { x: -0.12, y: 0.18, rz: 0.015, s: 0.9 }, { x: 0.1, y: -0.16, s: 0.94 }];
// picking a colour behind: the card first slips out below and to the right, clear of the others, while they move up;
// then it comes in at the front (it never crosses another card at the same depth)
const SLIP: Pose = { x: 1.0, y: -1.88, rz: -0.06, s: 0.86 };
// how far the camera stands back in each view (the cards fill about seven eighths of the width in One card)
const DIST: Record<View, number> = { card: 0.88, stack: 0.9, colours: 0.95, sides: 0.98 };
// what changed last, which decides how new cards come in and old ones go:
//   reveal  the first arrival after loading (from far back, landing slowly)
//   tab, view, colour  a carousel, for the cards, the views and the colours alike: the old card (or the whole arrangement) slides off
//           to the side it is leaving by, turning a little away, as the new one slides in from the other side turned a
//           little in. Solid all the way (nothing fades, so no card ever shows through another); the two sets travel
//           together, a card's width and more apart, so they never overlap. The direction follows the control: to the
//           right in the tabs, the views or the swatches, and everything moves left
type Change = "reveal" | "tab" | "view" | "colour";
const SLIDE = 4.3, TURN = 0.5;
function useLeaving(items: Slot[], change: Change, dir: number) {
  // cards taken off the stage stay a moment, on their way out, then go. Worked out as the stage changes (in the same
  // render), so a leaving card is never unmounted and remounted; only the last change's cards are kept, so no more than
  // one set is ever leaving
  const keys = items.map((i) => i.key).join("|");
  const [was, setWas] = useState({ keys, items });
  const [gone, setGone] = useState<Slot[]>([]);
  if (keys !== was.keys) {
    const now = new Set(items.map((i) => i.key));
    const out = (i: Slot): Slot => ({ ...i, pose: { ...i.pose, x: (i.pose.x ?? 0) - dir * SLIDE }, lean: -dir * TURN, interactive: false, onTap: undefined });
    setGone(was.items.filter((i) => !now.has(i.key)).map(out));
    setWas({ keys, items });
  }
  useEffect(() => { const b = setTimeout(() => setGone([]), 950); return () => clearTimeout(b); }, [keys]);
  return gone.filter((g) => !items.some((i) => i.key === g.key));
}
// where the cards' band sits on the screen, in scene units, so the canvas can cover the whole screen (nothing is ever
// cut off) while the cards sit between the tabs and the views
function useBandOffset(screen: React.RefObject<HTMLDivElement | null>, band: React.RefObject<HTMLDivElement | null>, dist: number) {
  const [off, setOff] = useState({ off: 0, d: 14 });
  useEffect(() => {
    const a = screen.current, b = band.current; if (!a || !b) return;
    const fit = () => {
      const A = a.getBoundingClientRect(), B = b.getBoundingClientRect(), tan = Math.tan((15 * Math.PI) / 180);
      const d = Math.max(5.2, 3.9 / (2 * tan * (A.width / Math.max(1, A.height)))) * dist, perPx = (2 * d * tan) / Math.max(1, A.height);
      setOff({ off: -((B.top + B.height / 2) - (A.top + A.height / 2)) * perPx, d });
    };
    const ro = new ResizeObserver(fit); ro.observe(a); ro.observe(b); fit(); return () => ro.disconnect();
  }, [screen, band, dist]);
  return off;
}

export function CardsScreen() {
  const [fam, setFam] = useState<Family>("venty");
  const [way, setWay] = useState(FIRST);
  const [view, setViewNow] = useState<View>("card");
  const [flips, setFlips] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"" | "part">("");
  const [change, setChange] = useState<Change>("reveal");
  const [dir, setDir] = useState(1);
  const [save, setSave] = useState(false);
  const [info, setInfo] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flip = (k: string) => flips[k] ?? 0;
  const turn = (...ks: string[]) => setFlips((f) => { const n = { ...f }; for (const k of ks) n[k] = (n[k] ?? 0) + 1; return n; });
  const pick = (f: Family) => {
    if (f === fam) return;
    setFam(f); setDir(FAMS.indexOf(f) > FAMS.indexOf(fam) ? 1 : -1); setChange("tab");
    // Stack: they trade places over the top (the old front card stays the top layer until the new one is above it)
    if (view === "stack") { setStep("part"); clearTimeout(t.current); t.current = setTimeout(() => setStep(""), 460); }
  };
  const order = VIEWS.map((x) => x.k);
  // All its colours: a card picked from behind slips out first, then comes to the front
  const [slip, setSlip] = useState<string | null>(null);
  useEffect(() => { if (!slip) return; const t = setTimeout(() => setSlip(null), 480); return () => clearTimeout(t); }, [slip]);
  const bring = (w: string) => { setSlip(w); setWay((x) => ({ ...x, [fam]: w })); };
  // a colour from the swatches: in All its colours the card comes forward; elsewhere the new colour slides in
  const ways = FAVOURITES[fam].ways.map((w) => w.id);
  const pickWay = (w: string) => {
    if (w === way[fam]) return;
    if (view === "colours") return bring(w);
    setDir(ways.indexOf(w) > ways.indexOf(way[fam]) ? 1 : -1); setChange("colour"); setWay((x) => ({ ...x, [fam]: w }));
  };
  const setView = (v: View) => { if (v === view) return; setDir(order.indexOf(v) > order.indexOf(view) ? 1 : -1); setViewNow(v); setChange("view"); setStep(""); };

  // made ahead: each card's first colourway, then the rest
  useEffect(() => { for (const f of FAMS) prefetchCard(ALL[f][FIRST[f]].els, ALL[f][FIRST[f]].stock); for (const f of FAMS) for (const w of FAVOURITES[f].ways) prefetchCard(ALL[f][w.id].els, ALL[f][w.id].stock); }, []);

  const screen = useRef<HTMLDivElement>(null), band = useRef<HTMLDivElement>(null);
  const { off: offset, d: camD } = useBandOffset(screen, band, DIST[view]);
  // a pose set back by z, scaled and moved out to look as it would at the front
  const deep = (p: Pose, z: number): Pose => { const k = (camD - z) / camD; return { x: (p.x ?? 0) * k, y: ((p.y ?? 0) + offset) * k - offset, z, rz: p.rz ?? 0, s: (p.s ?? 1) * k }; };
  // every card on the stage is keyed by its view and its colour, so a new view or a new colour is a new card; a new
  // card shows the side the one before it showed (after Turn)
  const odd = (f: Family) => flip(`main-${f}`) % 2 === 1;
  const main = (f: Family): Slot => ({ key: `${view}:main-${f}-${way[f]}`, fam: f, way: way[f], pose: { y: 0 }, layer: 1, interactive: true, startBack: odd(f), flip: flip(`main-${f}`) });
  let slots: Slot[];
  if (view === "card") slots = [{ ...main(fam), show: true }]; // the card drifts, tilts and floats on its own
  else if (view === "stack") slots = FAMS.map((f) => {
    // they part at the same depth (apart, so they cannot meet), then pass each other in depth as they come together
    const front = f === fam, top = step === "part" ? !front : front;
    return { ...main(f), pose: front ? (step === "part" ? deep(PART_UP, -GAP / 2) : FRONT) : step === "part" ? deep(PART_DOWN, -GAP / 2) : deep(BEHIND, -GAP), layer: top ? 1 : 0, interactive: front, onTap: front ? undefined : () => pick(f) };
  });
  else if (view === "sides") slots = [
    // the front above and a little to the left, set back; the back below, in front; they overlap at a corner. Both take
    // the drag, so either turns them together (they stay parallel, so they never meet)
    { ...main(fam), pose: deep({ x: -0.12, y: 0.62, rz: 0.03, s: 0.84 }, -GAP), layer: 0 },
    { key: `${view}:back-${fam}-${way[fam]}`, fam, way: way[fam], pose: { x: 0.12, y: -0.64, rz: -0.03, s: 0.84 }, layer: 1, interactive: true, startBack: !odd(fam), flip: flip(`main-${fam}`) },
  ];
  else {
    // All its colours: the pick last (in front); the others behind it in order
    const ws = FAVOURITES[fam].ways.map((w) => w.id), order = [...ws.filter((w) => w !== way[fam]), way[fam]];
    slots = order.map((w, r) => ({ key: `${view}:${fam}-${w}`, fam, way: w, pose: slip === w ? deep(SLIP, -GAP / 2) : deep(CASCADE[r], -(2 - r) * GAP), layer: r, interactive: r === 2, flip: r === 2 ? flip(`main-${fam}`) : 0, onTap: r === 2 ? undefined : () => bring(w) }));
  }
  const leaving = useLeaving(slots, change, dir);
  // where a new card comes in from, for the last change (a card already on the stage ignores it)
  const from = (s: Slot) => ({ ...s.pose, x: (s.pose.x ?? 0) + dir * SLIDE, yaw: dir * TURN });

  // nothing half made: the loader until every card this view needs is made. Then the cards are put on the stage unseen
  // for a moment (their textures go to the GPU and their shaders are built while nothing moves), and they arrive
  const needed = slots.map((s) => ALL[s.fam][s.way]);
  const ready = useCardsReady(needed);
  const [shown, setShown] = useState(false);
  if (ready && !shown) setShown(true);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { if (!shown) return; const r = setTimeout(() => setRevealed(true), 700); return () => clearTimeout(r); }, [shown]);

  const turnNow = () => turn(`main-${fam}`);
  return (
    <div ref={screen} className="relative h-full text-white">
      {/* the app's page: its dark and its dot grid */}
      <div className="dotgrid" />
      {/* the stage covers the whole screen, under the controls, so a card is never cut off */}
      <CardStage dist={DIST[view]} offset={offset} shadows className="absolute inset-0">
        <Sweep on={view === "card"} />
        {shown && [...leaving, ...slots].map((s, i) => (
          <LiveCard key={s.key} {...ALL[s.fam][s.way]} madeOnly pose={s.pose} layer={s.layer} interactive={!!s.interactive} spin={s.spin} flip={s.flip ?? 0} startBack={s.startBack} show={s.show} onTap={s.onTap}
            opacity={s.opacity ?? 1} lean={s.lean ?? 0} speed={view === "stack" ? 9 : 7}
            arrive={change === "reveal" ? 0.7 + i * 0.2 : undefined} from={change === "reveal" ? undefined : from(s)} />
        ))}
      </CardStage>
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="pointer-events-auto relative flex h-11 items-center justify-between px-4 pt-[52px] box-content">
          <RB icon="back" label="Back" />
          <h2 className="pointer-events-none absolute inset-x-0 bottom-0 flex h-11 items-center justify-center text-[18px] font-normal tracking-[-.02em]">Business cards</h2>
          <RB icon="user" label="Her details" onClick={() => setInfo(true)} />
        </div>
        <div className="pointer-events-auto mt-6 px-5"><Tabs fam={fam} setFam={pick} /></div>
        <div ref={band} className="relative min-h-0 flex-1">
          <BodyLoader show={!revealed} />
          {/* a colour picked before its card is made: a small ring while it is made */}
          <div className={cx("absolute right-5 top-3 transition-opacity duration-300", revealed && !ready ? "opacity-100" : "opacity-0")} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 28 28" className="body-loader-ring"><circle cx="14" cy="14" r="11" fill="none" stroke="rgb(255 255 255 / .12)" strokeWidth="2.6" /><circle cx="14" cy="14" r="11" fill="none" stroke="rgb(240 244 254 / .8)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="17 52" /></svg>
          </div>
        </div>
        <div className="pointer-events-auto px-5"><ViewSwitch view={view} setView={setView} /></div>
        <div className="pointer-events-auto mt-3 px-5"><Swatches fam={fam} way={way[fam]} setWay={pickWay} rest={view === "colours"} /></div>
        <div className="pointer-events-auto mt-3 flex gap-2.5 px-5 pb-7">
          <button type="button" onClick={turnNow} className="pill pill-dark h-12 w-12 shrink-0 !px-0" aria-label="Turn it over"><Icon name="rotate" size={18} /></button>
          <button type="button" onClick={() => setSave(true)} className="pill pill-primary h-12 flex-1 text-[15px]"><Icon name="download" size={18} />Save card</button>
        </div>
      </div>
      <AnimatePresence>{save && <SaveSheet fam={fam} way={way[fam]} onClose={() => setSave(false)} />}</AnimatePresence>
      <AnimatePresence>{info && <DetailsSheet fam={fam} onClose={() => setInfo(false)} />}</AnimatePresence>
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
          <p>One screen: the back button, a centred title and her details (the person button: a sheet where every detail can be tapped or copied); the cards by name; the cards; the views; the colourways; then turn and save.</p>
          <p>Four views, drawn as how the cards sit: one card (it drifts, tilts and floats, a light sweeping across it), both stacked (pick one and they shuffle: they part, swap once apart, and come together), all its colours cascaded (the swatches rest), and front and back. A card above throws a soft shadow on the cards below, and only on them.</p>
          <p>Motion: switching cards and switching views are the same carousel: the old card (or arrangement) slides off the way it is leaving, turning a little away, as the new one slides in from the other side, solid all the way (nothing fades, so no card shows through another); the direction follows the control. A new colour slides in the same way, following the swatches. Every move eases in and out. The stage covers the whole screen under the controls, so nothing is cut off. Nothing is shown half made: the 3D body&apos;s loader ring shows until the cards are ready; then they are put on the stage unseen for a moment (so their textures are on the GPU before anything moves) and arrive from far back, landing slowly.</p>
          <p className="text-[13.5px] text-white/40">For the app: bake each card&apos;s maps at build time (a script renders them to compressed images in /public), so the screen only downloads and shows them, a few hundred KB a card, instead of making them on the phone. Preload the first colourway of each card when the profile opens, the rest after; keep only the cards on screen in memory. Saving opens the phone&apos;s share sheet (Save Image, Save to Files, Contacts); an Apple Wallet pass would need a signed pass from a server.</p>
        </div>
        <div className="relative isolate h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
          <CardsScreen />
        </div>
      </div>
    </section>
  );
}
