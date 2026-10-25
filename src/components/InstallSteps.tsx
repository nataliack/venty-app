"use client";
// The steps on "Add Venty to your home screen" (chosen in the lab, /lab/mc3, 26 Oct 2026). Pictures of what you will see in
// Safari and Chrome, each drawn once at 300 × 170 and scaled to its place: pictures, not buttons (the onboarding found
// testers tapping drawn buttons), a framed screen in the ink, quiet greys, and the one thing to tap circled in periwinkle.
// StepRow lays Safari's four taps out as cards to swipe, each led by its number in an inset tile; the next card shows at
// the edge. The pager under it is a knob in a track pressed into the paper that follows the swipe, stretching ahead to the
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

// the frame, scaled to `w` wide (or, with no `w`, to the width it is given). `live`: the thing to tap pulses (the card in
// view)
export function Pic({ k, w, icon, live, className }: { k: PicKey; w?: number; icon: IconKey; live?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(W);
  useEffect(() => {
    const el = ref.current; if (w || !el) return;
    const ro = new ResizeObserver(() => setFit(el.offsetWidth)); ro.observe(el); return () => ro.disconnect();
  }, [w]);
  const width = w ?? fit, s = width / W;
  return (
    <div ref={ref} className={cx("relative shrink-0 overflow-hidden rounded-[16px] border border-white/[.06] bg-ink", live && "pic-live", className)} style={{ width: w ?? "100%", height: H * s }} aria-hidden>
      <div className="absolute left-0 top-0 origin-top-left text-white" style={{ width: W, height: H, transform: `scale(${s})` }}>{ART[k](icon)}</div>
    </div>
  );
}
// the picture in a dark bezel, like a screenshot laid on the paper
export const Bezel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx("rounded-[22px] bg-[#12131c] p-1.5 shadow-[0_16px_30px_-18px_rgb(28_34_82/.7),0_2px_4px_rgb(18_19_28/.12)]", className)}>{children}</div>
);

