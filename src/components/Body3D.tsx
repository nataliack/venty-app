"use client";
// The 3D body: MakeHuman's mannequin with a smooth helmet head (public/body3d/<sex>.glb, a skinned mesh with its
// measure shape keys), fitted to the person's measurements (fitBody), posed and framed for the measurement being
// taken (bodyShots), and finished by a "look" (material, lights, shadow) that can be tuned live in the lab.
// three.js through React Three Fiber. Frames are drawn only while something moves or changes. Drag to turn the body;
// it turns slowly by itself on the torso shots, but never with reduced motion (then poses and shots also cut instead
// of easing).
/* eslint-disable react-hooks/immutability -- three.js objects (materials, meshes, bones) are changed in place by design;
   React Three Fiber renders them, React does not */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF, Line } from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Line2 } from "three/examples/jsm/lines/Line2.js";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { fitBody, landmarks, type Sex3D } from "@/lib/fitBody";
import { POSES, SHOTS, type PoseName, type Shot } from "@/lib/bodyShots";
import model from "@/lib/body3d.json";

// the model's address carries a stamp of its bytes (written by the export), so a new export is never served from a cache
const glbUrl = (sex: Sex3D) => `/body3d/${sex}.glb?v=${(model as { glb?: Record<string, string> }).glb?.[sex] ?? "0"}`;

export type Look = {
  color: string; metalness: number; roughness: number; clearcoat: number; clearcoatRoughness: number;
  sheen: number; sheenColor: string; envIntensity: number;
  keyIntensity: number; keyColor: string; keyAzimuth: number; keyElevation: number;
  fillIntensity: number; fillColor: string;
  rimIntensity: number; rimColor: string;
  ambient: number;
  shadowOpacity: number; shadowBlur: number;
  ringColor: string;
};

export const LOOKS: Record<string, Look> = {
  // the default (Jose's, 23 Oct 2026): a pale blue-grey, glossy but not metallic, lit from the fill and the rim, no
  // floor shadow, a cornflower tape
  venty: { color: "#b0c3d4", metalness: 0, roughness: 0.15, clearcoat: 0.43, clearcoatRoughness: 0.15, sheen: 0, sheenColor: "#8c9cf8", envIntensity: 1.2, keyIntensity: 0, keyColor: "#e6e9ff", keyAzimuth: 35, keyElevation: 40, fillIntensity: 0.6, fillColor: "#687ef5", rimIntensity: 2.4, rimColor: "#8c9cf8", ambient: 0.15, shadowOpacity: 0, shadowBlur: 0, ringColor: "#687ef5" },
  chrome: { color: "#c9d0f5", metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.15, sheen: 0, sheenColor: "#8c9cf8", envIntensity: 1.2, keyIntensity: 2.2, keyColor: "#e6e9ff", keyAzimuth: 35, keyElevation: 40, fillIntensity: 0.6, fillColor: "#687ef5", rimIntensity: 2.4, rimColor: "#8c9cf8", ambient: 0.15, shadowOpacity: 0.55, shadowBlur: 2.4, ringColor: "#ffffff" },
  porcelain: { color: "#e9ebf4", metalness: 0, roughness: 0.42, clearcoat: 0.8, clearcoatRoughness: 0.3, sheen: 0.2, sheenColor: "#c1c8d9", envIntensity: 0.8, keyIntensity: 2.6, keyColor: "#ffffff", keyAzimuth: 30, keyElevation: 45, fillIntensity: 0.8, fillColor: "#a0abca", rimIntensity: 1.6, rimColor: "#8c9cf8", ambient: 0.25, shadowOpacity: 0.45, shadowBlur: 2.6, ringColor: "#687ef5" },
  matte: { color: "#4d5e85", metalness: 0, roughness: 0.85, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.5, sheenColor: "#8c9cf8", envIntensity: 0.6, keyIntensity: 2.4, keyColor: "#f0f4fe", keyAzimuth: 40, keyElevation: 35, fillIntensity: 0.7, fillColor: "#687ef5", rimIntensity: 2.8, rimColor: "#a9b5fb", ambient: 0.2, shadowOpacity: 0.5, shadowBlur: 2.2, ringColor: "#ffffff" },
};

