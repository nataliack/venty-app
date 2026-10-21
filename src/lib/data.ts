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
  // one vocabulary: the title starts with the same word as the short label in the progress bar,
  // and the description gives the sewing term and which way the tape runs
  { key: "around", title: "Around the body", short: "Around", desc: "Circumferences: neck, ribs, arm, wrist, hip and thigh" },
  { key: "down", title: "Lengths", short: "Lengths", desc: "Top to bottom: back, front, arm and leg" },
  { key: "across", title: "Widths", short: "Widths", desc: "Side to side: shoulders, back and chest" },
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
  { id: "p1", name: "Flutter midi dress", garment: "flutter" as GarmentKey, body: "Me, Spring 26", pieces: 6, status: "Printed", spec: { ease: 4, fabric: "Viscose crepe", stretch: "No", drape: 0.72, seam: 1.5, printer: "A4" as const, sheets: 9, metres: 2.6 } },
  { id: "p2", name: "Bias slip skirt", garment: "biasskirt" as GarmentKey, body: "Me, Spring 26", pieces: 4, status: "Fitting" },
  { id: "p3", name: "Camp collar shirt", garment: "shirt" as GarmentKey, body: "Tom", pieces: 7, status: "Draft" },
  { id: "p4", name: "Wide-leg trousers", garment: "wideleg" as GarmentKey, body: "Mum", pieces: 5, status: "Printed", spec: { ease: 8, fabric: "Linen", stretch: "No", drape: 0.5, seam: 1.5, printer: "A0" as const, sheets: 1, metres: 2.9 } },
];

// ─── Fit and fabric advice ────────────────────────────────────────────
// Ease = the extra room (cm) between the body and the garment.
export const FITS = [
  { key: "tight", label: "Close", ease: 1, note: "Close to the body" },
  { key: "easy", label: "Relaxed", ease: 4, note: "A little room to move" },
  { key: "loose", label: "Loose", ease: 8, note: "Relaxed and flowing" },
  { key: "oversized", label: "Oversized", ease: 16, note: "Big and roomy" },
] as const;
export const fitName = (ease: number) => (ease <= 2 ? "Close" : ease <= 6 ? "Relaxed" : ease <= 12 ? "Loose" : "Oversized");

// What fabric suits a fit. Described by how it behaves, not by name, so people can find their own.
export function fabricAdvice(ease: number): { stretch: "A lot" | "A bit" | "No"; title: string; why: string; drape: string } {
  if (ease <= 2) return { stretch: "A lot", title: "A stretchy fabric", why: "A close fit needs fabric that stretches and springs back, so you can move and get it on.", drape: "Soft or medium" };
  if (ease <= 6) return { stretch: "A bit", title: "Little or no stretch", why: "With a little room, a fabric with a bit of give or none at all works well.", drape: "Soft to medium" };
  if (ease <= 12) return { stretch: "No", title: "A fabric with no stretch", why: "A loose fit has room built in, so the fabric does not need to stretch. Soft fabrics hang nicely.", drape: "Soft and drapey" };
  return { stretch: "No", title: "A fabric with no stretch", why: "An oversized fit holds its shape best in fabric that does not stretch. Crisp or soft both work.", drape: "Crisp or soft" };
}

// Fabric to buy, at 140 cm wide, with 10% extra for shrinkage
export function metresFor(garment: GarmentKey, ease: number) {
  const cat = garment === "flutter" ? "Dresses" : templateBy(garment).category;
  const base = { Dresses: 2.2, Tops: 1.3, Pants: 2.4, Skirts: 1.5 }[cat];
  return Math.round((base + Math.max(0, ease) * 0.03) * 1.1 * 10) / 10;
}

// The same pattern on a narrower or wider fabric needs more or fewer metres (laid out for 140 cm by default).
export const FABRIC_WIDTHS = [115, 140, 150] as const;
export const metresAt = (garment: GarmentKey, ease: number, width: number) => Math.round(metresFor(garment, ease) * Math.pow(140 / width, 0.8) * 10) / 10;

