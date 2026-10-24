"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, animate } from "motion/react";
import { useApp, type Pattern } from "@/lib/store";
import { fabricAdvice, fitName, metresFor, metresAt, notionsFor, kindOf, FLUTTER, SEED_PATTERNS, TEMPLATES, CATEGORIES, type GarmentKey } from "@/lib/data";
import { TplCard } from "./templates";
import { Screen, H1, Pill, Glow, Chip, RB, Sheet, TopBar, Split, Crown, Avatar, Segmented, cx, useDesk } from "@/components/ui";
import { BodyFigure, Flat } from "@/components/art";
import { useInstall } from "@/components/Install";
import { MapBoard } from "./print";
import { ArcCarousel } from "./auth";
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
function useCreateActions() {
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
// the lab). The tabs sit at fixed, even places: Home and You on the centres of the bar's top corners (BAR_R in), Bodies
// and Patterns 68px either side of the plus (the closest a 40px circle keeps 5px from the widened notch). The current
// tab's icon sits in a 40px circle pressed into the snow; on Home and You it shares its centre with the bar's corner,
// so it runs parallel to it. It glides from tab to tab (one layout id across the pages, which cross-fade in place).
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
const TAB_D = 40, TAB_TOP = 10, TAB_GAP = 68;
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
  const centres = [BAR_R, w / 2 - TAB_GAP, w / 2 + TAB_GAP, w - BAR_R];
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

// Notifications behind the bell: only things that matter to you (work waiting, patterns ready, what's new). No marketing.
function useUpdates() {
  const { bodies, patterns, resumeBody, set, go } = useApp();
  const unfinished = bodies.find((x) => x.id === resumeBody && x.done.length < 24);
  const ready = patterns.find((x) => x.status === "Fitting");
  const list: { icon: IconName; t: string; d: string; when: string; go?: () => void }[] = [];
  if (unfinished) list.push({ icon: "ruler", t: `Finish ${unfinished.name}’s measurements`, d: `${unfinished.done.length} of 24 saved. Pick up where you left off.`, when: "Today", go: () => { set({ activeBody: unfinished.id }); go("wizard"); } });
  if (ready) list.push({ icon: "printer", t: `${ready.name} is ready to print`, d: `Drafted to ${ready.body}. Lay it out on your sheets when you’re ready.`, when: "Today", go: () => go("pattern", { id: ready.id }) });
  list.push({ icon: "dress", t: "New patterns to make", d: "A wrap dress and wide-leg trousers were added to the library.", when: "Yesterday", go: () => go("templates") });
  list.push({ icon: "pencil", t: "New: sketch on your photos", d: "Add a photo and draw your changes on top of it.", when: "This week" });
  return list;
}

function UpdatesButton() {
  const seen = useApp((s) => s.updatesSeen);
  const set = useApp((s) => s.set);
  const [open, setOpen] = useState(false);
  const list = useUpdates();
  return (
    <>
      <button onClick={() => { setOpen(true); set({ updatesSeen: true }); }} aria-label={seen ? "Notifications" : "Notifications, new"} className="bell-btn tap relative grid h-10 w-10 shrink-0 place-items-center rounded-full">
        <Icon name="bell" size={19} strokeWidth={1.8} />
        {!seen && <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#687ef5] ring-2 ring-white" />}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h3 className="mb-2 text-[20px] font-normal tracking-[-.02em]">Notifications</h3>
        {/* a quiet feed, not a stack of buttons: plain rows split by hairlines. Rows that lead somewhere are still tappable. */}
        <div className="-mx-2 flex flex-col">{list.map((u, i) => {
          const body = <><span className="iconbadge grid h-9 w-9 shrink-0 place-items-center rounded-[11px]"><Icon name={u.icon} size={17} strokeWidth={1.9} /></span>
            <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-3"><span className="text-[16px]">{u.t}</span><span className="shrink-0 text-[13px] text-white/40">{u.when}</span></span><span className="mt-0.5 block text-[14px] leading-snug text-white/55">{u.d}</span></span></>;
          const row = cx("flex items-start gap-3.5 rounded-[16px] px-2 py-3.5 text-left", i > 0 && "border-t border-white/[.07]");
          return u.go
            ? <button key={u.t} onClick={() => { setOpen(false); u.go!(); }} className={cx(row, "transition-colors hover:bg-white/[.04]")}>{body}</button>
            : <div key={u.t} className={row}>{body}</div>;
        })}</div>
      </Sheet>
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
              <button onClick={make} className="pair-dark tap flex min-h-[128px] flex-col justify-between rounded-[24px] p-4 text-left text-white lg:min-h-[170px] lg:p-6">
                <span className="flex items-center justify-between"><span className="icon-primary grid h-11 w-11 place-items-center rounded-full"><Icon name="pencil" size={20} strokeWidth={2} /></span><Icon name="chevR" size={20} className="text-white/60" /></span>
                <span><span className="block text-[18px] font-medium leading-tight lg:text-[20px]">Create a pattern</span><span className="mt-1 block text-[14px] leading-snug text-white/70 [text-wrap:balance]">From a photo, sketch or words</span></span>
              </button>
              <button onClick={() => go("templates")} className="pair-dark tap flex min-h-[128px] flex-col justify-between rounded-[24px] p-4 text-left text-white lg:min-h-[170px] lg:p-6">
                <span className="flex items-center justify-between"><span className="icon-primary grid h-11 w-11 place-items-center rounded-full"><Icon name="dress" size={20} strokeWidth={2} /></span><Icon name="chevR" size={20} className="text-white/60" /></span>
                <span><span className="block text-[18px] font-medium leading-tight lg:text-[20px]">Start from a pattern</span><span className="mt-1 block text-[14px] leading-snug text-white/70 [text-wrap:balance]">Pick a design, fit it to you</span></span>
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
                <button key={b.id} onClick={() => { set({ activeBody: b.id }); go("preview"); }} className="card-soft tap flex h-[76px] shrink-0 items-center gap-3 rounded-[20px] pl-2 pr-4 text-left">
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
const Tick = ({ on }: { on: boolean }) => (
  <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors", on ? "border-white bg-white text-[#0b0c15]" : "border-white/40")}>{on && <Icon name="check" size={13} strokeWidth={3} />}</span>
);
function useEditing<T extends string>() {
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState<T[]>([]);
  const [ask, setAsk] = useState(false);
  const toggle = (id: T) => setSel((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const stop = () => { setEditing(false); setSel([]); setAsk(false); };
  return { editing, setEditing, sel, toggle, stop, ask, setAsk };
}
const EditButton = ({ editing, onClick }: { editing: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={cx("tap h-9 rounded-full px-4 text-[14px] font-medium transition-colors", editing ? "bg-white text-[#0b0c15]" : "border border-white/15 text-white/85 hover:border-white/30")}>{editing ? "Done" : "Edit"}</button>
);
// Library top: just the title, with Edit on the same line. While editing, one quiet line says what to do.
function LibraryHead({ title, editing, canEdit, onEdit }: { title: string; editing: boolean; canEdit: boolean; onEdit: () => void }) {
  return (
    <div className="pt-7 lg:pt-6">
      <div className="flex items-center justify-between gap-4">
        <H1 className="min-w-0">{title}</H1>
        {canEdit && <EditButton editing={editing} onClick={onEdit} />}
      </div>
      <p className={cx("text-[15px] text-white/55 transition-all", editing ? "mt-1.5 h-6 opacity-100" : "h-0 opacity-0")} aria-hidden={!editing}>Tap the ones you want to delete.</p>
    </div>
  );
}
function DeleteBar({ n, what, onDelete, onCancel }: { n: number; what: string; onDelete: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <Pill variant="dark" className="flex-1" onClick={onCancel}>Cancel</Pill>
      <Pill className="flex-1" disabled={n === 0} onClick={onDelete} icon={<Icon name="trash" size={18} />}>{n ? `Delete ${n}` : `Pick ${what}`}</Pill>
    </div>
  );
}
function ConfirmDelete({ open, n, one, many, onYes, onNo }: { open: boolean; n: number; one: string; many: string; onYes: () => void; onNo: () => void }) {
  return (
    <Sheet open={open} onClose={onNo}>
      <h3 className="text-[22px] font-normal">Delete {n === 1 ? `this ${one}` : `${n} ${many}`}?</h3>
      <p className="mt-2 text-[15px] text-white/60">This can’t be undone.</p>
      <Pill className="mt-5" onClick={onYes}>Delete</Pill>
      <Pill variant="dark" className="mt-2.5" onClick={onNo}>Keep {n === 1 ? "it" : "them"}</Pill>
    </Sheet>
  );
}

export function Bodies() {
  const { go, bodies, set, startBody, removeBodies } = useApp();
  const [q, setQ] = useState("");
  const ed = useEditing<string>();
  const list = bodies.filter((b) => !q.trim() || b.name.toLowerCase().includes(q.trim().toLowerCase()));
  const desk = useDesk();
  const footer = ed.editing ? <DeleteBar n={ed.sel.length} what="bodies" onDelete={() => ed.setAsk(true)} onCancel={ed.stop} /> : desk ? undefined : <TabBar tab="bodies" />;
  return (
    <Screen dock={!ed.editing} footer={footer}>
      <LibraryHead title="Body library" editing={ed.editing} canEdit={bodies.length > 0} onEdit={() => (ed.editing ? ed.stop() : ed.setEditing(true))} />
      <label className="field mt-4 flex h-12 items-center gap-2.5 px-4 lg:max-w-[420px]">
        <Icon name="search" size={18} className="shrink-0 text-white/50" />
        <input value={q} onChange={(e) => setQ(e.target.value)} type="text" enterKeyHint="search" placeholder="Search bodies" aria-label="Search bodies" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-white/40" />
        {q && <button onClick={() => setQ("")} aria-label="Clear search" className="grid h-7 w-7 place-items-center rounded-full bg-white/10"><Icon name="close" size={13} /></button>}
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-7 lg:grid-cols-4 lg:gap-5">
        {list.map((b, i) => {
          const on = ed.sel.includes(b.id);
          return (
            <Glow key={b.id} as="button" color="#4d5e85" variant="fade" onClick={() => (ed.editing ? ed.toggle(b.id) : (set({ activeBody: b.id }), go("preview")))} className={cx("relative h-[230px] rounded-[26px] p-4 transition-[box-shadow,opacity] lg:h-[320px] lg:p-5", ed.editing && !on && "opacity-70", on && "ring-2 ring-white")}>
              {b.done.length < 24 && !ed.editing && <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2 py-1 text-[11px] font-medium">Incomplete</span>}
              {ed.editing && <span className="absolute right-3 top-3"><Tick on={on} /></span>}
              <div className="flex h-[150px] justify-center lg:h-[230px]"><BodyFigure sex={b.sex} width={desk ? 90 : 62} variant="solid" glow={false} /></div>
              <div className="absolute bottom-4 left-4 right-4"><div className="text-[15px] font-medium">{b.name}</div><div className="text-[13px] text-white/65"><span className="serif text-[15px] text-white">{b.done.length}</span> of 24 measurements</div></div>
            </Glow>
          );
        })}
        {!ed.editing && !q && (
          <button onClick={() => startBody()} className="tap flex h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-white/25 lg:h-[320px]">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary"><Icon name="plus" size={24} /></span>
            <span className="mt-3 text-[15px] font-medium">New body</span><span className="text-[13px] text-white/50">4 measures to start</span>
          </button>
        )}
      </div>
      {q && list.length === 0 && <p className="mt-6 text-center text-[15px] text-white/55">No bodies called “{q.trim()}”.</p>}
      <ConfirmDelete open={ed.ask} n={ed.sel.length} one="body" many="bodies" onNo={() => ed.setAsk(false)} onYes={() => { removeBodies(ed.sel); ed.stop(); }} />
    </Screen>
  );
}

// What a pattern's card says: where it stands, in words that help you decide what to do next.
const specOf = (p: Pattern): NonNullable<Pattern["spec"]> => p.spec ?? SEED_PATTERNS.find((x) => x.id === p.id)?.spec ?? { ease: 4, drape: 0.6, seam: 1.5, printer: "A4" as const, metres: metresFor(p.garment, 4) };
const statusLine = (p: Pattern) => {
  const sp = specOf(p);
  if (p.status === "Printed") return sp.printer === "A0" ? "Printed at a print shop" : `Printed on ${sp.sheets ?? 9} A4 sheets`;
  if (p.status === "Fitting") return "Ready to print";
  return "Draft, not finished yet";
};

export function Patterns({ p }: { p?: Record<string, unknown> }) {
  const { go, patterns, removePatterns } = useApp();
  const [f, setF] = useState((p?.filter as string) ?? "All"); // the profile's Printed tile opens it filtered
  // your own patterns, or every pattern the app offers to make (the same ones as on home), filtered by kind
  const [view, setView] = useState(p?.view === "ready" ? "Patterns to make" : "Your patterns");
  const ready = view === "Patterns to make";
  const [cat, setCat] = useState("All");
  const ed = useEditing<string>();
  const list = patterns.filter((p) => f === "All" || (f === "Printed" ? p.status === "Printed" : p.status !== "Printed"));
  const desk = useDesk();
  const footer = ed.editing ? <DeleteBar n={ed.sel.length} what="patterns" onDelete={() => ed.setAsk(true)} onCancel={ed.stop} /> : desk ? undefined : <TabBar tab="patterns" />;
  return (
    <Screen dock={!ed.editing} footer={footer}>
      <LibraryHead title="Pattern library" editing={ed.editing} canEdit={!ready && patterns.length > 0} onEdit={() => (ed.editing ? ed.stop() : ed.setEditing(true))} />
      {!ed.editing && <div className="mt-4 lg:max-w-[420px]"><Segmented items={["Your patterns", "Patterns to make"]} value={view} onChange={setView} /></div>}
      {ready ? (
        <>
        <div className="noscroll mt-3 flex gap-5 overflow-x-auto border-b border-white/10 lg:max-w-[520px]">{["All", ...CATEGORIES].map((c) => <button key={c} onClick={() => setCat(c)} className={cx("relative shrink-0 pb-2.5 text-[15px] transition-colors", cat === c ? "text-white" : "text-white/50 hover:text-white/80")}>{c === "Pants" ? "Trousers" : c}{cat === c && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-white" />}</button>)}</div>
        <div className={cx("mt-4 grid gap-3", desk ? "grid-cols-4 gap-5" : "grid-cols-2")}>{TEMPLATES.filter((t) => cat === "All" || t.category === cat).map((t) => <TplCard key={t.key} t={t} desk={desk} onClick={() => go("template", { key: t.key })} />)}</div>
        </>
      ) : <>
      {patterns.length > 0 && <div className="mt-3 flex gap-5 border-b border-white/10 lg:max-w-[420px]">{["All", "In progress", "Printed"].map((c) => <button key={c} onClick={() => setF(c)} className={cx("relative pb-2.5 text-[15px] transition-colors", f === c ? "text-white" : "text-white/50 hover:text-white/80")}>{c}{f === c && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-white" />}</button>)}</div>}
      <div className="mt-4 flex flex-col gap-3 lg:mt-7 lg:grid lg:grid-cols-2 lg:gap-4">
        {list.map((p, i) => {
          const sp = specOf(p);
          const on = ed.sel.includes(p.id);
          return (
            <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}
              onClick={() => (ed.editing ? ed.toggle(p.id) : go("pattern", { id: p.id }))}
              className={cx("card-soft tap flex w-full items-stretch gap-4 rounded-[26px] p-2.5 pr-4 text-left transition-opacity", ed.editing && !on && "opacity-70", on && "!border-white")}>
              {/* the garment on a small Crown panel, like a swatch card */}
              <span className="violet-panel relative grid h-[116px] w-[96px] shrink-0 place-items-center overflow-hidden rounded-[20px] lg:h-[140px] lg:w-[118px]">
                <Flat g={p.garment as GarmentKey} size={desk ? 82 : 66} stroke="#fff" fill="rgba(255,255,255,.16)" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col py-1.5">
                <span className="flex items-center gap-1.5 text-[13px] text-white/70"><span className={cx("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[p.status])} />{statusLine(p)}</span>
                <span className="mt-1.5 block truncate text-[18px] leading-tight">{p.name}</span>
                <span className="mt-0.5 block truncate text-[14px] text-white/55">Drafted to {p.body}</span>
                <span className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[12px] text-white/75">{fitName(sp.ease)} fit</span>
                  <span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[12px] text-white/75"><span className="serif">{sp.metres}</span> m of fabric</span>
                </span>
              </span>
              <span className="grid place-items-center">{ed.editing ? <Tick on={on} /> : <Icon name="chevR" size={18} className="text-white/40" />}</span>
            </motion.button>
          );
        })}
      </div>
      {list.length === 0 && (patterns.length === 0 ? (
        <div className="mt-8 text-center">
          {/* the sign-up page's arc of looks: what you could make, drifting past */}
          <ArcCarousel />
          <p className="mt-6 text-[20px] tracking-[-.02em]">No patterns yet</p>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[15px] leading-snug text-white/60">Design your own, or start from one of the patterns to make.</p>
          <button onClick={() => setView("Patterns to make")} className="tap mt-3 h-11 rounded-full border border-white/20 px-5 text-[15px] font-medium hover:border-white/45">See the patterns to make</button>
        </div>
      ) : <p className="mt-8 text-center text-[15px] text-white/55">Nothing here yet.</p>)}
      </>}
      <ConfirmDelete open={ed.ask} n={ed.sel.length} one="pattern" many="patterns" onNo={() => ed.setAsk(false)} onYes={() => { removePatterns(ed.sel); ed.stop(); }} />
    </Screen>
  );
}

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
