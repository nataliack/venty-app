// Fits the 3D body (public/body3d/*.glb) to a person's measurements.
// The body comes from MakeHuman, with its own "measure" shape keys (bust, underbust, waist, hips, neck, thigh), each
// in two directions (…_incr, …_decr). tools/body3d/export.py measured, like a tape, how many cm each one adds at full
// weight (src/lib/body3d.json). Height is a uniform scale (exact); the circumferences are then matched by choosing the
// shape key weights (coordinate descent, each key between 0 and 1, one direction per measurement), so every value the
// person typed shows on the body.
import model from "./body3d.json";

export type Sex3D = "female" | "male";
type Effects = Record<string, Record<string, number>>;
type BodyModel = { base: Record<string, number>; landmarks: Record<string, number>; effects: Effects; rings: Record<string, [number, number][]> };

// the measurements the body is fitted to, and the shape keys that move them
const FIT = ["bust", "underbust", "waist", "hips", "neck", "thigh"] as const;
const DRIVERS = ["bust", "underbust", "waist", "hips", "neck", "thigh"] as const;

const bodyOf = (sex: Sex3D) => (model as unknown as Record<Sex3D, BodyModel>)[sex];

// a shape key's effect on the fitted measurements. A tape that catches an arm (or loses the loop) shows as a jump of
// tens of cm; those readings are not the shape key's doing, so they are capped or left out.
function effect(sex: Sex3D, key: string): number[] {
  const e = bodyOf(sex).effects[key] ?? {};
  const own = key.split("_")[0];
  return FIT.map((q) => {
    const v = e[q] ?? 0;
    if (q === own) return Math.max(-25, Math.min(25, v));
    return Math.abs(v) > 20 ? 0 : v;
  });
}

export function baseMeasures(sex: Sex3D) { return bodyOf(sex).base; }
export function landmarks(sex: Sex3D) { return bodyOf(sex).landmarks; }
// the outline a tape follows at a landmark, on the base body (cm, Blender x / y), measured in tools/body3d/export.py
export function ringOutline(sex: Sex3D, key: string) { return bodyOf(sex).rings?.[key] ?? null; }

export function fitBody(sex: Sex3D, m: Partial<Record<string, number>>): { scale: number; weights: Record<string, number> } {
  const B = bodyOf(sex);
  const scale = (m.height ?? B.base.height) / B.base.height;
  // what each fitted measurement should be on the unscaled body (circumferences scale with height)
  const want = FIT.map((q) => (m[q] !== undefined ? (m[q] as number) / scale : B.base[q]));
  const has = FIT.map((q) => m[q] !== undefined);
  const inc = DRIVERS.map((d) => effect(sex, `${d}_incr`));
  const dec = DRIVERS.map((d) => effect(sex, `${d}_decr`));
  const u = DRIVERS.map(() => 0); // signed weight: >0 uses …_incr, <0 uses …_decr
  const part = (j: number) => (u[j] > 0 ? inc[j].map((x) => x * u[j]) : dec[j].map((x) => x * -u[j]));
  const predict = () => {
    const p = FIT.map((q) => B.base[q]);
    DRIVERS.forEach((_, j) => part(j).forEach((x, i) => (p[i] += x)));
    return p;
  };
  for (let it = 0; it < 40; it++) {
    for (let j = 0; j < DRIVERS.length; j++) {
      const mine = part(j);
      const p = predict();
      const r = FIT.map((_, i) => (has[i] ? want[i] - (p[i] - mine[i]) : 0)); // what's left, without this key
      const step = (v: number[]) => {
        const vv = v.reduce((s, x, i) => s + (has[i] ? x * x : 0), 0);
        if (vv < 1e-6) return 0;
        return Math.max(0, Math.min(1, v.reduce((s, x, i) => s + (has[i] ? x * r[i] : 0), 0) / vv));
      };
      const err = (v: number[], t: number) => r.reduce((s, x, i) => s + (has[i] ? (x - v[i] * t) ** 2 : 0), 0);
      const up = step(inc[j]), down = step(dec[j]);
      u[j] = err(inc[j], up) <= err(dec[j], down) ? up : -down;
    }
  }
  const weights: Record<string, number> = {};
  DRIVERS.forEach((d, j) => { weights[`${d}_incr`] = Math.max(0, u[j]); weights[`${d}_decr`] = Math.max(0, -u[j]); });
  return { scale, weights };
}