// What else to buy, from the garment's details: the fastening, interfacing for any facing, and thread.
export function notionsFor(details: [string, string][], pieces: PieceKey[]): string[] {
  const d = Object.fromEntries(details);
  const out: string[] = [];
  const f = d.Fastening ?? "";
  if (/fly/i.test(f)) out.push("A trouser zip, 18 cm");
  else if (/zip/i.test(f)) out.push(`An invisible zip, ${/side/i.test(f) ? 20 : 55} cm`);
  if (/button/i.test(f)) out.push("6 buttons, 12 mm");
  if (/hook/i.test(f)) out.push("1 hook and eye");
  if (/elastic|pull-on|drawstring|paperbag/i.test(`${f} ${d.Waist ?? ""}`)) out.push("Elastic, 2.5 cm wide, your waist plus 5 cm");
  if (pieces.includes("facing") || pieces.includes("waistband") || pieces.includes("collar")) out.push("Light fusible interfacing, 0.5 m");
  out.push("1 spool of matching thread");
  return out;
}

// ─── What you are making: four kinds of garment, each with its own details ─────────────
export type Kind = "dress" | "top" | "skirt" | "trousers";
export const KINDS: { key: Kind; label: string }[] = [{ key: "dress", label: "Dress" }, { key: "top", label: "Top" }, { key: "skirt", label: "Skirt" }, { key: "trousers", label: "Trousers" }];
export const kindOf = (g: GarmentKey): Kind => (g === "flutter" ? "dress" : ({ Dresses: "dress", Tops: "top", Pants: "trousers", Skirts: "skirt" } as const)[templateBy(g).category]);
export const kindLabel = (k: Kind) => KINDS.find((x) => x.key === k)!.label;

// what the words say you are making (a "shirt dress" is a dress, "pants" are trousers)
export function detectKind(words?: string): Kind | null {
  const t = ` ${(words ?? "").toLowerCase()} `;
  if (/dress|gown|frock/.test(t)) return "dress";
  if (/pant|trouser|jean|slack|chino|culotte|shorts|legging|joggers/.test(t)) return "trousers";
  if (/skirt/.test(t)) return "skirt";
  if (/\btop\b|shirt|blouse|\btee\b|t-shirt|cami|tank|bodice|crop/.test(t)) return "top";
  return null;
}

const SLEEVES = ["Sleeveless", "Cap", "Short", "Flutter", "Puff", "Elbow", "Three-quarter", "Long", "Bell"];
const NECKLINES = ["V-neck", "Round", "Scoop", "Square", "Sweetheart", "Boat", "High neck", "Halter", "Off-shoulder", "Cowl"];
// Every detail of each kind of garment, the range a sewist expects, and what the pretend AI reads first.
export const KIND_DETAILS: Record<Kind, { read: [string, string][]; opts: Record<string, string[]> }> = {
  dress: {
    read: FLUTTER.read,
    opts: {
      Sleeves: SLEEVES, Neckline: NECKLINES,
      Length: ["Extra mini", "Mini", "Above the knee", "Knee", "Midi", "Maxi"],
      Waist: ["Fitted", "Relaxed", "Tie", "Elastic", "Empire", "Drop waist", "Belted"],
      Skirt: ["A-line", "Straight", "Bodycon", "Bias cut", "Pencil", "Pleated", "Full circle", "Wrap", "Tiered", "Mermaid"],
      Fastening: ["Back zip", "Side zip", "Buttons", "Wrap tie", "Pull-on", "Hook and eye"],
    },
  },
  top: {
    read: [["Sleeves", "Short"], ["Neckline", "Round"], ["Length", "Hip"], ["Shape", "Relaxed"], ["Fastening", "Pull-on"]],
    opts: {
      Sleeves: SLEEVES, Neckline: [...NECKLINES, "Collar"],
      Length: ["Cropped", "Waist", "Hip", "Tunic"],
      Shape: ["Fitted", "Relaxed", "Boxy", "Oversized", "Peplum", "Wrap"],
      Fastening: ["Pull-on", "Buttons", "Back zip", "Side zip", "Wrap tie"],
    },
  },
  skirt: {
    read: [["Length", "Midi"], ["Shape", "A-line"], ["Waist", "Waistband"], ["Fastening", "Side zip"]],
    opts: {
      Length: ["Mini", "Above the knee", "Knee", "Midi", "Maxi"],
      Shape: ["A-line", "Straight", "Pencil", "Bias cut", "Pleated", "Full circle", "Wrap", "Tiered"],
      Waist: ["Waistband", "Elastic", "Yoke", "Drawstring", "Paperbag"],
      Fastening: ["Side zip", "Back zip", "Pull-on", "Buttons", "Wrap tie"],
    },
  },
  trousers: {
    read: [["Rise", "Mid"], ["Leg", "Straight"], ["Length", "Full"], ["Waist", "Waistband"], ["Pockets", "Slant"], ["Fastening", "Fly zip"]],
    opts: {
      Rise: ["Low", "Mid", "High"],
      Leg: ["Straight", "Wide", "Slim", "Tapered", "Flared", "Barrel"],
      Length: ["Shorts", "Knee", "Cropped", "Ankle", "Full"],
      Waist: ["Waistband", "Elastic", "Drawstring", "Paperbag"],
      Pockets: ["None", "Slant", "Patch", "Welt"],
      Fastening: ["Fly zip", "Side zip", "Pull-on", "Buttons"],
    },
  },
};
export const detailOpts = (kind: Kind, key: string) => KIND_DETAILS[kind].opts[key] ?? [];

