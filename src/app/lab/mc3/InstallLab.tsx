"use client";
// Lab (MC 3): "Add Venty to your home screen" (the install screen, InstallGuide in src/components/Install.tsx), refined.
// Today is the page as it is on a phone, built from its own steps and drawings (IOS, ANDROID), so it stays true to the app.
// The versions beside it are one page each: Safari's menus close when the page is touched, so a page per step cannot work
// (no Next between Safari's taps). Android is the case where Chrome can install (beforeinstallprompt).
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Crown, cx, HS, Lead, NextButton, Pill, RB } from "@/components/ui";
import { ICONS, type IconKey } from "./icons";
import { AppIcon, Phone } from "./parts";
import { Glyph, Pic, type PicKey } from "./InstallArt";

// the old page's steps (Install.tsx before 26 Oct 2026), kept here for these early rounds; their drawings are in git
const IOS: { t: string; d: string; art?: ReactNode }[] = [
  { t: "Tap the three dots", d: "Next to the web address, at the bottom of Safari." },
  { t: "Tap Share", d: "It is at the top of the menu that opens." },
  { t: "Scroll down, tap Add to Home Screen", d: "It sits below the apps and contacts." },
  { t: "Tap Add", d: "Venty is now on your home screen." },
];
const ANDROID: { t: string; d: string; art?: ReactNode }[] = [
  { t: "Open Chrome’s menu", d: "Tap ⋮ in the top right corner." },
  { t: "Tap Add to Home screen", d: "On some phones it says Install app." },
  { t: "Tap Install", d: "Venty is now on your home screen, ready to open like an app." },
];

type OS = "ios" | "android";
type V = "fitted" | "picture" | "first" | "result";

// the app's Screen on a phone: the back button pinned at the top, the words scrolling, the button pinned at the bottom
function PhoneScreen({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col text-white">
      <div className="dotgrid" />
      <div className="relative z-10 shrink-0 px-6" style={{ paddingTop: "var(--top)" }}><div className="flex h-12 items-center gap-3"><RB icon="back" label="Back" /></div></div>
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 noscroll"><div className="pb-5">{children}</div></div>
      <div className="relative z-20 shrink-0 px-6 pt-2" style={{ paddingBottom: "var(--bottom)" }}>{footer}</div>
    </div>
  );
}

