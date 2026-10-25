"use client";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, animate } from "motion/react";
import { useApp, type Pattern } from "@/lib/store";
import { fabricAdvice, fitName, templateBy, metresFor, metresAt, notionsFor, kindOf, FLUTTER, SEED_PATTERNS, type GarmentKey } from "@/lib/data";
import { Screen, H1, Pill, Chip, RB, Sheet, TopBar, Split, Crown, Avatar, cx, useDesk } from "@/components/ui";
import { BodyFigure, Flat } from "@/components/art";
import { useInstall } from "@/components/Install";
import { MapBoard } from "./print";
import { piecesFor } from "./pattern";
import { Icon, type IconName } from "@/components/icons";

// The bar's outline: a rounded pill with a round notch cut into the top centre. Where the notch meets the top edge
// the corners are rounded too (fillets), so the bar wraps the button like a cradle. Docked (home-screen app), the
// bottom corners are square: the bar runs into the screen's own rounded corners.
// One channel, G (5px), runs round everything (24 Oct 2026, from Jose's Figma): closed, round the plus (the notch is the
// button plus G); open, between the Create card and the bar (the card wraps the plus in a ring of the button plus G,
// and the notch widens to the button plus 2G). The card's outline pushed out by G is the bar's outline exactly (same
// centres, every radius G apart), so the gap never changes and never closes.
const BAR_H = 80, BAR_R = 30, NOTCH_Y = 9, FILLET = 9, BTN = 31, G = 5, RING = BTN + G, CARD_R = 22;
function notchPath(w: number, H: number, docked: boolean, R: number) {
  const c = w / 2, h = NOTCH_Y, f = FILLET;
  const dx = Math.sqrt((R + f) ** 2 - (h - f) ** 2); // fillet centre sits this far from the notch centre
  const k = R / (R + f); // touch point between fillet and notch, along the line joining their centres
  const p1 = [c + (-dx) * k, h + (f - h) * k], p2 = [c + dx * k, h + (f - h) * k];
  const r = BAR_R, rb = docked ? 0 : BAR_R;
  return [
    `M ${r} 0`, `L ${c - dx} 0`,
    `A ${f} ${f} 0 0 1 ${p1[0]} ${p1[1]}`,
    `A ${R} ${R} 0 1 0 ${p2[0]} ${p2[1]}`,
    `A ${f} ${f} 0 0 1 ${c + dx} 0`,
    `L ${w - r} 0`, `A ${r} ${r} 0 0 1 ${w} ${r}`, `L ${w} ${H - rb}`, rb ? `A ${rb} ${rb} 0 0 1 ${w - rb} ${H}` : "",
    `L ${rb} ${H}`, rb ? `A ${rb} ${rb} 0 0 1 0 ${H - rb}` : "", `L 0 ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, "Z",
  ].join(" ");
}
// the Create card: a rounded rectangle (w × h) whose bottom edge dips into a ring round the plus, G + NOTCH_Y below it,
// meeting it with a concave curve of FILLET + G
function cardPath(w: number, h: number) {
  const c = w / 2, cy = h + G + NOTCH_Y, fc = FILLET + G, d = RING + fc;
  return [`M ${CARD_R} 0`, `H ${w - CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 ${w} ${CARD_R}`, `V ${h - CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 ${w - CARD_R} ${h}`,
    `H ${c + d}`, `A ${fc} ${fc} 0 0 0 ${c + RING} ${cy}`, `A ${RING} ${RING} 0 0 1 ${c} ${cy + RING}`, `A ${RING} ${RING} 0 0 1 ${c - RING} ${cy}`,
    `A ${fc} ${fc} 0 0 0 ${c - d} ${h}`, `H ${CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 0 ${h - CARD_R}`, `V ${CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 ${CARD_R} 0`, "Z"].join(" ");
}
// one even snow (no gradient; a docked bar meets the strip below, painted the same snow, with no seam), built like the
// white secondary button: a soft white light inside the edge, and a rim that is white along the top and a slightly
// deeper snow towards the bottom
function SnowShape({ id, d, h }: { id: string; d: string; h: number }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}rim`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={h}><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="rgb(19 21 35 / .06)" /><stop offset="1" stopColor="rgb(19 21 35 / .16)" /></linearGradient>
        <clipPath id={`${id}clip`}><path d={d} /></clipPath>
        <filter id={`${id}glow`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <path d={d} fill="var(--color-snow)" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="12" clipPath={`url(#${id}clip)`} filter={`url(#${id}glow)`} />
      <path d={d} fill="none" stroke={`url(#${id}rim)`} strokeWidth="1" />
    </>
  );
}
// a number that eases to its target (the notch's radius): the outline is redrawn from it each frame, which works in every
// browser (Safari cannot transition an SVG path in CSS, and motion cannot blend these path strings)
function useEased(target: number) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const c = animate(cur.current, target, { duration: 0.42, ease: [0.2, 0.8, 0.2, 1], onUpdate: (x) => { cur.current = x; setV(x); } });
    return () => c.stop();
  }, [target]);
  return v;
}

// The three ways to start, the same everywhere (the tab bar's Create card, the sidebar's Create dialog)
const CREATE: [IconName, string, string][] = [
  ["pencil", "Create a pattern", "From a photo, sketch or words"],
  ["dress", "Start from a pattern", "Pick a design, fit it to you"],
  ["body", "Add a body", "Take your measurements"],
];
export function useCreateActions() {
  const { go, newDraft, startBody } = useApp();
  return [() => { newDraft(); go("patSelectBody"); }, () => go("templates"), () => startBody()];
}
// the rows: an inset icon tile, the name, one short line, a chevron; hairlines between
function CreateRows({ onPick }: { onPick: (i: number) => void }) {
  return (
    <div className="divide-y divide-white/8">{CREATE.map(([ic, t, d], i) => (
      <button key={t} onClick={() => onPick(i)} className="tap flex w-full items-center gap-3.5 py-3.5 text-left">
        <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-[13px]"><Icon name={ic} size={21} strokeWidth={2} /></span>
        <span className="min-w-0 flex-1"><span className="block text-[16px] font-medium leading-tight">{t}</span><span className="mt-0.5 block text-[14px] leading-snug text-white/60">{d}</span></span>
        <Icon name="chevR" size={18} className="shrink-0 text-white/40" />
      </button>
    ))}</div>
  );
}
// the card's words and rows; its height is measured, so the card's outline fits them
function CreateCardBody({ onHeight, onPick }: { onHeight: (h: number) => void; onPick: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => onHeight(el.offsetHeight)); ro.observe(el); onHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [onHeight]);
  return (
    // .snow-card gives what sits inside the ink of a chosen card (the inset tiles pressed into the snow, the steel
    // icons, ink text); the snow itself is the outline under it
    <div ref={ref} className="snow-card relative !bg-transparent px-5 pb-3 pt-5 text-[#131523]">
      <h3 className="text-center text-[22px] font-normal leading-tight tracking-[-.02em]">Create</h3>
      <p className="mt-1 text-center text-[15px] text-white/60">What would you like to start?</p>
      <div className="mt-3"><CreateRows onPick={onPick} /></div>
    </div>
  );
}

// Phone navigation: a light bar with the Create button sitting in a round notch in the centre (24 Oct 2026, chosen in
// the lab). The tabs sit at fixed, even places: Bodies and Patterns 68px either side of the plus (the closest a 40px
// circle keeps 5px from the widened notch), Home and You 74.5px beyond them, never closer to the ends than the centres
// of the bar's top corners. On a 345px bar (most phones) that is exactly those centres; on a wider bar (a Pro Max, or
// docked full width) the four stay a compact group round the plus. The current tab's icon sits in a 40px circle
// pressed into the snow; on a 345px bar, on Home and You it shares its centre with the bar's corner, so it runs
// parallel to it. It glides from tab to tab (one layout id across the pages, which cross-fade in place).
// Each tab's tap area runs to the halfway point between its neighbours, and to the notch.
// The plus opens the Create card out of the bar (see the channel above); the page behind blurs and darkens, the bar
// stays; the plus turns 45° into × in the dark secondary style. A tab, the ×, a tap outside or Escape closes it.
// · Safari: a floating pill (Safari's own toolbar sits below it).
// · Home-screen app (html.pwa): docked like a native iOS tab bar. It runs full width to the bottom edge; icons stay in the
//   top 80px and the bar grows underneath by --tab-under, the space kept free for the iPhone's home bar. The Create
//   card still keeps 24px from the screen's edges.
const usePwaDock = () => {
  const [docked, setDocked] = useState(false);
  useEffect(() => { setDocked(document.documentElement.classList.contains("pwa") && window.matchMedia("(max-width: 639px)").matches); }, []);
  return docked;
};
// TAB_SPREAD: the outer tabs sit at most this far beyond the inner ones, so on a wide bar (a Pro Max, or docked full
// width) the four stay a compact, even group round the plus; on a 345px bar it puts Home and You on the corners' centres
const TAB_D = 40, TAB_TOP = 10, TAB_GAP = 68, TAB_SPREAD = 74.5;
export function TabBar({ tab }: { tab: "home" | "bodies" | "patterns" | "you" }) {
  const { replace } = useApp();
  const [open, setOpen] = useState(false);
  const docked = usePwaDock();
  const actions = useCreateActions();
  const wrap = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const [[w, h], setSize] = useState([353, BAR_H]);
  const [cardH, setCardH] = useState(0);
  const [screen, setScreen] = useState<Element | null>(null);
  const notch = useEased(open ? BTN + 2 * G : RING);
  useEffect(() => { const el = nav.current; if (!el) return; const fit = () => setSize([el.clientWidth, el.clientHeight || BAR_H]); const ro = new ResizeObserver(fit); ro.observe(el); fit(); return () => ro.disconnect(); }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", esc); return () => window.removeEventListener("keydown", esc);
  }, [open]);
  const items: [typeof tab, IconName, string][] = [["home", "home", "Home"], ["bodies", "body", "Bodies"], ["patterns", "scissors", "Patterns"], ["you", "user", "You"]];
  const centres = [Math.max(BAR_R, w / 2 - TAB_GAP - TAB_SPREAD), w / 2 - TAB_GAP, w / 2 + TAB_GAP, Math.min(w - BAR_R, w / 2 + TAB_GAP + TAB_SPREAD)];
  const edges = [0, (centres[0] + centres[1]) / 2, w / 2 - RING - G, w / 2 + RING + G, (centres[2] + centres[3]) / 2, w];
  const spans = [[edges[0], edges[1]], [edges[1], edges[2]], [edges[3], edges[4]], [edges[4], edges[5]]];
  const btn = ([k, ic, l]: (typeof items)[number], i: number) => {
    const on = tab === k, [a, b] = spans[i], c = centres[i] - a;
    return (
      <button key={k} onClick={() => { setOpen(false); if (!on) replace(k); }} aria-current={on ? "page" : undefined}
        className={cx("absolute top-0 text-[12px] transition-colors", on ? "font-semibold text-[#26335f]" : "font-medium text-[#26335f]/60")} style={{ left: a, width: b - a, height: BAR_H }}>
        {on && <motion.span layoutId="tab-active" transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} className="tab-pressed absolute rounded-full" style={{ left: c - TAB_D / 2, top: TAB_TOP, width: TAB_D, height: TAB_D }} />}
        <span className="absolute grid place-items-center" style={{ left: c - 14, top: TAB_TOP + TAB_D / 2 - 14, width: 28, height: 28 }}><Icon name={ic} size={22} strokeWidth={on ? 2.1 : 1.7} /></span>
        <span className="absolute -translate-x-1/2 whitespace-nowrap leading-none" style={{ left: c, top: TAB_TOP + TAB_D + 4 }}>{l}</span>
      </button>
    );
  };
  const cardW = docked ? w - 48 : w;
  return (
    <>
      {screen && createPortal(
        <AnimatePresence>{open && <motion.div key="dim" className="absolute inset-0 z-[15] bg-black/50 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden />}</AnimatePresence>,
        screen)}
      <div ref={wrap} className={cx("relative mt-3", docked && "-mx-6")}>
        <AnimatePresence>{open && (
          <motion.div key="card" role="dialog" aria-label="Create" className={cx("absolute z-10", docked ? "inset-x-6" : "inset-x-0")} style={{ bottom: `calc(100% + ${G}px)`, transformOrigin: `50% calc(100% + ${G + NOTCH_Y}px)` }}
            initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 8 }} transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}>
            {cardH > 0 && (
              <svg width={cardW} height={cardH + G + NOTCH_Y + RING} className="pointer-events-none absolute left-0 top-0 overflow-visible" style={{ filter: "drop-shadow(0 1px 2px rgb(0 0 0 / .3)) drop-shadow(0 18px 28px rgb(0 0 0 / .45))" }} aria-hidden>
                <SnowShape id="createcard" d={cardPath(cardW, cardH)} h={cardH} />
              </svg>
            )}
            <CreateCardBody onHeight={setCardH} onPick={(i) => { setOpen(false); actions[i](); }} />
          </motion.div>
        )}</AnimatePresence>
        {/* 80px of icons and labels, with room underneath; docked, plus the home bar's space (--tab-under). The bar is
            drawn over the card, so the card's shadow falls on the page but never on the bar */}
        <nav ref={nav} className="tabbar relative z-20" style={{ height: docked ? "calc(80px + var(--tab-under, 0px))" : 80 }}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="tabbar-shape pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
            <SnowShape id="tab" d={notchPath(w, h, docked, notch)} h={BAR_H} />
          </svg>
          {items.map(btn)}
        </nav>
        {/* centred on the notch: its centre sits NOTCH_Y below the bar's top edge. Periwinkle; open, it turns 45° into × and
            fades into the dark secondary */}
        {/* opening finds this page, for the dimmed layer: it covers the page behind its footer, so the bar and the card stay above it */}
        <button onClick={() => { if (!open) setScreen(wrap.current?.closest("[data-screen]") ?? null); setOpen(!open); }} aria-label={open ? "Close" : "Create"} aria-expanded={open}
          className="tap absolute left-1/2 top-[-22px] z-30 grid h-[62px] w-[62px] -translate-x-1/2 place-items-center rounded-full text-white">
          <span className={cx("createbtn absolute inset-0 rounded-full transition-opacity duration-300", open && "opacity-0")} />
          <span className={cx("sec-dark absolute inset-0 rounded-full transition-opacity duration-300", !open && "opacity-0")} />
          <motion.span className="relative grid place-items-center" animate={{ rotate: open ? 45 : 0 }} transition={{ type: "spring", bounce: 0.3, duration: 0.45 }}><Icon name="plus" size={26} strokeWidth={2.2} /></motion.span>
        </button>
      </div>
    </>
  );
}

