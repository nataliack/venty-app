"use client";
// The 3D body: MakeHuman's mannequin (public/body3d/<sex>.glb), fitted to the person's measurements (fitBody), lit and
// finished by a "look" (material, lights, shadow) that can be tuned live in the lab. three.js through React Three Fiber.
// It draws a frame only when something changes, unless it is turning by itself (not with reduced motion).
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF, Line } from "@react-three/drei";
import { fitBody, landmarks, type Sex3D } from "@/lib/fitBody";

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
  chrome: { color: "#c9d0f5", metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.15, sheen: 0, sheenColor: "#8c9cf8", envIntensity: 1.2, keyIntensity: 2.2, keyColor: "#e6e9ff", keyAzimuth: 35, keyElevation: 40, fillIntensity: 0.6, fillColor: "#687ef5", rimIntensity: 2.4, rimColor: "#8c9cf8", ambient: 0.15, shadowOpacity: 0.55, shadowBlur: 2.4, ringColor: "#ffffff" },
  porcelain: { color: "#e9ebf4", metalness: 0, roughness: 0.42, clearcoat: 0.8, clearcoatRoughness: 0.3, sheen: 0.2, sheenColor: "#c1c8d9", envIntensity: 0.8, keyIntensity: 2.6, keyColor: "#ffffff", keyAzimuth: 30, keyElevation: 45, fillIntensity: 0.8, fillColor: "#a0abca", rimIntensity: 1.6, rimColor: "#8c9cf8", ambient: 0.25, shadowOpacity: 0.45, shadowBlur: 2.6, ringColor: "#687ef5" },
  matte: { color: "#4d5e85", metalness: 0, roughness: 0.85, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.5, sheenColor: "#8c9cf8", envIntensity: 0.6, keyIntensity: 2.4, keyColor: "#f0f4fe", keyAzimuth: 40, keyElevation: 35, fillIntensity: 0.7, fillColor: "#687ef5", rimIntensity: 2.8, rimColor: "#a9b5fb", ambient: 0.2, shadowOpacity: 0.5, shadowBlur: 2.2, ringColor: "#ffffff" },
};

const dir = (az: number, el: number, r = 4): [number, number, number] => {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  return [Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r + 1, Math.cos(a) * Math.cos(e) * r];
};

function Mannequin({ sex, measures, look, ring }: { sex: Sex3D; measures: Partial<Record<string, number>>; look: Look; ring?: string }) {
  const { scene } = useGLTF(`/body3d/${sex}.glb`);
  const invalidate = useThree((s) => s.invalidate);
  const mesh = useMemo(() => {
    let found: THREE.Mesh | null = null;
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && !found) found = o as THREE.Mesh; });
    // each Body3D gets its own copy, so several can show different bodies at once
    const m = (found as unknown as THREE.Mesh).clone();
    m.geometry = (found as unknown as THREE.Mesh).geometry;
    m.morphTargetInfluences = [...((found as unknown as THREE.Mesh).morphTargetInfluences ?? [])];
    m.castShadow = true;
    return m;
  }, [scene]);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial(), []);
  useEffect(() => {
    material.color.set(look.color); material.metalness = look.metalness; material.roughness = look.roughness;
    material.clearcoat = look.clearcoat; material.clearcoatRoughness = look.clearcoatRoughness;
    material.sheen = look.sheen; material.sheenColor.set(look.sheenColor); material.envMapIntensity = look.envIntensity;
    material.needsUpdate = true; mesh.material = material; invalidate();
  }, [look, material, mesh, invalidate]);
  const fit = useMemo(() => fitBody(sex, measures), [sex, measures]);
  useEffect(() => {
    const dict = mesh.morphTargetDictionary ?? {};
    const inf = mesh.morphTargetInfluences ?? [];
    for (const [name, i] of Object.entries(dict)) inf[i] = fit.weights[name] ?? 0;
    invalidate();
  }, [fit, mesh, invalidate]);
  // the tape ring for the measurement being taken, traced on the fitted body itself: the skin at that height (with
  // the shape keys applied), the torso only (not an arm), the outline a tape follows (its convex hull), a few
  // millimetres off the skin
  const ringPts = useMemo(() => {
    if (!ring) return null;
    const lm = landmarks(sex)[ring];
    const geo = mesh.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute | undefined;
    if (lm === undefined || !pos) return null;
    const y0 = lm / 100, band = 0.01;
    const morphs = geo.morphAttributes.position ?? [];
    const names = Object.entries(mesh.morphTargetDictionary ?? {});
    const pts: [number, number][] = [];
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      for (const [name, k] of names) {
        const w = fit.weights[name];
        if (!w || !morphs[k]) continue;
        x += morphs[k].getX(i) * w; y += morphs[k].getY(i) * w; z += morphs[k].getZ(i) * w;
      }
      if (Math.abs(y - y0) < band) pts.push([x, z]);
    }
    // the torso: the cluster of points around the middle, split from the arms by a gap of at least 2 cm
    pts.sort((p, q) => p[0] - q[0]);
    let lo = 0, hi = pts.length - 1;
    const mid = pts.findIndex((p) => p[0] >= 0);
    if (mid < 0) return null;
    for (lo = mid; lo > 0 && pts[lo][0] - pts[lo - 1][0] < 0.02; lo--);
    for (hi = mid; hi < pts.length - 1 && pts[hi + 1][0] - pts[hi][0] < 0.02; hi++);
    const torso = pts.slice(lo, hi + 1);
    // convex hull (monotone chain)
    const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const L: number[][] = [], U: number[][] = [];
    for (const q of torso) { while (L.length >= 2 && cross(L[L.length - 2], L[L.length - 1], q) <= 0) L.pop(); L.push(q); }
    for (const q of [...torso].reverse()) { while (U.length >= 2 && cross(U[U.length - 2], U[U.length - 1], q) <= 0) U.pop(); U.push(q); }
    const hull = [...L.slice(0, -1), ...U.slice(0, -1)];
    if (hull.length < 3) return null;
    const cx = hull.reduce((t, q) => t + q[0], 0) / hull.length, cz = hull.reduce((t, q) => t + q[1], 0) / hull.length;
    const out = hull.map(([x, z]) => {
      const dx = x - cx, dz = z - cz, r = Math.hypot(dx, dz) || 1, off = 0.004;
      return new THREE.Vector3(cx + dx + (dx / r) * off, y0, cz + dz + (dz / r) * off);
    });
    return [...out, out[0]];
  }, [ring, sex, mesh, fit.weights]);
  return (
    <group scale={fit.scale}>
      <primitive object={mesh} />
      {ringPts && <Line points={ringPts} color={look.ringColor} lineWidth={1.6} dashed dashSize={0.012} gapSize={0.008} />}
    </group>
  );
}