// ─── Today: the steps on one page, numbered tiles joined by a thread, a drawing under each iPhone step ───
export function Today({ os }: { os: OS }) {
  const steps = os === "ios" ? IOS : ANDROID;
  return (
    <PhoneScreen footer={<div className="flex items-center gap-3 pb-1"><NextButton ready label="Done" className="flex-1" /></div>}>
      <HS className="mt-2 !text-[30px]">Add Venty to your home screen</HS>
      <Lead className="mt-2">{os === "ios" ? "Four taps" : "Three taps"}, then open it like an app.</Lead>
      <div className="mt-5">
        {os === "android" && <Pill className="mb-5" icon={<Icon name="addhome" size={20} />}>Add to home screen</Pill>}
        <ol className="relative flex flex-col gap-5">
          {steps.map((s, i) => (
            <li key={s.t} className="relative flex gap-4">
              {i < steps.length - 1 && <span className="absolute -bottom-5 left-[19px] top-11 w-px bg-white/10" aria-hidden />}
              <span className="iconbadge relative grid h-10 w-10 shrink-0 place-items-center rounded-[11px]"><span className="serif text-[18px] leading-none">{i + 1}</span></span>
              <div className="min-w-0 flex-1 pt-1.5">
                <div className="text-[18px] leading-tight">{s.t}</div>
                <p className="mt-1 text-[15px] leading-snug text-white/60">{s.d}</p>
                {s.art}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PhoneScreen>
  );
}

// ─── the refined pieces every version shares ───
// Safari's four taps as it works today (iOS 26): the words, the picture, and the symbol you will see
const STEPS: { t: string; d: string; pic: PicKey; g: "more" | "share" | "addhome" | "add" }[] = [
  { t: "Tap the three dots", d: "Beside the address, at the bottom of Safari", pic: "bar", g: "more" },
  { t: "Tap Share", d: "At the top of the menu", pic: "menu", g: "share" },
  { t: "Scroll down, tap Add to Home Screen", d: "Below the apps and contacts", pic: "share", g: "addhome" },
  { t: "Tap Add", d: "Leave Open as Web App on", pic: "add", g: "add" },
];
const CHROME = "Chrome asks you to confirm, then Venty is on your home screen.";

// the title, broken by hand so no word sits alone on a line
const Title = () => <HS className="mt-2 !text-[30px]">Add Venty to<br />your home screen</HS>;
const Label = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx("text-[15px] text-white/55", className)}>{children}</p>;
const Footer = ({ os, k }: { os: OS; k: IconKey | null }) => (
  <div className="flex items-center gap-3 pb-1"><NextButton ready={!!k} label={os === "ios" ? "Done" : "Add to home screen"} className="flex-1" /></div>
);

// the icons in one row that scrolls sideways, fading at its ends; nothing is chosen until you tap one
function IconStrip({ k, setK }: { k: IconKey | null; setK: (k: IconKey) => void }) {
  return (
    <div className="-mx-6 overflow-x-auto px-6 noscroll [mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)]">
      <div className="flex w-max gap-2" role="radiogroup" aria-label="Icon" data-need={k ? undefined : "1"}>
        {ICONS.map((x) => (
          <button key={x.k} role="radio" aria-checked={k === x.k} aria-label={x.name} onClick={() => setK(x.k)}
            className={cx("opt flex h-20 w-16 flex-col items-center gap-2 rounded-[18px] pt-3", k === x.k && "on")}>
            <AppIcon k={x.k} size={40} />
            {/* the ring under the icon, a tick once chosen (8px below the icon, so it never touches its corner) */}
            <span className={cx("radio !h-[14px] !w-[14px] !border", k === x.k && "icon-primary")}>{k === x.k && <Icon name="check" size={8} strokeWidth={3.5} />}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── A · Fitted: the icon strip, then the four steps as pictures two by two ───
function Fitted({ os, k, setK }: { os: OS; k: IconKey | null; setK: (k: IconKey) => void }) {
  return (
    <PhoneScreen footer={<Footer os={os} k={k} />}>
      <Title />
      <Label className="mt-5">Choose your icon</Label>
      <div className="mt-2.5"><IconStrip k={k} setK={setK} /></div>
      <Label className="mt-6">{os === "ios" ? "Then, in Safari" : "Then"}</Label>
      {os === "ios" ? (
        <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <Pic k={s.pic} w={166} icon={k ?? "today"} />
              <div className="mt-2 flex gap-2 text-[15px] leading-tight"><span className="serif w-3 shrink-0 text-peri">{i + 1}</span><span>{s.t}<span className="mt-1 block text-[13px] leading-snug text-white/50">{s.d}</span></span></div>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <Pic k="chromeInstall" w={345} icon={k ?? "today"} className="mt-3" />
          <p className="mt-3 text-[15px] leading-snug text-white/65">{CHROME}</p>
        </>
      )}
    </PhoneScreen>
  );
}

// ─── B · Big picture: one large picture of Safari over the steps; tap a step to see it ───
function Picture({ os, k, setK }: { os: OS; k: IconKey | null; setK: (k: IconKey) => void }) {
  const [at, setAt] = useState(0);
  return (
    <PhoneScreen footer={<Footer os={os} k={k} />}>
      <Title />
      <Label className="mt-5">Choose your icon</Label>
      <div className="mt-2.5"><IconStrip k={k} setK={setK} /></div>
      <Pic k={os === "ios" ? STEPS[at].pic : "chromeInstall"} w={345} icon={k ?? "today"} className="mt-5" />
      {os === "ios" ? (
        <ol className="mt-3 flex flex-col gap-0.5">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <button onClick={() => setAt(i)} aria-current={at === i} className={cx("flex h-10 w-full items-center gap-3 text-left text-[16px] transition-colors", at === i ? "text-white" : "text-white/45")}>
                <span className={cx("serif grid h-7 w-7 shrink-0 place-items-center rounded-[9px] text-[15px] leading-none", at === i ? "icon-primary" : "iconbadge")}>{i + 1}</span>
                <span className="truncate">{s.t}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : <p className="mt-3 text-[15px] leading-snug text-white/65">{CHROME}</p>}
    </PhoneScreen>
  );
}

// ─── C · Icon first: the icons as a grid, then the taps as four short lines with the symbol you will see ───
function First({ os, k, setK }: { os: OS; k: IconKey | null; setK: (k: IconKey) => void }) {
  return (
    <PhoneScreen footer={<Footer os={os} k={k} />}>
      <Title />
      <Label className="mt-5">First, choose your icon</Label>
      <div className="mt-2.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Icon" data-need={k ? undefined : "1"}>
        {ICONS.map((x) => (
          <button key={x.k} role="radio" aria-checked={k === x.k} aria-label={x.name} onClick={() => setK(x.k)}
            className={cx("opt flex flex-col items-center gap-1.5 rounded-[20px] pb-2.5 pt-3", k === x.k && "on")}>
            <AppIcon k={x.k} size={44} />
            <span className="text-[12px] leading-none">{x.name}</span>
            <span className={cx("radio absolute right-2 top-2 !h-4 !w-4 !border", k === x.k && "icon-primary")}>{k === x.k && <Icon name="check" size={9} strokeWidth={3.5} />}</span>
          </button>
        ))}
      </div>
      <Label className="mt-5">{os === "ios" ? "Then, in Safari" : "Then"}</Label>
      {os === "ios" ? (
        <ol className="mt-2.5 flex flex-col gap-2">
          {STEPS.map((s) => <li key={s.t} className="flex items-center gap-3 text-[16px] leading-tight"><Glyph k={s.g} /><span>{s.t}</span></li>)}
        </ol>
      ) : <p className="mt-2.5 text-[15px] leading-snug text-white/65">{CHROME}</p>}
    </PhoneScreen>
  );
}

// ─── D · Result first: a moment in the onboarding look. Crown above with Venty on a home screen, where you choose its
// icon (the chosen one takes the name, the others step back); the steps on paper below ───
function Result({ os, k, setK }: { os: OS; k: IconKey | null; setK: (k: IconKey) => void }) {
  return (
    <div className="paper absolute inset-0 flex flex-col">
      <div className="relative h-[46%] shrink-0 overflow-hidden rounded-b-[32px] text-white">
        <Crown />
        <div className="absolute inset-x-0 top-0 px-5" style={{ paddingTop: "var(--top)" }}><div className="flex h-12 items-center"><RB icon="back" label="Back" /></div></div>
        <div className="absolute inset-x-0 bottom-10">
          <p className="text-center text-[15px] text-white/80">Choose your icon</p>
          <div className="mt-4 overflow-x-auto px-6 noscroll [mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)]">
            <div className="mx-auto flex w-max gap-[18px]" role="radiogroup" aria-label="Icon" data-need={k ? undefined : "1"}>
              {ICONS.map((x) => (
                <button key={x.k} role="radio" aria-checked={k === x.k} aria-label={x.name} onClick={() => setK(x.k)}
                  className={cx("flex flex-col items-center gap-1.5 transition-opacity", k && k !== x.k && "opacity-45")}>
                  <AppIcon k={x.k} size={60} className="shadow-[0_8px_20px_-8px_rgb(0_0_0/.5)]" />
                  <span className={cx("h-[14px] text-[12px] leading-none", k === x.k ? "text-white" : "text-transparent")}>Venty</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 noscroll">
        <Title />
        {os === "ios" ? (
          <>
            <p className="lead mt-2">Then, in Safari:</p>
            <ol className="mt-3 flex flex-col gap-2">
              {STEPS.map((s) => <li key={s.t} className="flex items-center gap-3 text-[16px] leading-tight"><Glyph k={s.g} paper /><span>{s.t}</span></li>)}
            </ol>
          </>
        ) : <p className="lead mt-2">{CHROME}</p>}
      </div>
      <div className="shrink-0 px-6 pt-3" style={{ paddingBottom: "var(--bottom)" }}><Footer os={os} k={k} /></div>
    </div>
  );
}

const VERSIONS: { k: V; name: string; note: string }[] = [
  { k: "fitted", name: "A · Fitted", note: "One page that fits: your icon in a strip, then the four steps as pictures two by two, each named in one line." },
  { k: "picture", name: "B · Big picture", note: "One picture of Safari, big enough to read, over the four steps. Tap a step to see it; the last shows the icon you chose." },
  { k: "first", name: "C · Icon first", note: "The icons lead, as a grid with their names; then the taps as four short lines, each with the symbol you will see. No pictures." },
  { k: "result", name: "D · Result first", note: "A moment, in the onboarding look: Venty on a home screen in Crown, where you choose its icon; the steps on paper below." },
];
const OSES: { k: OS; name: string }[] = [{ k: "ios", name: "iPhone" }, { k: "android", name: "Android" }];

// what every version fixes
const FIXES = [
  "Fits an iPhone screen with nothing to scroll (393 × 852); today step 3 runs under Done and step 4 is out of sight.",
  "The title is broken by hand: Add Venty to / your home screen (today “screen” sits alone).",
  "You choose the icon first, as the iPhone keeps the icon it is added with. Nothing is chosen until you tap one, and the button stays faded until then.",
  "The pictures are the app's own: framed in the ink, quiet greys, and the thing to tap circled in periwinkle, never a white button (testers tap drawn buttons). Venty's real address, and the last picture shows your icon.",
  "Step 4 says to leave Open as Web App on, so Venty opens on its own and not as a page in Safari.",
  "Android, where Chrome can install: one button, Add to home screen, opening Chrome's own confirmation. No steps to read and no second primary button.",
];

export function InstallLab() {
  const [v, setV] = useState<V>("fitted");
  const [os, setOs] = useState<OS>("ios");
  const [k, setK] = useState<IconKey | null>(null);
  const pick = <K extends string>(list: { k: K; name: string }[], cur: K, set: (k: K) => void) => (
    <div className="flex flex-wrap gap-2">{list.map((x) => (
      <button key={x.k} onClick={() => set(x.k)} aria-pressed={cur === x.k} className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition-colors", cur === x.k ? "bg-white text-bg" : "border border-white/15 text-white/75 hover:text-white")}>{x.name}</button>
    ))}</div>
  );
  const props = { os, k, setK };
  return (
    <section>
      <h2 className="h1 !text-[34px]">Add Venty to your home screen, round 1</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">Reached from Before we begin (Yes, show me), the card on home and You, Settings; only in a phone browser. Each version works: choose an icon, tap the steps.</p>
      <div className="mt-6 flex max-w-[720px] flex-col gap-3">
        {pick(VERSIONS, v, setV)}
        {pick(OSES, os, setOs)}
        <p className="text-[15px] leading-snug text-white/65">{VERSIONS.find((x) => x.k === v)!.note}</p>
      </div>
      <div className="mt-8 grid justify-center gap-10 lg:grid-cols-2 lg:justify-items-center">
        <Phone label={VERSIONS.find((x) => x.k === v)!.name}>
          {v === "fitted" && <Fitted {...props} />}
          {v === "picture" && <Picture {...props} />}
          {v === "first" && <First {...props} />}
          {v === "result" && <Result {...props} />}
        </Phone>
        <Phone label="Today"><Today os={os} /></Phone>
      </div>
      <p className="mt-10 text-[15px] text-white/50">Fixed in every version</p>
      <ol className="mt-3 max-w-[720px] list-decimal space-y-2 pl-5 text-[15px] leading-snug text-white/65">{FIXES.map((x) => <li key={x}>{x}</li>)}</ol>
    </section>
  );
}
