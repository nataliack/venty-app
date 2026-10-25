"use client";
// Lab (MC 3): the icon selector, round 3. The icons slide in a track pressed into the page, like the measuring ruler's
// (.ruler-track) and the look switch's; drag or flick it, tap an icon, or use the arrow keys (the same loop as IconWheel:
// endless, nothing cloned, settling on the nearest icon). Until it is touched every icon sits pressed in at one size and
// nothing is chosen; then the centre one rises out of the track, full size and casting a short shadow, and is the choice.
// The track's corner is the raised icon's plus the 5px channel, as is its height, so the channel runs above and below it.
// Under it, the name in a second pressed readout.
import { useEffect, useState } from "react";
import { animate, motion, AnimatePresence, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { cx } from "@/components/ui";
import { ICONS, type IconKey } from "./icons";
import { AppIcon } from "./parts";
import { mod, useIconLoop } from "./IconWheel";

export type Tone = "paper" | "night";
// pressed into the page: a floor a touch darker, a shadow inside from the top edge, a lip of light along the bottom
export const pressed: Record<Tone, string> = {
  paper: "bg-[#12131c]/[.07] shadow-[inset_0_3px_7px_rgb(18_19_28/.2),inset_0_1px_1.5px_rgb(18_19_28/.16),inset_0_-1px_0_rgb(255_255_255/.85),0_1px_0_rgb(255_255_255/.6)]",
  night: "ruler-track",
};

const BIG = 76, CH = 5, STEP = 72, SIDE = 52 / BIG;
const R = BIG * 0.2237; // the icon's corner (iOS's)

export function IconTrack({ k, setK, tone }: { k: IconKey | null; setK: (k: IconKey) => void; tone: Tone }) {
  const { p, near, here, touched, ref, handlers } = useIconLoop(k, setK, STEP);
  // the centre icon rises once the track is first touched, over a moment, never with a jump
  const still = useReducedMotion();
  const lift = useMotionValue(touched ? 1 : 0);
  const [up, setUp] = useState(touched ? 1 : 0);
  useMotionValueEvent(lift, "change", setUp);
  useEffect(() => { if (touched) { if (still) lift.set(1); else animate(lift, 1, { duration: 0.35, ease: [0.2, 0.9, 0.3, 1.2] }); } }, [touched, still, lift]);
  const ink = tone === "paper" ? "18 19 28" : "0 0 0";
  return (
    <div>
      <div ref={ref} role="slider" tabIndex={0} aria-label="Icon" aria-valuemin={0} aria-valuemax={ICONS.length - 1} aria-valuenow={mod(near, ICONS.length)} aria-valuetext={touched ? here.name : "None chosen"}
        data-need={k ? undefined : "1"} {...handlers}
        className={cx("relative cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing", pressed[tone])}
        style={{ height: BIG + 2 * CH, borderRadius: R + CH, overflow: "hidden", clipPath: `inset(0 round ${R + CH}px)` /* Safari leaks moving layers past a rounded overflow */ }}>
        {Array.from({ length: 7 }, (_, i) => near - 3 + i).map((j) => {
          const d = j - p, f = Math.max(0, 1 - Math.abs(d)) * up;
          const s = SIDE + (1 - SIDE) * f;
          // pressed in: smaller and a touch darker, in shade (never see-through), sliding under the track's walls at its
          // ends; raised: full size, in full light, casting a shadow, above the walls' shade
          const lifted = f > 0.5;
          return (
            <span key={j} className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden
              style={{ width: BIG, height: BIG, marginLeft: -BIG / 2, marginTop: -BIG / 2, transform: `translateX(${d * STEP}px) scale(${s})`, filter: `brightness(${0.88 + 0.12 * f}) saturate(${0.8 + 0.2 * f})`, zIndex: lifted ? 30 : 10 - Math.round(Math.abs(d) * 2) }}>
              <AppIcon k={ICONS[mod(j, ICONS.length)].k} size={BIG} />
              {/* raised: a short shadow on the floor and a lit top edge; pressed: a faint shade inside its top */}
              <span className="absolute inset-0 rounded-[22.37%]" style={{ boxShadow: f > 0.5 ? `0 5px 9px -3px rgb(${ink} / .45), 0 1px 2px rgb(${ink} / .25), inset 0 1px 0 rgb(255 255 255 / .35)` : `inset 0 1px 2px rgb(${ink} / .25)` }} />
            </span>
          );
        })}
        {/* the walls' shade, drawn over the pressed icons so they sit down in the track and slide under its ends */}
        <span className="pointer-events-none absolute inset-0 z-20" style={{ borderRadius: R + CH, boxShadow: `inset 0 3px 6px rgb(${ink} / ${tone === "paper" ? 0.16 : 0.5}), inset 14px 0 12px -12px rgb(${ink} / ${tone === "paper" ? 0.3 : 0.7}), inset -14px 0 12px -12px rgb(${ink} / ${tone === "paper" ? 0.3 : 0.7})` }} aria-hidden />
      </div>
      {/* the name, in its own pressed readout */}
      <div className={cx("mx-auto mt-3 grid h-10 w-[188px] place-items-center overflow-hidden rounded-full", pressed[tone])} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={touched ? here.k : "none"} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: still ? 0 : 0.2 }}
            className={cx("text-[15px] leading-none", tone === "paper" ? (touched ? "text-[#12131c]" : "text-[#12131c]/45") : touched ? "text-white" : "text-white/45")}>
            {touched ? here.name : "Drag or tap an icon"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
