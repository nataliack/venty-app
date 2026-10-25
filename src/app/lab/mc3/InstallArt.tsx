"use client";
// Lab (MC 3): pictures of what you will see in Safari and Chrome, for "Add Venty to your home screen". Each is drawn once
// at 300 × 170 and scaled to its place. They are pictures, not buttons (the onboarding found testers tapping drawn
// buttons): a framed screen, quiet tones, and the one thing to tap circled in periwinkle. Laid out as Safari is on iOS 26
// (from Jose's screenshots, 26 Oct 2026): the bar is three shapes (back, the address with its page and reload icons, the
// three dots), the menus list their icons on the left. Dark (the ink) or `light`: a screen pressed into the paper like
// the light track, with white menus and controls; the colours come from one palette, set on the frame.
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cx } from "@/components/ui";
import type { IconKey } from "./icons";
import { AppIcon } from "./parts";

const W = 300, H = 170;
const URL = "app.venty.au";
export type PicKey = "bar" | "menu" | "share" | "add" | "chromeMenu" | "chromeInstall";

// the palette: the screen (f), its rim (e), its own shade (i: pressed into the paper when light), fills (a, a2), Safari's
// controls (c) and their shadow (cs), the thing to tap (b), menus (m) and their shadow (s), words (t, t2), quiet words
// (d), the page's lines (l, l2) and the ring round the thing to tap (r)
const DARK = { f: "#131523", e: "rgb(255 255 255 / .1)", i: "none", a: "rgb(255 255 255 / .07)", a2: "rgb(255 255 255 / .06)", c: "rgb(255 255 255 / .07)", cs: "none",
  b: "rgb(255 255 255 / .14)", m: "rgb(255 255 255 / .08)", s: "0 10px 30px rgb(0 0 0 / .5)", t: "#fff", t2: "rgb(255 255 255 / .75)", d: "rgb(255 255 255 / .45)",
  l: "rgb(255 255 255 / .1)", l2: "rgb(255 255 255 / .06)", r: "#8c9cf8" };
const LIGHT = { f: "#e3e1dd", e: "rgb(18 19 28 / .06)", i: "inset 0 3px 7px rgb(18 19 28 / .2), inset 0 1px 1.5px rgb(18 19 28 / .16), inset 0 -1px 0 rgb(255 255 255 / .85)",
  a: "rgb(18 19 28 / .06)", a2: "rgb(18 19 28 / .05)", c: "#fff", cs: "0 4px 10px -4px rgb(18 19 28 / .25), 0 0 0 1px rgb(18 19 28 / .05)",
  b: "rgb(18 19 28 / .07)", m: "#fff", s: "0 8px 20px -8px rgb(18 19 28 / .28), 0 0 0 1px rgb(18 19 28 / .05)", t: "#12131c", t2: "rgb(18 19 28 / .75)",
  d: "rgb(18 19 28 / .45)", l: "rgb(18 19 28 / .1)", l2: "rgb(18 19 28 / .06)", r: "#687ef5" };

// the frame, scaled to `w` wide. `live`: the thing to tap sends out a soft pulse (the card in view)
export function Pic({ k, w, icon, className, live, light }: { k: PicKey; w: number; icon: IconKey; className?: string; live?: boolean; light?: boolean }) {
  const s = w / W, c = light ? LIGHT : DARK;
  const vars = Object.fromEntries(Object.entries(c).map(([n, v]) => [`--p${n}`, v])) as CSSProperties;
  return (
    <div className={cx("relative shrink-0 overflow-hidden rounded-[18px] border bg-[var(--pf)] [border-color:var(--pe)] [box-shadow:var(--pi)]", live && "pic-live", className)} style={{ width: w, height: H * s, ...vars }} aria-hidden>
      <div className="absolute left-0 top-0 origin-top-left text-[var(--pt)]" style={{ width: W, height: H, transform: `scale(${s})` }}>{ART[k](icon)}</div>
    </div>
  );
}

// the thing to tap: a periwinkle ring just outside it, with a soft glow
const tap = "tap-ring outline outline-2 outline-offset-[3px] [outline-color:var(--pr)] shadow-[0_0_18px_rgb(140_156_248/.55)]";
// the page behind, as faint lines, so the menus read as sitting over something
const Page = () => (
  <div className="absolute inset-x-5 top-5 flex flex-col gap-2.5 opacity-60">
    <span className="h-3 w-24 rounded-full bg-[var(--pl)]" /><span className="h-2 w-44 rounded-full bg-[var(--pl2)]" /><span className="h-2 w-36 rounded-full bg-[var(--pl2)]" />
  </div>
);
// a row of a menu or list: its icon on the left, then its words, as Safari has them
const Row = ({ children, on, icon }: { children: ReactNode; on?: boolean; icon: ReactNode }) => (
  <div className={cx("flex h-8 items-center gap-2.5 rounded-[10px] px-2.5 text-[12.5px]", on ? cx("bg-[var(--pb)] font-medium text-[var(--pt)]", tap) : "text-[var(--pd)]")}>
    <span className="grid w-4 shrink-0 place-items-center">{icon}</span>{children}
  </div>
);
const Menu = ({ className, children }: { className: string; children: ReactNode }) => (
  <div className={cx("absolute rounded-[16px] bg-[var(--pm)] p-1.5 [box-shadow:var(--ps)]", className)}>{children}</div>
);
// Safari's page menu icon (a page above its lines), at the left of the address
const PageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="3.5" width="16" height="10" rx="2.5" /><path d="M4 18h16M4 21.5h9" /></svg>
);
const Control = ({ className, children }: { className: string; children: ReactNode }) => (
  <span className={cx("grid place-items-center bg-[var(--pc)] [box-shadow:var(--pcs)]", className)}>{children}</span>
);