// the thing to tap: a periwinkle ring just outside it, with a soft glow
const tap = "tap-ring outline outline-2 outline-offset-[3px] outline-peri shadow-[0_0_18px_rgb(140_156_248/.55)]";
// the page behind, as faint lines, so the menus read as sitting over something
const Page = () => (
  <div className="absolute inset-x-5 top-5 flex flex-col gap-2.5 opacity-60">
    <span className="h-3 w-24 rounded-full bg-white/10" /><span className="h-2 w-44 rounded-full bg-white/[.06]" /><span className="h-2 w-36 rounded-full bg-white/[.06]" />
  </div>
);
const Row = ({ children, on, icon }: { children: ReactNode; on?: boolean; icon?: ReactNode }) => (
  <div className={cx("flex h-9 items-center justify-between rounded-[11px] px-3 text-[13px]", on ? cx("bg-white/[.14] font-medium text-white", tap) : "text-white/45")}>{children}{icon}</div>
);
const Menu = ({ className, children }: { className: string; children: ReactNode }) => (
  <div className={cx("absolute rounded-[16px] bg-white/[.08] p-1.5 shadow-[0_10px_30px_rgb(0_0_0/.5)]", className)}>{children}</div>
);
const AppIcon = ({ k, size }: { k: IconKey; size: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={iconSrc(k, 180)} alt="" width={size} height={size} className="block shrink-0 rounded-[22.37%]" style={{ width: size, height: size }} />
);

const ART: Record<PicKey, (icon: IconKey) => ReactNode> = {
  // Safari's bar at the bottom: back, the address, and the three dots
  bar: () => (
    <>
      <Page />
      <div className="absolute inset-x-4 bottom-4 flex h-12 items-center gap-2 rounded-full bg-white/[.07] px-1.5">
        <span className="grid h-9 w-9 place-items-center rounded-full text-white/45"><Icon name="back" size={17} /></span>
        <span className="min-w-0 flex-1 truncate text-center text-[13px] text-white/45">{URL}</span>
        <span className={cx("grid h-9 w-9 place-items-center rounded-full bg-white/[.14]", tap)}><Icon name="more" size={18} /></span>
      </div>
    </>
  ),
  // the menu that opens from the three dots: Share at the top
  menu: () => (
    <>
      <Page />
      <Menu className="bottom-3 right-3 w-[176px]">
        <Row on icon={<Icon name="share" size={16} />}>Share</Row>
        <Row>Add to Bookmarks</Row>
        <Row>Find on Page</Row>
      </Menu>
    </>
  ),
  // the share sheet, scrolled down: Add to Home Screen
  share: () => (
    <div className="absolute inset-x-3 bottom-0 top-6 rounded-t-[18px] bg-white/[.08] p-2.5 shadow-[0_10px_30px_rgb(0_0_0/.5)]">
      <div className="flex justify-center gap-3 pb-2.5 opacity-50">{[0, 1, 2, 3].map((i) => <span key={i} className="h-9 w-9 rounded-full bg-white/10" />)}</div>
      <Row>Add to Reading List</Row>
      <Row on icon={<Icon name="addhome" size={16} />}>Add to Home Screen</Row>
    </div>
  ),
  // the last screen: your icon and its name, Open as Web App on, and Add
  add: (icon) => (
    <div className="absolute inset-x-3 bottom-0 top-3 rounded-t-[18px] bg-white/[.08] px-3 pt-2.5 shadow-[0_10px_30px_rgb(0_0_0/.5)]">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-white/45">Cancel</span><span className="font-medium text-white/75">Add to Home Screen</span>
        <span className={cx("rounded-full bg-white/[.14] px-3 py-1 font-medium", tap)}>Add</span>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-[12px] bg-white/[.06] p-2"><AppIcon k={icon} size={40} /><span className="text-[15px]">Venty</span></div>
      <div className="mt-2 flex h-9 items-center justify-between rounded-[12px] bg-white/[.06] px-3 text-[13px] leading-none text-white/75">
        Open as Web App<span className="h-[18px] w-8 rounded-full bg-primary p-[2px]"><span className="ml-auto block h-[14px] w-[14px] rounded-full bg-white" /></span>
      </div>
    </div>
  ),
  // Chrome on Android: the address at the top and its menu
  chromeMenu: () => (
    <>
      <div className="absolute inset-x-3 top-3 flex h-10 items-center gap-2 rounded-full bg-white/[.07] pl-4 pr-1">
        <span className="min-w-0 flex-1 truncate text-[13px] text-white/45">{URL}</span>
        <span className={cx("grid h-8 w-8 place-items-center rounded-full bg-white/[.14] text-[18px] leading-none", tap)}>⋮</span>
      </div>
      <Menu className="right-3 top-[60px] w-[180px]">
        <Row>New tab</Row>
        <Row on icon={<Icon name="addhome" size={16} />}>Add to Home screen</Row>
      </Menu>
    </>
  ),
  // Chrome's install dialog with your icon
  chromeInstall: (icon) => (
    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-[18px] bg-white/[.08] p-3.5 shadow-[0_10px_30px_rgb(0_0_0/.5)]">
      <div className="text-[14px] font-medium">Install app</div>
      <div className="mt-2.5 flex items-center gap-3"><AppIcon k={icon} size={40} /><span><span className="block text-[14px]">Venty</span><span className="block text-[11px] text-white/45">{URL}</span></span></div>
      <div className="mt-3 flex justify-end gap-4 text-[13px]"><span className="py-1 text-white/45">Cancel</span><span className={cx("rounded-full bg-white/[.14] px-3 py-1 font-medium", tap)}>Install</span></div>
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
  const go = (i: number) => {
    self.current = true; setTimeout(() => { self.current = false; }, 900);
    ref.current?.scrollTo({ left: i * (CARD + GAP), behavior: still ? "auto" : "smooth" });
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
  const i = Math.floor(f), t = f - i;
  const front = i + ease(clamp(t * 2)), back = i + ease(clamp(t * 2 - 1));
  return (
    <div>
      {/* the row runs to the screen's edges (on a computer, past the column, its ends fading); its end padding lets the
          last card come to rest where the first one sits */}
      <div ref={ref} onScroll={(e) => { setF(e.currentTarget.scrollLeft / (CARD + GAP)); if (!self.current) pause(); }}
        onPointerDown={() => { holding.current = true; pause(); }} onPointerUp={() => { holding.current = false; pause(); }} onPointerCancel={() => { holding.current = false; pause(); }} onWheel={pause}
        className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pl-6 noscroll lg:[mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)]" style={{ paddingRight: `calc(100% + 24px - ${CARD}px)`, scrollPaddingLeft: 24 }}>
        {steps.map((s, n) => (
          <figure key={s.t} className="shrink-0 snap-start" style={{ width: CARD }}>
            <Bezel><Pic k={s.pic} w={CARD - 12} icon={icon} live={n === at && !still} /></Bezel>
            <figcaption className="mt-3 flex items-start gap-3 pr-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#12131c]/[.06] text-[15px] font-medium leading-none tabular-nums text-[#12131c]/75 shadow-[inset_0_1px_2px_rgb(18_19_28/.12)]" aria-hidden>{n + 1}</span>
              <span className="pt-0.5 text-[16px] leading-tight">{s.t}<span className="mt-1 block text-[14px] leading-snug text-[#12131c]/55">{s.d}</span></span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="relative mx-auto mt-4 rounded-full bg-[#12131c]/[.07] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)]"
        style={{ width: SEG * steps.length, height: KH + 2 * CH }} role="tablist" aria-label="Steps">
        <span className="pill-white absolute rounded-full" aria-hidden style={{ left: CH + back * SEG, top: CH, width: SEG - 2 * CH + (front - back) * SEG, height: KH }} />
        {steps.map((s, n) => (
          <button key={s.t} role="tab" aria-selected={at === n} aria-label={s.t} onClick={() => { pause(); go(n); }}
            className="absolute top-0 h-full" style={{ left: n * SEG, width: SEG }} />
        ))}
      </div>
    </div>
  );
}
