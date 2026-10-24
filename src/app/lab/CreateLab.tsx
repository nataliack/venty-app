"use client";
// Lab: the Create pop-up on the phone tab bar. Tapping the plus opens a snow card that grows out of the bar around the
// button: the card wraps the plus in a ring, and a channel (the "river") of one width, 5px, runs between the card and
// the bar all the way round, the bar's notch widening to make room. The page behind blurs and darkens; the bar stays.
// The plus turns into × in the dark secondary style.
//
// Geometry, all from one set of numbers so the channel is exactly G everywhere (y down, origin at the bar's top left):
// · the button: radius B, centred NOTCH_Y below the bar's top edge
// · closed: the bar's notch is the button plus the channel (B + G), its corners rounded with F where it meets the top edge
// · open: the card's bottom edge sits G above the bar; it wraps the button in a ring (B + G) and meets its bottom edge
//   with a concave curve of F + G; the bar's notch widens to B + 2G. The card's outline pushed out by G is then the
//   bar's outline exactly (same centres, every radius G larger or smaller), so the gap never changes and never closes
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import { Icon, type IconName } from "@/components/icons";
import { cx } from "@/components/ui";

const BAR_H = 80, BAR_R = 30, NOTCH_Y = 9, F = 9, B = 31, G = 5, CARD_R = 22;
const RING = B + G; // the card's ring round the button (and the closed notch)

// the bar: a rounded rectangle with the notch (radius n) cut into the top centre, its corners rounded with F
const barPath = (w: number, n: number) => {
  const c = w / 2, y = NOTCH_Y;
  return [`M ${BAR_R} 0`, `H ${c - n - F}`, `A ${F} ${F} 0 0 1 ${c - n} ${y}`, `A ${n} ${n} 0 0 0 ${c} ${y + n}`, `A ${n} ${n} 0 0 0 ${c + n} ${y}`,
    `A ${F} ${F} 0 0 1 ${c + n + F} 0`, `H ${w - BAR_R}`, `A ${BAR_R} ${BAR_R} 0 0 1 ${w} ${BAR_R}`, `V ${BAR_H - BAR_R}`, `A ${BAR_R} ${BAR_R} 0 0 1 ${w - BAR_R} ${BAR_H}`,
    `H ${BAR_R}`, `A ${BAR_R} ${BAR_R} 0 0 1 0 ${BAR_H - BAR_R}`, `V ${BAR_R}`, `A ${BAR_R} ${BAR_R} 0 0 1 ${BAR_R} 0`, "Z"].join(" ");
};
// the card: a rounded rectangle (w × h) whose bottom edge dips into a ring round the button, G + NOTCH_Y below it
const cardPath = (w: number, h: number) => {
  const c = w / 2, cy = h + G + NOTCH_Y, fc = F + G, d = RING + fc; // the concave curve's centre sits d from the button's
  return [`M ${CARD_R} 0`, `H ${w - CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 ${w} ${CARD_R}`, `V ${h - CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 ${w - CARD_R} ${h}`,
    `H ${c + d}`, `A ${fc} ${fc} 0 0 0 ${c + RING} ${cy}`, `A ${RING} ${RING} 0 0 1 ${c} ${cy + RING}`, `A ${RING} ${RING} 0 0 1 ${c - RING} ${cy}`,
    `A ${fc} ${fc} 0 0 0 ${c - d} ${h}`, `H ${CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 0 ${h - CARD_R}`, `V ${CARD_R}`, `A ${CARD_R} ${CARD_R} 0 0 1 ${CARD_R} 0`, "Z"].join(" ");
};

// a snow shape built like the white secondary: a soft white light inside the edge, a rim white along the top and a
// slightly deeper snow towards the bottom
function SnowShape({ id, d, h }: { id: string; d: string; h: number }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-rim`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={h}><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="rgb(19 21 35 / .06)" /><stop offset="1" stopColor="rgb(19 21 35 / .16)" /></linearGradient>
        <clipPath id={`${id}-clip`}><path d={d} /></clipPath>
        <filter id={`${id}-glow`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <path d={d} fill="var(--color-snow)" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="12" clipPath={`url(#${id}-clip)`} filter={`url(#${id}-glow)`} />
      <path d={d} fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1" />
    </>
  );
}

// a number that eases to its target (the notch's radius): the outline is redrawn from it each frame, which works in
// every browser (Safari cannot transition an SVG path in CSS, and motion cannot blend these path strings)
function useEased(target: number) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const c = animate(cur.current, target, { duration: 0.42, ease: [0.2, 0.8, 0.2, 1], onUpdate: (x) => { cur.current = x; setV(x); } });
    return () => c.stop();
  }, [target]);
  return v;
}

