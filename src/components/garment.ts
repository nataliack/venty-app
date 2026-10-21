// ─── Garments drawn from their details ───────────────────────────────────────────────────────────────────────
// Every garment on the mannequin is built from what you asked for: the neckline, the sleeves, the length, the skirt
// or leg shape, the rise and the waist, plus how much room it has (the fit). So a cropped, tight, scoop-neck top
// with short sleeves looks like exactly that, and moving the length dial moves the hem.
// Drawn in the body's 200 × 530 space, centred on x = 100; x values below are offsets from the centre line.
import { NECK_CM, lengthCmFor, type Kind, type Sex } from "@/lib/data";

export type L = { neckY: number; neckH: number; shY: number; shH: number; armY: number; armH: number; bustY: number; bustH: number; waistY: number; waistH: number; hipY: number; hipH: number; crotchY: number; kneeY: number; ankleY: number; elbowY: number; elbowO: number; elbowI: number; wristY: number; wristO: number; wristI: number };
// Landmarks are measured off the mannequin silhouettes, so shoulders, waist and hips always land on the figure.
export const LM: Record<Sex, L> = {
  female: { neckY: 90, neckH: 10, shY: 101, shH: 49, armY: 134, armH: 43, bustY: 150, bustH: 44, waistY: 205, waistH: 29, hipY: 275, hipH: 48, crotchY: 293, kneeY: 405, ankleY: 494, elbowY: 205, elbowO: 69, elbowI: 54, wristY: 282, wristO: 77, wristI: 67 },
  male: { neckY: 90, neckH: 12, shY: 101, shH: 57, armY: 140, armH: 50, bustY: 156, bustH: 50, waistY: 205, waistH: 39, hipY: 278, hipH: 44, crotchY: 296, kneeY: 404, ankleY: 494, elbowY: 205, elbowO: 75.5, elbowI: 57.5, wristY: 282, wristO: 83.5, wristI: 70.5 },
};
export const P = (x: number, y: number) => `${(100 + x).toFixed(1)} ${y.toFixed(1)}`;
export type Drawn = { body: string; extra?: string[]; details: string };
export type GarmentSpec = { kind: Kind; details?: [string, string][]; ease?: number; lengthCm?: number; neckCm?: number };

const PX = 3.2; // the mannequin is drawn at about 3.2 units to the centimetre
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));
type Pt = [number, number];

// the garment's outline: the right half from the neck side of the shoulder down to the hem, mirrored, with a softly
// curved hem and the neckline closing it at the top
function outline(right: Pt[], neck: string) {
  const [hx, hy] = right[right.length - 1];
  const left = [...right].reverse().slice(1).map(([x, y]) => P(-x, y));
  return `M${right.map(([x, y]) => P(x, y)).join(" L")} Q${P(0, hy + 7)} ${P(-hx, hy)} L${left.join(" L")}${neck} Z`;
}