// On a computer the sidebar's Create opens the same three ways to start in a dialog
export function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const actions = useCreateActions();
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="relative">
        <h3 className="text-center text-[26px] font-normal leading-tight tracking-[-.02em]">Create</h3>
        <p className="mt-1 text-center text-[15px] text-white/60">What would you like to start?</p>
        <RB icon="close" size={38} onClick={onClose} label="Close" className="!absolute right-0 top-0" />
      </div>
      <div className="mt-3"><CreateRows onPick={(i) => { onClose(); actions[i](); }} /></div>
    </Sheet>
  );
}

// Home notices: resume paused measures; offer the tour to people who skipped it. Both dismiss themselves once used.
function Notices() {
  const { bodies, resumeBody, tourSkipped, installDismissed, set, go } = useApp();
  const b = bodies.find((x) => x.id === resumeBody && x.done.length < 24);
  const { offer } = useInstall();
  const showInstall = offer && !installDismissed;
  if (!b && !tourSkipped && !showInstall) return null;
  return (
    <div className="mt-5 flex flex-col gap-2.5 lg:max-w-[720px]">
      {showInstall && (
        <div className="card-soft relative flex items-center gap-3.5 rounded-[22px] p-4">
          <button onClick={() => go("install")} className="flex flex-1 items-center gap-3.5 text-left">
            <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-[13px]"><Icon name="addhome" size={20} strokeWidth={2} /></span>
            <span><span className="block text-[16px] font-medium">Add to your home screen</span><span className="block text-[14px] text-white/55">Open Venty in one tap, like an app.</span></span>
          </button>
          <button onClick={() => set({ installDismissed: true })} aria-label="Dismiss" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10"><Icon name="close" size={16} /></button>
        </div>
      )}
      {b && (
        <button onClick={() => { set({ activeBody: b.id }); go("wizard"); }} className="card-soft tap flex w-full items-center gap-3.5 rounded-[22px] p-4 text-left">
          <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-[13px]"><Icon name="ruler" size={20} strokeWidth={2} /></span>
          <div className="min-w-0 flex-1"><div className="text-[16px] font-medium">Continue finishing your measurements</div><div className="text-[14px] text-white/55">{b.name} · {b.done.length} of 24 saved</div>
            <div className="mt-2 flex gap-[2px]">{Array.from({ length: 24 }, (_, i) => <span key={i} className={cx("h-1 flex-1 rounded-full", i < b.done.length ? "bg-primary" : "bg-white/15")} />)}</div></div>
          <Icon name="chevR" size={18} className="text-white/50" />
        </button>
      )}
      {tourSkipped && (
        <div className="card-soft relative flex items-center gap-3.5 rounded-[22px] p-4">
          <button onClick={() => go("onboarding", { from: "app" })} className="flex flex-1 items-center gap-3.5 text-left">
            <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-[13px]"><Icon name="video" size={20} strokeWidth={2} /></span>
            <span><span className="block text-[16px] font-medium">New here? Take the tour</span><span className="block text-[14px] text-white/55">See how a photo becomes your pattern.</span></span>
          </button>
          <button onClick={() => set({ tourSkipped: false })} aria-label="Dismiss" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10"><Icon name="close" size={16} /></button>
        </div>
      )}
    </div>
  );
}

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

