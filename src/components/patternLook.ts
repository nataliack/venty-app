// The pattern look of a garment on the 3D body: the garment in cornflower with its sewing pattern drawn on it in snow.
// Drawn in the browser from the garment's own texture layout: each garment's texture is laid out in flat pieces, cut
// by its modeller much like a pattern (front, back, sleeves, bands), so the edges of those pieces fall where the seams
// are. For each piece: a solid line along its edge (the seam), a dashed line just inside it (the seam allowance), the
// grainline (a double arrow along the body's up), and its name and length. A demonstration, as close as the layout
// allows: a modeller's odd cut shows as an odd seam.
import * as THREE from "three";

const CORNFLOWER = "#687ef5";
const SNOW = "#f0f4fe";
const SIZE = 1024;

type Piece = { tris: number[]; verts: Set<number>; area: number };

// the pieces of the layout: triangles joined through shared vertices (the export splits vertices where the layout is cut)
function pieces(geo: THREE.BufferGeometry): Piece[] {
  const index = geo.index;
  const n = geo.attributes.position.count;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const tri = (t: number) => (index ? [index.getX(t * 3), index.getX(t * 3 + 1), index.getX(t * 3 + 2)] : [t * 3, t * 3 + 1, t * 3 + 2]);
  const T = index ? index.count / 3 : n / 3;
  for (let t = 0; t < T; t++) { const [a, b, c] = tri(t); parent[find(a)] = find(b); parent[find(b)] = find(c); }
  // points at the same place on the layout are one point (some meshes are not joined up: every triangle on its own)
  const uv = geo.attributes.uv;
  const at = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const k = `${Math.round(uv.getX(i) * 1e5)}_${Math.round(uv.getY(i) * 1e5)}`;
    const j = at.get(k);
    if (j === undefined) at.set(k, i); else parent[find(i)] = find(j);
  }
  const by = new Map<number, Piece>();
  for (let t = 0; t < T; t++) {
    const [a, b, c] = tri(t);
    const r = find(a);
    if (!by.has(r)) by.set(r, { tris: [], verts: new Set(), area: 0 });
    const p = by.get(r)!;
    p.tris.push(a, b, c);
    p.verts.add(a); p.verts.add(b); p.verts.add(c);
    const ax = uv.getX(a), ay = uv.getY(a);
    p.area += Math.abs((uv.getX(b) - ax) * (uv.getY(c) - ay) - (uv.getX(c) - ax) * (uv.getY(b) - ay)) / 2;
  }
  return [...by.values()];
}

// what a piece is, from where it sits on the body: on the arm (its skin carried by arm bones) a sleeve; a narrow band
// round the waist a waistband; otherwise front or back by which way it faces (the body faces +z)
function nameOf(geo: THREE.BufferGeometry, p: Piece, armBone: Set<number>, waistY: number): string {
  const pos = geo.attributes.position, nrm = geo.attributes.normal;
  const si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
  let arm = 0, nz = 0, y0 = Infinity, y1 = -Infinity;
  for (const v of p.verts) {
    if (si && sw) for (let c = 0; c < 4; c++) if (armBone.has(si.getComponent(v, c))) arm += sw.getComponent(v, c);
    if (nrm) nz += nrm.getZ(v);
    y0 = Math.min(y0, pos.getY(v)); y1 = Math.max(y1, pos.getY(v));
  }
  const k = p.verts.size;
  if (arm / k > 0.5) return "Sleeve";
  if (y1 - y0 < 0.09 && Math.abs((y0 + y1) / 2 - waistY) < 0.12) return "Waistband";
  if (y1 - y0 < 0.06) return "Band";
  return nz >= 0 ? "Front" : "Back";
}