// the copy (a first draft, for Jose to edit): one short line each
const OPTIONS: [IconName, string, string][] = [
  ["pencil", "Create a pattern", "From a photo, sketch or words"],
  ["dress", "Start from a pattern", "Pick a design, fit it to you"],
  ["body", "Add a body", "Take your measurements"],
];

// the active tab. The shape sits 5px inside the bar on every side it meets (top, bottom, and the outer edge on Home
// and You), so its corners (25) run parallel to the bar's (30) with the app's 5px channel between them; it keeps at
// least 5px from the plus's notch too. It glides from tab to tab (a shared layout id), as it would from page to page
type A = "now" | "tint" | "pressed" | "raised" | "solid" | "itop" | "icircle" | "itile" | "iraised" | "idisc" | "iline" | "rcircle" | "rtile";
// the pressed-in tile, laid out on the river: the four tabs at fixed, even places (see riverTabs)
const RIVER: A[] = ["rcircle", "rtile"];
// the shapes that sit round the icon only (the label stays plain)
const ICON_ONLY: A[] = ["itop", "icircle", "itile", "iraised", "idisc", "iline"];
const ACTIVE: { k: A; name: string; note: string }[] = [
  { k: "now", name: "Today", note: "A small periwinkle capsule round the icon. Its corners have nothing to do with the bar's." },
  { k: "tint", name: "A · Channel tint", note: "A soft periwinkle tint, 5px inside the bar on every side it meets, its corners parallel to the bar's: the same channel as everywhere else." },
  { k: "pressed", name: "B · Pressed in", note: "The same shape pressed into the snow, like the inset icon tiles: a deeper shade along its top edge, a white lip below. The icon and label turn ink." },
  { k: "raised", name: "C · Raised", note: "The same shape raised off the bar like the white secondary buttons: a white line along the top, a slightly deeper snow at the bottom and a soft shadow." },
  { k: "solid", name: "D · Periwinkle", note: "The same shape in the periwinkle of the plus and home's icons, the icon and label white. The loudest: the current page is unmissable." },
  { k: "itop", name: "E · Icon, from the top", note: "Round the icon only: a soft periwinkle tint that starts 5px below the bar's top edge (its top corners parallel to the bar's on Home and You) and ends just under the icon. The label stays plain." },
  { k: "icircle", name: "F · Icon circle", note: "A soft periwinkle circle round the icon only. The quietest of the icon ones." },
  { k: "itile", name: "G · Icon pressed in", note: "A small rounded tile pressed into the snow round the icon, the same build as the inset icon tiles across the app." },
  { k: "iraised", name: "H · Icon raised", note: "A raised snow circle round the icon, built like the white secondary buttons: a white line along the top, a soft shadow under it." },
  { k: "idisc", name: "I · Icon periwinkle", note: "The icon in a periwinkle disc with a white icon, exactly like home's start-card icons and the plus. The label stays ink." },
  { k: "rcircle", name: "K · Pressed circle, on the river", note: "The pressed-in tile as a 50px circle, 5px below the bar's top edge. On Home and You it shares its centre with the bar's corner (25 inside 30), so the 5px channel runs round it exactly. The tabs sit at even places: the end ones on the corners' centres, the inner ones 70px from the plus, and each keeps 5px from the plus's notch, open or closed." },
  { k: "rtile", name: "L · Pressed tile, on the river", note: "The pressed-in rounded tile (16px corners), 50px and 5px below the bar's top edge. On Home and You its outer top corner opens to 25px, so it follows the bar's corner with the 5px channel. Same even places as K." },
  { k: "iline", name: "J · Line on top", note: "No shape: a short periwinkle line 5px below the bar's top edge, over the icon, and the icon and label in ink. The lightest touch." },
];
const PILL_W = 56;

// the card's words and options; its height is measured, so the card fits them
function CardBody({ onHeight }: { onHeight: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => onHeight(el.offsetHeight)); ro.observe(el); onHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [onHeight]);
  return (
    // .snow-card gives what sits inside the ink of a chosen card (the inset tiles pressed into the snow, the steel icons);
    // the snow itself is the SVG under it
    <div ref={ref} className="snow-card relative !bg-transparent px-5 pb-3 pt-5 text-[#131523]">
      <h3 className="text-center text-[22px] font-normal leading-tight tracking-[-.02em]">Create</h3>
      <p className="mt-1 text-center text-[15px] text-white/60">What would you like to start?</p>
      <div className="mt-3 divide-y divide-[rgb(19_21_35/.09)]">{OPTIONS.map(([ic, t, d]) => (
        <button key={t} className="tap flex w-full items-center gap-3.5 py-3.5 text-left">
          <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-[13px]"><Icon name={ic} size={21} strokeWidth={2} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[16px] font-medium leading-tight">{t}</span><span className="mt-0.5 block text-[14px] leading-snug text-white/60">{d}</span></span>
          <Icon name="chevR" size={18} className="shrink-0 text-white/40" />
        </button>
      ))}</div>
    </div>
  );
}

