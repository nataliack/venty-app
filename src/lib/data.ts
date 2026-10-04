// Static demo data for the Venty expo prototype.

export type Sex = "female" | "male";

export type Marker =
  | { kind: "ring"; y: number; w: number; x?: number } // horizontal ring around the body (body coords 200x530)
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number }; // straight tape line

export type Measure = {
  key: string;
  label: string;
  group: "base" | "around" | "down" | "across" | "sitting";
  value: number; // default cm
  min: number;
  max: number;
  hint: string;
  how: string[];
  marker: Marker;
};

export const BASE: Measure[] = [
  { key: "height", label: "Height", group: "base", value: 168, min: 140, max: 200, hint: "Stand tall against a wall, heels together.", how: ["Stand barefoot against a wall.", "Rest a book flat on your head.", "Measure from the floor to the book."], marker: { kind: "line", x1: 184, y1: 2, x2: 184, y2: 528 } },
  { key: "bust", label: "Bust", group: "base", value: 88, min: 70, max: 130, hint: "Around the fullest part of your bust. Keep the tape level across your back.", how: ["Wear a thin, unpadded top.", "Wrap the tape round the fullest part.", "Keep it level across your back."], marker: { kind: "ring", y: 140, w: 100 } },
  { key: "waist", label: "Waist", group: "base", value: 70, min: 55, max: 120, hint: "Around your natural waist, the narrowest point.", how: ["Bend to one side to find the crease.", "Wrap the tape round that point.", "Breathe out normally, then read."], marker: { kind: "ring", y: 205, w: 72 } },
  { key: "hips", label: "Hips", group: "base", value: 96, min: 75, max: 140, hint: "Around the fullest part of your hips and seat.", how: ["Stand with feet together.", "Wrap the tape round the fullest part of your seat.", "Check it's level all the way round."], marker: { kind: "ring", y: 275, w: 110 } },
];

