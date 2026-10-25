"use client";
// Lab (MC 3): pieces shared by the sections on /lab/mc3.
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/ui";
import type { IconKey } from "./icons";

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

// the icon's PNG: 512 to look at, 180 for the iPhone's apple-touch-icon. Today is the app's own icon.
export const png = (k: IconKey, size: 180 | 512 = 512) =>
  k === "today" ? (size === 180 ? "/apple-touch-icon.png" : "/icon-512.png") : `/lab/mc3/icons/${k}-${size}.png`;

// rounded like a home screen (iOS and Android round the square themselves; 22.37% is iOS's corner)
export function AppIcon({ k, size, className }: { k: IconKey; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={png(k)} alt="" width={size} height={size} style={{ width: size, height: size }} className={cx("block shrink-0 rounded-[22.37%]", className)} />;
}
