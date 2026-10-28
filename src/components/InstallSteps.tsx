"use client";
// The steps on "Add Venty to your home screen" (chosen in the lab, /lab/mc3, 26 Oct 2026). Pictures of what you will see in
// Safari and Chrome, each drawn once at 300 × 170 and scaled to its place: pictures, not buttons (the onboarding found
// testers tapping drawn buttons). Light: a screen pressed into the page like the icon track, white menus and controls with
// neutral shadows, ink words, and the one thing to tap circled in primary. Laid out as Safari is on iOS 26 (from Jose's
// screenshots): the bar is three shapes (back, the address with its page and reload icons, the three dots), the menus list
// their icons on the left.
// StepRow lays Safari's four taps out as cards to swipe, each led by its number in an inset tile; the next card shows at
// the edge. The pager under it is a knob in a track pressed into the page that follows the swipe, stretching ahead to the
// next step and catching up behind it. On the card in view the thing to tap sends out a soft pulse (.pic-live in
// globals.css). It moves on by itself every few seconds (nothing counts down on screen); a finger on the row pauses it,
// and a few seconds after the finger stops it carries on from wherever it was left.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { Icon } from "./icons";
import { cx } from "./ui";
import { iconSrc, type IconKey } from "@/lib/appIcons";

const W = 300, H = 170;
const URL = "app.venty.au";
export type PicKey = "bar" | "menu" | "share" | "add" | "chromeMenu" | "chromeInstall";