const dir = (az: number, el: number, r = 4): [number, number, number] => {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  return [Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r + 1, Math.cos(a) * Math.cos(e) * r];
};
const AXIS = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
// the whole body is framed as if it stood this tall (m, the tallest the app takes), feet on the same line: so a
// taller body visibly reaches higher, rather than every height filling the frame alike
const FULL_FRAME = 2.0;
// how fast the tape's dashes run round the body (m/s, before the body's scale)
const TAPE_SPEED = 0.12;
// how much of the way to go this frame (speed per second); 0 = cut straight there
const ease = (dt: number, speed: number) => (speed <= 0 ? 1 : 1 - Math.exp(-dt * speed));

type Rig = {
  root: THREE.Object3D; body: THREE.SkinnedMesh; meshes: THREE.Mesh[];
  bones: Record<string, THREE.Bone>;
  rest: Record<string, { local: THREE.Quaternion; world: THREE.Quaternion; dir: THREE.Vector3 }>;
  hipY: number; kneeY: number;
};

// a copy of the body for this view (its own skeleton, its own shape key weights), with the rest pose recorded
function useRig(sex: Sex3D): Rig {
  const { scene } = useGLTF(glbUrl(sex));
  return useMemo(() => {
    const root = cloneSkinned(scene);
    root.updateMatrixWorld(true);
    const meshes: THREE.Mesh[] = [];
    let body: THREE.SkinnedMesh | null = null;
    const bones: Record<string, THREE.Bone> = {};
    root.traverse((o) => {
      if ((o as THREE.Bone).isBone) bones[o.name] = o as THREE.Bone;
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        m.frustumCulled = false; // posed limbs can leave the rest pose's bounds
        meshes.push(m);
        if (m.morphTargetDictionary && Object.keys(m.morphTargetDictionary).length) body = m as THREE.SkinnedMesh;
      }
    });
    const rootQ = root.getWorldQuaternion(new THREE.Quaternion()).invert();
    const rest: Rig["rest"] = {};
    const at = (b: THREE.Object3D) => b.getWorldPosition(new THREE.Vector3()).applyQuaternion(rootQ);
    for (const [n, b] of Object.entries(bones)) {
      // the way the bone points: from its joint to the middle of the joints it carries
      const kids = b.children.filter((c) => (c as THREE.Bone).isBone);
      const dir = kids.length ? kids.reduce((v, c) => v.add(at(c)), new THREE.Vector3()).divideScalar(kids.length).sub(at(b)).normalize() : new THREE.Vector3(0, 1, 0);
      rest[n] = { local: b.quaternion.clone(), world: rootQ.clone().multiply(b.getWorldQuaternion(new THREE.Quaternion())), dir };
    }
    const y = (n: string) => (bones[n] ? bones[n].getWorldPosition(new THREE.Vector3()).y : 0);
    return { root, body: body as unknown as THREE.SkinnedMesh, meshes, bones, rest, hipY: y("thigh_l"), kneeY: y("calf_l") };
  }, [scene]);
}

// a pose as each turned bone's local rotation: the turns about the body's axes, carried into the bone's rest frame
function poseTargets(rig: Rig, pose: PoseName): Record<string, THREE.Quaternion> {
  const byBone: Record<string, THREE.Quaternion> = {};
  for (const t of POSES[pose]) {
    if ("aim" in t) continue;
    const q = new THREE.Quaternion().setFromAxisAngle(AXIS[t.axis], (t.deg * Math.PI) / 180);
    byBone[t.bone] = byBone[t.bone] ? q.multiply(byBone[t.bone]) : q;
  }
  // aims, in order (a forearm before its hand): the turn that brings the bone, carried by its parents' turns, to point
  // the way asked
  for (const t of POSES[pose]) {
    if (!("aim" in t) || !rig.rest[t.bone]) continue;
    const carried = new THREE.Quaternion();
    for (let p = rig.bones[t.bone].parent; p && (p as THREE.Bone).isBone; p = p.parent) if (byBone[p.name]) carried.premultiply(byBone[p.name]);
    const want = new THREE.Vector3(...t.aim).normalize().applyQuaternion(carried.clone().invert());
    byBone[t.bone] = new THREE.Quaternion().setFromUnitVectors(rig.rest[t.bone].dir, want);
  }
  const out: Record<string, THREE.Quaternion> = {};
  for (const [n, qA] of Object.entries(byBone)) {
    const r = rig.rest[n];
    if (!r) continue;
    out[n] = r.local.clone().multiply(r.world.clone().invert().multiply(qA).multiply(r.world));
  }
  return out;
}

