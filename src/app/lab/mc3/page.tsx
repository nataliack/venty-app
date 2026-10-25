"use client";
// Lab (MC 3): choosing the app's home-screen icon. The icons themselves are in icons.ts (their PNGs in
// public/lab/mc3/icons, made by tools/lab-mc3-icons.mjs). Nothing here is used by the app.
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cx, HS, Lead, NextButton, RB } from "@/components/ui";
import { ICONS, type IconKey } from "./icons";

// the icon's PNG: 512 to look at, 180 for the iPhone's apple-touch-icon. Today is the app's own icon.
const png = (k: IconKey, size: 180 | 512 = 512) =>
  k === "today" ? (size === 180 ? "/apple-touch-icon.png" : "/icon-512.png") : `/lab/mc3/icons/${k}-${size}.png`;

// rounded like a home screen (iOS and Android round the square themselves; 22.37% is iOS's corner)
function AppIcon({ k, size, className }: { k: IconKey; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={png(k)} alt="" width={size} height={size} style={{ width: size, height: size }} className={cx("block shrink-0 rounded-[22.37%]", className)} />;
}

// ─── a phone at the iPhone's real size (393 × 852), a touch smaller on a narrow screen so it fits ───
function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3 max-[424px]:[zoom:.86]">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[55px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]">
        {children}
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}

// ─── the step in the app: the first page of "Add Venty to your home screen" ───
function ChooseStep({ k, setK }: { k: IconKey | null; setK: (k: IconKey) => void }) {
  return (
    <div className="flex h-full flex-col px-5 pb-[42px] pt-[62px] text-white">
      <div className="dotgrid" />
      <div className="relative flex h-12 items-center"><RB icon="back" label="Back" /></div>
      <HS className="relative mt-2 !text-[30px]">Choose your icon</HS>
      <Lead className="relative mt-2">It goes on your home screen, with Venty under it.</Lead>
      <div className="relative mt-6 grid grid-cols-3 gap-2.5" data-need={k ? undefined : "1"} role="radiogroup" aria-label="Icon">
        {ICONS.map((x) => (
          <button key={x.k} role="radio" aria-checked={k === x.k} aria-label={x.name} onClick={() => setK(x.k)}
            className={cx("opt flex flex-col items-center gap-2 rounded-[22px] pb-3 pt-4", k === x.k && "on")}>
            <AppIcon k={x.k} size={54} />
            <span className="text-[13px] leading-none">{x.name}</span>
            <span className={cx("radio absolute right-[7px] top-[7px] !h-[18px] !w-[18px]", k === x.k && "icon-primary")}>{k === x.k && <Icon name="check" size={10} strokeWidth={3} />}</span>
          </button>
        ))}
      </div>
      <p className="relative mt-5 flex gap-2.5 text-[14px] leading-snug text-white/55">
        <Icon name="info" size={17} className="mt-px shrink-0 text-peri" />
        To change it later, remove Venty from your home screen and add it again.
      </p>
      <div className="flex-1" />
      <NextButton ready={!!k} label="Continue" className="relative w-full" />
    </div>
  );
}