const STATUS_DOT: Record<string, string> = { Printed: "bg-primary", Fitting: "bg-peri", Draft: "bg-white/40" };

function SectionHead({ title, onAll }: { title: string; onAll: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[18px] font-normal tracking-[-.02em] lg:text-[22px]">{title}</h2>
      <button onClick={onAll} className="tap flex h-8 items-center gap-0.5 rounded-full border border-white/15 pl-3 pr-2 text-[13px] font-medium text-white/75 hover:text-white">View all<Icon name="chevR" size={14} /></button>
    </div>
  );
}

// Notifications behind the bell (from the lab, 25 Oct 2026): only things that matter to you. No marketing. Two kinds.
// Reminders (finish a body's measurements, print a pattern) come from what is waiting, so they go by themselves once it
// is done. News (what is new in Venty) stays, read or not, under Earlier. Nothing is ever deleted: a tap reads one, Mark
// all as read reads them all (the ids kept in updatesRead). A reminder goes straight to its place; news has more to
// say, so it opens a page of its own over the sheet (a picture, paragraphs with links, pictures, one thing to do), and
// back returns to the sheet.
type Story = { kicker: string; image: string; body: ReactNode[]; gallery?: { src: string; caption: string }[]; cta: string; act: () => void };
type Update = { id: string; icon: IconName; t: string; d: string; when: string; today: boolean; go?: () => void; story?: Story };
// a link inside a story's paragraph: it goes somewhere in the app
const StoryLink = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} className="inline font-medium text-[#a9b5fb] underline decoration-[#a9b5fb]/40 underline-offset-[3px] hover:decoration-[#a9b5fb]">{children}</button>
);
function useUpdates(close: () => void) {
  const { bodies, patterns, resumeBody, set, go, newDraft } = useApp();
  const to = (fn: () => void) => () => { close(); fn(); };
  const unfinished = bodies.find((x) => x.id === resumeBody && x.done.length < 24);
  const ready = patterns.find((x) => x.status === "Fitting");
  const wrap = templateBy("wrap"), wide = templateBy("wideleg");
  const list: Update[] = [];
  if (unfinished) list.push({ id: `measure-${unfinished.id}`, icon: "ruler", t: `Finish ${unfinished.name}’s measurements`, d: `${unfinished.done.length} of 24 saved. Pick up where you left off.`, when: "Today", today: true, go: to(() => { set({ activeBody: unfinished.id }); go("wizard"); }) });
  if (ready) list.push({ id: `print-${ready.id}`, icon: "printer", t: `${ready.name} is ready to print`, d: `Drafted to ${ready.body}. Lay it out on your sheets when you’re ready.`, when: "Today", today: true, go: to(() => go("pattern", { id: ready.id })) });
  list.push({
    id: "news-new-patterns", icon: "dress", t: "New patterns to make", d: "A wrap dress and wide-leg trousers were added to the library.", when: "Yesterday", today: false,
    story: {
      kicker: "New in Patterns to make", image: "/auth/look-street-green.webp",
      body: [
        <>Two new patterns are in the library, each drafted to your own measurements when you choose it.</>,
        <><b className="font-medium text-white">{wrap.name}.</b> {wrap.blurb}</>,
        <><b className="font-medium text-white">{wide.name}.</b> {wide.blurb}</>,
        <>Both are in <StoryLink onClick={to(() => go("templates"))}>Patterns to make</StoryLink>, with the rest of the library.</>,
      ],
      gallery: [{ src: "/auth/look-limo-mauve.webp", caption: `${wrap.name} · ${wrap.level}` }, { src: "/auth/look-street-burgundy.webp", caption: `${wide.name} · ${wide.level}` }],
      cta: "See the new patterns", act: to(() => go("templates")),
    },
  });
  list.push({
    id: "news-sketch", icon: "pencil", t: "New: sketch on your photos", d: "Add a photo and draw your changes on top of it.", when: "This week", today: false,
    story: {
      kicker: "What’s new", image: "/auth/detail-bows.webp",
      body: [
        <>Add a photo of a garment you like, then draw your changes on top of it: circle a neckline, sketch a longer hem, add bows.</>,
        <>Venty uses your lines with the picture when it drafts the pattern. <StoryLink onClick={to(() => go("info", { doc: "ai" }))}>About the AI</StoryLink> explains what it does with your photos, and what to check.</>,
      ],
      gallery: [{ src: "/auth/detail-hems.webp", caption: "A longer hem, drawn on" }, { src: "/auth/detail-corset.webp", caption: "A new neckline" }],
      cta: "Make a pattern", act: to(() => { newDraft(); go("patSelectBody"); }),
    },
  });
  return list;
}