export function patternTextures(mesh: THREE.SkinnedMesh, scale: number): { map: THREE.CanvasTexture; lines: THREE.CanvasTexture } | null {
  const geo = mesh.geometry;
  const uv = geo.attributes.uv;
  if (!uv) return null;
  const pos = geo.attributes.position;
  const armBone = new Set(mesh.skeleton.bones.map((b, i) => (/upperarm|lowerarm|hand/.test(b.name) ? i : -1)).filter((i) => i >= 0));
  const pelvis = mesh.skeleton.bones.find((b) => b.name === "spine_01");
  const waistY = pelvis ? pelvis.getWorldPosition(new THREE.Vector3()).y : 1;

  const mk = () => { const c = document.createElement("canvas"); c.width = c.height = SIZE; return c; };
  const colour = mk(), glow = mk();
  const g = colour.getContext("2d")!, e = glow.getContext("2d")!;
  g.fillStyle = CORNFLOWER; g.fillRect(0, 0, SIZE, SIZE);
  e.fillStyle = "#000"; e.fillRect(0, 0, SIZE, SIZE);
  const P = (i: number) => [uv.getX(i) * SIZE, uv.getY(i) * SIZE] as const;
  const both = (f: (c: CanvasRenderingContext2D) => void) => { f(g); f(e); };

  const all = pieces(geo);
  const biggest = Math.max(...all.map((p) => p.area));
  for (const p of all) {
    // the piece's edges: the sides of its triangles that only one triangle uses
    const count = new Map<string, number>();
    const third = new Map<string, number>();
    const pk = (i: number) => `${Math.round(uv.getX(i) * 1e5)}_${Math.round(uv.getY(i) * 1e5)}`;
    const ends = new Map<string, [number, number]>();
    for (let t = 0; t < p.tris.length; t += 3) {
      const [a, b, c] = [p.tris[t], p.tris[t + 1], p.tris[t + 2]];
      for (const [x, y, z] of [[a, b, c], [b, c, a], [c, a, b]]) {
        const kx = pk(x), ky = pk(y);
        const k = kx < ky ? `${kx}|${ky}` : `${ky}|${kx}`;
        ends.set(k, [x, y]);
        count.set(k, (count.get(k) ?? 0) + 1);
        third.set(k, z);
      }
    }
    const edges = [...count].filter(([, n]) => n === 1).map(([k]) => [...ends.get(k)!, third.get(k)!]);
    const small = p.area < biggest * 0.04;
    both((c) => {
      c.strokeStyle = SNOW; c.lineCap = "round";
      // the seam
      c.setLineDash([]); c.lineWidth = small ? 2.5 : 3.5;
      c.beginPath();
      for (const [a, b] of edges) { const [ax, ay] = P(a), [bx, by] = P(b); c.moveTo(ax, ay); c.lineTo(bx, by); }
      c.stroke();
      // the seam allowance, a little inside the seam (each edge moved towards the rest of its triangle)
      if (!small) {
        c.setLineDash([10, 8]); c.lineWidth = 2;
        c.beginPath();
        for (const [a, b, t] of edges) {
          const [ax, ay] = P(a), [bx, by] = P(b), [tx, ty] = P(t);
          let nx = -(by - ay), ny = bx - ax;
          const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
          if ((tx - ax) * nx + (ty - ay) * ny < 0) { nx = -nx; ny = -ny; }
          const d = 11;
          c.moveTo(ax + nx * d, ay + ny * d); c.lineTo(bx + nx * d, by + ny * d);
        }
        c.stroke();
        c.setLineDash([]);
      }
    });
    if (small) continue;

    // where the label goes: on the part of the piece that faces out most (the front of a piece that wraps the body,
    // like a circle skirt), half way up it; the grainline and the reading direction are worked out from the points round
    // there, so they hold on a curved layout too
    const nrm = geo.attributes.normal;
    let pY0 = Infinity, pY1 = -Infinity, posN = 0, negN = 0;
    for (const v of p.verts) {
      pY0 = Math.min(pY0, pos.getY(v)); pY1 = Math.max(pY1, pos.getY(v));
      const z = nrm ? nrm.getZ(v) : 0;
      if (z > 0.5) posN++; else if (z < -0.5) negN++;
    }
    const wraps = posN > 0.15 * p.verts.size && negN > 0.15 * p.verts.size;
    const midY = (pY0 + pY1) / 2;
    let anchor = -1, best = -Infinity;
    for (const v of p.verts) {
      const score = (nrm ? nrm.getZ(v) * (wraps ? 1 : Math.sign(posN - negN || 1)) : 0) - Math.abs(pos.getY(v) - midY) / Math.max(pY1 - pY0, 1e-3);
      if (score > best) { best = score; anchor = v; }
    }
    const au = uv.getX(anchor), av = uv.getY(anchor);
    const reach = Math.sqrt(p.area) * 0.45;
    const near = [...p.verts].filter((v) => Math.hypot(uv.getX(v) - au, uv.getY(v) - av) < reach);
    const use = near.length >= 6 ? near : [...p.verts];
    let su = 0, sv = 0, sy = 0, sx = 0, sz = 0, k = 0;
    for (const v of use) { su += uv.getX(v); sv += uv.getY(v); sy += pos.getY(v); sx += pos.getX(v); sz += nrm ? nrm.getZ(v) : 0; k++; }
    const mu = au, mv = av, my = sy / k, mx = sx / k;
    let uu = 0, uv2 = 0, vv = 0, uy = 0, vy = 0, ux = 0, vx = 0;
    for (const v of use) {
      const du = uv.getX(v) - su / k, dv = uv.getY(v) - sv / k, dy = pos.getY(v) - my, dx = pos.getX(v) - mx;
      uu += du * du; uv2 += du * dv; vv += dv * dv; uy += du * dy; vy += dv * dy; ux += du * dx; vx += dv * dx;
    }
    const y0 = pY0, y1 = pY1;
    const det = uu * vv - uv2 * uv2 || 1e-9;
    // height grows along (a, b) on the layout; up the body is the gradient of height over the layout
    const a = (uy * vv - vy * uv2) / det, b = (vy * uu - uy * uv2) / det;
    // and the way that reads left to right for someone looking at the piece (the body's +x from the front, -x from behind)
    const facing = sz >= 0 ? 1 : -1;
    const rx = facing * (ux * vv - vx * uv2) / det, ry = facing * (vx * uu - ux * uv2) / det;
    let gx = a, gy = b;
    const gl = Math.hypot(gx, gy) || 1; gx /= gl; gy /= gl;
    const cx = mu * SIZE, cy = mv * SIZE;
    const span = Math.sqrt(p.area) * SIZE * (wraps ? 0.25 : 0.42);
    const named = nameOf(geo, p, armBone, waistY);
    // a piece that wraps the body is named for what it is, not for one side
    const name = wraps && (named === "Front" || named === "Back") ? (midY < waistY ? "Skirt" : "Bodice") : named;
    const cm = Math.round((y1 - y0) * scale * 100);
    both((c) => {
      // the grainline: a double arrow
      const x0 = cx - gx * span, yA = cy - gy * span, x1 = cx + gx * span, yB = cy + gy * span;
      c.strokeStyle = SNOW; c.fillStyle = SNOW; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x0, yA); c.lineTo(x1, yB); c.stroke();
      const head = (hx: number, hy: number, dx: number, dy: number) => {
        c.beginPath(); c.moveTo(hx, hy);
        c.lineTo(hx - dx * 16 - dy * 8, hy - dy * 16 + dx * 8);
        c.lineTo(hx - dx * 16 + dy * 8, hy - dy * 16 - dx * 8);
        c.closePath(); c.fill();
      };
      head(x1, yB, gx, gy); head(x0, yA, -gx, -gy);
      // the name and the length, upright on the body, beside the grainline
      const fs = Math.max(16, Math.min(40, span * 0.22));
      c.save();
      c.translate(cx, cy);
      // the text's up along the grainline (towards the head), and mirrored where the layout is
      const th = Math.atan2(gx, -gy);
      c.rotate(th);
      if (Math.cos(th) * rx + Math.sin(th) * ry < 0) c.scale(-1, 1);
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = `500 ${fs}px "Familjen Grotesk", system-ui, sans-serif`;
      // beside the grainline, not across it
      c.textAlign = "left";
      const off = fs * 0.55;
      c.fillText(name, off, -fs * 0.45);
      c.font = `400 ${fs * 0.75}px "Familjen Grotesk", system-ui, sans-serif`;
      c.fillText(`${cm} cm`, off, fs * 0.55);
      c.restore();
    });
  }
  const tex = (cv: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(cv);
    t.flipY = false; // glTF's layout reads top down
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { map: tex(colour), lines: tex(glow) };
}