// the bar, the button and (when open) the card, laid out like the app's floating tab bar
function TabBarCreate({ w, open, setOpen, id, active, setActive, v }: { w: number; open: boolean; setOpen: (v: boolean) => void; id: string; active: string; setActive: (k: string) => void; v: A }) {
  const [h, setH] = useState(0);
  const notch = useEased(open ? B + 2 * G : RING);
  const items: [IconName, string][] = [["home", "Home"], ["body", "Bodies"], ["scissors", "Patterns"], ["user", "You"]];
  const tab = ([ic, l]: [IconName, string]) => {
    const on = active === l;
    const iconOnly = ICON_ONLY.includes(v);
    const shape = v === "now" || iconOnly ? null : <motion.span layoutId={`${id}-pill`} transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
      className={cx("tab-on absolute rounded-[25px]", `tab-on-${v}`)} style={{ top: G, bottom: G, left: `calc(50% - ${PILL_W / 2}px)`, width: PILL_W }} />;
    return (
      // tapping a tab goes to its page and closes the Create card
      <button key={l} onClick={() => { setOpen(false); setActive(l); }} aria-current={on ? "page" : undefined}
        className={cx("relative flex h-full flex-1 flex-col items-center justify-start gap-1 pt-[11px] text-[12px] transition-colors duration-300", on ? cx("font-semibold", v === "solid" ? "text-white" : "text-[#26335f]") : "font-medium text-[#26335f]/60")}>
        {on && shape}
        <span className="relative grid h-8 w-14 place-items-center">
          {on && v === "now" && <motion.span layoutId={`${id}-pill`} transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} className="absolute inset-0 rounded-full bg-[#687ef5]/25" />}
          {/* the icon's own shape, centred on the icon (the icon box is 56 × 32 and starts 11px below the bar's top edge) */}
          {on && iconOnly && <motion.span layoutId={`${id}-pill`} transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} className={cx("tab-on absolute", `tab-on-${v}`)} />}
          <Icon name={ic} size={22} strokeWidth={on ? 2.1 : 1.7} className={cx("relative", on && v === "idisc" && "text-white")} />
        </span>
        <span className="relative">{l}</span>
      </button>
    );
  };
  // K and L: the tabs at fixed places. The end ones sit on the centres of the bar's corners (BAR_R in from each end), the
  // inner ones 70px either side of the plus (the closest a 50px tile can be and keep 5px from the widened notch). Each
  // tab's tap area runs to the halfway point between its neighbours, and to the notch
  const river = RIVER.includes(v);
  const T = 50, centres = [BAR_R, w / 2 - 70, w / 2 + 70, w - BAR_R];
  const edges = [0, (centres[0] + centres[1]) / 2, w / 2 - RING - G, w / 2 + RING + G, (centres[2] + centres[3]) / 2, w];
  const spans = [[edges[0], edges[1]], [edges[1], edges[2]], [edges[3], edges[4]], [edges[4], edges[5]]];
  const radius = (i: number) => (v === "rcircle" ? "25px" : i === 0 ? "25px 16px 16px 16px" : i === 3 ? "16px 25px 16px 16px" : "16px");
  const riverTab = ([ic, l]: [IconName, string], i: number) => {
    const on = active === l, [a, b] = spans[i], c = centres[i] - a;
    return (
      <button key={l} onClick={() => { setOpen(false); setActive(l); }} aria-current={on ? "page" : undefined}
        className={cx("absolute top-0 h-full text-[12px] transition-colors duration-300", on ? "font-semibold text-[#26335f]" : "font-medium text-[#26335f]/60")} style={{ left: a, width: b - a }}>
        {on && <motion.span layoutId={`${id}-pill`} transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} className="tab-on tab-on-river absolute"
          style={{ left: c - T / 2, top: G, width: T, height: T, borderRadius: radius(i) }} />}
        <span className="absolute grid place-items-center" style={{ left: c - 14, top: G + T / 2 - 14, width: 28, height: 28 }}><Icon name={ic} size={22} strokeWidth={on ? 2.1 : 1.7} /></span>
        <span className="absolute -translate-x-1/2 whitespace-nowrap leading-none" style={{ left: c, top: G + T + 4 }}>{l}</span>
      </button>
    );
  };
  return (
    <div className="relative" style={{ width: w, height: BAR_H }}>
      <AnimatePresence>{open && (
        <motion.div key="card" className="absolute inset-x-0 z-10" style={{ bottom: BAR_H + G, transformOrigin: `50% calc(100% + ${G + NOTCH_Y}px)` }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 8 }} transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}>
          {h > 0 && (
            <svg width={w} height={h + G + NOTCH_Y + RING} className="pointer-events-none absolute left-0 top-0 overflow-visible" style={{ filter: "drop-shadow(0 1px 2px rgb(0 0 0 / .3)) drop-shadow(0 18px 28px rgb(0 0 0 / .45))" }} aria-hidden>
              <SnowShape id={`${id}-card`} d={cardPath(w, h)} h={h} />
            </svg>
          )}
          <CardBody onHeight={setH} />
        </motion.div>
      )}</AnimatePresence>
      {/* the bar is drawn over the card, so the card's shadow falls on the page but never on the bar */}
      <svg width={w} height={BAR_H} className="tabbar-shape pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden>
        <SnowShape id={`${id}-bar`} d={barPath(w, notch)} h={BAR_H} />
      </svg>
      {river
        ? <div className="tabbar relative z-20 h-full">{items.map(riverTab)}</div>
        : <div className="tabbar relative z-20 flex h-full items-stretch px-1.5">{tab(items[0])}{tab(items[1])}<span className="w-[84px] shrink-0" />{tab(items[2])}{tab(items[3])}</div>}
      {/* the plus: periwinkle closed; open, it turns 45° into × and fades into the dark secondary */}
      <button onClick={() => setOpen(!open)} aria-label={open ? "Close" : "Create"} aria-expanded={open}
        className="tap absolute left-1/2 z-30 grid -translate-x-1/2 place-items-center rounded-full text-white" style={{ top: NOTCH_Y - B, width: 2 * B, height: 2 * B }}>
        <span className={cx("createbtn absolute inset-0 rounded-full transition-opacity duration-300", open && "opacity-0")} />
        <span className={cx("sec-dark absolute inset-0 rounded-full transition-opacity duration-300", !open && "opacity-0")} />
        <motion.span className="relative grid place-items-center" animate={{ rotate: open ? 45 : 0 }} transition={{ type: "spring", bounce: 0.3, duration: 0.45 }}><Icon name="plus" size={26} strokeWidth={2.2} /></motion.span>
      </button>
    </div>
  );
}