// the frame, pressed into the page, scaled to `w` wide (or, with no `w`, to the width it is given). `live`: the thing to
// tap pulses (the card in view)
export function Pic({ k, w, icon, live, className }: { k: PicKey; w?: number; icon: IconKey; live?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(W);
  useEffect(() => {
    const el = ref.current; if (w || !el) return;
    const ro = new ResizeObserver(() => setFit(el.offsetWidth)); ro.observe(el); return () => ro.disconnect();
  }, [w]);
  const width = w ?? fit, s = width / W;
  return (
    <div ref={ref} className={cx("relative shrink-0 overflow-hidden rounded-[22px] border border-[#181e46]/[.06] bg-[#e1e7f6] text-[#12131c] shadow-[inset_0_3px_7px_rgb(24_30_70/.2),inset_0_1px_1.5px_rgb(24_30_70/.16),inset_0_-1px_0_rgb(255_255_255/.85)]", live && "pic-live", className)}
      style={{ width: w ?? "100%", height: H * s }} aria-hidden>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${s})` }}>{ART[k](icon)}</div>
    </div>
  );
}

// the thing to tap: a primary ring just outside it, with a soft glow
const tap = "tap-ring outline outline-2 outline-offset-[3px] outline-primary shadow-[0_0_18px_rgb(140_156_248/.55)]";
// white things raised off the pressed screen (Safari's controls, its menus and sheets)
const raised = "bg-white shadow-[0_4px_10px_-4px_rgb(24_30_70/.25),0_0_0_1px_rgb(24_30_70/.05)]";
const sheet = "bg-white shadow-[0_8px_20px_-8px_rgb(24_30_70/.28),0_0_0_1px_rgb(24_30_70/.05)]";
// the page behind, as faint lines, so the menus read as sitting over something
const Page = () => (
  <div className="absolute inset-x-5 top-5 flex flex-col gap-2.5 opacity-60">
    <span className="h-3 w-24 rounded-full bg-[#181e46]/10" /><span className="h-2 w-44 rounded-full bg-[#181e46]/[.06]" /><span className="h-2 w-36 rounded-full bg-[#181e46]/[.06]" />
  </div>
);
// a row of a menu or list: its icon on the left, then its words, as Safari has them
const Row = ({ children, on, icon }: { children: ReactNode; on?: boolean; icon: ReactNode }) => (
  <div className={cx("flex h-8 items-center gap-2.5 rounded-[10px] px-2.5 text-[12.5px]", on ? cx("bg-[#181e46]/[.07] font-medium", tap) : "text-[#12131c]/45")}>
    <span className="grid w-4 shrink-0 place-items-center">{icon}</span>{children}
  </div>
);
const Menu = ({ className, children }: { className: string; children: ReactNode }) => <div className={cx("absolute rounded-[16px] p-1.5", sheet, className)}>{children}</div>;
// Safari's page menu icon (a page above its lines), at the left of the address
const PageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="3.5" width="16" height="10" rx="2.5" /><path d="M4 18h16M4 21.5h9" /></svg>
);
const AppIcon = ({ k, size }: { k: IconKey; size: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={iconSrc(k, 180)} alt="" width={size} height={size} className="block shrink-0 rounded-[22.37%]" style={{ width: size, height: size }} />
);

const ART: Record<PicKey, (icon: IconKey) => ReactNode> = {
  // Safari's bar at the bottom, three shapes: back; the address with the page icon and reload; the three dots
  bar: () => (
    <>
      <Page />
      <div className="absolute inset-x-3 bottom-4 flex items-center gap-2">
        <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#12131c]/45", raised)}><Icon name="back" size={17} /></span>
        <span className={cx("flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-3 text-[#12131c]/45", raised)}>
          <PageIcon /><span className="min-w-0 flex-1 truncate text-center text-[13px] text-[#12131c]/75">{URL}</span><Icon name="refresh" size={15} />
        </span>
        <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-full", raised, tap)}><Icon name="more" size={18} /></span>
      </div>
    </>
  ),
  // the menu over the three dots: Share first, then the bookmarks, a line, New Tab
  menu: () => (
    <>
      <Page />
      <Menu className="bottom-3 right-3 w-[178px]">
        <Row on icon={<Icon name="share" size={14} />}>Share</Row>
        <Row icon={<Icon name="book" size={14} />}>Add to Bookmarks</Row>
        <Row icon={<Icon name="book" size={14} />}>Add Bookmark to…</Row>
        <div className="mx-2.5 my-1 h-px bg-[#181e46]/10" />
        <Row icon={<Icon name="plus" size={14} />}>New Tab</Row>
      </Menu>
    </>
  ),
  // the share sheet, scrolled down: the round actions above, then the list with Add to Home Screen
  share: () => (
    <div className={cx("absolute inset-x-3 bottom-0 top-3 rounded-t-[18px] px-2.5 pt-2.5", sheet)}>
      <div className="flex justify-around pb-2 opacity-50">
        {(["layers", "book", "eye", "chevD"] as const).map((n) => <span key={n} className="grid h-8 w-8 place-items-center rounded-full bg-[#181e46]/[.06] text-[#12131c]/45"><Icon name={n} size={14} /></span>)}
      </div>
      <div className="rounded-[12px] bg-[#181e46]/[.05] p-1">
        <Row icon={<Icon name="pencil" size={14} />}>Add to Quick Note</Row>
        <Row icon={<Icon name="search" size={14} />}>Find on Page</Row>
        <Row on icon={<Icon name="addhome" size={14} />}>Add to Home Screen</Row>
      </div>
    </div>
  ),
  // the last screen: close on the left, Add on the right; your icon with Venty and the address; Open as Web App on
  add: (icon) => (
    <div className={cx("absolute inset-x-3 bottom-0 top-3 rounded-t-[18px] px-3 pt-2.5", sheet)}>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#181e46]/[.06] text-[#12131c]/45"><Icon name="close" size={13} /></span>
        <span className="font-medium text-[#12131c]/75">Add to Home Screen</span>
        <span className={cx("rounded-full bg-[#181e46]/[.07] px-3 py-1 font-medium", tap)}>Add</span>
      </div>
      <div className="mt-2.5 flex items-center gap-3 rounded-[12px] bg-[#181e46]/[.05] p-2">
        <AppIcon k={icon} size={38} />
        <span className="min-w-0"><span className="block text-[14px] leading-tight">Venty</span><span className="block truncate text-[11px] text-[#12131c]/45">https://{URL}/</span></span>
      </div>
      <div className="mt-2 flex h-9 items-center justify-between rounded-[12px] bg-[#181e46]/[.05] px-3 text-[12.5px] leading-none text-[#12131c]/75">
        Open as Web App<span className="h-[18px] w-8 rounded-full bg-primary p-[2px]"><span className="ml-auto block h-[14px] w-[14px] rounded-full bg-white" /></span>
      </div>
    </div>
  ),
  // Chrome on Android: the address at the top and its menu
  chromeMenu: () => (
    <>
      <div className={cx("absolute inset-x-3 top-3 flex h-10 items-center gap-2 rounded-full pl-4 pr-1", raised)}>
        <span className="min-w-0 flex-1 truncate text-[13px] text-[#12131c]/45">{URL}</span>
        <span className={cx("grid h-8 w-8 place-items-center rounded-full bg-[#181e46]/[.07] text-[18px] leading-none", tap)}>⋮</span>
      </div>
      <Menu className="right-3 top-[60px] w-[180px]">
        <Row icon={<Icon name="plus" size={14} />}>New tab</Row>
        <Row on icon={<Icon name="addhome" size={14} />}>Add to Home screen</Row>
      </Menu>
    </>
  ),
  // Chrome's install dialog with your icon
  chromeInstall: (icon) => (
    <div className={cx("absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-[18px] p-3.5", sheet)}>
      <div className="text-[14px] font-medium">Install app</div>
      <div className="mt-2.5 flex items-center gap-3"><AppIcon k={icon} size={40} /><span><span className="block text-[14px]">Venty</span><span className="block text-[11px] text-[#12131c]/45">{URL}</span></span></div>
      <div className="mt-3 flex justify-end gap-4 text-[13px]"><span className="py-1 text-[#12131c]/45">Cancel</span><span className={cx("rounded-full bg-[#181e46]/[.07] px-3 py-1 font-medium", tap)}>Install</span></div>
    </div>
  ),
};

export type Step = { t: string; d: string; pic: PicKey };
const CARD = 300, GAP = 12, AUTO = 4500, RESUME = 4000;
// the pager: segments 34 wide; the knob is a segment less the 5px channel each side, the track its height plus 5 each side
const SEG = 34, CH = 5, KH = 12;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export function StepRow({ steps, icon }: { steps: Step[]; icon: IconKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0); // where the row is, in cards
  const still = useReducedMotion();
  const at = Math.round(f);
  // a finger on the row (or the row moving under it) pauses it until RESUME after the finger stops; moving on by itself
  // is marked, so its own scrolling never counts as a finger
  const until = useRef(0), holding = useRef(false), self = useRef(false);
  const [nudge, setNudge] = useState(0);
  const pause = () => { until.current = Date.now() + RESUME; setNudge((x) => x + 1); };
  // where each step comes to rest: its card's start, but never past the row's end (so the last card rests with its right
  // edge on the page's padding); and where the row is, in steps, read between those
  const stops = () => { const el = ref.current; const max = el ? el.scrollWidth - el.clientWidth : 0; return steps.map((_, n) => Math.min(n * (CARD + GAP), max)); };
  const read = (x: number) => {
    const st = stops(), c = Math.min(Math.max(x, 0), st[st.length - 1]);
    for (let n = 1; n < st.length; n++) if (c <= st[n]) return n - 1 + (st[n] > st[n - 1] ? (c - st[n - 1]) / (st[n] - st[n - 1]) : 1);
    return st.length - 1;
  };
  const go = (i: number) => {
    self.current = true; setTimeout(() => { self.current = false; }, 900);
    ref.current?.scrollTo({ left: stops()[i], behavior: still ? "auto" : "smooth" });
  };
  useEffect(() => {
    if (still) return;
    const t = setTimeout(() => {
      if (holding.current || Date.now() < until.current) { setNudge((x) => x + 1); return; }
      go((at + 1) % steps.length);
    }, Math.max(until.current - Date.now(), AUTO));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still, at, nudge]);
  // the caterpillar: between two steps the front of the knob gets there first, then the back follows
  // (held to the track: a pull past either end of the row stretches the row, never the knob out of its track)
  const fc = Math.min(steps.length - 1, Math.max(0, f));
  const i = Math.floor(fc), t = fc - i;
  const front = i + ease(clamp(t * 2)), back = i + ease(clamp(t * 2 - 1));
  return (
    <div>
      {/* the row runs to the screen's edges (on a computer, past the column, its ends fading); the last card comes to
          rest with its right edge on the page's padding */}
      <div ref={ref} onScroll={(e) => { setF(read(e.currentTarget.scrollLeft)); if (!self.current) pause(); }}
        onPointerDown={() => { holding.current = true; pause(); }} onPointerUp={() => { holding.current = false; pause(); }} onPointerCancel={() => { holding.current = false; pause(); }} onWheel={pause}
        className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pl-6 noscroll lg:[mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)]" style={{ scrollPaddingLeft: 24 }}>
        {steps.map((s, n) => (
          <figure key={s.t} className="shrink-0 snap-start" style={{ width: CARD }}>
            <Pic k={s.pic} w={CARD} icon={icon} live={n === at && !still} />
            <figcaption className="mt-3 flex items-start gap-3 pr-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#181e46]/[.06] text-[15px] font-medium leading-none tabular-nums text-[#12131c]/75 shadow-[inset_0_1px_2px_rgb(24_30_70/.12)]" aria-hidden>{n + 1}</span>
              <span className="pt-0.5 text-[16px] leading-tight">{s.t}<span className="mt-1 block text-[14px] leading-snug text-[#12131c]/55">{s.d}</span></span>
            </figcaption>
          </figure>
        ))}
        {/* the row's end: with the gap before it, the page's 24px padding, where the last card's right edge comes to rest */}
        <span className="w-3 shrink-0" aria-hidden />
      </div>
      <div className="relative mx-auto mt-4 rounded-full bg-[#181e46]/[.07] shadow-[inset_0_3px_7px_rgb(24_30_70/.2),inset_0_1px_1.5px_rgb(24_30_70/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)]"
        style={{ width: SEG * steps.length, height: KH + 2 * CH }} role="tablist" aria-label="Steps">
        <span className="pill-white absolute rounded-full" aria-hidden style={{ background: "#fff", left: CH + back * SEG, top: CH, width: SEG - 2 * CH + (front - back) * SEG, height: KH }} />
        {steps.map((s, n) => (
          <button key={s.t} role="tab" aria-selected={at === n} aria-label={s.t} onClick={() => { pause(); go(n); }}
            className="absolute top-0 h-full" style={{ left: n * SEG, width: SEG }} />
        ))}
      </div>
    </div>
  );
}