// ─── the home screen with the chosen icon among others (plain shapes, no other apps' names) ───
type Wall = "meadow" | "dark" | "light";
const WALLS: { k: Wall; name: string }[] = [{ k: "meadow", name: "Photo" }, { k: "dark", name: "Dark" }, { k: "light", name: "Light" }];
function HomeScreen({ k, wall }: { k: IconKey; wall: Wall }) {
  const light = wall === "light";
  const other = light ? "bg-[#131523]/[.09]" : "bg-white/[.16] backdrop-blur-md";
  const cell = (i: number) => i === 2
    ? <div key={i} className="flex flex-col items-center gap-1.5"><AppIcon k={k} size={62} /><span className={cx("text-[12px] leading-none", light ? "text-ink" : "text-white")}>Venty</span></div>
    : <div key={i} className="flex flex-col items-center gap-1.5"><span className={cx("h-[62px] w-[62px] rounded-[22.37%]", other)} /><span className={cx("h-[7px] w-9 rounded-full", light ? "bg-[#131523]/[.1]" : "bg-white/25")} /></div>;
  return (
    <div className={cx("relative h-full", wall === "dark" && "bg-bg", light && "bg-snow")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {wall === "meadow" && <img src="/tour/meadow-640.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className={cx("relative flex h-[54px] items-end justify-between px-[38px] pb-1.5 text-[16px] font-semibold", light ? "text-ink" : "text-white")}><span>9:41</span><span className="h-3 w-6 rounded-[4px] border-2 border-current opacity-80" /></div>
      <div className="relative mt-7 grid grid-cols-4 gap-x-[22px] gap-y-6 px-[27px]">{Array.from({ length: 12 }, (_, i) => cell(i))}</div>
      <div className={cx("absolute inset-x-3 bottom-3 flex h-[92px] items-center justify-around rounded-[40px] px-4", light ? "bg-[#131523]/[.06]" : "bg-white/[.14] backdrop-blur-xl")}>
        {Array.from({ length: 4 }, (_, i) => <span key={i} className={cx("h-[62px] w-[62px] rounded-[22.37%]", other)} />)}
      </div>
    </div>
  );
}

export default function LabMC3() {
  const [k, setK] = useState<IconKey | null>(null);
  const [wall, setWall] = useState<Wall>("meadow");
  const shown = k ?? "today";
  // the test: this page's iPhone icon follows the choice, so Share, Add to Home Screen shows (and keeps) the chosen one
  useEffect(() => {
    document.querySelectorAll<HTMLLinkElement>('link[rel="apple-touch-icon"]').forEach((l) => { l.href = png(shown, 180); });
  }, [shown]);
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K | null, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  return (
    // the app pins html and body (no page scroll), so the lab scrolls inside its own box
    <div className="fixed inset-0 overflow-y-auto bg-[#05060b] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        <p className="text-[14px] text-white/50">Venty lab · MC 3</p>
        <h2 className="h1 mt-6 !text-[34px]">App icon</h2>
        <div className="mt-4 max-w-[640px] space-y-3 text-[15px] leading-snug text-white/65">
          <p>A web app can offer a choice of icon, but only before it is added. On an iPhone the icon is saved when Venty is added to the home screen and stays as it is; the app has no way to swap it afterwards like a native app can. So the choice belongs in Add Venty to your home screen, and changing it later means removing Venty and adding it again.</p>
          <p>On Android, Chrome checks the app’s details about once a day and can update the icon, showing the person the change first. That needs the icon set from a server, and it is untested here.</p>
        </div>

        <p className="mt-10 text-[15px] text-white/50">The icons, big and at home-screen size</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ICONS.map((x) => (
            <button key={x.k} onClick={() => setK(x.k)} aria-pressed={k === x.k}
              className={cx("flex gap-4 rounded-[26px] border p-4 text-left transition-colors", k === x.k ? "border-white/60 bg-white/[.06]" : "border-white/10 hover:border-white/25")}>
              <AppIcon k={x.k} size={112} />
              <span className="min-w-0 flex-1">
                <span className="flex items-end justify-between gap-3"><span className="text-[17px]">{x.name}</span><AppIcon k={x.k} size={60} /></span>
                <span className="mt-2 block text-[14px] leading-snug text-white/60">{x.note}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-14 grid justify-center gap-10 lg:grid-cols-2 lg:justify-items-center">
          <div className="flex flex-col items-center gap-4">
            <p className="min-h-[44px] max-w-[393px] text-[15px] leading-snug text-white/65">In the app: the first page of Add Venty to your home screen. Nothing is chosen until you tap one.</p>
            <Phone label="Choose your icon"><ChooseStep k={k} setK={setK} /></Phone>
          </div>
          <div className="flex flex-col items-center gap-4">
            <p className="min-h-[44px] w-[393px] max-w-full text-[15px] leading-snug text-white/65">On the home screen{k ? "" : ", Today until you choose one"}. The wallpaper is under the phone.</p>
            <Phone label="Home screen"><HomeScreen k={shown} wall={wall} /></Phone>
            {pick(WALLS, wall, setWall)}
          </div>
        </div>

        <div className="mt-14 max-w-[640px] rounded-[26px] border border-white/10 p-5">
          <div className="flex items-center gap-4">
            <AppIcon k={shown} size={60} />
            <div><div className="text-[17px]">Try it on your iPhone</div><div className="text-[14px] text-white/55">This page’s icon is now {ICONS.find((x) => x.k === shown)!.name}.</div></div>
          </div>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[15px] leading-snug text-white/65">
            <li>Choose an icon above.</li>
            <li>In Safari, tap the three dots, then Share, then Add to Home Screen.</li>
            <li>The Add screen shows the icon it will use. Add it to see it on the home screen, then delete it (it opens the live app).</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