export const WIZARD: Measure[] = [
  // Circumferences
  { key: "neck", label: "Neck", group: "around", value: 34.5, min: 28, max: 48, hint: "Around the base of your neck.", how: ["Stand tall and look straight ahead.", "Wrap the tape round the base of your neck.", "Slip one finger under the tape, then read."], marker: { kind: "ring", y: 78, w: 26 } },
  { key: "underbust", label: "Underbust", group: "around", value: 76, min: 60, max: 110, hint: "Around your ribcage, just under the bust.", how: ["Find the band just under your bust.", "Wrap the tape snug round your ribcage.", "Keep it level at the back."], marker: { kind: "ring", y: 162, w: 88 } },
  { key: "upperArm", label: "Upper arm", group: "around", value: 28.5, min: 20, max: 45, hint: "Around the fullest part of your upper arm.", how: ["Relax your arm by your side.", "Wrap the tape round the fullest part, between shoulder and elbow.", "Keep it snug, not tight. Read where it meets."], marker: { kind: "ring", y: 150, w: 20, x: 155 } },
  { key: "elbow", label: "Elbow", group: "around", value: 24, min: 18, max: 36, hint: "Around your elbow with the arm slightly bent.", how: ["Bend your arm a little.", "Wrap the tape round the elbow joint.", "Read with the arm still bent."], marker: { kind: "ring", y: 205, w: 16, x: 161 } },
  { key: "wrist", label: "Wrist", group: "around", value: 15.5, min: 12, max: 22, hint: "Around your wrist bone.", how: ["Find the bump of your wrist bone.", "Wrap the tape round just above it.", "Leave room for one finger."], marker: { kind: "ring", y: 285, w: 14, x: 172 } },
  { key: "highHip", label: "High hip", group: "around", value: 88, min: 65, max: 130, hint: "Around your hip bones, between waist and hips.", how: ["Find the top of your hip bones.", "Wrap the tape round at that level.", "It sits about 10 cm below your waist."], marker: { kind: "ring", y: 238, w: 94 } },
  { key: "thigh", label: "Thigh", group: "around", value: 54, min: 40, max: 80, hint: "Around the fullest part of one thigh.", how: ["Stand with weight on both feet.", "Wrap the tape round the top of one thigh.", "Keep it level, then read."], marker: { kind: "ring", y: 320, w: 40, x: 78 } },
  // Lengths
  { key: "napeWaist", label: "Nape to waist", group: "down", value: 40.5, min: 32, max: 50, hint: "From the bone at the back of your neck to your waist.", how: ["Tilt your head forward to find the neck bone.", "Hold the tape there.", "Run it straight down your spine to your waist."], marker: { kind: "line", x1: 100, y1: 82, x2: 100, y2: 205 } },
  { key: "frontNeckWaist", label: "Front neck to waist", group: "down", value: 34, min: 28, max: 46, hint: "From the hollow of your neck down to your waist.", how: ["Find the dip at the base of your throat.", "Run the tape down over your bust.", "Stop at your natural waist."], marker: { kind: "line", x1: 100, y1: 92, x2: 100, y2: 205 } },
  { key: "armhole", label: "Armhole depth", group: "down", value: 19.5, min: 14, max: 26, hint: "From the top of the shoulder to the underarm.", how: ["Rest a ruler under your arm.", "Measure from the top of your shoulder…", "…straight down to the ruler."], marker: { kind: "line", x1: 146, y1: 100, x2: 146, y2: 150 } },
  { key: "shoulderApex", label: "Shoulder to apex", group: "down", value: 25, min: 18, max: 34, hint: "From the shoulder point to the fullest point of the bust.", how: ["Start where your neck meets your shoulder.", "Run the tape down to your bust point.", "Read at the fullest point."], marker: { kind: "line", x1: 118, y1: 95, x2: 122, y2: 140 } },
  { key: "waistHip", label: "Waist to hip", group: "down", value: 21, min: 14, max: 30, hint: "Down your side from waist to the fullest part of your hips.", how: ["Tie a string round your waist.", "Measure down your side…", "…to the fullest part of your hips."], marker: { kind: "line", x1: 150, y1: 205, x2: 154, y2: 275 } },
  { key: "shoulderWrist", label: "Shoulder to wrist", group: "down", value: 58, min: 45, max: 70, hint: "From the shoulder point, over a bent elbow, to the wrist.", how: ["Bend your elbow slightly.", "Start at the tip of your shoulder.", "Run over the elbow down to your wrist bone."], marker: { kind: "line", x1: 154, y1: 104, x2: 172, y2: 285 } },
  { key: "insideLeg", label: "Inside leg", group: "down", value: 78, min: 65, max: 95, hint: "From your crotch down to the floor.", how: ["Stand with feet slightly apart.", "Start the tape at the top of your inner leg.", "Run it straight down to the floor."], marker: { kind: "line", x1: 92, y1: 292, x2: 88, y2: 525 } },
  // Widths
  { key: "shoulderLength", label: "Shoulder length", group: "across", value: 12.5, min: 9, max: 17, hint: "From the side of your neck to the shoulder point.", how: ["Find where your neck meets your shoulder.", "Run the tape along the top of your shoulder.", "Stop at the bony tip."], marker: { kind: "line", x1: 113, y1: 90, x2: 150, y2: 101 } },
  { key: "acrossShoulder", label: "Across shoulder", group: "across", value: 38, min: 32, max: 48, hint: "Across your back from shoulder point to shoulder point.", how: ["Find both bony shoulder tips.", "Measure straight across your upper back.", "Keep the tape level."], marker: { kind: "line", x1: 50, y1: 102, x2: 150, y2: 102 } },
  { key: "acrossBack", label: "Across back", group: "across", value: 34.5, min: 28, max: 44, hint: "Across your back, halfway between neck and underarm.", how: ["Let your arms hang naturally.", "Measure across your back…", "…between the two arm creases."], marker: { kind: "line", x1: 58, y1: 122, x2: 142, y2: 122 } },
  { key: "acrossFront", label: "Across front", group: "across", value: 33, min: 26, max: 42, hint: "Across your chest between the arm creases.", how: ["Find the crease where arm meets chest.", "Measure straight across the front.", "Stay above the bust."], marker: { kind: "line", x1: 60, y1: 118, x2: 140, y2: 118 } },
  { key: "apexApex", label: "Apex to apex", group: "across", value: 18.5, min: 14, max: 26, hint: "Between the fullest points of your bust.", how: ["Find the fullest point of each side.", "Measure straight across between them.", "Keep the tape flat."], marker: { kind: "line", x1: 80, y1: 140, x2: 120, y2: 140 } },
  // Rise (seated)
  { key: "rise", label: "Rise", group: "sitting", value: 27, min: 20, max: 36, hint: "Sit on a hard chair. Measure down your side, from your waist to the seat.", how: ["Sit up straight on a hard, flat chair.", "Measure down your side from your waist…", "…to the chair seat."], marker: { kind: "line", x1: 154, y1: 205, x2: 156, y2: 290 } },
];