// a row: the icon in its pressed tile (a cornflower dot on it while unread), the title (white while unread), when, the
// line under it, a chevron (every row leads somewhere)
function UpdateRow({ u, unread, onTap }: { u: Update; unread: boolean; onTap: () => void }) {
  return (
    <button onClick={onTap} className="group relative flex w-full items-start gap-3.5 px-2 py-3.5 text-left">
      <span aria-hidden className="absolute inset-x-0 inset-y-1 rounded-[14px] transition-colors group-hover:bg-white/[.04]" />
      <span className="iconbadge relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px]">
        <Icon name={u.icon} size={17} strokeWidth={1.9} />
        {unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#687ef5] ring-2 ring-[var(--color-card)]" />}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cx("text-[16px] leading-snug", unread ? "font-medium text-white" : "text-white/80")}>{u.t}{unread && <span className="sr-only"> (new)</span>}</span>
          <span className="shrink-0 text-[13px] text-white/40">{u.when}</span>
        </span>
        <span className="mt-0.5 block text-[14px] leading-snug text-white/55">{u.d}</span>
      </span>
      <Icon name="chevR" size={16} className="relative mt-1 shrink-0 text-white/30" />
    </button>
  );
}

// a news item's page, over the sheet (in the device frame, like the sheet): back returns to the sheet
function StoryPage({ u, onBack }: { u: Update; onBack: () => void }) {
  const r = u.story!;
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onBack(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onBack]);
  return (
    <motion.div role="dialog" aria-modal="true" aria-label={u.t} className="absolute inset-0 z-[60] flex flex-col bg-bg text-white"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.45 }}>
      <div className="min-h-0 flex-1 overflow-y-auto noscroll">
        <div className="mx-auto w-full max-w-[640px] lg:px-8 lg:pt-8">
          <div className="relative">
            <img src={r.image} alt="" className="h-[300px] w-full object-cover lg:h-[360px] lg:rounded-[28px]" />
            <div className="absolute inset-0 lg:rounded-[28px]" style={{ background: "linear-gradient(180deg, rgb(11 12 21 / .45), transparent 30%, transparent 60%, var(--color-bg))" }} />
            <div className="absolute left-5" style={{ top: "var(--top)" }}><RB icon="back" size={40} onClick={onBack} label="Back to notifications" /></div>
          </div>
          <div className="relative -mt-6 px-6 pb-8 lg:px-0">
            <div className="text-[13px] text-white/50">{r.kicker} · {u.when}</div>
            <h1 className="mt-2 text-[30px] font-normal leading-[1.08] tracking-[-.03em] lg:text-[36px]">{u.t}</h1>
            <div className="mt-4 space-y-3.5 text-[16px] leading-relaxed text-white/75">{r.body.map((b, i) => <p key={i}>{b}</p>)}</div>
            {r.gallery && (
              <div className="mt-6 grid grid-cols-2 gap-3">{r.gallery.map((g) => (
                <figure key={g.src}><img src={g.src} alt="" className="aspect-[4/5] w-full rounded-[18px] object-cover" /><figcaption className="mt-2 text-[13px] text-white/55">{g.caption}</figcaption></figure>
              ))}</div>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[640px] shrink-0 px-6 pt-3 lg:px-8" style={{ paddingBottom: "var(--bottom)" }}><Pill onClick={r.act}>{r.cta}</Pill></div>
    </motion.div>
  );
}