// one plain line that says what the garment is, built from its details
export function describe(kind: Kind, details: [string, string][]) {
  const v = (k: string) => (details.find(([x]) => x.toLowerCase() === k)?.[1] ?? "").toLowerCase();
  if (kind === "trousers") return `${v("rise")} rise, ${v("leg")} leg, ${v("length")} length, ${v("pockets") === "none" ? "no" : v("pockets")} pockets.`.replace(/^./, (c) => c.toUpperCase());
  if (kind === "skirt") return `${v("length")} length, ${v("shape")}, ${v("waist")} waist.`.replace(/^./, (c) => c.toUpperCase());
  if (kind === "top") return `${v("sleeves")} sleeves, ${v("neckline")}, ${v("length")} length, ${v("shape")} shape.`.replace(/^./, (c) => c.toUpperCase());
  return `${v("length")} length, ${v("sleeves")} sleeves, ${v("neckline")}, ${v("skirt")} skirt.`.replace(/^./, (c) => c.toUpperCase());
}

// A pattern's name says what you asked for ("Straight mid-rise trousers", "Midi A-line skirt"); a pre-made pattern
// keeps its own name.
export function nameFor(garment: GarmentKey, kind?: Kind, details?: [string, string][]) {
  const own = garment === "flutter" ? FLUTTER.name : templateBy(garment).name;
  if (!kind || !details) return own;
  const v = (k: string) => details.find(([x]) => x === k)?.[1] ?? "";
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  if (kind === "trousers") return v("Length") === "Shorts" ? cap(`${v("Leg").toLowerCase()} ${v("Rise").toLowerCase()}-rise shorts`) : cap(`${v("Leg").toLowerCase()} ${v("Rise").toLowerCase()}-rise trousers`);
  if (kind === "skirt") return `${v("Length")} ${v("Shape").toLowerCase()} skirt`.replace(/a-line/, "A-line");
  if (kind === "top") return garment === "shirt" ? `${v("Sleeves")}-sleeve shirt`.replace("Long-sleeve", "Long-sleeved") : garment === "cami" ? "Cami top" : `${v("Sleeves")}-sleeve top`.replace("Sleeveless-sleeve", "Sleeveless");
  if (garment === "wrap") return `${v("Length")} wrap dress`;
  return `${v("Length")} ${v("Skirt").toLowerCase()} dress`.replace(/a-line/, "A-line");
}

// where each kind's length is measured from, its range, and a typical starting length
export const LENGTH_DIAL: Record<Kind, { label: string; min: number; max: number; start: number }> = {
  dress: { label: "Shoulder to hem", min: 80, max: 130, start: 104 },
  top: { label: "Shoulder to hem", min: 40, max: 80, start: 62 },
  skirt: { label: "Waist to hem", min: 35, max: 110, start: 70 },
  trousers: { label: "Waist to hem", min: 30, max: 115, start: 102 },
};

