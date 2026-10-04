"use client";
// "Add Venty to your home screen". Android/Chrome can install for real (beforeinstallprompt); iPhone cannot be added by a
// website, so there we show the three taps. Never offered when Venty is already open from the home screen, or on desktop.
import { useEffect, useState } from "react";
import { Pill, Sheet, RB, useDesk } from "./ui";
import { Icon, type IconName } from "./icons";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: BIP | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as BIP; window.dispatchEvent(new Event("venty-installable")); });
  window.addEventListener("appinstalled", () => { deferred = null; });
}

export function useInstall() {
  const desk = useDesk();
  const [state, setState] = useState({ standalone: true, ios: false, prompt: false });
  useEffect(() => {
    const read = () => setState({
      standalone: document.documentElement.classList.contains("pwa"),
      ios: /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
      prompt: !!deferred,
    });
    read(); window.addEventListener("venty-installable", read);
    return () => window.removeEventListener("venty-installable", read);
  }, []);
  // worth offering only on a phone browser, where it can actually be added
  const offer = !desk && !state.standalone && (state.ios || state.prompt);
  return { ...state, offer };
}

export function InstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { ios, prompt } = useInstall();
  const install = async () => { if (!deferred) return; await deferred.prompt(); try { await deferred.userChoice; } catch {} deferred = null; onClose(); };
  const steps: [IconName, string, string][] = [
    ["share", "Tap Share", "In Safari, it’s the square with an arrow. On newer iPhones, tap ••• first."],
    ["addhome", "Tap Add to Home Screen", "Scroll down the list if you don’t see it."],
    ["check", "Tap Add", "Venty appears on your home screen, ready to open like an app."],
  ];
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="text-[24px] font-normal leading-tight tracking-[-.02em]">Add Venty to your home screen</h3><p className="mt-1.5 text-[15px] leading-snug text-white/65">Open it in one tap, full screen, like an app.</p></div>
        <RB icon="close" size={38} onClick={onClose} />
      </div>
      {prompt && !ios ? (
        <Pill className="mt-6" onClick={install} icon={<Icon name="addhome" size={20} />}>Add to home screen</Pill>
      ) : ios ? (
        <>
          <ol className="mt-5 flex flex-col gap-2">{steps.map(([ic, t, d], i) => (
            <li key={t} className="card-soft flex items-start gap-3.5 rounded-[20px] p-4">
              <span className="iconbadge grid h-11 w-11 shrink-0 place-items-center rounded-full"><Icon name={ic} size={21} strokeWidth={2} /></span>
              <span><span className="block text-[16px] font-medium"><span className="mr-1.5 text-white/50">{i + 1}.</span>{t}</span><span className="mt-0.5 block text-[14px] leading-snug text-white/60">{d}</span></span>
            </li>
          ))}</ol>
          <Pill className="mt-5" variant="white" onClick={onClose}>Got it</Pill>
        </>
      ) : (
        <>
          <p className="mt-5 text-[15px] leading-snug text-white/70">Open this page in Safari on iPhone, or Chrome on Android, to add it to your home screen.</p>
          <Pill className="mt-5" variant="white" onClick={onClose}>Got it</Pill>
        </>
      )}
    </Sheet>
  );
}