export const GROUPS = [
  // sewing terms, named by the direction the tape runs; the short labels sit in the progress bar
  { key: "around", title: "Circumferences", short: "Around", desc: "Measured around your body: neck, ribs, arm, wrist, hip and thigh" },
  { key: "down", title: "Vertical lengths", short: "Down", desc: "Measured from top to bottom: back, front, arm and leg" },
  { key: "across", title: "Horizontal widths", short: "Across", desc: "Measured from side to side: shoulders, back and chest" },
  { key: "sitting", title: "Seated rise", short: "Seated", desc: "One measurement, sitting on a hard chair" },
] as const;

export type GroupKey = (typeof GROUPS)[number]["key"];

export const ALL_MEASURES = [...BASE, ...WIZARD];
export const defaultMeasures = (): Record<string, number> => Object.fromEntries(ALL_MEASURES.map((m) => [m.key, m.value]));

// ─── Garments & templates ─────────────────────────────────────────────

export type GarmentKey =
  | "slip" | "wrap" | "aline" | "cami" | "tee" | "shirt" | "wideleg" | "straight" | "biasskirt" | "mini" | "flutter";

export type Category = "Dresses" | "Tops" | "Pants" | "Skirts";

export type Template = {
  key: GarmentKey;
  name: string;
  category: Category;
  level: "Easy" | "Intermediate" | "Hard";
  pieces: number;
  tag: string;
  blurb: string;
  lengths: string[];
  defaultLength: string;
  color: string; // glow colour
  pieceSet: PieceKey[];
};

export type PieceKey = "bodiceFront" | "bodiceBack" | "skirtFront" | "skirtBack" | "sleeve" | "facing" | "trouserFront" | "trouserBack" | "waistband" | "collar";

export const TEMPLATES: Template[] = [
  { key: "slip", name: "Slip dress", category: "Dresses", level: "Easy", pieces: 3, tag: "Bias cut", blurb: "A bias-cut slip with thin straps and a soft V neck. It skims the body, so Venty adds a little ease at the hip.", lengths: ["Mini", "Midi", "Maxi"], defaultLength: "Midi", color: "#687ef5", pieceSet: ["bodiceFront", "bodiceBack", "facing"] },
  { key: "wrap", name: "Wrap dress", category: "Dresses", level: "Intermediate", pieces: 6, tag: "Tie waist", blurb: "A true wrap with a crossover bodice, flutter sleeves and a tie at the waist. Adjusts to you as you wear it.", lengths: ["Knee", "Midi", "Maxi"], defaultLength: "Midi", color: "#4f63e0", pieceSet: ["bodiceFront", "bodiceBack", "skirtFront", "skirtBack", "sleeve", "waistband"] },
  { key: "aline", name: "A-line midi", category: "Dresses", level: "Easy", pieces: 5, tag: "Fitted bodice", blurb: "A fitted, sleeveless bodice with a softly flared A-line skirt. A calm first dress with a waist seam.", lengths: ["Knee", "Midi", "Maxi"], defaultLength: "Midi", color: "#8c9cf8", pieceSet: ["bodiceFront", "bodiceBack", "skirtFront", "skirtBack", "facing"] },
  { key: "cami", name: "Cami", category: "Tops", level: "Easy", pieces: 3, tag: "Thin straps", blurb: "A simple cami with a curved neckline and spaghetti straps. Cut on the bias so it drapes.", lengths: ["Cropped", "Hip"], defaultLength: "Hip", color: "#4f63e0", pieceSet: ["bodiceFront", "bodiceBack", "facing"] },
  { key: "tee", name: "Boxy tee", category: "Tops", level: "Easy", pieces: 4, tag: "Relaxed", blurb: "A relaxed, boxy tee with dropped shoulders and a neat neckband. Perfect for your first knit.", lengths: ["Cropped", "Hip"], defaultLength: "Hip", color: "#687ef5", pieceSet: ["bodiceFront", "bodiceBack", "sleeve", "facing"] },
  { key: "shirt", name: "Shirt", category: "Tops", level: "Hard", pieces: 9, tag: "Collared", blurb: "A classic button-up shirt with a two-piece collar, placket and long sleeves. A project to be proud of.", lengths: ["Hip", "Long"], defaultLength: "Hip", color: "#8c9cf8", pieceSet: ["bodiceFront", "bodiceBack", "sleeve", "collar", "facing"] },
  { key: "wideleg", name: "Wide-leg trouser", category: "Pants", level: "Intermediate", pieces: 6, tag: "High waist", blurb: "High-waisted trousers with a wide, fluid leg and front pleats. Graded to your waist, hip and rise.", lengths: ["Cropped", "Full"], defaultLength: "Full", color: "#3e4db8", pieceSet: ["trouserFront", "trouserBack", "waistband"] },
  { key: "straight", name: "Straight pant", category: "Pants", level: "Intermediate", pieces: 6, tag: "Pockets", blurb: "An everyday straight-leg pant with slant pockets and a fly front. Fitted through the seat.", lengths: ["Ankle", "Full"], defaultLength: "Full", color: "#4f63e0", pieceSet: ["trouserFront", "trouserBack", "waistband"] },
  { key: "biasskirt", name: "Bias midi skirt", category: "Skirts", level: "Easy", pieces: 2, tag: "Elastic waist", blurb: "A bias-cut midi skirt that moves beautifully. Two pieces and an elastic waist.", lengths: ["Knee", "Midi", "Maxi"], defaultLength: "Midi", color: "#8c9cf8", pieceSet: ["skirtFront", "skirtBack"] },
  { key: "mini", name: "A-line mini", category: "Skirts", level: "Easy", pieces: 3, tag: "Zip back", blurb: "A crisp A-line mini with a contour waistband and centre-back zip.", lengths: ["Micro", "Mini"], defaultLength: "Mini", color: "#687ef5", pieceSet: ["skirtFront", "skirtBack", "waistband"] },
];

