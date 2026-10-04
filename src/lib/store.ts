"use client";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { defaultMeasures, templateBy, metresFor, type GarmentKey, type Sex, SEED_PATTERNS } from "./data";

// Storage that never throws (private mode, blocked storage, etc.)
const safeStorage: StateStorage = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

export type Route = { id: string; p?: Record<string, unknown> };

export type Body = {
  id: string;
  name: string;
  sex: Sex;
  measures: Record<string, number>;
  done: string[]; // measure keys the user has confirmed
  photoScan?: boolean;
  est?: string[]; // keys AI-estimated from the photo scan and not yet checked by the user
  photos?: (string | null)[]; // front, back, side (small JPEG data URLs, kept on this device)
};

export type Pattern = {
  id: string;
  name: string;
  garment: GarmentKey;
  body: string;
  pieces: number;
  status: "Draft" | "Fitting" | "Printed";
  // what was decided while making it, so the pattern can be looked up later (e.g. at the fabric shop)
  spec?: { ease: number; fabric?: string; stretch?: string; drape: number; seam: number | null; printer: "A4" | "A0"; sheets?: number; metres: number; details?: [string, string][] };
};

export type Draft = {
  garment: GarmentKey;
  source: "photo" | "link" | "sketch" | "template" | "voice";
  start?: "link" | "sketch"; // home shortcut: open this input straight away on the prompt screen
  photo?: string; // your photo and sketch as one picture, not persisted
  prompt?: string; // what you wrote in the studio
  details?: [string, string][]; // the garment details you confirmed (sleeves, neckline, …)
  bodyId?: string;
  length?: string;
  ease: number; // cm at waist
  fabric: string;
  stretch: "No" | "A bit" | "A lot";
  drape: number; // 0..1
  seam: number | null;
  printer: "A4" | "A0";
  sheets?: number; // sheets the arranged layout prints on
  chosen?: { fit?: boolean; fabric?: boolean; stretch?: boolean }; // which garment settings the user has picked (nothing is pre-selected)
  layout?: { garment: string; printer: string; at: Record<string, { x: number; y: number; r: number }> }; // where you put each piece: centre in % of the sheet area, rotation in degrees
  lengthCm: number;
  neckline: number;
  sleeve: string;
  version: number;
};

const freshDraft = (): Draft => ({ garment: "flutter", source: "photo", ease: 4, fabric: "Viscose crepe", stretch: "A bit", drape: 0.72, seam: 1.5, printer: "A4", lengthCm: 104, neckline: 12, sleeve: "Flutter", version: 1 });

const ME: Body = { id: "me", name: "Me, Spring 26", sex: "female", measures: defaultMeasures(), done: ["height", "bust", "waist", "hips"] };
const seedBodies = (): Body[] => [
  { id: "mum", name: "Mum", sex: "female", measures: { ...defaultMeasures(), bust: 96, waist: 82, hips: 104, height: 162 }, done: ["height", "bust", "waist", "hips"] },
  { id: "tom", name: "Tom", sex: "male", measures: { ...defaultMeasures(), bust: 98, waist: 84, hips: 100, height: 181 }, done: ["height", "bust", "waist", "hips"] },
];

type State = {
  stack: Route[];
  dir: 1 | -1;
  user: { name: string; email: string; guest: boolean };
  units: "cm" | "in";
  experience: number | null;
  prefsDone: boolean; // units + experience chosen once, app-wide
  tourSkipped: boolean; // skipped onboarding: home offers the tour later
  updatesSeen: boolean; // the home bell has been opened
  installDismissed: boolean; // "Add Venty to your home screen" card closed on home
  resumeBody: string | null; // body whose extra measures were paused ("Take a break")
  bodies: Body[];
  activeBody: string; // body being edited / selected
  patterns: Pattern[];
  draft: Draft;
  onboarded: boolean;
  kiosk: boolean;
  // nav
  go: (id: string, p?: Record<string, unknown>) => void;
  replace: (id: string, p?: Record<string, unknown>) => void;
  back: () => void;
  home: () => void;
  reset: () => void;
  // data
  set: (patch: Partial<State>) => void;
  setDraft: (patch: Partial<Draft>) => void;
  newDraft: (patch?: Partial<Draft>) => void;
  body: () => Body;
  updateBody: (patch: Partial<Body>) => void;
  setMeasure: (key: string, v: number) => void;
  confirmMeasure: (key: string) => void;
  newBody: () => void;
  startBody: () => void;
  exitFlow: () => void;
  savePattern: (status?: Pattern["status"]) => void;
};