function UpdatesButton() {
  const read = useApp((s) => s.updatesRead) ?? [];
  const set = useApp((s) => s.set);
  const [open, setOpen] = useState(false);
  const [story, setStory] = useState<Update | null>(null);
  const close = () => { setStory(null); setOpen(false); };
  const list = useUpdates(close);
  const isUnread = (u: Update) => !read.includes(u.id);
  const unread = list.filter(isUnread).length;
  const markRead = (ids: string[]) => set({ updatesRead: Array.from(new Set([...useApp.getState().updatesRead ?? [], ...ids])) });
  const tap = (u: Update) => { markRead([u.id]); if (u.story) setStory(u); else u.go?.(); };
  // the story's page lives in the device frame, over the sheet (as the sheet does), while the sheet is open
  const frame = open && typeof document !== "undefined" ? document.querySelector(".device") ?? document.body : null;
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label={unread ? `Notifications, ${unread} new` : "Notifications"} className="bell-btn tap relative grid h-10 w-10 shrink-0 place-items-center rounded-full">
        <Icon name="bell" size={19} strokeWidth={1.8} />
        {unread > 0 && <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#687ef5] ring-2 ring-white" />}
      </button>
      <Sheet open={open} onClose={close}>
        <div className="mb-1 flex items-center gap-3">
          <h3 className="flex-1 text-[20px] font-normal tracking-[-.02em]">Notifications{unread > 0 && <span className="ml-2 align-middle text-[13px] text-white/45">{unread} new</span>}</h3>
          {unread > 0 && <button onClick={() => markRead(list.map((u) => u.id))} className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-[#a9b5fb] hover:bg-white/[.05]"><Icon name="check" size={14} strokeWidth={2.4} />Mark all as read</button>}
        </div>
        {/* a quiet feed: Today and Earlier, plain rows split by straight hairlines of their own (a row's rounded corners
            would bend a border at its ends; the hover's rounded background is a layer inside the row) */}
        <div className="-mx-2 max-h-[62dvh] overflow-y-auto noscroll">
          {list.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="iconbadge grid h-12 w-12 place-items-center rounded-[14px]"><Icon name="bell" size={20} /></span>
              <div className="mt-4 text-[16px] font-medium">You’re all caught up</div>
              <div className="mt-1 max-w-[240px] text-[14px] leading-snug text-white/55">When a pattern is ready or something new arrives, you’ll see it here.</div>
            </div>
          ) : ([true, false] as const).map((today) => {
            const rows = list.filter((u) => u.today === today);
            if (!rows.length) return null;
            return (
              <section key={String(today)} className="mt-2 first:mt-0">
                <h4 className="px-2 pb-1 pt-2 text-[13px] font-normal text-white/45">{today ? "Today" : "Earlier"}</h4>
                {rows.map((u, i) => (
                  <Fragment key={u.id}>
                    {i > 0 && <span aria-hidden className="mx-2 block h-px bg-white/[.07]" />}
                    <UpdateRow u={u} unread={isUnread(u)} onTap={() => tap(u)} />
                  </Fragment>
                ))}
              </section>
            );
          })}
        </div>
      </Sheet>
      {frame && createPortal(<AnimatePresence>{story && <StoryPage key={story.id} u={story} onBack={() => setStory(null)} />}</AnimatePresence>, frame)}
    </>
  );
}

// Home: the top keeps the Welcome sky (with a soft graph-paper grid fading down) and holds the one main job,
// starting a pattern, as two clear choices. Everything else sits below on the dark page.
export function Home() {
  const { go, user, bodies, patterns, newDraft, setDraft, startBody, set } = useApp();
  const name = user.guest ? "Guest" : user.name;
  const desk = useDesk();
  const make = () => { newDraft(); go("patSelectBody"); };
  return (
    <Screen noPad dock footer={desk ? undefined : <TabBar tab="home" />}>
      {/* the dark page sits behind the rounded corners, so nothing grey shows through */}
      <div className="bg-bg">
      <section className="home-hero light-hero relative px-5 pb-7 lg:px-12 lg:py-12">
        <div className="light-mat" aria-hidden />
        <div className="relative">
          {/* .home-hero already pads for the status bar (padding-top: var(--top)); never add a pt-* here, it would override that */}
          {/* kept quiet on purpose: the eye should land on the two cards, not up here */}
          <div className="mt-2 flex h-11 items-center gap-2.5 lg:mt-0">
            <button onClick={() => go("you")} aria-label="Your profile" className="tap rounded-full"><Avatar size={40} ring /></button>
            <div className="min-w-0 flex-1 leading-tight"><div className="text-[13px] text-[#5d6a99]">{greet()}</div><div className="truncate text-[15px] font-medium text-[#3f4c80]">{name}</div></div>
            <UpdatesButton />
          </div>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-12">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} className="h1 mt-8 !text-[34px] text-[#26335f] [text-wrap:balance] lg:mt-14 lg:!text-[60px]">What are we making today?</motion.h1>
              <p className="mt-2.5 max-w-[440px] text-[16px] leading-snug text-[#3f4c80] lg:text-[18px]">Design your own pattern, or start from one of ours.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-0 lg:gap-4">
              {/* the two ways to start (24 Oct 2026, chosen in the lab as "icon on the right"): the name, top-left, with the icon
                  at the right end of its row. Both names and both lines are broken by hand, so each takes two lines on every
                  screen (on a wide phone "Create a pattern" would otherwise fit on one) and the two cards always match */}
              <button onClick={make} className="pair-dark tap flex flex-col rounded-[24px] p-4 text-left text-white lg:min-h-[170px] lg:justify-between lg:p-6">
                <span className="flex items-start justify-between gap-2.5"><span className="min-w-0 pt-0.5 text-[16px] font-medium leading-tight lg:text-[20px]">Create a<br />pattern</span><span className="icon-primary grid h-8 w-8 shrink-0 place-items-center rounded-full lg:h-11 lg:w-11"><Icon name="pencil" size={15} strokeWidth={2} className="lg:h-5 lg:w-5" /></span></span>
                <span className="mt-2.5 block text-[14px] leading-snug text-white/70">From a photo,<br />sketch or words</span>
              </button>
              <button onClick={() => go("templates")} className="pair-dark tap flex flex-col rounded-[24px] p-4 text-left text-white lg:min-h-[170px] lg:justify-between lg:p-6">
                <span className="flex items-start justify-between gap-2.5"><span className="min-w-0 pt-0.5 text-[16px] font-medium leading-tight lg:text-[20px]">Start from<br />a pattern</span><span className="icon-primary grid h-8 w-8 shrink-0 place-items-center rounded-full lg:h-11 lg:w-11"><Icon name="dress" size={15} strokeWidth={2} className="lg:h-5 lg:w-5" /></span></span>
                <span className="mt-2.5 block text-[14px] leading-snug text-white/70">Pick a design,<br />fit it to you</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      </div>

      <div className="px-6 lg:px-0">
        <Notices />
        <div className="lg:mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-12">
          <div>
            <div className="mt-7"><SectionHead title="Your bodies" onAll={() => go("bodies")} /></div>
            <div className="noscroll -mx-6 mt-3 flex gap-2.5 overflow-x-auto px-6 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
              <button onClick={() => startBody()} aria-label="New body" className="tap grid h-[76px] w-[64px] shrink-0 place-items-center rounded-[20px] border border-dashed border-white/30 text-white/80 hover:border-white/60 lg:w-auto lg:grid-cols-[auto_auto] lg:justify-center lg:gap-2 lg:text-[15px] lg:font-medium">
                <Icon name="plus" size={22} /><span className="hidden lg:inline">New body</span>
              </button>
              {bodies.map((b) => (
                <button key={b.id} onClick={() => { set({ activeBody: b.id }); go("bodyPage"); }} className="card-soft tap flex h-[76px] shrink-0 items-center gap-3 rounded-[20px] pl-2 pr-4 text-left">
                  <span className="grid h-[60px] w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-primary/20"><BodyFigure sex={b.sex} width={20} glow={false} className="h-[52px] w-full" /></span>
                  <span className="min-w-0"><span className="block truncate text-[15px] font-medium">{b.name}</span><span className="block whitespace-nowrap text-[13px] text-white/55">{b.done.length} of 24 measurements</span></span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mt-7"><SectionHead title="Your patterns" onAll={() => go("patterns")} /></div>
            <div className="mt-2 flex flex-col">
              {patterns.slice(0, 3).map((p) => (
                <button key={p.id} onClick={() => go("pattern", { id: p.id })} className="tap flex items-center gap-3.5 border-b border-white/8 py-3 text-left last:border-0">
                  <span className="card-soft grid h-[52px] w-[48px] shrink-0 place-items-center rounded-[14px]"><Flat g={p.garment as GarmentKey} size={32} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[16px] font-medium">{p.name}</span><span className="block truncate text-[14px] text-white/55">{p.body}</span></span>
                  <span className="flex items-center gap-1.5 text-[14px] text-white/70"><span className={cx("h-2 w-2 rounded-full", STATUS_DOT[p.status])} />{p.status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => go("templates")} className="card-soft tap mt-5 flex w-full items-center gap-3 rounded-[22px] p-3 text-left lg:mt-8 lg:p-4">
          <div className="flex shrink-0 -space-x-3"><span className="grid h-12 w-11 place-items-center rounded-[14px] bg-[#2b3266]"><Flat g="slip" size={30} /></span><span className="grid h-12 w-11 place-items-center rounded-[14px] bg-[#343c63]"><Flat g="tee" size={30} /></span></div>
          <div className="flex-1"><div className="text-[16px] font-medium">Patterns to make</div><div className="text-[14px] text-white/55">10 patterns, ready to fit to a body</div></div>
          <Icon name="chevR" size={18} className="text-white/50" />
        </button>
        <div className="h-4" />
      </div>
    </Screen>
  );
}

// ─── Libraries: Edit lets you pick items and delete them. Picking is a quiet tick, deleting asks once. ───

// What a pattern's card says: where it stands, in words that help you decide what to do next.
export const specOf = (p: Pattern): NonNullable<Pattern["spec"]> => p.spec ?? SEED_PATTERNS.find((x) => x.id === p.id)?.spec ?? { ease: 4, drape: 0.6, seam: 1.5, printer: "A4" as const, metres: metresFor(p.garment, 4) };
export const statusLine = (p: Pattern) => {
  const sp = specOf(p);
  if (p.status === "Printed") return sp.printer === "A0" ? "Printed at a print shop" : `Printed on ${sp.sheets ?? 9} A4 sheets`;
  if (p.status === "Fitting") return "Ready to print";
  return "Draft, not finished yet";
};

// A finished (or in-progress) pattern, as a complete page you can come back to: the garment on the body,
// where it stands, and a shopping list you can show at the fabric shop.
export function PatternView({ p }: { p?: Record<string, unknown> }) {
  const { go, patterns, bodies, set, newDraft } = useApp();
  const pat = patterns.find((x) => x.id === p?.id) ?? patterns[0];
  const desk = useDesk();
  if (!pat) return null;
  const body = bodies.find((b) => b.name === pat.body);
  const sp: NonNullable<Pattern["spec"]> = pat.spec ?? SEED_PATTERNS.find((x) => x.id === pat.id)?.spec ?? { ease: 4, drape: 0.6, seam: 1.5, printer: "A4" as const, metres: metresFor(pat.garment, 4) };
  const tip = fabricAdvice(sp.ease);
  const stretch = sp.stretch ?? tip.stretch;
  const shop: [string, string][] = [
    ["Fabric to buy", `${sp.metres} metres, 140 cm wide`],
    ["On 115 cm fabric", `${metresAt(pat.garment, sp.ease, 115)} metres`],
    ["On 150 cm fabric", `${metresAt(pat.garment, sp.ease, 150)} metres`],
    ["Stretch", { "A lot": "Stretchy", "A bit": "A little stretch", No: "No stretch" }[stretch as "A lot" | "A bit" | "No"] ?? stretch],
    ...(sp.fabric ? [["Fabric you chose", sp.fabric] as [string, string]] : []),
  ];
  const made: [string, string][] = [
    ["Fit", `${fitName(sp.ease)}, +${sp.ease} cm of room`],
    ["Seam allowance", sp.seam ? `${sp.seam} cm, on every piece` : "Not added, add your own"],
    ["Pieces", String(pat.pieces)],
    ["Paper", sp.printer === "A0" ? "1 A0 sheet, print shop" : `${sp.sheets ?? 9} A4 sheets, at home`],
    ...(sp.details ?? []).slice(0, 4),
  ];
  const open = (to: string) => { if (body) set({ activeBody: body.id }); newDraft({ patternId: pat.id, garment: pat.garment, ease: sp.ease, seam: sp.seam, printer: sp.printer, drape: sp.drape, ...(sp.fabric ? { fabric: sp.fabric } : {}), ...(sp.stretch ? { stretch: sp.stretch as "No" | "A bit" | "A lot" } : {}), chosen: { fit: true, fabric: !!sp.fabric, stretch: !!sp.stretch }, details: sp.details, ...(sp.kind ? { kind: sp.kind } : {}), ...(sp.lengthCm ? { lengthCm: sp.lengthCm } : {}), ...(sp.neckCm ? { neckline: sp.neckCm, neckSet: true } : {}), ...(sp.layout ? { layout: { garment: pat.garment, printer: sp.printer, at: sp.layout } } : {}) }); go(to); };
  const list = (title: string, rows: [string, string][]) => (
    <div className="card-soft mt-3 rounded-[24px] px-5 pb-1 pt-4">
      <div className="text-[15px] font-medium text-white/85">{title}</div>
      <div className="mt-1 divide-y divide-white/8">{rows.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-4 py-3"><span className="text-[15px] text-white/60">{k}</span><span className="text-right text-[16px]">{v}</span></div>)}</div>
    </div>
  );
  return (
    <Screen footer={<div className="flex gap-3"><Pill variant="dark" className="flex-1" onClick={() => open("garment")}>Change the design</Pill><Pill className="flex-1" onClick={() => open("printMethod")}>{pat.status === "Printed" ? "Print again" : "Print it"}</Pill></div>}>
      <TopBar left="back" />
      <Split cols="lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" left={<>
        <div className="mt-2 flex items-center gap-2 text-[15px] text-white/70 lg:mt-0"><span className={cx("h-2 w-2 rounded-full", STATUS_DOT[pat.status])} />{pat.status === "Printed" ? "Printed" : pat.status === "Fitting" ? "Ready to print" : "Draft"} · drafted to {pat.body}</div>
        <H1 className="mt-2">{pat.name}</H1>
        <div className="relative mt-4 h-[min(300px,34dvh)] overflow-hidden rounded-[28px] py-4 lg:h-[min(560px,62dvh)] lg:rounded-[36px]">
          <Crown />
          <BodyFigure sex={body?.sex ?? "female"} width={desk ? 200 : 130} variant="solid" garment={pat.garment} spec={sp.details ? { kind: sp.kind ?? kindOf(pat.garment), details: sp.details, ease: sp.ease, lengthCm: sp.lengthCm, neckCm: sp.neckCm } : null} glow={false} className="relative h-full w-full" />
        </div>
      </>} right={<>
        {/* the pattern map: always in sight here, since it is what you need while taping the sheets together */}
        <button onClick={() => go("minimap", { id: pat.id })} className="card-soft tap mt-3 flex w-full items-center gap-4 rounded-[24px] p-3 pr-4 text-left lg:mt-0">
          <MapBoard garment={pat.garment} printer={sp.printer} at={sp.layout} labels={false} className="w-[84px] shrink-0 lg:w-[110px]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[17px]">Pattern map</span>
            <span className="mt-1 block text-[14px] leading-snug text-white/60">{sp.printer === "A0" ? "Where every piece sits on your A0 sheet" : `Where every piece sits on your ${sp.sheets ? `${sp.sheets} ` : ""}A4 sheets, and how to tape them`}</span>
          </span>
          <Icon name="chevR" size={18} className="shrink-0 text-white/40" />
        </button>
        {list("Shopping list", shop)}
        <p className="mt-2 px-1 text-[14px] leading-snug text-white/50">{tip.why}</p>
        {/* everything else the pattern needs: the fastening, interfacing for facings, thread */}
        <div className="card-soft mt-3 rounded-[24px] px-5 pb-3 pt-4">
          <div className="text-[15px] font-medium text-white/85">You will also need</div>
          <ul className="mt-2 flex flex-col gap-2">{notionsFor(sp.details ?? (pat.garment === "flutter" ? FLUTTER.read : []), piecesFor(pat.garment)).map((n) => <li key={n} className="flex items-start gap-2.5 text-[15px] leading-snug text-white/75"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-peri" />{n}</li>)}</ul>
        </div>
        {list("How it was made", made)}
      </>} />
    </Screen>
  );
}
