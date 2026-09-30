// Mannequin silhouettes, generated from anatomical landmark points in a 200 × 530 box.
// Proportions: ~8.5 heads tall, legs ≈ 45% of height, feet included.
// Each part is a smooth closed Catmull-Rom curve; parts overlap so they read as one body.
import type { Sex } from "@/lib/data";

type Pt = [number, number];

function smooth(pts: Pt[], t = 0.5): string {
  const n = pts.length;
  const p = (i: number) => pts[(i + n) % n];
  let d = `M${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) * t) / 3, p1[1] + ((p2[1] - p0[1]) * t) / 3];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) * t) / 3, p2[1] - ((p3[1] - p1[1]) * t) / 3];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + " Z";
}
const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [200 - x, y]);

// right half of torso + right leg, from neck down the outside and back up the inside
function trunk(s: Sex): Pt[] {
  const f = s === "female";
  const right: Pt[] = f
    ? [[109, 88], [124, 94], [140, 99], [147, 106], [146, 122], [142, 134], [144, 146], [142, 162], [134, 184], [129, 205], [134, 226], [143, 250], [148, 275], [147, 298], [142, 330], [134, 368], [126, 404], [127, 438], [123, 470], [116, 494], [118, 510], [115, 524], [108, 528], [103, 524], [104, 496], [104, 470], [103, 440], [103, 406], [103, 370], [102, 330], [101, 300]]
    : [[112, 88], [130, 94], [148, 99], [156, 108], [154, 126], [149, 140], [150, 156], [146, 180], [139, 205], [138, 226], [141, 252], [144, 278], [144, 300], [140, 332], [133, 370], [127, 404], [129, 438], [125, 470], [118, 494], [120, 510], [117, 524], [109, 528], [104, 524], [105, 496], [105, 470], [104, 440], [104, 406], [103, 370], [102, 330], [101, 302]];
  const crotch: Pt = [100, f ? 293 : 296];
  const left = mirror(right).reverse();
  return [...right, crotch, ...left];
}

function arm(s: Sex, side: 1 | -1): Pt[] {
  const f = s === "female";
  const o = f ? 0 : 5; // male arms sit a little wider
  const w = f ? 0 : 1.5; // and a little thicker
  const pts: Pt[] = [
    [136 + o, 100], [148 + o, 101], [157 + o + w, 110], [163 + o + w, 132], [165 + o + w, 152], [168 + o + w, 180], [169 + o + w, 205], [172 + o + w, 240], [177 + o + w, 280],
    [180 + o, 292], [180 + o, 308], [176 + o, 318], [171 + o, 316], [168 + o, 304], [167 + o - w, 284], [160 + o - w, 244], [154 + o - w, 206], [150 + o - w, 178], [147 + o - w, 152], [143 + o, 132], [138 + o, 116],
  ];
  return side === 1 ? pts : mirror(pts).reverse();
}

function head(s: Sex): Pt[] {
  const f = s === "female";
  const hw = f ? 18 : 20;
  const r: Pt[] = [[100, 4], [100 + hw * 0.72, 9], [100 + hw, 26], [100 + hw * 0.92, 44], [100 + hw * 0.55, 60], [100 + (f ? 9 : 11), 70], [100 + (f ? 9 : 11), 92]];
  return [...r, ...mirror(r).reverse().slice(0, -1)];
}

function build(s: Sex) {
  return [smooth(head(s), 0.6), smooth(trunk(s)), smooth(arm(s, 1)), smooth(arm(s, -1))].join(" ");
}

export const BODY: Record<Sex, string> = { female: build("female"), male: build("male") };
