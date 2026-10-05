"use client";
// "Add Venty to your home screen". Android/Chrome can install for real (beforeinstallprompt); iPhone cannot be added by a
// website, so there we show the three taps, all on one page. Only offered on a phone browser, never on desktop or when
// Venty is already open from the home screen.
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { Screen, TopBar, HS, Lead, Arrows, Pill, Split, cx, useDesk } from "./ui";
import { Icon } from "./icons";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: BIP | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as BIP; window.dispatchEvent(new Event("venty-installable")); });
  window.addEventListener("appinstalled", () => { deferred = null; });
}

export function useInstall() {
  const desk = useDesk();
  const [state, setState] = useState({ standalone: true, ios: false, android: false, prompt: false });
  useEffect(() => {
    const read = () => setState({
      standalone: document.documentElement.classList.contains("pwa"),
      ios: /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
      android: /Android/.test(navigator.userAgent),
      prompt: !!deferred,
    });
    read(); window.addEventListener("venty-installable", read);
    return () => window.removeEventListener("venty-installable", read);
  }, []);
  // worth offering only on a phone browser, where it can actually be added
  const offer = !desk && !state.standalone && (state.ios || state.prompt);
  return { ...state, offer };
}

// ─── little drawings of what you'll see, so each step is recognisable at a glance ───
const Hi = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cx("grid place-items-center rounded-full bg-white text-[#0b0c15] shadow-[0_0_0_5px_rgb(140_156_248_/_.35)]", className)}>{children}</span>
);
const Mock = ({ children }: { children: ReactNode }) => <div className="mt-2.5 overflow-hidden rounded-[16px] border border-white/10 bg-[#0d0f1c] p-2.5">{children}</div>;
const SafariBar = () => (
  <Mock>
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-white/60"><Icon name="back" size={16} /></span>
      <span className="flex h-9 min-w-0 flex-1 items-center justify-center rounded-full bg-white/8 px-3 text-[13px] text-white/55"><span className="truncate">app.venty.au</span></span>
      <Hi className="h-9 w-9"><Icon name="share" size={17} /></Hi>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-white/60"><Icon name="more" size={18} /></span>
    </div>
  </Mock>
);
const ShareMenu = () => (
  <Mock>
    <div className="flex flex-col text-[14px]">
      <div className="border-b border-white/[.07] px-1 pb-2 text-white/45">Add to Reading List</div>
      <div className="mt-1.5 flex items-center justify-between rounded-[10px] bg-white px-2.5 py-2 font-medium text-[#0b0c15] shadow-[0_0_0_5px_rgb(140_156_248_/_.35)]">Add to Home Screen<Icon name="addhome" size={17} /></div>
    </div>
  </Mock>
);
const AddBar = () => (
  <Mock>
    <div className="flex items-center justify-between text-[14px]">
      <span className="text-white/45">Cancel</span><span className="font-medium text-white/80">Add to Home Screen</span><Hi className="h-8 px-3.5 font-medium">Add</Hi>
    </div>
  </Mock>
);

const IOS: { t: string; d: string; art?: ReactNode }[] = [
  { t: "Tap Share", d: "The square with an arrow. If it’s hidden, tap ••• first.", art: <SafariBar /> },
  { t: "Tap Add to Home Screen", d: "Scroll down a little if you don’t see it.", art: <ShareMenu /> },
  { t: "Tap Add", d: "Venty is now on your home screen.", art: <AddBar /> },
];
const ANDROID: { t: string; d: string; art?: ReactNode }[] = [
  { t: "Open Chrome’s menu", d: "Tap ⋮ in the top right corner." },
  { t: "Tap Add to Home screen", d: "On some phones it says Install app." },
  { t: "Tap Install", d: "Venty is now on your home screen, ready to open like an app." },
];

// A page, not a pop-up: three short steps you can read at once. In the onboarding it sits between
// "Before we begin" and naming the body (p.then), elsewhere it simply goes back.
export function InstallGuide({ p }: { p?: Record<string, unknown> }) {
  const { go, back } = useApp();
  const { ios, android, prompt } = useInstall();
  const [os, setOs] = useState<"ios" | "android">("ios");
  useEffect(() => { if (android && !ios) setOs("android"); }, [android, ios]);
  const then = p?.then as string | undefined;
  const done = () => (then ? go(then) : back());
  const install = async () => { if (!deferred) return; await deferred.prompt(); try { await deferred.userChoice; } catch {} deferred = null; done(); };
  const steps = os === "ios" ? IOS : ANDROID;
  return (
    <Screen header={<TopBar left="back" />} footer={<Arrows ready onNext={done} label={then ? "Continue" : "Done"} />}>
      <Split left={<>
        <HS className="mt-2 !text-[30px] lg:mt-0 lg:!text-[48px]">Add Venty to your home screen</HS>
        <Lead className="mt-2">Three taps, then open it like an app.</Lead>
        {!ios && !android && (
          <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[.05] p-1" role="tablist">
            {([["ios", "iPhone"], ["android", "Android"]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={os === k} onClick={() => setOs(k)} className={cx("h-9 rounded-full px-4 text-[14px] font-medium", os === k ? "bg-white text-[#0b0c15]" : "text-white/65")}>{l}</button>
            ))}
          </div>
        )}
      </>} right={
        <div className="mt-5 lg:mt-0">
          {os === "android" && prompt && (
            <Pill className="mb-5" icon={<Icon name="addhome" size={20} />} onClick={install}>Add to home screen</Pill>
          )}
          <ol className="relative flex flex-col gap-5">
            {steps.map((s, i) => (
              <li key={s.t} className="relative flex gap-4">
                {/* a thin thread joining each step to the next */}
                {i < steps.length - 1 && <span className="absolute -bottom-5 left-[19px] top-11 w-px bg-white/10" aria-hidden />}
                <span className="iconbadge relative grid h-10 w-10 shrink-0 place-items-center rounded-full"><span className="serif text-[18px] leading-none">{i + 1}</span></span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="text-[18px] leading-tight">{s.t}</div>
                  <p className="mt-1 text-[15px] leading-snug text-white/60">{s.d}</p>
                  {s.art}
                </div>
              </li>
            ))}
          </ol>
        </div>} />
    </Screen>
  );
}