function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative isolate h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">{children}</div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

// home behind the bar, so the blur and the dimming read as they would in the app
function HomeBehind() {
  return (
    <div className="absolute inset-0">
      <div className="dotgrid" />
      <section className="light-hero relative overflow-hidden rounded-b-[34px] px-5 pb-6 pt-12">
        <div className="light-mat" aria-hidden />
        <div className="relative">
          <div className="text-[13px] text-[#3f4c80]/80">Good evening</div><div className="text-[16px] font-medium text-[#26335f]">Ana</div>
          <h1 className="h1 mt-6 !text-[30px] text-[#26335f]">What are we making today?</h1>
          <div className="mt-5 grid grid-cols-2 gap-2.5">{["Design from scratch", "Start from a pattern"].map((t) => (
            <div key={t} className="card-soft rounded-[24px] p-4 text-white"><span className="icon-primary grid h-11 w-11 place-items-center rounded-full"><Icon name={t.startsWith("Design") ? "pencil" : "dress"} size={20} strokeWidth={2} /></span><div className="mt-4 text-[16px] font-medium leading-tight">{t}</div></div>
          ))}</div>
        </div>
      </section>
      <div className="px-5 pt-5 text-white">
        <div className="card-soft flex items-center gap-3.5 rounded-[22px] p-4"><span className="iconbadge grid h-11 w-11 place-items-center rounded-[13px]"><Icon name="ruler" size={20} strokeWidth={2} /></span><span className="text-[16px] font-medium">Continue finishing your measurements</span></div>
        <div className="mt-6 text-[19px]">Your bodies</div>
      </div>
    </div>
  );
}

function Screen({ start, id, v }: { start: boolean; id: string; v: A }) {
  const [open, setOpen] = useState(start);
  const [active, setActive] = useState("Home");
  return (
    <>
      <HomeBehind />
      {/* behind the card: the page blurs and darkens; the bar stays */}
      <AnimatePresence>{open && <motion.div key="dim" className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}</AnimatePresence>
      <div className="absolute inset-x-6 bottom-6 z-20"><TabBarCreate w={312} open={open} setOpen={setOpen} id={id} active={active} setActive={setActive} v={v} /></div>
    </>
  );
}