// ─── the top edge: necklines (and what they mean for the shoulders) ───
type Top = { start: Pt[]; neck: string; armStart: Pt; noShoulder?: boolean; lines?: string };
// k scales how deep the neckline dips (1 = its usual depth, from the neckline-depth dial)
function topEdge(l: L, neckline: string, sleeves: string, e: number, k = 1): Top {
  const outerSh: Pt = [l.shH - 4, l.shY - 3];
  // thin straps: the bodice starts straight across above the bust, held by two straps
  if (sleeves === "Thin straps") {
    const y = l.bustY - 20, x = l.bustH - 8 + e * 0.5;
    const curve = neckline === "V-neck" ? ` L${P(-x, y)} L${P(0, y + 16)} L${P(x, y)}` : neckline === "Sweetheart" ? ` L${P(-x, y)} Q${P(-14, y - 10)} ${P(0, y + 8)} Q${P(14, y - 10)} ${P(x, y)}` : ` L${P(-x, y)} Q${P(0, y + 6)} ${P(x, y)}`;
    return { start: [[x, y]], neck: curve, armStart: [l.armH + e * 0.6, l.armY + 8], noShoulder: true, lines: `M${P(x - 5, y)} L${P(l.neckH + 15, l.shY - 4)} M${P(-(x - 5), y)} L${P(-(l.neckH + 15), l.shY - 4)}` };
  }
  switch (neckline) {
    case "Off-shoulder": {
      const y = l.shY + 16, x = l.shH + 4 + e * 0.5;
      return { start: [[x, y]], neck: ` L${P(-x, y)} Q${P(0, y + 10)} ${P(x, y)}`, armStart: [l.armH + e * 0.6, l.armY + 6], noShoulder: true, lines: `M${P(-x + 2, y + 5)} Q${P(0, y + 15)} ${P(x - 2, y + 5)}` };
    }
    case "Halter": {
      const n: Pt = [l.neckH + 3, l.neckY - 3];
      return { start: [n, [l.bustH - 10, l.armY - 4]], neck: ` L${P(-n[0], n[1])} L${P(n[0], n[1])}`, armStart: [l.armH + e * 0.6, l.armY + 8], noShoulder: true, lines: `M${P(-n[0], n[1] + 5)} L${P(n[0], n[1] + 5)}` };
    }
    case "Sweetheart": {
      const y = l.bustY - 18, x = l.bustH - 6 + e * 0.5;
      return { start: [[x, y]], neck: ` L${P(-x, y)} Q${P(-16, y - 12)} ${P(0, y + 10)} Q${P(16, y - 12)} ${P(x, y)}`, armStart: [l.armH + e * 0.6, l.armY + 8], noShoulder: true };
    }
    case "Boat": {
      const n: Pt = [l.shH - 16, l.shY - 5];
      return { start: [n, outerSh], neck: ` L${P(-n[0], n[1])} Q${P(0, n[1] + 9)} ${P(n[0], n[1])}`, armStart: outerSh };
    }
    case "V-neck": { const n: Pt = [l.neckH + 3, l.neckY - 1]; return { start: [n, outerSh], neck: ` L${P(-n[0], n[1])} L${P(0, n[1] + 42 * k)} L${P(n[0], n[1])}`, armStart: outerSh }; }
    case "Scoop": { const n: Pt = [l.neckH + 13, l.neckY + 5]; return { start: [n, outerSh], neck: ` L${P(-n[0], n[1])} Q${P(0, n[1] + 40 * k)} ${P(n[0], n[1])}`, armStart: outerSh }; }
    case "Square": { const n: Pt = [l.neckH + 12, l.neckY + 3]; return { start: [n, outerSh], neck: ` L${P(-n[0], n[1])} L${P(-n[0], n[1] + 26 * k)} L${P(n[0], n[1] + 26 * k)} L${P(n[0], n[1])}`, armStart: outerSh }; }
    case "High neck": { const n: Pt = [l.neckH + 1, l.neckY - 14]; return { start: [n, [l.neckH + 3, l.neckY - 1], outerSh], neck: ` L${P(-n[0], n[1])} Q${P(0, n[1] - 2)} ${P(n[0], n[1])}`, armStart: outerSh, lines: `M${P(-l.neckH - 2, l.neckY - 2)} Q${P(0, l.neckY + 3)} ${P(l.neckH + 2, l.neckY - 2)}` }; }
    case "Cowl": { const n: Pt = [l.neckH + 9, l.neckY + 1]; return { start: [n, outerSh], neck: ` L${P(-n[0], n[1])} Q${P(0, n[1] + 34 * k)} ${P(n[0], n[1])}`, armStart: outerSh, lines: `M${P(-n[0] + 4, n[1] + 8)} Q${P(0, n[1] + 30)} ${P(n[0] - 4, n[1] + 8)} M${P(-n[0] + 8, n[1] + 16)} Q${P(0, n[1] + 36)} ${P(n[0] - 8, n[1] + 16)}` }; }
    case "Collar": {
      const n: Pt = [l.neckH + 4, l.neckY];
      return { start: [n, outerSh], neck: ` L${P(-n[0], n[1])} L${P(0, n[1] + 18 * k)} L${P(n[0], n[1])}`, armStart: outerSh,
        lines: `M${P(-n[0], n[1])} L${P(-n[0] - 10, n[1] + 20)} L${P(-3, n[1] + 18)} M${P(n[0], n[1])} L${P(n[0] + 10, n[1] + 20)} L${P(3, n[1] + 18)}` };
    }
    default: { const n: Pt = [l.neckH + 4, l.neckY]; return { start: [n, outerSh], neck: ` L${P(-n[0], n[1])} Q${P(0, n[1] + 16 * k)} ${P(n[0], n[1])}`, armStart: outerSh }; } // round
  }
}