const ART: Record<PicKey, (icon: IconKey) => ReactNode> = {
  // Safari's bar at the bottom, three shapes: back; the address with the page icon and reload; the three dots
  bar: () => (
    <>
      <Page />
      <div className="absolute inset-x-3 bottom-4 flex items-center gap-2">
        <Control className="h-11 w-11 shrink-0 rounded-full text-[var(--pd)]"><Icon name="back" size={17} /></Control>
        <Control className="h-11 min-w-0 flex-1 !flex items-center gap-2 rounded-full px-3 text-[var(--pd)]">
          <PageIcon /><span className="min-w-0 flex-1 truncate text-center text-[13px] text-[var(--pt2)]">{URL}</span><Icon name="refresh" size={15} />
        </Control>
        <Control className={cx("h-11 w-11 shrink-0 rounded-full", tap)}><Icon name="more" size={18} /></Control>
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
        <div className="mx-2.5 my-1 h-px bg-[var(--pl)]" />
        <Row icon={<Icon name="plus" size={14} />}>New Tab</Row>
      </Menu>
    </>
  ),
  // the share sheet, scrolled down: the round actions above, then the list with Add to Home Screen
  share: () => (
    <div className="absolute inset-x-3 bottom-0 top-3 rounded-t-[18px] bg-[var(--pm)] px-2.5 pt-2.5 [box-shadow:var(--ps)]">
      <div className="flex justify-around pb-2 opacity-50">
        {(["layers", "book", "eye", "chevD"] as const).map((n) => <span key={n} className="grid h-8 w-8 place-items-center rounded-full bg-[var(--pa)] text-[var(--pd)]"><Icon name={n} size={14} /></span>)}
      </div>
      <div className="rounded-[12px] bg-[var(--pa2)] p-1">
        <Row icon={<Icon name="pencil" size={14} />}>Add to Quick Note</Row>
        <Row icon={<Icon name="search" size={14} />}>Find on Page</Row>
        <Row on icon={<Icon name="addhome" size={14} />}>Add to Home Screen</Row>
      </div>
    </div>
  ),
  // the last screen: close on the left, Add on the right; your icon with Venty and the address; Open as Web App on
  add: (icon) => (
    <div className="absolute inset-x-3 bottom-0 top-3 rounded-t-[18px] bg-[var(--pm)] px-3 pt-2.5 [box-shadow:var(--ps)]">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--pa)] text-[var(--pd)]"><Icon name="close" size={13} /></span>
        <span className="font-medium text-[var(--pt2)]">Add to Home Screen</span>
        <span className={cx("rounded-full bg-[var(--pb)] px-3 py-1 font-medium", tap)}>Add</span>
      </div>
      <div className="mt-2.5 flex items-center gap-3 rounded-[12px] bg-[var(--pa2)] p-2">
        <AppIcon k={icon} size={38} />
        <span className="min-w-0"><span className="block text-[14px] leading-tight">Venty</span><span className="block truncate text-[11px] text-[var(--pd)]">https://{URL}/</span></span>
      </div>
      <div className="mt-2 flex h-9 items-center justify-between rounded-[12px] bg-[var(--pa2)] px-3 text-[12.5px] leading-none text-[var(--pt2)]">
        Open as Web App<span className="h-[18px] w-8 rounded-full bg-primary p-[2px]"><span className="ml-auto block h-[14px] w-[14px] rounded-full bg-white" /></span>
      </div>
    </div>
  ),
  // Chrome on Android: the address at the top and its menu
  chromeMenu: () => (
    <>
      <div className="absolute inset-x-3 top-3 flex h-10 items-center gap-2 rounded-full bg-[var(--pc)] pl-4 pr-1 [box-shadow:var(--pcs)]">
        <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--pd)]">{URL}</span>
        <span className={cx("grid h-8 w-8 place-items-center rounded-full bg-[var(--pb)] text-[18px] leading-none", tap)}>⋮</span>
      </div>
      <Menu className="right-3 top-[60px] w-[180px]">
        <Row icon={<Icon name="plus" size={14} />}>New tab</Row>
        <Row on icon={<Icon name="addhome" size={14} />}>Add to Home screen</Row>
      </Menu>
    </>
  ),
  // Chrome's install dialog with your icon
  chromeInstall: (icon) => (
    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-[18px] bg-[var(--pm)] p-3.5 [box-shadow:var(--ps)]">
      <div className="text-[14px] font-medium">Install app</div>
      <div className="mt-2.5 flex items-center gap-3"><AppIcon k={icon} size={40} /><span><span className="block text-[14px]">Venty</span><span className="block text-[11px] text-[var(--pd)]">{URL}</span></span></div>
      <div className="mt-3 flex justify-end gap-4 text-[13px]"><span className="py-1 text-[var(--pd)]">Cancel</span><span className={cx("rounded-full bg-[var(--pb)] px-3 py-1 font-medium", tap)}>Install</span></div>
    </div>
  ),
};

// a symbol in a small inset tile, for steps written as one line (the dots, Share, Add to Home Screen, Add)
export function Glyph({ k, paper }: { k: "more" | "share" | "addhome" | "add" | "menu"; paper?: boolean }) {
  const tile = paper ? "bg-[#12131c]/[.06] text-[#12131c]/70 shadow-[inset_0_1px_2px_rgb(18_19_28/.12)]" : "iconbadge";
  return (
    <span className={cx("inline-grid h-8 w-8 shrink-0 place-items-center rounded-[10px] align-middle", tile)} aria-hidden>
      {k === "add" ? <span className="text-[11px] font-semibold">Add</span> : k === "menu" ? <span className="text-[16px] leading-none">⋮</span> : <Icon name={k} size={15} strokeWidth={2} />}
    </span>
  );
}
