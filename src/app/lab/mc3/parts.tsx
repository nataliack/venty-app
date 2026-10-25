"use client";
// Lab (MC 3): pieces shared by the sections on /lab/mc3.
import type { CSSProperties, ReactNode } from "react";

// ─── a phone at the iPhone's real size (393 × 852), a touch smaller on a narrow screen so it fits. Its screen sets the
// app's --top and --bottom as on an iPhone in Safari (below the status bar, above the home bar) ───
export function Phone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-3 max-[424px]:[zoom:.86]">
      <div className="relative isolate h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[55px] bg-bg shadow-[0_0_0_10px_#15161f,0_0_0_11px_#2a2c3a,0_40px_100px_-30px_rgb(0_0_0/.8)]"
        style={{ "--top": "62px", "--bottom": "34px" } as CSSProperties}>
        {children}
      </div>
      <figcaption className="text-[14px] text-white/55">{label}</figcaption>
    </figure>
  );
}