// ─── sleeves: one per side, following the arm down to where they end ───
const armOuter = (l: L): Pt[] => [[l.shH + 1, l.shY + 4], [l.elbowO, l.elbowY], [l.wristO, l.wristY]];
const armInner = (l: L): Pt[] => [[l.armH, l.armY], [l.elbowI, l.elbowY], [l.wristI, l.wristY]];
function along(pts: Pt[], y: number) {
  for (let i = 0; i < pts.length - 1; i++) if (y <= pts[i + 1][1]) return lerp(pts[i][0], pts[i + 1][0], (y - pts[i][1]) / (pts[i + 1][1] - pts[i][1]));
  return pts[pts.length - 1][0];
}
function sleeve(l: L, kind: string, side: 1 | -1, e: number, from: Pt, lowStart: boolean): string | null {
  const s = (x: number) => side * x;
  const ends: Record<string, number> = { Cap: l.shY + 20, Short: l.shY + 42, Flutter: l.shY + 46, Puff: l.shY + 44, Elbow: l.elbowY, "Three-quarter": l.elbowY + (l.wristY - l.elbowY) * 0.55, Long: l.wristY, Bell: l.wristY + 4 };
  const end = ends[kind];
  if (end === undefined) return null; // sleeveless, thin straps
  const ex = 2 + e * 0.6;
  const top = from;
  const pit: Pt = [l.armH, l.armY + 2];
  if (kind === "Cap") return `M${P(s(top[0]), top[1])} Q${P(s(l.shH + 10 + ex), l.shY + 4)} ${P(s(l.shH + 7 + ex), end)} Q${P(s(l.armH + 6), end + 6)} ${P(s(pit[0]), pit[1] - 6)} Z`;
  if (kind === "Flutter") return `M${P(s(top[0] - 3), top[1] - 1)} Q${P(s(l.shH + 24 + ex), l.shY - 2)} ${P(s(l.shH + 32 + ex), end)} Q${P(s(l.shH + 24 + ex), end + 7)} ${P(s(l.shH + 17 + ex), end - 2)} Q${P(s(l.shH + 9), end + 5)} ${P(s(pit[0] + 1), end - 6)} L${P(s(pit[0]), pit[1])} Z`;
  if (kind === "Puff") return `M${P(s(top[0]), top[1])} Q${P(s(l.shH + 24 + ex), l.shY - 6)} ${P(s(l.shH + 14 + ex), end - 2)} Q${P(s(l.shH + 6), end + 6)} ${P(s(pit[0] + 1), end - 2)} L${P(s(pit[0]), pit[1])} Z`;
  const flare = kind === "Bell" ? 14 : 0;
  const outer = armOuter(l).filter(([, y]) => y > top[1] + 4 && y < end).map(([x, y]) => P(s(x + ex), y));
  const inner = armInner(l).filter(([, y]) => y > pit[1] + 2 && y < end).reverse().map(([x, y]) => P(s(x - ex), y));
  const oEnd = along(armOuter(l), end) + ex + flare, iEnd = along(armInner(l), end) - ex - flare * 0.5;
  const start = lowStart ? `M${P(s(top[0]), top[1])}` : `M${P(s(top[0]), top[1])} L${P(s(l.shH + 1 + ex), l.shY + 5)}`;
  return `${start}${outer.length ? " L" + outer.join(" L") : ""} L${P(s(oEnd), end)} L${P(s(iEnd), end)}${inner.length ? " L" + inner.join(" L") : ""} L${P(s(pit[0]), pit[1])} Z`;
}