// Frame the whole body: the camera looks at its middle from far enough to show head to feet.
function Frame({ height }: { height: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const fov = (cam.fov * Math.PI) / 180;
    const fitH = height * 1.12, fitW = (height * 0.55) / (size.width / size.height);
    const d = Math.max(fitH, fitW) / 2 / Math.tan(fov / 2);
    cam.position.set(0, height / 2, d);
    cam.lookAt(0, height / 2, 0);
    cam.updateProjectionMatrix();
  }, [camera, size, height]);
  return null;
}

export function Body3D({ sex = "female", measures = {}, look = LOOKS.chrome, ring, autoRotate = true, className }: {
  sex?: Sex3D; measures?: Partial<Record<string, number>>; look?: Look; ring?: string; autoRotate?: boolean; className?: string;
}) {
  const [still, setStill] = useState(false);
  useEffect(() => { const q = window.matchMedia("(prefers-reduced-motion: reduce)"); const f = () => setStill(q.matches); f(); q.addEventListener("change", f); return () => q.removeEventListener("change", f); }, []);
  const spin = autoRotate && !still;
  const height = ((measures.height ?? (sex === "female" ? 159 : 173)) / 100);
  return (
    <div className={className}>
      <Canvas frameloop={spin ? "always" : "demand"} dpr={[1, 2]} camera={{ fov: 26, near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true }} shadows>
        <Frame height={height} />
        <ambientLight intensity={look.ambient} />
        <directionalLight position={dir(look.keyAzimuth, look.keyElevation)} intensity={look.keyIntensity} color={look.keyColor} />
        <directionalLight position={dir(look.keyAzimuth - 150, 15)} intensity={look.fillIntensity} color={look.fillColor} />
        <directionalLight position={dir(180, 30)} intensity={look.rimIntensity} color={look.rimColor} />
        {/* soft studio reflections, made here (no image to download): a big softbox above and two strips at the sides */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={["#1b1c26"]} />
          <Lightformer form="rect" intensity={5} position={[0, 4, 2]} scale={[6, 3, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#e6e9ff" position={[0, 1.4, 5]} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={3} color="#c1c8d9" position={[-4, 1.5, 1]} scale={[1, 4, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#8c9cf8" position={[4, 1.5, -1]} scale={[1, 4, 1]} rotation-y={-Math.PI / 2} />
        </Environment>
        <Suspense fallback={null}>
          <Mannequin sex={sex} measures={measures} look={look} ring={ring} />
        </Suspense>
        <ContactShadows position={[0, 0.001, 0]} opacity={look.shadowOpacity} blur={look.shadowBlur} scale={1.6} far={1} resolution={512} frames={Infinity} />
        <OrbitControls target={[0, height / 2, 0]} enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} autoRotate={spin} autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/body3d/female.glb");
