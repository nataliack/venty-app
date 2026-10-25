"use client";
// Lab (MC 3), round 2 of "Add Venty to your home screen", from D (Result first): Crown above with the icons on an endless
// carousel (IconWheel), the steps on paper as pictures (StepCards). Three ways to fit the pictures, each beside Today.
import { useState, type ReactNode } from "react";
import { Crown, cx, NextButton, RB } from "@/components/ui";
import { ICONS, type IconKey } from "./icons";
import { AppIcon, Phone } from "./parts";
import { Pic } from "./InstallArt";
import { IconWheel } from "./IconWheel";
import { StepCards, type Step } from "./StepCards";
import { Today } from "./InstallLab";

type OS = "ios" | "android";
type V = "page" | "two" | "auto";

// Safari's four taps as it works today (iOS 26)
const STEPS: Step[] = [
  { t: "Tap the three dots", d: "Beside the address, at the bottom of Safari", pic: "bar" },
  { t: "Tap Share", d: "At the top of the menu", pic: "menu" },
  { t: "Scroll down, tap Add to Home Screen", d: "Below the apps and contacts", pic: "share" },
  { t: "Tap Add", d: "Leave Open as Web App on", pic: "add" },
];
const CHROME = "Chrome asks you to confirm, then Venty is on your home screen.";

// the Crown half: the way back, the words, and whatever sits on it
function Hero({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={cx("relative shrink-0 overflow-hidden rounded-b-[32px] text-white", className)}>
      <Crown live />
      <div className="relative flex h-full flex-col px-6" style={{ paddingTop: "var(--top)" }}>
        <div className="flex h-12 shrink-0 items-center"><RB icon="back" label="Back" /></div>
        {children}
      </div>
    </div>
  );
}
const Title = ({ children }: { children: ReactNode }) => <h1 className="h-serif mt-2 !text-[30px] leading-[1.1]">{children}</h1>;
const Foot = ({ children }: { children: ReactNode }) => <div className="shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}><div className="flex items-center gap-3 pb-1">{children}</div></div>;

// Chrome on Android: its own install, shown once with your icon
function ChromeCard({ icon }: { icon: IconKey }) {
  return (
    <>
      <div className="rounded-[22px] bg-[#12131c] p-1.5 shadow-[0_16px_30px_-18px_rgb(28_34_82/.7),0_2px_4px_rgb(18_19_28/.12)]"><Pic k="chromeInstall" w={333} icon={icon} className="!rounded-[16px] !border-white/[.06]" /></div>
      <p className="lead mt-3">{CHROME}</p>
    </>
  );
}

// ─── 1 · One page: the icons on Crown, the steps as cards to swipe on the paper ───
function OnePage({ os, k, setK, auto }: { os: OS; k: IconKey | null; setK: (k: IconKey) => void; auto?: boolean }) {
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <Hero className="h-[47%]">
        <Title>Add Venty to<br />your home screen</Title>
        <div className="flex flex-1 flex-col justify-center pb-5"><IconWheel k={k} setK={setK} className="-mx-6" /></div>
      </Hero>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pt-5 noscroll">
        {os === "ios" ? <><p className="lead">Then, in Safari</p><div className="mt-3"><StepCards steps={STEPS} icon={k ?? "today"} auto={auto} /></div></> : <ChromeCard icon={k ?? "today"} />}
      </div>
      <Foot><NextButton ready={!!k} label={os === "ios" ? "Done" : "Add to home screen"} className="flex-1" /></Foot>
    </div>
  );
}