function Mannequin({ sex, measures, look, shot, still, yawRef }: { sex: Sex3D; measures: Partial<Record<string, number>>; look: Look; shot: Shot; still: boolean; yawRef: React.MutableRefObject<number> }) {
  const rig = useRig(sex);
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<THREE.Group>(null);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial(), []);
  useEffect(() => {
    material.color.set(look.color); material.metalness = look.metalness; material.roughness = look.roughness;
    material.clearcoat = look.clearcoat; material.clearcoatRoughness = look.clearcoatRoughness;
    material.sheen = look.sheen; material.sheenColor.set(look.sheenColor); material.envMapIntensity = look.envIntensity;
    material.needsUpdate = true;
    rig.meshes.forEach((m) => { m.material = material; m.castShadow = true; });
    invalidate();
  }, [look, material, rig, invalidate]);

  const fit = useMemo(() => fitBody(sex, measures), [sex, measures]);
  useEffect(() => {
    const dict = rig.body.morphTargetDictionary ?? {};
    const inf = rig.body.morphTargetInfluences ?? [];
    for (const [name, i] of Object.entries(dict)) inf[i] = fit.weights[name] ?? 0;
    invalidate();
  }, [fit, rig, invalidate]);

  // the pose this shot wants, and (sitting) how far the body drops so the feet stay on the floor
  const target = useMemo(() => poseTargets(rig, shot.pose), [rig, shot.pose]);
  const drop = shot.pose === "seated" ? rig.hipY - rig.kneeY : 0;
  useFrame((_, dt) => {
    const k = ease(dt, still ? 0 : 7);
    let moving = false;
    for (const [n, b] of Object.entries(rig.bones)) {
      const to = target[n] ?? rig.rest[n].local;
      if (b.quaternion.angleTo(to) > 1e-4) { b.quaternion.slerp(to, k); moving = true; }
    }
    const g = group.current;
    if (g) {
      const y = -drop * fit.scale;
      if (Math.abs(g.position.y - y) > 1e-4) { g.position.y += (y - g.position.y) * k; moving = true; }
      if (Math.abs(g.rotation.y - yawRef.current) > 1e-4) { g.rotation.y += (yawRef.current - g.rotation.y) * ease(dt, 12); moving = true; }
    }
    if (moving) invalidate();
  });

  // the tape ring, traced on the fitted body: the skin at that height (shape keys applied), the torso only (no arm
  // points, then split from anything else by a gap), the outline a tape follows (its convex hull), a few millimetres off the skin
  const ringPts = useMemo(() => {
    const ring = shot.ring;
    if (!ring) return null;
    const lm = landmarks(sex)[ring];
    const geo = rig.body.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute | undefined;
    if (lm === undefined || !pos) return null;
    const band = 0.01;
    const morphs = geo.morphAttributes.position ?? [];
    const names = Object.entries(rig.body.morphTargetDictionary ?? {});
    // the tape goes round the torso only: points carried mostly by an arm bone are left out (at the bust the arms are
    // close enough to the sides to be taken for torso)
    const skinI = geo.attributes.skinIndex as THREE.BufferAttribute | undefined, skinW = geo.attributes.skinWeight as THREE.BufferAttribute | undefined;
    const armBone = new Set(rig.body.skeleton.bones.map((b, k) => (/upperarm|lowerarm|hand|thumb|index|middle|ring|pinky/.test(b.name) ? k : -1)).filter((k) => k >= 0));
    const onArm = (i: number) => {
      if (!skinI || !skinW) return false;
      let w = 0;
      for (let c = 0; c < 4; c++) if (armBone.has(skinI.getComponent(i, c))) w += skinW.getComponent(i, c);
      return w > 0.5;
    };
    // the fitted torso's skin (shape keys applied)
    const skin: [number, number, number][] = [];
    for (let i = 0; i < pos.count; i++) {
      if (onArm(i)) continue;
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      for (const [name, j] of names) {
        const w = fit.weights[name];
        if (!w || !morphs[j]) continue;
        x += morphs[j].getX(i) * w; y += morphs[j].getY(i) * w; z += morphs[j].getZ(i) * w;
      }
      skin.push([x, y, z]);
    }
    // the base body's height for the tape; the bust follows the fitted bust's fullest point (a fuller bust sits lower)
    let y0 = lm / 100;
    if (ring === "bust") {
      let best = -Infinity;
      for (const [x, y, z] of skin) if (Math.abs(x) < 0.15 && y > y0 - 0.08 && y < y0 + 0.04 && z > best) { best = z; y0 = y; }
    }
    const pts: [number, number][] = skin.filter(([, y]) => Math.abs(y - y0) < band).map(([x, , z]) => [x, z]);
    pts.sort((p, q) => p[0] - q[0]);
    const mid = pts.findIndex((p) => p[0] >= 0);
    if (mid < 0) return null;
    let lo = mid, hi = mid;
    while (lo > 0 && pts[lo][0] - pts[lo - 1][0] < 0.02) lo--;
    while (hi < pts.length - 1 && pts[hi + 1][0] - pts[hi][0] < 0.02) hi++;
    const torso = pts.slice(lo, hi + 1);
    const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const L: number[][] = [], U: number[][] = [];
    for (const q of torso) { while (L.length >= 2 && cross(L[L.length - 2], L[L.length - 1], q) <= 0) L.pop(); L.push(q); }
    for (const q of [...torso].reverse()) { while (U.length >= 2 && cross(U[U.length - 2], U[U.length - 1], q) <= 0) U.pop(); U.push(q); }
    const hull = [...L.slice(0, -1), ...U.slice(0, -1)];
    if (hull.length < 3) return null;
    const cx = hull.reduce((t, q) => t + q[0], 0) / hull.length, cz = hull.reduce((t, q) => t + q[1], 0) / hull.length;
    const out = hull.map(([x, z]) => {
      const dx = x - cx, dz = z - cz, r = Math.hypot(dx, dz) || 1, off = 0.006;
      return new THREE.Vector3(cx + dx + (dx / r) * off, y0, cz + dz + (dz / r) * off);
    });
    return [...out, out[0]];
  }, [shot.ring, sex, rig, fit.weights]);

  // the tape's dashes run round the body (about three times as fast as the body turns), so the measurement reads at a
  // glance; still with reduced motion
  const tapeRef = useRef<Line2 | LineSegments2>(null);
  useFrame((_, dt) => {
    if (tapeRef.current && !still) tapeRef.current.material.dashOffset -= dt * TAPE_SPEED;
  });

  // the stool for the seated rise: a plain round seat just under the thighs
  const seatTop = (rig.kneeY - 0.075) * fit.scale;
  return (
    <>
      <group ref={group}>
        <group scale={fit.scale}>
          <primitive object={rig.root} />
          {/* the tape: flat colour (no light, no reflection, no tone mapping), thick enough to read at a glance */}
          {ringPts && <Line ref={tapeRef} points={ringPts} color={look.ringColor} lineWidth={3.5} toneMapped={false} dashed dashSize={0.014} gapSize={0.009} />}
        </group>
      </group>
      {shot.pose === "seated" && (
        <mesh position={[0, seatTop / 2, -0.035 * fit.scale]} material={material} castShadow>
          <cylinderGeometry args={[0.17 * fit.scale, 0.17 * fit.scale, seatTop, 48]} />
        </mesh>
      )}
    </>
  );
}