// ─── skirts: from where the skirt starts down to the hem, by shape ───
function skirtSide(l: L, shape: string, topY: number, hemY: number, e: number): Pt[] {
  const hipX = l.hipH + 3 + e;
  const knee = 35 + e, ankle = 26 + e; // the outer edge of the legs together at the knee and at the ankle
  const bodyAt = (y: number) => (y <= l.hipY ? hipX : y <= l.kneeY ? lerp(hipX, knee, (y - l.hipY) / (l.kneeY - l.hipY)) : lerp(knee, ankle, (y - l.kneeY) / (l.ankleY - l.kneeY)));
  const drop = Math.max(0, hemY - l.hipY);
  const hip: Pt[] = hemY > l.hipY + 4 && topY < l.hipY ? [[hipX + (shape === "Full circle" ? 12 : shape === "Pleated" || shape === "Tiered" ? 4 : 1), l.hipY]] : [];
  switch (shape) {
    case "Bodycon": return [...hip, ...(hemY > l.kneeY ? [[knee, l.kneeY] as Pt] : []), [bodyAt(hemY) + 1, hemY]];
    case "Pencil": return [...hip, ...(hemY > l.kneeY ? [[knee + 3, l.kneeY] as Pt] : []), [bodyAt(hemY) + 2, hemY]];
    case "Mermaid": return hemY > l.kneeY - 10 ? [...hip, [knee, l.kneeY - 12], [knee + 4 + (hemY - l.kneeY) * 0.35, hemY]] : [...hip, [bodyAt(hemY) + 1, hemY]];
    case "Straight": return [...hip, [hipX + 2, hemY]];
    case "Bias cut": return [...hip, [hipX + 6 + drop * 0.07, hemY]];
    case "Full circle": return [...hip, [hipX + 14 + drop * 0.42, hemY]];
    default: return [...hip, [hipX + 5 + drop * 0.15, hemY]]; // A-line, Pleated, Wrap, Tiered
  }
}
function skirtLines(l: L, shape: string, topY: number, topX: number, side: Pt[]): string {
  const [hx, hy] = side[side.length - 1];
  if (shape === "Pleated") return [-0.6, -0.2, 0.2, 0.6].map((k) => `M${P(topX * k, topY + 4)} L${P(hx * k, hy + 3)}`).join(" ");
  if (shape === "Tiered") return [1 / 3, 2 / 3].map((k) => { const y = lerp(topY, hy, k), x = lerp(topX, hx, k) + 2; return `M${P(-x, y)} Q${P(0, y + 5)} ${P(x, y)}`; }).join(" ");
  if (shape === "Wrap") return `M${P(topX * 0.55, topY)} Q${P(hx * 0.3, (topY + hy) / 2)} ${P(hx * 0.12, hy + 5)}`;
  return `M${P(-topX * 0.45, topY + 2)} L${P(-hx * 0.45, hy + 3)} M${P(topX * 0.45, topY + 2)} L${P(hx * 0.45, hy + 3)}`;
}