// The pretend AI read: start from the kind's usual garment and change any detail the words name. The words also choose
// the pattern drawing: a wrap dress, a shirt or a cami, a mini or a bias skirt, wide-leg or straight trousers.
export function readDesign(words: string | undefined, kind: Kind): { garment: GarmentKey; details: [string, string][]; lengthCm: number } {
  const t = ` ${(words ?? "").toLowerCase()} `;
  const read = new Map(KIND_DETAILS[kind].read.map(([k, v]) => [k, v]));
  const pick = (key: string, list: [RegExp, string][]) => { if (!read.has(key)) return; for (const [re, v] of list) if (re.test(t)) { read.set(key, v); return; } };
  pick("Sleeves", [[/sleeveless|strapless|\btank/, "Sleeveless"], [/flutter/, "Flutter"], [/puff/, "Puff"], [/bell sleeve/, "Bell"], [/three.quarter|3\/4/, "Three-quarter"], [/long sleeve/, "Long"], [/short sleeve/, "Short"], [/cap sleeve/, "Cap"]]);
  pick("Neckline", [[/v.?neck/, "V-neck"], [/sweetheart/, "Sweetheart"], [/square neck/, "Square"], [/scoop/, "Scoop"], [/boat neck|bateau/, "Boat"], [/halter/, "Halter"], [/cowl/, "Cowl"], [/off.the.shoulder|off.shoulder/, "Off-shoulder"], [/high neck|turtle/, "High neck"], [/collar/, "Collar"], [/round neck|crew/, "Round"]]);
  pick("Length", kind === "trousers" ? [[/shorts/, "Shorts"], [/crop/, "Cropped"], [/ankle/, "Ankle"], [/full.length|long/, "Full"]]
    : kind === "top" ? [[/crop/, "Cropped"], [/tunic|long/, "Tunic"], [/waist length/, "Waist"]]
    : [[/maxi|floor/, "Maxi"], [/midi/, "Midi"], [/knee/, "Knee"], [/mini/, "Mini"]]);
  pick("Skirt", [[/bodycon/, "Bodycon"], [/pencil/, "Pencil"], [/pleat/, "Pleated"], [/circle/, "Full circle"], [/tier/, "Tiered"], [/bias|slip/, "Bias cut"], [/mermaid/, "Mermaid"], [/straight skirt/, "Straight"], [/a.line/, "A-line"]]);
  pick("Shape", kind === "skirt" ? [[/pencil/, "Pencil"], [/pleat/, "Pleated"], [/circle/, "Full circle"], [/tier/, "Tiered"], [/bias|slip/, "Bias cut"], [/straight/, "Straight"], [/wrap/, "Wrap"], [/a.line/, "A-line"]]
    : [[/fitted|bodycon/, "Fitted"], [/boxy/, "Boxy"], [/oversize/, "Oversized"], [/peplum/, "Peplum"], [/wrap/, "Wrap"]]);
  pick("Rise", [[/high.?(rise|waist)/, "High"], [/mid.?rise/, "Mid"], [/low.?rise/, "Low"]]);
  pick("Leg", [[/wide/, "Wide"], [/slim|skinny/, "Slim"], [/taper/, "Tapered"], [/flare|boot.?cut/, "Flared"], [/barrel/, "Barrel"], [/straight/, "Straight"]]);
  pick("Pockets", [[/no pockets?/, "None"], [/patch pocket/, "Patch"], [/welt/, "Welt"]]);
  pick("Waist", kind === "dress" ? [[/empire/, "Empire"], [/drop waist/, "Drop waist"], [/belt/, "Belted"], [/elastic/, "Elastic"]] : [[/elastic/, "Elastic"], [/drawstring/, "Drawstring"], [/paperbag/, "Paperbag"], [/yoke/, "Yoke"]]);
  pick("Fastening", [[/button/, "Buttons"], [/side zip/, "Side zip"], [/back zip/, "Back zip"], [/pull.on|elastic|drawstring/, "Pull-on"]]);
  const wrap = /\bwrap\b/.test(t);
  let garment: GarmentKey;
  if (kind === "dress") {
    if (wrap) { read.set("Waist", "Tie"); read.set("Skirt", "Wrap"); read.set("Fastening", "Wrap tie"); }
    garment = wrap ? "wrap" : /\bslip\b|strappy|spaghetti/.test(t) ? "slip" : "flutter";
  } else if (kind === "top") {
    garment = /shirt|blouse|button|collar/.test(t) && !/t-shirt|\btee\b/.test(t) ? "shirt" : /cami|strap|tank/.test(t) ? "cami" : "tee";
    if (garment === "shirt") { read.set("Fastening", "Buttons"); read.set("Neckline", "Collar"); if (!/short sleeve/.test(t)) read.set("Sleeves", "Long"); }
    if (garment === "cami") read.set("Sleeves", "Sleeveless");
  } else if (kind === "skirt") {
    garment = read.get("Length") === "Mini" ? "mini" : "biasskirt";
  } else {
    garment = read.get("Leg") === "Wide" || read.get("Leg") === "Flared" || read.get("Leg") === "Barrel" ? "wideleg" : "straight";
  }
  return { garment, details: [...read.entries()], lengthCm: LENGTH_DIAL[kind].start };
}