// The camera glides to the shot: the band of the body it frames, from the front, side or back.
function Camera({ shot, height, still }: { shot: Shot; height: number; still: boolean }) {
  const { camera, size, invalidate } = useThree();
  const goal = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const fov = (cam.fov * Math.PI) / 180;
    const [y0, y1] = shot.y;
    const whole = y0 === 0 && y1 === 1;
    // a band of the body follows the body's own height; the whole body, the tallest frame (see FULL_FRAME)
    const H = whole ? Math.max(height, FULL_FRAME) : height;
    const bandH = (y1 - y0) * H * 1.12;
    // across: the whole body needs its own width (arms out at most about 0.6 of its height); a band, some room round it
    const bandW = whole ? 0.6 * height : Math.max(0.5 * H * (y1 - y0 > 0.6 ? 1 : 0.7), bandH * 0.62);
    const aspect = size.width / size.height;
    const d = Math.max(bandH / 2 / Math.tan(fov / 2), bandW / 2 / (Math.tan(fov / 2) * aspect));
    const az = (shot.az * Math.PI) / 180;
    const look = new THREE.Vector3((shot.x ?? 0) * height, ((y0 + y1) / 2) * H, 0);
    return { look, pos: look.clone().add(new THREE.Vector3(Math.sin(az) * d, 0, Math.cos(az) * d)) };
  }, [camera, size, shot, height]);
  const lookAt = useRef<THREE.Vector3 | null>(null);
  useFrame((_, dt) => {
    const k = ease(dt, still ? 0 : 5);
    if (!lookAt.current) { lookAt.current = goal.look.clone(); camera.position.copy(goal.pos); }
    const far = camera.position.distanceTo(goal.pos) + lookAt.current.distanceTo(goal.look);
    if (far > 1e-4) {
      camera.position.lerp(goal.pos, k);
      lookAt.current.lerp(goal.look, k);
      invalidate();
    }
    camera.lookAt(lookAt.current);
  });
  return null;
}