// ─── waists: the seam and whatever sits on it ───
function waistBits(l: L, kind: string, y: number, x: number): string {
  const seam = `M${P(-x, y)} Q${P(0, y + 3)} ${P(x, y)}`;
  if (kind === "Belted") return `M${P(-x, y - 4)} L${P(x, y - 4)} M${P(-x, y + 4)} L${P(x, y + 4)} M${P(-5, y - 6)} L${P(5, y - 6)} L${P(5, y + 6)} L${P(-5, y + 6)} Z`;
  if (kind === "Tie") return `${seam} M${P(x * 0.5, y)} Q${P(x * 0.5 + 12, y - 9)} ${P(x * 0.5 + 6, y + 2)} M${P(x * 0.5, y)} Q${P(x * 0.5 + 13, y + 10)} ${P(x * 0.5 + 4, y + 4)} M${P(x * 0.5 + 2, y + 2)} L${P(x * 0.5 + 4, y + 34)} M${P(x * 0.5 + 2, y + 2)} L${P(x * 0.5 + 12, y + 30)}`;
  if (kind === "Elastic" || kind === "Drawstring" || kind === "Paperbag") {
    const g = Array.from({ length: 7 }, (_, i) => { const gx = lerp(-x + 4, x - 4, i / 6); return `M${P(gx, y - 4)} L${P(gx, y + 4)}`; }).join(" ");
    const cord = kind === "Drawstring" ? ` M${P(-3, y)} Q${P(-8, y + 14)} ${P(-5, y + 22)} M${P(3, y)} Q${P(8, y + 14)} ${P(5, y + 22)}` : "";
    return `M${P(-x, y - 5)} L${P(x, y - 5)} M${P(-x, y + 5)} L${P(x, y + 5)} ${g}${cord}`;
  }
  return seam;
}