// ─── 2 · Two screens: the icon on its own (the whole screen Crown, the carousel large), then the steps on paper ───
function ChooseScreen({ k, setK }: { k: IconKey | null; setK: (k: IconKey) => void }) {
  return (
    <div className="absolute inset-0 flex flex-col text-white">
      <Hero className="flex-1 !rounded-none">
        <Title>Choose your icon</Title>
        <p className="mt-2 text-[16px] leading-snug text-white/75">It goes on your home screen, with Venty under&nbsp;it.</p>
        <div className="flex flex-1 flex-col justify-center pb-10"><IconWheel k={k} setK={setK} size={120} step={104} side={0.55} className="-mx-6" /></div>
      </Hero>
      <div className="absolute inset-x-0 bottom-0"><Foot><NextButton ready={!!k} label="Continue" className="flex-1" /></Foot></div>
    </div>
  );
}
function StepsScreen({ k, os }: { k: IconKey | null; os: OS }) {
  const icon = k ?? "today";
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <div className="shrink-0 px-6" style={{ paddingTop: "var(--top)" }}><div className="flex h-12 items-center"><RB icon="back" label="Back" className="sec-dark" /></div></div>
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-6 pb-4 noscroll">
        <Title>{os === "ios" ? <>Now, four taps<br />in Safari</> : <>Now, add it<br />with Chrome</>}</Title>
        {/* the icon you chose, as it will look: information, so no button */}
        <div className="mt-4 flex items-center gap-3"><AppIcon k={icon} size={40} /><span className="text-[15px] leading-tight text-[#12131c]/60">Venty, with the {ICONS.find((x) => x.k === icon)!.name} icon</span></div>
        {os === "ios" ? (
          <ol className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <div className="rounded-[18px] bg-[#12131c] p-1 shadow-[0_12px_24px_-16px_rgb(28_34_82/.7),0_2px_4px_rgb(18_19_28/.12)]"><Pic k={s.pic} w={158} icon={icon} className="!rounded-[14px] !border-white/[.06]" /></div>
                <div className="mt-2.5 flex gap-2 text-[15px] leading-tight"><span className="serif w-3 shrink-0 text-primary">{i + 1}</span><span>{s.t}<span className="mt-1 block text-[13px] leading-snug text-[#12131c]/55">{s.d}</span></span></div>
              </li>
            ))}
          </ol>
        ) : <div className="mt-5"><ChromeCard icon={icon} /></div>}
      </div>
      <Foot>
        <RB icon="back" label="Back" size={56} className="sec-dark" />
        <NextButton ready label={os === "ios" ? "Done" : "Add to home screen"} className="flex-1" />
      </Foot>
    </div>
  );
}

const VERSIONS: { k: V; name: string; note: string }[] = [
  { k: "page", name: "1 · One page", note: "The icons on Crown, the centre one the choice; the four steps on paper as pictures you swipe, the next one showing at the edge. A knob in a pressed-in track follows the swipe; tap the track to jump." },
  { k: "two", name: "2 · Two screens", note: "Choosing the icon gets the whole screen and a bigger carousel, then Continue. The steps get the next screen and all four pictures fit at once, so nothing has to be swiped." },
  { k: "auto", name: "3 · Moves on by itself", note: "As 1, but the pictures move on every 4.5 seconds, the knob filling as it waits, and stop for good at the first touch. The onboarding testers felt rushed by pages that moved on alone, so this is the one to watch." },
];
const OSES: { k: OS; name: string }[] = [{ k: "ios", name: "iPhone" }, { k: "android", name: "Android" }];

// what changed from D, and the one decision to make
const NOTES = [
  "The carousel loops without end and never jumps: drag or flick it and it settles on the nearest icon, tap an icon beside the centre to bring it in, or use the arrow keys.",
  "The centre icon sits in a well pressed into Crown, with the app's 5px channel round it, and a ruler of ticks under it moves with it, like the measuring dial.",
  "To decide: a carousel always has an icon in the centre, so one looks chosen before you touch it (Today). To keep nothing chosen for you, the button stays faded until you move the carousel or tap an icon.",
  "The pictures are screenshots laid on the paper: the drawing in a dark bezel with a soft shadow. Every picture fits on the screen at once in 2; in 1 and 3, one at a time.",
  "Built from the app's own pieces: Crown, paper, the white knob and pressed-in track of the look switch, the dark secondary Back, the primary button.",
];

export function InstallLab2() {
  const [v, setV] = useState<V>("page");
  const [os, setOs] = useState<OS>("ios");
  const [k, setK] = useState<IconKey | null>(null);
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  return (
    <section>
      <h2 className="h1 !text-[34px]">Add Venty to your home screen, round 2</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">From D (Result first), with the pictures from A and B and the icons on an endless carousel. Each phone works.</p>
      <div className="mt-6 flex max-w-[720px] flex-col gap-3">
        {pick(VERSIONS, v, setV)}
        {pick(OSES, os, setOs)}
        <p className="text-[15px] leading-snug text-white/65">{VERSIONS.find((x) => x.k === v)!.note}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        {v === "two" ? (
          <>
            <Phone label="2 · Choose your icon"><ChooseScreen k={k} setK={setK} /></Phone>
            <Phone label="2 · Then the steps"><StepsScreen k={k} os={os} /></Phone>
          </>
        ) : <Phone label={VERSIONS.find((x) => x.k === v)!.name}><OnePage key={v} os={os} k={k} setK={setK} auto={v === "auto"} /></Phone>}
        <Phone label="Today"><Today os={os} /></Phone>
      </div>
      <p className="mt-10 text-[15px] text-white/50">What changed</p>
      <ol className="mt-3 max-w-[720px] list-decimal space-y-2 pl-5 text-[15px] leading-snug text-white/65">{NOTES.map((x) => <li key={x}>{x}</li>)}</ol>
    </section>
  );
}
