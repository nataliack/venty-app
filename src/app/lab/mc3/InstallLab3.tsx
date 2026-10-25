"use client";
// Lab (MC 3), round 3 of "Add Venty to your home screen", from round 2's 3 (Moves on by itself), with Jose's notes: no
// picture block at the top; the title top right; the icons in a pressed track like the measuring ruler (IconTrack) with
// their name in a pressed readout under it; "Select an icon" above; the steps led by inset icons (StepRow), the pager
// centred, and a new motion when it moves on. On paper (a moment) or on the night of the measuring screens.
import { useState, type ReactNode } from "react";
import { cx, NextButton, RB } from "@/components/ui";
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
      {/* the way back on the left; the title top right, set right, so the page below has the room */}
      <div className="relative flex shrink-0 items-start justify-between gap-4 px-6" style={{ paddingTop: "var(--top)" }}>
        <RB icon="back" label="Back" className={paper ? "sec-dark" : undefined} />
        <h1 className="h-serif mt-1 text-right !text-[30px] leading-[1.08]">Add Venty to<br />your home screen</h1>
      </div>
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 noscroll">
        <Label tone={tone} className="mt-7">Select an icon</Label>
        <div className="mt-3"><IconTrack k={k} setK={setK} tone={tone} /></div>
        <Label tone={tone} className="mt-7">{os === "ios" ? "Then add it in four taps" : "Then add it with Chrome"}</Label>
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
        <div className="flex items-center gap-3 pb-1"><NextButton ready={!!k} label={os === "ios" ? "Done" : "Add to home screen"} className="flex-1" /></div>
      </div>
    </div>
  );
}

const TONES: { k: Tone; name: string; note: string }[] = [
  { k: "paper", name: "Paper", note: "On paper, as the app's moments are; the tracks pressed into the paper like the pager you liked, the knob white." },
  { k: "night", name: "Night", note: "On the night of the measuring screens, so the icon track is the measuring ruler's own pressed track and knob." },
];
const OSES: { k: OS; name: string }[] = [{ k: "ios", name: "iPhone" }, { k: "android", name: "Android" }];

const NOTES = [
  "No picture block at the top: the title sits top right, set right, beside the way back, which gives the rest of the page the room.",
  "The icons slide in a track pressed into the page, like the measuring ruler: drag, flick or tap, endless, settling on the nearest. The raised icon has the app's 5px channel above and below it; the track's corner is its corner plus 5.",
  "Nothing looks chosen until you touch it: every icon sits pressed in at one size and the readout says Drag or tap an icon. Then the centre one rises out of the track and its name shows in the readout under it.",
  "“Select an icon” above the track; “Then add it in four taps” above the steps (Then, in Safari is gone).",
  "Each step is led by the symbol you will tap, in an inset tile like the app's icons, not a number.",
  "The pager is centred. Moving on by itself, nothing counts down: the knob stretches ahead to the next step and catches up, and on the card in view the thing to tap sends out a soft pulse. The first touch stops it for good.",
];

export function InstallLab3() {
  const [tone, setTone] = useState<Tone>("paper");
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
      <h2 className="h1 !text-[34px]">Add Venty to your home screen, round 3</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">From round 2’s 3 (Moves on by itself), with your notes. The phone works: drag the icons, swipe the steps.</p>
      <div className="mt-6 flex max-w-[720px] flex-col gap-3">
        {pick(TONES, tone, setTone)}
        <div className="flex flex-wrap items-center gap-2">{pick(OSES, os, setOs)}
          <button onClick={() => { setK(null); setRun((r) => r + 1); }} className="h-10 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/75 hover:text-white">Start again</button>
        </div>
        <p className="text-[15px] leading-snug text-white/65">{TONES.find((x) => x.k === tone)!.note}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        <Phone label={`Round 3 · ${TONES.find((x) => x.k === tone)!.name}`}><Page key={`${tone}${os}${run}`} tone={tone} os={os} k={k} setK={setK} /></Phone>
        <Phone label="Today"><Today os={os} /></Phone>
      </div>
      <p className="mt-10 text-[15px] text-white/50">What changed</p>
      <ol className="mt-3 max-w-[720px] list-decimal space-y-2 pl-5 text-[15px] leading-snug text-white/65">{NOTES.map((x) => <li key={x}>{x}</li>)}</ol>
    </section>
  );
}
