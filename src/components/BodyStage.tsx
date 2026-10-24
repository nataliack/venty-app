"use client";
// The 3D body on its stage, for the screens that show one (the measuring steps, body ready): a card in ink with a faint
// cornflower light from above, the body standing on the pattern floor (whitish lines), and, where the body turns by
// itself, a pause button bottom right (paused, it stays still until tapped again, dragging included). Drag to turn.
import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { cx, RB } from "@/components/ui";
import { SHOTS } from "@/lib/bodyShots";
import type { Sex3D } from "@/lib/fitBody";

// three.js only runs in the browser
const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false });

export function BodyStage({ sex, measures, focus = "height", turn, floor = true, className, children }: {
  sex: Sex3D; measures: Partial<Record<string, number>>; focus?: string;
  // turn slowly by itself (the torso tapes always turn)
  turn?: boolean; floor?: boolean; className?: string; children?: ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  const turning = turn || !!(SHOTS[focus] ?? SHOTS.height).spin;
  return (
    <div className={cx("stage-ink relative overflow-hidden border border-white/[.08]", className)}>
      <Body3D sex={sex} measures={measures} focus={focus} stage={floor ? "grid" : "none"} lines="white" turn={turn} paused={paused} className="absolute inset-0" />
      {children}
      {turning && <RB icon={paused ? "play" : "pause"} size={40} onClick={() => setPaused((p) => !p)} label={paused ? "Turn the body" : "Stop turning"} className="absolute bottom-3 right-3" />}
    </div>
  );
}
