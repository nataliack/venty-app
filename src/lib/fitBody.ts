// Fits the 3D body (public/body3d/*.glb) to a person's measurements.
// The body comes from MakeHuman, with its own "measure" shape keys, each in two directions (…_incr, …_decr).
// tools/body3d/export.py measured, like a tape, how many cm each one adds at full weight (src/lib/body3d.json).
// Height is a uniform scale (exact); the other measurements are then matched by choosing the shape key weights
// (coordinate descent, each key between 0 and 1, one direction per measurement), so every value the person typed shows
// on the body.
//
// Two kinds of measurement:
// - absolute: the circumferences the body was fitted to from the start (bust, underbust, waist, hips, neck, thigh), the
//   tape on the body reads the person's number;
// - by change: the ones added later (the lengths, the shoulders, the arms). The export measures them on points of the
//   skin, which is not quite where a person puts the tape, so the body follows how far the number moves from the
//   app's starting value instead: at the starting value the body is as made, and it grows or shrinks from there.
// Measurements MakeHuman has no control for (elbow, high hip, armhole, apex, rise…) do not move the body.
import model from "./body3d.json";
import { ALL_MEASURES } from "./data";

export type Sex3D = "female" | "male";
type Effects = Record<string, Record<string, number>>;
type BodyModel = { base: Record<string, number>; landmarks: Record<string, number>; effects: Effects; rings: Record<string, [number, number][]> };

const ABSOLUTE = ["bust", "underbust", "waist", "hips", "neck", "thigh"];
const BY_CHANGE = ["napeWaist", "waistHip", "insideLeg", "shoulderWrist", "acrossShoulder", "acrossFront", "upperArm", "wrist"];
const FIT = [...ABSOLUTE, ...BY_CHANGE];
// each measurement and the shape keys that move it (two keys moved together for a length made of two parts)
const DRIVERS: { key: string; shapes: string[] }[] = [
  ...ABSOLUTE.map((k) => ({ key: k, shapes: [k] })),
  { key: "napeWaist", shapes: ["napeWaist"] }, { key: "waistHip", shapes: ["waistHip"] },
  { key: "insideLeg", shapes: ["upperLeg", "lowerLeg"] }, { key: "shoulderWrist", shapes: ["upperArmLength", "lowerArmLength"] },
  { key: "acrossShoulder", shapes: ["acrossShoulder"] }, { key: "acrossFront", shapes: ["acrossFront"] },
  { key: "upperArm", shapes: ["upperArm"] }, { key: "wrist", shapes: ["wrist"] },
];
const START: Record<string, number> = Object.fromEntries(ALL_MEASURES.map((m) => [m.key, m.value]));

const bodyOf = (sex: Sex3D) => (model as unknown as Record<Sex3D, BodyModel>)[sex];

// a driver's effect (its shape keys together, in one direction) on the fitted measurements, and on the height. A tape
// that catches an arm (or loses the loop) shows as a jump of tens of cm; those readings are not the shape key's doing,
// so they are capped or left out.
function effect(sex: Sex3D, d: (typeof DRIVERS)[number], dir: "incr" | "decr"): { fit: number[]; height: number } {
  const all = d.shapes.map((s) => bodyOf(sex).effects[`${s}_${dir}`] ?? {});
  const sum = (q: string) => all.reduce((t, e) => t + (e[q] ?? 0), 0);
  return {
    fit: FIT.map((q) => {
      const v = sum(q);
      if (q === d.key) return Math.max(-25, Math.min(25, v));
      return Math.abs(v) > 20 ? 0 : v;
    }),
    height: Math.abs(sum("height")) > 20 ? 0 : sum("height"),
  };
}

export function baseMeasures(sex: Sex3D) { return bodyOf(sex).base; }
export function landmarks(sex: Sex3D) { return bodyOf(sex).landmarks; }
// the outline a tape follows at a landmark, on the base body (cm, Blender x / y), measured in tools/body3d/export.py
export function ringOutline(sex: Sex3D, key: string) { return bodyOf(sex).rings?.[key] ?? null; }

export function fitBody(sex: Sex3D, m: Partial<Record<string, number>>): { scale: number; weights: Record<string, number> } {
  const B = bodyOf(sex);
  const inc = DRIVERS.map((d) => effect(sex, d, "incr"));
  const dec = DRIVERS.map((d) => effect(sex, d, "decr"));
  const has = FIT.map((q) => m[q] !== undefined && (ABSOLUTE.includes(q) || B.base[q] !== undefined));
  const u = DRIVERS.map(() => 0); // signed weight: >0 uses …_incr, <0 uses …_decr
  // a measurement added later only moves its own shape keys when the person has it: never borrowed to match another
  const active = DRIVERS.map((d) => ABSOLUTE.includes(d.key) || has[FIT.indexOf(d.key)]);
  const part = (j: number) => (u[j] > 0 ? inc[j].fit.map((x) => x * u[j]) : dec[j].fit.map((x) => x * -u[j]));
  const lift = () => DRIVERS.reduce((t, _, j) => t + (u[j] > 0 ? inc[j].height * u[j] : dec[j].height * -u[j]), 0);
  const predict = () => {
    const p = FIT.map((q) => B.base[q] ?? 0);
    DRIVERS.forEach((_, j) => part(j).forEach((x, i) => (p[i] += x)));
    return p;
  };
  // the lengths also change the body's height, so the scale is worked out again from the fitted body's own height
  let scale = (m.height ?? B.base.height) / B.base.height;
  for (let round = 0; round < 3; round++) {
    // what each fitted measurement should be on the unscaled body (everything scales with height)
    const want = FIT.map((q) => {
      const v = m[q];
      if (v === undefined) return B.base[q] ?? 0;
      return ABSOLUTE.includes(q) ? v / scale : (B.base[q] ?? 0) + (v - (START[q] ?? v)) / scale;
    });
    for (let it = 0; it < 40; it++) {
      for (let j = 0; j < DRIVERS.length; j++) {
        if (!active[j]) continue;
        const mine = part(j);
        const p = predict();
        const r = FIT.map((_, i) => (has[i] ? want[i] - (p[i] - mine[i]) : 0)); // what's left, without this key
        const step = (v: number[]) => {
          const vv = v.reduce((s, x, i) => s + (has[i] ? x * x : 0), 0);
          if (vv < 1e-6) return 0;
          return Math.max(0, Math.min(1, v.reduce((s, x, i) => s + (has[i] ? x * r[i] : 0), 0) / vv));
        };
        const err = (v: number[], t: number) => r.reduce((s, x, i) => s + (has[i] ? (x - v[i] * t) ** 2 : 0), 0);
        const up = step(inc[j].fit), down = step(dec[j].fit);
        u[j] = err(inc[j].fit, up) <= err(dec[j].fit, down) ? up : -down;
      }
    }
    scale = (m.height ?? B.base.height) / (B.base.height + lift());
  }
  const weights: Record<string, number> = {};
  DRIVERS.forEach((d, j) => d.shapes.forEach((s) => { weights[`${s}_incr`] = Math.max(0, u[j]); weights[`${s}_decr`] = Math.max(0, -u[j]); }));
  return { scale, weights };
}
