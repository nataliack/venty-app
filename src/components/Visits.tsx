"use client";
// Visits (4 Nov 2026, Jose): Vercel Web Analytics, which counts each visit with no cookies and nothing that identifies a
// visitor (the page, the country, the kind of device and browser, where they came from), seen in Vercel's dashboard
// under Analytics. Counted once per visit: on a tablet or a computer by the page round the phone, never again by the app
// inside it (html.in-frame).
import { Analytics } from "@vercel/analytics/next";
import { useSyncExternalStore } from "react";

const noSub = () => () => {};
export function Visits() {
  const inFrame = useSyncExternalStore(noSub, () => document.documentElement.classList.contains("in-frame"), () => true);
  return inFrame ? null : <Analytics />;
}
