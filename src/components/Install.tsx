"use client";
// "Add Venty to your home screen" (rebuilt from the lab, /lab/mc3, 26 Oct 2026). A moment, on cloud (since 28 Oct 2026;
// the whole page, so Safari's bars above and below take it too): the way back, the
// title centred, then "Select an icon" over the icons in the measuring dial's pressed track (IconTrack), then the steps.
// An iPhone cannot be added by a website (a page cannot open Safari's Add to Home Screen), so there the four taps are
// shown as pictures to swipe (StepRow) and the only button is "Continue in my browser". Android/Chrome installs for real
// (beforeinstallprompt), so there "Add to home screen" opens Chrome's own confirmation. The chosen icon is kept
// (appIcon) and set on the page (useAppIconLinks), so it is the one the phone takes. Only offered on a phone browser,
// never on desktop or when Venty is already open from the home screen.
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { iconSrc, type IconKey } from "@/lib/appIcons";
import { NextButton, RB, TextButton, useDesk } from "./ui";
import { IconTrack } from "./IconTrack";
import { Pic, StepRow, type Step } from "./InstallSteps";

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

// The chosen icon on the page: the iPhone takes its home-screen icon from apple-touch-icon when Venty is added (and keeps
// it), Android from the manifest (one per icon at /app-manifest/<key>). Called once, in App.
export function useAppIconLinks() {
  const k = useApp((s) => s.appIcon);
  useEffect(() => {
    if (!k) return;
    document.querySelectorAll<HTMLLinkElement>('link[rel="apple-touch-icon"]').forEach((l) => { l.href = iconSrc(k, 180); });
    const m = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (m) m.href = `/app-manifest/${k}`;
  }, [k]);
}

// Safari's four taps as it works today (iOS 26)
const IOS: Step[] = [
  { t: "Tap the three dots", d: "Beside the address, at the bottom of Safari", pic: "bar" },
  { t: "Tap Share", d: "At the top of the menu", pic: "menu" },
  { t: "Scroll down, tap Add to Home Screen", d: "Below the apps and contacts", pic: "share" },
  { t: "Tap Add", d: "Leave Open as Web App on", pic: "add" },
];

const Label = ({ children }: { children: ReactNode }) => <p className="text-center text-[15px] text-[#12131c]/60">{children}</p>;

// A page, not a pop-up. In the onboarding it sits between "Before we begin" and naming the body (p.then), elsewhere it
// simply goes back.
export function InstallGuide({ p }: { p?: Record<string, unknown> }) {
  const { go, back, appIcon, set } = useApp();
  const { ios, android, prompt } = useInstall();
  const os = android && !ios ? "android" : "ios";
  const then = p?.then as string | undefined;
  const done = () => (then ? go(then) : back());
  const install = async () => { if (!deferred) return; await deferred.prompt(); try { await deferred.userChoice; } catch {} deferred = null; done(); };
  const setK = (k: IconKey) => set({ appIcon: k });
  const icon = appIcon ?? "today";
  return (
    <div className="cloud absolute inset-0 flex flex-col items-center lg:justify-center">
      {/* one column: the phone's width, centred on a wider screen (and no taller than a tall phone there) */}
      <div className="flex h-full w-full max-w-[480px] flex-col lg:max-h-[900px]">
        <div className="shrink-0 px-6" style={{ paddingTop: "var(--top)" }}>
          <div className="flex h-12 items-center"><RB icon="back" label="Back" onClick={back} className="sec-dark" /></div>
          <h1 className="h-serif mt-1.5 text-center !text-[30px] leading-[1.08] lg:!text-[36px]">Add Venty to<br />your home screen</h1>
        </div>
        {/* the height to spare is shared evenly by the three gaps (above the icons, between the two parts, above the
            buttons), each keeping its least, so a taller phone gets even room, not a gap at the top or the bottom */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-6 noscroll">
          <div className="min-h-5 flex-1" />
          <Label>Select an icon</Label>
          <div className="mt-3"><IconTrack k={appIcon} setK={setK} /></div>
          <div className="min-h-6 flex-1" />
          {os === "ios" ? (
            <>
              <Label>Then follow these steps</Label>
              <div className="mt-3"><StepRow steps={IOS} icon={icon} /></div>
            </>
          ) : (
            <>
              <Label>{prompt ? "Then confirm it in Chrome" : "Then add it from Chrome’s menu"}</Label>
              <Pic k={prompt ? "chromeInstall" : "chromeMenu"} icon={icon} live className="mt-3" />
              <p className="mt-3 text-center text-[15px] leading-snug text-[#12131c]/60">
                {prompt ? <>Chrome asks you to confirm,<br />then Venty is on your home screen.</> : <>Tap ⋮ at the top of Chrome,<br />then Add to Home screen.</>}
              </p>
            </>
          )}
          <div className="min-h-6 flex-1" />
        </div>
        <div className="shrink-0 px-6" style={{ paddingBottom: "var(--bottom)" }}>
          {/* on Android, Chrome installs for real, so that is the primary; on an iPhone a page cannot open Safari's Add to
              Home Screen, so a Done would only repeat Continue in my browser, and there is none */}
          {os === "android" && prompt && <div className="mb-1 flex"><NextButton ready onClick={install} label="Add to home screen" className="flex-1" /></div>}
          <TextButton tone="paper" onClick={done}>Continue in my browser</TextButton>
        </div>
      </div>
    </div>
  );
}