export function buildSpec(spec: GarmentSpec, l: L): Drawn {
  const d = new Map(spec.details ?? []);
  const v = (k: string, dflt: string) => d.get(k) ?? dflt;
  const e = Math.max(0, spec.ease ?? 4) * 0.8; // how much room it has, per side
  const kind = spec.kind;
  const cm = spec.lengthCm ?? lengthCmFor(kind, v("Length", ""));
  const from = kind === "dress" || kind === "top" ? l.shY : l.waistY;
  const hemY = Math.min(l.ankleY + 6, from + cm * PX);

  if (kind === "trousers") return trousers(l, v, e, hemY);

  if (kind === "skirt") {
    const shape = v("Shape", "A-line"), waist = v("Waist", "Waistband");
    const topY = waist === "Paperbag" ? l.waistY - 10 : l.waistY - 2, topX = l.waistH + 3 + e * 0.5;
    const side = skirtSide(l, shape, topY, hemY, e);
    const right: Pt[] = [[topX, topY], ...side];
    const body = `M${right.map(([x, y]) => P(x, y)).join(" L")} Q${P(0, hemY + 7)} ${P(-side[side.length - 1][0], hemY)} L${[...right].reverse().slice(1).map(([x, y]) => P(-x, y)).join(" L")} Z`;
    const band = waist === "Yoke" ? `M${P(-topX - 6, l.waistY + 26)} Q${P(0, l.waistY + 34)} ${P(topX + 6, l.waistY + 26)}` : waistBits(l, waist === "Waistband" ? "band" : waist, l.waistY + 6, topX + 1) + (waist === "Waistband" ? ` M${P(-topX, l.waistY + 10)} L${P(topX, l.waistY + 10)}` : "");
    return { body, details: `${band} ${skirtLines(l, shape, l.waistY + 10, topX + 2, side)}` };
  }

  // tops and dresses share the bodice: neckline, shoulders, sleeves, sides
  const neckline = v("Neckline", "Round");
  // a halter or sweetheart neckline leaves the shoulders bare, so there is nothing for a sleeve to hang from
  const sleeves = neckline === "Halter" || neckline === "Sweetheart" ? "Sleeveless" : v("Sleeves", kind === "top" ? "Short" : "Flutter");
  const shape = kind === "top" ? v("Shape", "Relaxed") : "";
  const big = shape === "Oversized" ? 14 : shape === "Boxy" ? 8 : 0;
  const usual = NECK_CM[neckline];
  const k = spec.neckCm && usual ? Math.min(2.4, Math.max(0.45, spec.neckCm / usual)) : 1;
  const top = topEdge(l, neckline, sleeves, e + big * 0.4, k);
  const sleeveless = sleeves === "Sleeveless" || sleeves === "Thin straps";
  const right: Pt[] = [...top.start];
  // sleeveless cuts the armhole in from the shoulder; a sleeve starts at the shoulder (or lower, off the shoulder)
  if (!top.noShoulder) {
    if (sleeveless) { right[right.length - 1] = [l.shH - 13, l.shY]; right.push([l.armH - 3 + e * 0.5, l.armY + 8]); }
    else right.push([big ? l.bustH + 4 + e + big : l.armH + e * 0.6, l.armY + 2 + big * 0.6]);
  } else right.push(top.armStart);
  const sleeveFrom: Pt = top.noShoulder ? top.start[0] : [l.shH - 4 + big * 0.4, l.shY - 3];
  const extra = [sleeve(l, sleeves, 1, e + big * 0.3, sleeveFrom, !!top.noShoulder), sleeve(l, sleeves, -1, e + big * 0.3, sleeveFrom, !!top.noShoulder)].filter(Boolean) as string[];
  let lines = top.lines ?? "";

  if (kind === "top") {
    const fitted = shape === "Fitted" || shape === "Peplum" || shape === "Wrap";
    const bustX = l.bustH + (fitted ? 1 : 4) + e + big;
    const sideAt = (y: number) => (big ? bustX : y <= l.waistY ? lerp(bustX, (fitted ? l.waistH + 3 : l.bustH - 2) + e, (y - l.bustY) / (l.waistY - l.bustY)) : lerp((fitted ? l.waistH + 3 : l.bustH - 2) + e, l.hipH + 4 + e, (y - l.waistY) / (l.hipY - l.waistY)));
    if (hemY > l.bustY + 4) right.push([bustX, l.bustY]);
    if (shape === "Peplum" && hemY > l.waistY + 12) {
      right.push([l.waistH + 3 + e, l.waistY]);
      right.push([l.waistH + 24 + e, hemY]);
      lines += ` ${waistBits(l, "seam", l.waistY, l.waistH + 3 + e)}`;
    } else {
      if (!big && hemY > l.waistY + 4) right.push([sideAt(l.waistY), l.waistY]);
      right.push([sideAt(hemY), hemY]);
    }
    if (shape === "Wrap") lines += ` M${P(-l.neckH - 3, l.neckY + 2)} Q${P(l.waistH * 0.2, l.bustY + 30)} ${P(l.waistH * 0.7, Math.min(hemY, l.waistY + 4))}`;
    if (v("Fastening", "") === "Buttons" || neckline === "Collar") lines += ` M${P(0, l.neckY + 18)} L${P(0, hemY + 4)} ${[0.25, 0.45, 0.65, 0.85].map((k) => { const by = lerp(l.neckY + 24, hemY - 6, k); return `M${P(-1.6, by)} L${P(1.6, by)}`; }).join(" ")}`;
    return { body: outline(right, top.neck), extra, details: lines };
  }

  // dresses: bodice to the waist seam, then the skirt
  const waist = v("Waist", "Fitted"), skirt = v("Skirt", "A-line");
  const seamY = waist === "Empire" ? l.bustY + 18 : waist === "Drop waist" ? l.hipY - 12 : l.waistY;
  const relaxed = waist === "Relaxed";
  const bustX = l.bustH + 2 + e;
  const seamX = relaxed ? l.bustH - 2 + e : seamY <= l.waistY ? lerp(bustX, l.waistH + 3 + e, (seamY - l.bustY) / (l.waistY - l.bustY)) : lerp(l.waistH + 3 + e, l.hipH + 2 + e, (seamY - l.waistY) / (l.hipY - l.waistY));
  right.push([bustX, l.bustY], [seamX, seamY]);
  const side = skirtSide(l, skirt, seamY, hemY, e);
  right.push(...side);
  if (!relaxed) lines += ` ${waistBits(l, waist, seamY, seamX)}`;
  lines += ` ${skirtLines(l, skirt, seamY + 3, seamX, side)}`;
  if (skirt === "Wrap" || waist === "Tie") lines += ` M${P(-l.neckH - 3, l.neckY)} L${P(seamX * 0.45, seamY)}`;
  if (v("Fastening", "") === "Buttons") lines += ` M${P(0, top.start[0][1] + 18)} L${P(0, hemY + 4)}`;
  return { body: outline(right, top.neck), extra, details: lines };
}

