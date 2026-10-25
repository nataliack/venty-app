"use client";
// Lab (MC 3): "Add Venty to your home screen" (the install screen, InstallGuide in src/components/Install.tsx), to refine.
// Today is the page as it is on a phone, built from its own steps and drawings (IOS, ANDROID), so it stays true to the app.
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { HS, Lead, NextButton, Pill, RB } from "@/components/ui";
import { IOS, ANDROID } from "@/components/Install";
import { Phone } from "./parts";

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
function Today({ os }: { os: "ios" | "android" }) {
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

// what the page does wrong today, seen at 393 × 852
const ISSUES = [
  "On an iPhone the four steps do not fit: step 3's drawing runs under Done and step 4 is out of sight (165 px to scroll). The iPhone is the main case.",
  "The title breaks as “Add Venty to your home / screen”, one word alone on the second line.",
  "Android shows two primary buttons at once (Add to home screen and Done), and the three steps repeat what the button already does in one tap.",
  "Only the iPhone steps have drawings; the Android steps are words only.",
  "The drawings are their own style: a white chip with a periwinkle halo, in boxes of #0d0f1c, which is not one of the app's colours. The Safari drawing shows app.venty.au, which is not Venty's address.",
  "Done is the primary button although nothing is done in the app, and nothing shows the result: Venty on the home screen, or its icon (where the icon choice would go).",
];

export function InstallLab() {
  return (
    <section>
      <h2 className="h1 !text-[34px]">Add Venty to your home screen</h2>
      <p className="mt-3 max-w-[640px] text-[15px] leading-snug text-white/65">Today, on a phone. Reached from Before we begin (Yes, show me), the card on home and You, Settings. Only offered in a phone browser.</p>
      <div className="mt-8 grid justify-center gap-10 lg:grid-cols-2 lg:justify-items-center">
        <Phone label="Today on an iPhone (Safari)"><Today os="ios" /></Phone>
        <Phone label="Today on Android (Chrome can install)"><Today os="android" /></Phone>
      </div>
      <p className="mt-10 text-[15px] text-white/50">What to refine</p>
      <ol className="mt-3 max-w-[720px] list-decimal space-y-2 pl-5 text-[15px] leading-snug text-white/65">{ISSUES.map((x) => <li key={x}>{x}</li>)}</ol>
    </section>
  );
}