const initial = () => ({
  stack: [{ id: "splash" }] as Route[],
  dir: 1 as 1 | -1,
  user: { name: "Ana", email: "", guest: true },
  units: "cm" as const,
  experience: null as number | null,
  prefsDone: false,
  tourSkipped: false,
  updatesSeen: false,
  installDismissed: false,
  resumeBody: null as string | null,
  bodies: [ME, ...seedBodies()],
  activeBody: "me",
  patterns: SEED_PATTERNS as Pattern[],
  draft: freshDraft(),
  onboarded: false,
});

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),
      kiosk: false,
      go: (id, p) => set((s) => ({ stack: [...s.stack, { id, p }].slice(-40), dir: 1 })),
      replace: (id, p) => set((s) => ({ stack: [...s.stack.slice(0, -1), { id, p }], dir: 1 })),
      back: () => set((s) => (s.stack.length > 1 ? { stack: s.stack.slice(0, -1), dir: -1 } : { stack: [{ id: "home" }], dir: -1 })),
      home: () => set({ stack: [{ id: "home" }], dir: -1 }),
      reset: () => { set({ ...initial() }); },
      set: (patch) => set(patch as Partial<State>),
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      newDraft: (patch) => set((s) => { if (s.draft.photo) { try { URL.revokeObjectURL(s.draft.photo); } catch {} } return { draft: { ...freshDraft(), bodyId: s.activeBody, ...patch } }; }),
      body: () => { const s = get(); return s.bodies.find((b) => b.id === s.activeBody) ?? s.bodies[0] ?? ME; },
      updateBody: (patch) => set((s) => ({ bodies: s.bodies.map((b) => (b.id === s.activeBody ? { ...b, ...patch } : b)) })),
      setMeasure: (key, v) => set((s) => ({ bodies: s.bodies.map((b) => (b.id === s.activeBody ? { ...b, measures: { ...b.measures, [key]: Math.round(v * 2) / 2 } } : b)) })),
      confirmMeasure: (key) => set((s) => ({ bodies: s.bodies.map((b) => (b.id === s.activeBody ? { ...b, done: b.done.includes(key) ? b.done : [...b.done, key], est: (b.est ?? []).filter((k) => k !== key) } : b)) })),
      newBody: () => set((s) => {
        const id = "b" + Date.now().toString(36);
        const b: Body = { id, name: "", sex: "female", measures: defaultMeasures(), done: [], est: [] };
        // replace the default "me" body if the visitor is building their first one
        const others = s.bodies.filter((x) => x.id !== "me");
        return { bodies: [b, ...others], activeBody: id };
      }),
      startBody: () => { get().newBody(); get().go(get().prefsDone ? "name" : "prefs"); },
      // leave a setup flow: back to where it started ("Where do you want to start?" or home); drop a body that was never named
      exitFlow: () => set((s) => {
        const b = s.bodies.find((x) => x.id === s.activeBody);
        const bodies = b && !b.name.trim() ? s.bodies.filter((x) => x.id !== b.id) : s.bodies;
        const activeBody = bodies.some((x) => x.id === s.activeBody) ? s.activeBody : bodies[0]?.id ?? "me";
        const ids = s.stack.map((r) => r.id);
        const at = Math.max(ids.lastIndexOf("start"), ids.lastIndexOf("home"));
        return { bodies, activeBody, dir: -1 as const, stack: at >= 0 ? s.stack.slice(0, at + 1) : [{ id: "home" }] };
      }),
      savePattern: (status = "Fitting") => set((s) => {
        const name = s.draft.garment === "flutter" ? "Flutter midi dress" : templateBy(s.draft.garment).name;
        const bodyName = (s.bodies.find((b) => b.id === (s.draft.bodyId ?? s.activeBody)) ?? s.bodies[0])?.name ?? "Me";
        const d = s.draft;
        const spec = { ease: d.ease, fabric: d.chosen?.fabric ? d.fabric : undefined, stretch: d.chosen?.stretch ? d.stretch : undefined, drape: d.drape, seam: d.seam, printer: d.printer, sheets: d.sheets, metres: metresFor(d.garment, d.ease), details: d.details };
        const existing = s.patterns.find((p) => p.name === name && p.body === bodyName);
        if (existing) return { patterns: s.patterns.map((p) => (p === existing ? { ...p, status, spec } : p)) };
        return { patterns: [{ id: "n" + Date.now().toString(36), name, garment: d.garment, body: bodyName, pieces: 6, status, spec }, ...s.patterns] };
      }),
    }),
    {
      name: "venty-expo-v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ ...s, draft: { ...s.draft, photo: undefined }, stack: s.stack.slice(-12) }),
      version: 2,
      migrate: () => ({ ...initial() }) as unknown as State,
    },
  ),
);

export const fmt = (v: number, units: "cm" | "in") => (units === "in" ? (v / 2.54).toFixed(1) : v.toFixed(1));