// trousers: the rise sets where they sit, the leg shape sets the width at the knee and the hem
function trousers(l: L, v: (k: string, d: string) => string, e: number, hemY0: number): Drawn {
  const rise = v("Rise", "Mid"), leg = v("Leg", "Straight"), waist = v("Waist", "Waistband"), pockets = v("Pockets", "Slant");
  const topY = rise === "High" ? l.waistY - 8 : rise === "Low" ? l.waistY + 24 : l.waistY + 8;
  const hemY = Math.max(l.crotchY + 22, hemY0);
  const topX = lerp(l.waistH, l.hipH, (topY - l.waistY) / (l.hipY - l.waistY)) + 3 + e * 0.6;
  const hipX = l.hipH + 3 + e;
  const c = 24; // each leg's centre line, from the middle
  const widths: Record<string, [number, number]> = { Straight: [16, 14], Wide: [24, 26], Slim: [13, 9], Tapered: [17, 9], Flared: [13, 24], Barrel: [23, 12] }; // half-width at the knee, at the hem
  const [wk0, wh0] = widths[leg] ?? widths.Straight;
  const wk = wk0 + e * 0.5, wh = wh0 + e * 0.5;
  const atHem = hemY < l.kneeY ? lerp(Math.max(wk, hipX - c), wk, (hemY - l.crotchY) / (l.kneeY - l.crotchY)) : wh;
  const pts: Pt[] = [[topX, topY]];
  if (topY < l.hipY - 6) pts.push([hipX, l.hipY]);
  if (hemY > l.kneeY + 10) pts.push([c + wk, l.kneeY]);
  pts.push([c + atHem, hemY], [Math.max(2.5, c - atHem), hemY]);
  if (hemY > l.kneeY + 10) pts.push([Math.max(2.5, c - wk), l.kneeY]);
  const right = pts.map(([x, y]) => P(x, y)).join(" L");
  const left = [...pts].reverse().map(([x, y]) => P(-x, y)).join(" L");
  const body = `M${P(-topX, topY)} L${right} L${P(2, l.crotchY + 10)} Q${P(0, l.crotchY + 2)} ${P(-2, l.crotchY + 10)} L${left} Z`;
  let lines = waist === "Waistband" ? `M${P(-topX, topY + 10)} L${P(topX, topY + 10)}` : waistBits(l, waist, topY + 6, topX);
  if (v("Fastening", "Fly zip") === "Fly zip") lines += ` M${P(0, topY + 10)} L${P(0, l.crotchY - 4)} M${P(-7, topY + 10)} Q${P(-7, l.crotchY - 8)} ${P(0, l.crotchY - 4)}`;
  // the pocket opening ends on the side seam, wherever the rise puts the top
  const sideAt = (y: number) => (y >= l.hipY ? hipX : lerp(topX, hipX, (y - topY) / (l.hipY - topY)));
  if (pockets === "Slant") { const py = topY + 36, px = sideAt(py) - 1; lines += ` M${P(topX - 9, topY + 10)} L${P(px, py)} M${P(-(topX - 9), topY + 10)} L${P(-px, py)}`; }
  if (pockets === "Patch") lines += [1, -1].map((s) => `M${P(s * (hipX - 26), topY + 26)} L${P(s * (hipX - 8), topY + 26)} L${P(s * (hipX - 9), topY + 48)} L${P(s * (hipX - 25), topY + 48)} Z`).join(" ");
  if (pockets === "Welt") lines += [1, -1].map((s) => `M${P(s * (hipX - 24), topY + 30)} L${P(s * (hipX - 8), topY + 28)}`).join(" ");
  lines += ` M${P(c, l.crotchY + 8)} L${P(c, hemY - 2)} M${P(-c, l.crotchY + 8)} L${P(-c, hemY - 2)}`; // centre creases
  return { body, details: lines };
}