const CSS = `
@layer components {
.tab-on { z-index: 0; }
.tab-on-tint { background: rgb(104 126 245 / .16); }
.tab-on-pressed { background: rgb(52 62 110 / .07);
  box-shadow: inset 0 3px 7px rgb(28 36 84 / .2), inset 0 1px 1.5px rgb(28 36 84 / .2), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9); }
.tab-on-raised { background: var(--color-snow);
  box-shadow: inset 0 0 0 1px rgb(19 21 35 / .06), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(19 21 35 / .1), inset 0 0 12px 1px rgb(255 255 255 / .75), 0 1px 2px rgb(19 21 35 / .1), 0 6px 14px -6px rgb(19 21 35 / .22); }
/* round the icon only: positioned on the icon's 56 × 32 box (its top is 11px below the bar's top edge) */
.tab-on-itop { left: 0; right: 0; top: -6px; bottom: -6px; border-radius: 25px 25px 18px 18px; background: rgb(104 126 245 / .16); }
.tab-on-icircle { left: 8px; top: -4px; width: 40px; height: 40px; border-radius: 999px; background: rgb(104 126 245 / .18); }
.tab-on-itile { left: 6px; top: -3px; width: 44px; height: 38px; border-radius: 13px; background: rgb(52 62 110 / .07);
  box-shadow: inset 0 3px 7px rgb(28 36 84 / .22), inset 0 1px 1.5px rgb(28 36 84 / .22), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9); }
.tab-on-iraised { left: 8px; top: -4px; width: 40px; height: 40px; border-radius: 999px; background: var(--color-snow);
  box-shadow: inset 0 0 0 1px rgb(19 21 35 / .06), inset 0 1px 0 #fff, inset 0 -1px 0 rgb(19 21 35 / .1), inset 0 0 10px 1px rgb(255 255 255 / .75), 0 1px 2px rgb(19 21 35 / .12), 0 6px 12px -6px rgb(19 21 35 / .25); }
.tab-on-idisc { left: 8px; top: -4px; width: 40px; height: 40px; border-radius: 999px; background: linear-gradient(180deg, #7387f6, #687ef5 55%, #6479f2);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .35), inset 0 0 0 1px rgb(255 255 255 / .18), 0 6px 14px -6px rgb(104 126 245 / .7); }
/* K and L: pressed into the snow like the inset icon tiles; size, place and corners are set inline */
.tab-on-river { background: rgb(52 62 110 / .07);
  box-shadow: inset 0 3px 7px rgb(28 36 84 / .22), inset 0 1px 1.5px rgb(28 36 84 / .22), inset 0 -1px 0 rgb(255 255 255 / .9), 0 1px 0 rgb(255 255 255 / .9); }
.tab-on-iline { left: 18px; top: -6px; width: 20px; height: 3px; border-radius: 999px; background: var(--color-primary); }
.tab-on-solid { background: linear-gradient(180deg, #7387f6, #687ef5 55%, #6479f2);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .35), inset 0 0 0 1px rgb(255 255 255 / .18), 0 8px 18px -8px rgb(104 126 245 / .7); }
}`;

export function CreateLab() {
  const [v, setV] = useState<A>("rtile");
  return (
    <section>
      <style>{CSS}</style>
      <h2 className="h1 !text-[34px]">Create pop-up</h2>
      <p className="mt-3 max-w-[760px] text-[16px] leading-snug text-white/65">Tap the plus. A snow card grows out of the bar around it: the card wraps the plus in a ring, and one 5px channel runs between the card and the bar all the way round, the bar&apos;s notch widening to make room (closed, the same 5px channel runs round the plus). The page behind blurs and darkens; the bar stays. The plus turns into × in the dark secondary style. Tap it, or outside the card, to close.</p>
      <p className="mt-6 text-[15px] text-white/50">The active tab</p>
      <div className="mt-2 flex flex-wrap gap-2">{ACTIVE.map((x) => (
        <button key={x.k} onClick={() => setV(x.k)} aria-pressed={v === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", v === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
      ))}</div>
      <p className="mt-3 max-w-[760px] text-[15px] leading-snug text-white/65">{ACTIVE.find((x) => x.k === v)!.note} Tap the tabs: it glides from one to the next, as it would from page to page. With the card open, a tab closes it and goes to its page.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-12">
        <Phone label="Tap the plus, or a tab"><Screen start={false} id="cl-a" v={v} /></Phone>
        <Phone label="Open"><Screen start id="cl-b" v={v} /></Phone>
      </div>
    </section>
  );
}
