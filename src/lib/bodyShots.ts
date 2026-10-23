// How the 3D body presents itself for each measurement: a pose (what the limbs do) and a shot (what the camera frames,
// and from where). Four poses cover every measurement; the camera does the rest.
//
// A pose is a few joint turns on MakeHuman's game-engine skeleton, each about an axis of the body (x: side to side,
// y: up, z: front to back), in degrees, from its rest pose (arms angled out, an A pose). The body faces +z; its left
// side is +x. Or an aim: the bone turned to point that way (in the body's axes), whatever its parents did, so a
// forearm can hang straight down from the elbow.

export type PoseName = "relaxed" | "open" | "stance" | "seated";
export type Turn = { bone: string; axis: "x" | "y" | "z"; deg: number } | { bone: string; aim: [number, number, number] };

// arms hanging: the upper arms in to the sides, the forearms and the hands pointing at the ground (a touch away from
// the thighs)
const armsHang: Turn[] = [
  { bone: "upperarm_l", axis: "z", deg: -34 }, { bone: "upperarm_r", axis: "z", deg: 34 },
  { bone: "lowerarm_l", aim: [0.1, -1, 0] }, { bone: "lowerarm_r", aim: [-0.1, -1, 0] },
  { bone: "hand_l", aim: [0.06, -1, 0] }, { bone: "hand_r", aim: [-0.06, -1, 0] },
];
// the arms in to the sides with the elbows a little bent (the start of the seated pose's hands on the thighs)
const armsDown: Turn[] = [
  { bone: "upperarm_l", axis: "z", deg: -34 }, { bone: "upperarm_r", axis: "z", deg: 34 },
  { bone: "lowerarm_l", axis: "x", deg: -6 }, { bone: "lowerarm_r", axis: "x", deg: -6 },
];
export const POSES: Record<PoseName, Turn[]> = {
  // standing naturally, arms a little away from the body
  relaxed: armsHang,
  // arms out (about 45°) and palms turned forward, so the arm and the underarm are in view, and a tape can go round the torso
  open: [
    { bone: "upperarm_l", axis: "z", deg: -6 }, { bone: "upperarm_r", axis: "z", deg: 6 },
    { bone: "upperarm_l", axis: "x", deg: -4 }, { bone: "upperarm_r", axis: "x", deg: -4 },
  ],
  // feet a little apart, so the inside leg and the thighs are in view
  stance: [...armsHang, { bone: "thigh_l", axis: "z", deg: 6 }, { bone: "thigh_r", axis: "z", deg: -6 }],
  // sitting on a stool: thighs forward, shins down, hands resting on the thighs
  seated: [
    { bone: "thigh_l", axis: "x", deg: -86 }, { bone: "thigh_r", axis: "x", deg: -86 },
    { bone: "calf_l", axis: "x", deg: 86 }, { bone: "calf_r", axis: "x", deg: 86 },
    ...armsDown, { bone: "upperarm_l", axis: "x", deg: -16 }, { bone: "upperarm_r", axis: "x", deg: -16 },
    { bone: "lowerarm_l", axis: "x", deg: -30 }, { bone: "lowerarm_r", axis: "x", deg: -30 },
  ],
};

// A shot: the pose, the part of the body to frame (a band of the standing height, 0 = floor, 1 = top of the head),
// where across (x, in body heights; the left arm is about +0.2), the view (0 front, 90 the body's left side, 180 back),
// whether it turns slowly by itself, and the tape ring to draw (a measurement with a ring on the body).
export type Shot = { pose: PoseName; y: [number, number]; x?: number; az: number; spin?: boolean; ring?: string };

const torso = (ring: string, y: [number, number]): Shot => ({ pose: "open", y, az: 0, spin: true, ring });
export const SHOTS: Record<string, Shot> = {
  height: { pose: "relaxed", y: [0, 1], az: 0 },
  bust: torso("bust", [0.56, 0.84]),
  underbust: torso("underbust", [0.54, 0.82]),
  waist: torso("waist", [0.48, 0.76]),
  highHip: torso("highHip", [0.42, 0.7]),
  hips: torso("hips", [0.38, 0.66]),
  neck: { pose: "relaxed", y: [0.74, 0.98], az: 0, ring: "neck" },
  acrossFront: { pose: "relaxed", y: [0.62, 0.9], az: 0 },
  apexApex: { pose: "relaxed", y: [0.62, 0.86], az: 0 },
  shoulderApex: { pose: "relaxed", y: [0.62, 0.9], az: 0 },
  frontNeckWaist: { pose: "relaxed", y: [0.54, 0.9], az: 0 },
  napeWaist: { pose: "relaxed", y: [0.54, 0.92], az: 180 },
  acrossBack: { pose: "relaxed", y: [0.6, 0.9], az: 180 },
  waistHip: { pose: "relaxed", y: [0.4, 0.72], az: 90 },
  shoulderLength: { pose: "open", y: [0.7, 0.96], az: 180 },
  acrossShoulder: { pose: "open", y: [0.7, 0.96], az: 180 },
  armhole: { pose: "open", y: [0.62, 0.92], x: 0.12, az: 0 },
  upperArm: { pose: "open", y: [0.5, 0.92], x: 0.17, az: 0 },
  elbow: { pose: "open", y: [0.42, 0.84], x: 0.2, az: 0 },
  wrist: { pose: "open", y: [0.32, 0.76], x: 0.22, az: 0 },
  shoulderWrist: { pose: "open", y: [0.3, 0.92], x: 0.17, az: 0 },
  thigh: { pose: "stance", y: [0.24, 0.56], az: 0 },
  insideLeg: { pose: "stance", y: [0, 0.56], az: 0 },
  rise: { pose: "seated", y: [0, 0.62], az: 90 },
};

export const MEASURE_NAMES: Record<string, string> = {
  height: "Height", bust: "Bust", underbust: "Underbust", waist: "Waist", highHip: "High hip", hips: "Hips", neck: "Neck",
  acrossFront: "Across front", apexApex: "Apex to apex", shoulderApex: "Shoulder to apex", frontNeckWaist: "Front neck to waist",
  napeWaist: "Nape to waist", acrossBack: "Across back", waistHip: "Waist to hip", shoulderLength: "Shoulder length",
  acrossShoulder: "Across shoulder", armhole: "Armhole depth", upperArm: "Upper arm", elbow: "Elbow", wrist: "Wrist",
  shoulderWrist: "Shoulder to wrist", thigh: "Thigh", insideLeg: "Inside leg", rise: "Rise",
};