// the slow turn on the torso shots (not while dragging)
function Spinner({ on, yawRef, dragRef }: { on: boolean; yawRef: React.MutableRefObject<number>; dragRef: React.MutableRefObject<unknown> }) {
  useFrame((_, dt) => { if (on && !dragRef.current) yawRef.current += dt * 0.35; });
  return null;
}

// whole: frame the whole body (front on, no turning by itself) but keep the measurement's pose and tape, for a figure
// beside a list (Edit measures) rather than a close-up
export function Body3D({ sex = "female", measures = {}, look = LOOKS.venty, focus = "height", autoRotate = true, whole = false, className }: {
  sex?: Sex3D; measures?: Partial<Record<string, number>>; look?: Look; focus?: string; autoRotate?: boolean; whole?: boolean; className?: string;
}) {
  const [still, setStill] = useState(false);
  useEffect(() => { const q = window.matchMedia("(prefers-reduced-motion: reduce)"); const f = () => setStill(q.matches); f(); q.addEventListener("change", f); return () => q.removeEventListener("change", f); }, []);
  const base = SHOTS[focus] ?? SHOTS.height;
  const shot = useMemo<Shot>(() => (whole ? { ...base, y: [0, 1], x: 0, az: 0, spin: false } : base), [base, whole]);
  const spin = autoRotate && !!shot.spin && !still;
  const height = (measures.height ?? (sex === "female" ? 159 : 173)) / 100;
  // turning: a drag turns the body; the torso shots also turn slowly by themselves; a new shot faces the camera again
  const yawRef = useRef(0);
  const dragRef = useRef<{ x: number; yaw: number } | null>(null);
  useEffect(() => { yawRef.current = 0; }, [focus]);
  return (
    <div className={className} style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => { dragRef.current = { x: e.clientX, yaw: yawRef.current }; (e.target as Element).setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => { if (dragRef.current) yawRef.current = dragRef.current.yaw + (e.clientX - dragRef.current.x) * 0.012; }}
      onPointerUp={() => (dragRef.current = null)} onPointerCancel={() => (dragRef.current = null)}>
      <Canvas frameloop={spin || (shot.ring && !still) ? "always" : "demand"} dpr={[1, 2]} camera={{ fov: 26, near: 0.05, far: 50 }} gl={{ antialias: true, alpha: true }} shadows>
        <Spinner on={spin} yawRef={yawRef} dragRef={dragRef} />
        <Camera shot={shot} height={height} still={still} />
        <ambientLight intensity={look.ambient} />
        <directionalLight position={dir(look.keyAzimuth, look.keyElevation)} intensity={look.keyIntensity} color={look.keyColor} />
        <directionalLight position={dir(look.keyAzimuth - 150, 15)} intensity={look.fillIntensity} color={look.fillColor} />
        <directionalLight position={dir(180, 30)} intensity={look.rimIntensity} color={look.rimColor} />
        {/* soft studio reflections, made here (no image to download): a big softbox above, one in front, two strips */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={["#1b1c26"]} />
          <Lightformer form="rect" intensity={5} position={[0, 4, 2]} scale={[6, 3, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#e6e9ff" position={[0, 1.4, 5]} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={3} color="#c1c8d9" position={[-4, 1.5, 1]} scale={[1, 4, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#8c9cf8" position={[4, 1.5, -1]} scale={[1, 4, 1]} rotation-y={-Math.PI / 2} />
        </Environment>
        <Suspense fallback={null}>
          <Mannequin sex={sex} measures={measures} look={look} shot={shot} still={still} yawRef={yawRef} />
        </Suspense>
        {look.shadowOpacity > 0 && <ContactShadows position={[0, 0.001, 0]} opacity={look.shadowOpacity} blur={look.shadowBlur} scale={1.8} far={1} resolution={512} frames={Infinity} />}
      </Canvas>
    </div>
  );
}

useGLTF.preload(glbUrl("female"));