export const CATEGORIES: Category[] = ["Dresses", "Tops", "Pants", "Skirts"];
export const LEVELS = ["Easy", "Intermediate", "Hard"] as const;
export const templateBy = (k: GarmentKey) => TEMPLATES.find((t) => t.key === k) ?? TEMPLATES[0];

// The "photo" garment: what the fake AI reads from an uploaded photo.
export const FLUTTER = {
  key: "flutter" as GarmentKey,
  name: "Flutter midi dress",
  read: [
    ["Sleeves", "Flutter"],
    ["Neckline", "V-neck"],
    ["Length", "Midi"],
    ["Waist", "Fitted"],
    ["Skirt", "A-line"],
    ["Fastening", "Back zip"],
  ] as [string, string][],
  match: 92,
};

export const PIECE_LABEL: Record<PieceKey, string> = {
  bodiceFront: "Bodice front",
  bodiceBack: "Bodice back",
  skirtFront: "Skirt front",
  skirtBack: "Skirt back",
  sleeve: "Sleeve",
  facing: "Neck facing",
  trouserFront: "Trouser front",
  trouserBack: "Trouser back",
  waistband: "Waistband",
  collar: "Collar",
};

export const FABRICS = [
  { name: "Viscose crepe", note: "Best drape for flutter sleeves", swatch: "#4f63e0", best: true },
  { name: "Cotton lawn", note: "Light, easy to sew", swatch: "#4d5e85" },
  { name: "Silk crepe de chine", note: "Luxe, trickier to handle", swatch: "#a0abca" },
];

export const SEED_PATTERNS = [
  { id: "p1", name: "Flutter midi dress", garment: "flutter" as GarmentKey, body: "Me, Spring 26", pieces: 6, status: "Printed" },
  { id: "p2", name: "Bias slip skirt", garment: "biasskirt" as GarmentKey, body: "Me, Spring 26", pieces: 4, status: "Fitting" },
  { id: "p3", name: "Camp collar shirt", garment: "shirt" as GarmentKey, body: "Tom", pieces: 7, status: "Draft" },
  { id: "p4", name: "Wide-leg trousers", garment: "wideleg" as GarmentKey, body: "Mum", pieces: 5, status: "Printed" },
];
