"use client";
// Lab (MC 3), "Add Venty to your home screen", round 4 (round 3 with Jose's notes), on paper: the title centred under the
// way back; the icons in a pressed track like the measuring ruler (IconTrack), with the ruler on its floor; "Select an
// icon" above; the steps as numbered picture cards to swipe that carry on by themselves (StepRow), the pager centred;
// Done, and Continue in my browser in words.
import { useState, type ReactNode } from "react";
import { cx, NextButton, RB, TextButton } from "@/components/ui";
import type { IconKey } from "./icons";
import { Phone } from "./parts";
import { Pic } from "./InstallArt";
import { IconTrack, type Tone } from "./IconTrack";
import { StepRow, type Step3 } from "./StepRow";
import { Today } from "./InstallLab";

type OS = "ios" | "android";

// Safari's four taps as it works today (iOS 26), each with the symbol you will tap
const STEPS: Step3[] = [
  { t: "Tap the three dots", d: "Beside the address, at the bottom of Safari", pic: "bar", g: "more" },
  { t: "Tap Share", d: "At the top of the menu", pic: "menu", g: "share" },
  { t: "Scroll down, tap Add to Home Screen", d: "Below the apps and contacts", pic: "share", g: "addhome" },
  { t: "Tap Add", d: "Leave Open as Web App on", pic: "add", g: "add" },
];

function Label({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return <p className={cx("text-center text-[15px]", tone === "paper" ? "text-[#12131c]/60" : "text-white/55", className)}>{children}</p>;
}

function Page({ tone, os, k, setK }: { tone: Tone; os: OS; k: IconKey | null; setK: (k: IconKey) => void }) {
  const paper = tone === "paper";
  const icon = k ?? "today";
  return (
    <div className={cx("absolute inset-0 flex flex-col", paper ? "paper" : "bg-bg text-white")}>
      {!paper && <div className="dotgrid" />}
      {/* the way back on its own row; the title under it, centred */}
      <div className="relative shrink-0 px-6" style={{ paddingTop: "var(--top)" }}>
        <div className="flex h-12 items-center"><RB icon="back" label="Back" className={paper ? "sec-dark" : undefined} /></div>
        <h1 className="h-serif mt-1.5 text-center !text-[30px] leading-[1.08]">Add Venty to<br />your home screen</h1>
      </div>
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 noscroll">
        <Label tone={tone} className="mt-5">Select an icon</Label>
        <div className="mt-3"><IconTrack k={k} setK={setK} tone={tone} /></div>
        <Label tone={tone} className="mt-6">{os === "ios" ? "Then add it in four taps" : "Then add it with Chrome"}</Label>
        <div className="mt-3">
          {os === "ios" ? <StepRow steps={STEPS} icon={icon} tone={tone} auto /> : (
            <>
              <div className={cx("rounded-[22px] p-1.5", paper ? "bg-[#12131c] shadow-[0_16px_30px_-18px_rgb(28_34_82/.7),0_2px_4px_rgb(18_19_28/.12)]" : "card-soft")}><Pic k="chromeInstall" w={paper ? 333 : 331} icon={icon} live className="!rounded-[16px] !border-white/[.06]" /></div>
              <p className={cx("mt-3 text-center text-[15px] leading-snug", paper ? "text-[#12131c]/60" : "text-white/60")}>Chrome asks you to confirm,<br />then Venty is on your home screen.</p>
            </>
          )}
        </div>
      </div>
      <div className="relative shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}>
        <div className="flex items-center gap-3"><NextButton ready={!!k} label={os === "ios" ? "Done" : "Add to home screen"} className="flex-1" /></div>
        {/* the quiet second choice: words only */}
        <TextButton tone={paper ? "paper" : "dark"} className="mt-1">Continue in my browser</TextButton>
      </div>
    </div>
  );
}

const OSES: { k: OS; name: string }[] = [{ k: "ios", name: "iPhone" }, { k: "android", name: "Android" }];

const NOTES = [
  "The title centred, under the way back on its own row.",
  "No names: the icons speak for themselves, and the page gets the room back.",
  "The ruler is back, inside the track on its floor: a long tick for every icon, moving as you drag, the centre marked as on the measuring dial.",
  "The icons fade towards the track's ends, like a carousel.",
  "The raised icon is smaller (64 px, from 76) with more room above and below it; the track's corner runs parallel to it.",
  "The gaps stay equal while one icon grows: each icon is placed from its neighbour's edge (16 px apart), not on a fixed grid.",
  "The steps are numbered again, 1 to 4, in the same inset tiles.",
  "Drag the steps whenever you like: they pause under your finger and, 4 seconds after you stop, carry on from where you left them.",
  "Continue in my browser, words only, under Done; the spacing above Done tightened.",
]

export function InstallLab3() {
  const tone: Tone = "paper";
  const [os, setOs] = useState<OS>("ios");
  const [k, setK] = useState<IconKey | null>(null);
  const [run, setRun] = useState(0); // starts the page again (nothing chosen, the steps playing)
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  return (
    <section>
      <h2 className="h1 !text-[34px]">Add Venty to your home screen, round 4</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">Paper, with your notes on round 3. The phone works: drag the icons, swipe the steps.</p>
      <div className="mt-6 flex max-w-[720px] flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">{pick(OSES, os, setOs)}
          <button onClick={() => { setK(null); setRun((r) => r + 1); }} className="h-10 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/75 hover:text-white">Start again</button>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        <Phone label="Round 4"><Page key={`${os}${run}`} tone={tone} os={os} k={k} setK={setK} /></Phone>
        <Phone label="Today"><Today os={os} /></Phone>
      </div>
      <p className="mt-10 text-[15px] text-white/50">What changed</p>
      <ol className="mt-3 max-w-[720px] list-decimal space-y-2 pl-5 text-[15px] leading-snug text-white/65">{NOTES.map((x) => <li key={x}>{x}</li>)}</ol>
    </section>
  );
}
