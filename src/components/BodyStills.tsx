"use client";
/* eslint-disable @next/next/no-img-element */
// Stills of the 3D body (from the lab, 26 Oct 2026): a picture taken once from a body's own 3D form (its measurements),
// transparent, for the places that show many bodies at once (the Body library), where live 3D views would be too many
// for a phone. One hidden 3D view takes them one after another and they are kept for the session; until one is ready,
// the drawn mannequin holds its place. Shots: the whole body front on, the face and shoulders in profile, the bust
// with its tape.
import { useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { cx } from "@/components/ui";
import { BodyFigure } from "@/components/art";
import type { Sex } from "@/lib/data";

const Body3D = dynamic(() => import("@/components/Body3D").then((m) => m.Body3D), { ssr: false });

export type StillShot = "whole" | "profile" | "bust";
type Job = { key: string; sex: Sex; measures: Record<string, number>; shot: StillShot; again?: number };
const stills = new Map<string, string>();
const queue: Job[] = [];
const subs = new Set<() => void>();
let version = 0;
const notify = () => { version++; subs.forEach((f) => f()); };
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const KEYS = ["height", "bust", "waist", "hips", "neck", "underbust", "highHip", "acrossShoulder"];
const keyOf = (sex: Sex, m: Record<string, number>, shot: StillShot) => [sex, ...KEYS.map((k) => m[k] ?? ""), shot].join("-");
// a profile: the body turned this far (radians) from facing the camera
const PROFILE_YAW = 1.3;

// is there a body in the picture (some pixels not see-through down its middle)?
function hasBody(url: string) {
  return new Promise<boolean>((done) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
      const x = c.getContext("2d"); if (!x) return done(false);
      x.drawImage(im, 0, 0);
      const col = x.getImageData(Math.floor(im.width / 2), 0, 1, im.height).data;
      let n = 0; for (let i = 3; i < col.length; i += 4) if (col[i] > 40) n++;
      done(n > im.height * 0.2);
    };
    im.onerror = () => done(false);
    im.src = url;
  });
}

// the hidden 3D view: mount once on a screen that shows stills. It stays on screen but unseen (a view off screen is
// never drawn), and a profile's view runs continuously while it is taken, so the turn is drawn before the picture is
export function StillMaker() {
  useSyncExternalStore(subscribe, () => version, () => 0);
  const job = queue[0];
  const id = job ? "still-" + job.key : "";
  useEffect(() => {
    if (!job) return;
    let gone = false, tries = 0;
    const w = window as unknown as { __ventySnap?: Record<string, (k: number) => string>; __ventyFace?: Record<string, (y: number) => void> };
    const take = async () => {
      if (gone) return;
      const snap = w.__ventySnap?.[id];
      if (snap) {
        w.__ventyFace?.[id]?.(job.shot === "profile" ? PROFILE_YAW : 0);
        await new Promise((r) => setTimeout(r, 120));
        const url = snap(2);
        if (await hasBody(url)) { stills.set(job.key, url); queue.shift(); notify(); return; }
      }
      // not drawn in time (a page in the background draws nothing): to the back of the queue, tried twice more
      if (++tries < 40) setTimeout(take, 350); else { queue.shift(); if ((job.again ?? 0) < 2) queue.push({ ...job, again: (job.again ?? 0) + 1 }); notify(); }
    };
    const t = setTimeout(take, 900);
    return () => { gone = true; clearTimeout(t); };
  }, [job, id]);
  if (!job) return null;
  return (
    <div aria-hidden className={cx("pointer-events-none fixed left-0 top-0 -z-10 w-[300px] opacity-0", job.shot === "whole" ? "h-[600px]" : "h-[300px]")}>
      <Body3D key={id} sex={job.sex} measures={job.measures} focus={job.shot === "whole" ? "height" : job.shot === "profile" ? "portrait" : job.shot}
        whole={job.shot === "whole"} autoRotate={job.shot === "profile"} turn={job.shot === "profile"} stage="none" snapshot={id} className="absolute inset-0" />
    </div>
  );
}

export function useStill(sex: Sex, measures: Record<string, number>, shot: StillShot) {
  useSyncExternalStore(subscribe, () => version, () => 0);
  const key = keyOf(sex, measures, shot);
  useEffect(() => { if (!stills.has(key) && !queue.some((j) => j.key === key)) { queue.push({ key, sex, measures, shot }); notify(); } }, [key, sex, measures, shot]);
  return stills.get(key);
}
export function Still({ sex, measures, shot = "whole", className }: { sex: Sex; measures: Record<string, number>; shot?: StillShot; className?: string }) {
  const url = useStill(sex, measures, shot);
  return url
    ? <img src={url} alt="" draggable={false} className={cx("h-full w-full", className ?? "object-contain")} />
    : <span className="grid h-full w-full place-items-center opacity-40"><BodyFigure sex={sex} width={60} variant="solid" glow={false} className="h-full w-full" /></span>;
}

// The body cards' pictures (the Body library and home's Your bodies only), cropped to the card's 4:5. A form with no
// picture yet shows its 3D still: face and shoulders in profile.
export const BODY_PIC: Partial<Record<Sex, string>> = { female: "/bodies/female.webp" };
export function BodyPic({ sex, measures }: { sex: Sex; measures: Record<string, number> }) {
  const pic = BODY_PIC[sex];
  return pic
    ? <img src={pic} alt="" draggable={false} className="h-full w-full object-cover" />
    : <Still sex={sex} measures={measures} shot="profile" className="origin-top scale-[2] object-cover object-top" />;
}
