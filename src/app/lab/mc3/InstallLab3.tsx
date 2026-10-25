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
import { StepRow, bezel, type Step3 } from "./StepRow";
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

function Page({ tone, os, k, setK, light }: { tone: Tone; os: OS; k: IconKey | null; setK: (k: IconKey) => void; light: boolean }) {
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
      {/* any height to spare is shared evenly by the three gaps (above the icons, between the two parts, above the bottom),
          each keeping its least: 20, 24 and 24 */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-6 noscroll">
        <div className="min-h-5 flex-1" />
        <Label tone={tone}>Select an icon</Label>
        <div className="mt-3"><IconTrack k={k} setK={setK} tone={tone} /></div>
        <div className="min-h-6 flex-1" />
        <Label tone={tone}>{os === "ios" ? "Then follow these steps" : "Then confirm it in Chrome"}</Label>
        <div className="mt-3">
          {os === "ios" ? <StepRow steps={STEPS} icon={icon} tone={tone} auto light={light} /> : (
            <>
              <div className={cx("rounded-[22px] p-1.5", bezel(paper, light))}><Pic k="chromeInstall" w={paper ? 333 : 331} icon={icon} light={light} live className="!rounded-[16px]" /></div>
              <p className={cx("mt-3 text-center text-[15px] leading-snug", paper ? "text-[#12131c]/60" : "text-white/60")}>Chrome asks you to confirm,<br />then Venty is on your home screen.</p>
            </>
          )}
        </div>
        <div className="min-h-6 flex-1" />
      </div>
      <div className="relative shrink-0 px-6" style={{ paddingBottom: "var(--bottom)" }}>
        {/* on Android, Chrome installs for real, so that is the primary; on an iPhone a page cannot open Safari's Add to Home
            Screen, so a Done would only repeat Continue in my browser, and it is left out */}
        {os === "android" && <div className="mb-1 flex items-center gap-3"><NextButton ready={!!k} label="Add to home screen" className="flex-1" /></div>}
        {/* the quiet second choice: words only */}
        <TextButton tone={paper ? "paper" : "dark"}>Continue in my browser</TextButton>
      </div>
    </div>
  );
}

const PICS: { k: "dark" | "light"; name: string }[] = [{ k: "dark", name: "Dark pictures" }, { k: "light", name: "Light pictures" }];
const OSES: { k: OS; name: string }[] = [{ k: "ios", name: "iPhone" }, { k: "android", name: "Android" }];

const NOTES = [
  "On an iPhone, Done is gone: a page cannot open Safari's Add to Home Screen, so Done would only do what Continue in my browser does. On Android, Add to home screen stays the primary, as Chrome installs for real.",
  "To check on your iPhone: Test the share sheet (above the phones) opens the share sheet a page is allowed to open. If Add to Home Screen is not in it, a button for it cannot exist.",
  "The icons: one rule, the bird the same size and in the same place on every one (today's, matched to the pixel). Today, Night (lifted only very faintly from below by one light centred under the icon, so there is no bright spot and no edge, with a touch of grain so it never bands), Primary (the landing page's favicon gradient, Haze), Snow, Pattern (the grid, the bird in steel), Pressed, Raised and Denim.",
]

export function InstallLab3() {
  const tone: Tone = "paper";
  const [os, setOs] = useState<OS>("ios");
  const [k, setK] = useState<IconKey | null>(null);
  const [pics, setPics] = useState<"dark" | "light">("dark");
  const [run, setRun] = useState(0); // starts the page again (nothing chosen, the steps playing)
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  return (
    <section>
      <h2 className="h1 !text-[34px]">Add Venty to your home screen, round 5</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">Paper, with your notes on round 4. The phone works: drag the icons, swipe the steps.</p>
      <div className="mt-6 flex max-w-[720px] flex-col gap-3">
        {pick(PICS, pics, setPics)}
        <div className="flex flex-wrap items-center gap-2">{pick(OSES, os, setOs)}
          <button onClick={() => { setK(null); setRun((r) => r + 1); }} className="h-10 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/75 hover:text-white">Start again</button>
          {/* a test for the iPhone: does the share sheet a page can open (the Web Share API) offer Add to Home Screen? */}
          <button onClick={() => { navigator.share?.({ title: "Venty", url: location.href }).catch(() => {}); }} className="h-10 rounded-full border border-white/15 px-4 text-[14px] font-medium text-white/75 hover:text-white">Test the share sheet</button>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
        <Phone label="Round 5"><Page key={`${os}${run}`} tone={tone} os={os} k={k} setK={setK} light={pics === "light"} /></Phone>
        <Phone label="Today"><Today os={os} /></Phone>
      </div>
      <p className="mt-10 text-[15px] text-white/50">What changed</p>
      <ol className="mt-3 max-w-[720px] list-decimal space-y-2 pl-5 text-[15px] leading-snug text-white/65">{NOTES.map((x) => <li key={x}>{x}</li>)}</ol>
    </section>
  );
}
