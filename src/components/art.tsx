"use client";
import { useId, useRef, useState, useEffect, useCallback } from "react";
import type { GarmentKey, Marker, PieceKey, Sex } from "@/lib/data";

// ─── Brand motif ──────────────────────────────────────────────────────
const MOTIF =
  "M0 417C0 418 0 419 2 419C4 419 2 421 12 418C22 415 46 406 63 402C80 398 103 394 117 393C131 392 128 390 145 397C162 404 202 424 219 433C236 442 233 434 248 451C263 468 294 516 310 535C326 554 337 561 345 568C353 575 351 573 357 576C363 579 373 583 382 586C391 589 398 591 409 592C420 593 432 593 445 591C458 589 475 584 487 582C499 580 504 583 518 579C532 575 560 566 574 560C588 554 595 549 604 545C613 541 620 541 628 537C636 533 640 529 653 521C666 513 691 499 707 491C723 483 736 478 750 471C764 464 776 458 789 447C802 436 819 420 830 408C841 396 849 386 855 378C861 370 862 370 867 361C872 352 882 333 888 323C894 313 899 310 905 301C911 292 919 278 925 270C931 262 934 260 943 251C952 242 973 226 982 218C991 210 996 204 999 201C1002 198 1000 198 999 197C998 196 997 194 996 194C995 194 996 192 991 194C986 196 977 202 965 208C953 214 936 222 920 228C904 234 879 242 867 246C855 250 855 248 848 250C841 252 832 257 825 259C818 261 814 261 808 263C802 265 796 269 792 271C788 273 787 272 781 274C775 276 766 280 758 286C750 292 742 298 732 308C722 318 706 334 697 346C688 358 683 368 676 383C669 398 660 420 653 435C646 450 638 461 631 470C624 479 618 484 612 490C606 496 598 501 594 503C590 505 590 504 589 504C588 504 585 506 587 502C589 498 596 489 600 482C604 475 607 467 609 460C611 453 612 448 613 442C614 436 615 428 615 421C615 414 615 409 614 403C613 397 613 393 610 384C607 375 604 364 596 348C588 332 571 302 565 291C559 280 561 285 558 281C555 277 550 272 545 268C540 264 542 265 531 259C520 253 492 242 478 234C464 226 453 219 445 214C437 209 440 212 431 203C422 194 402 174 393 162C384 150 380 142 376 130C372 118 370 103 369 93C368 83 367 83 368 71C369 59 374 32 374 22C374 12 372 17 370 14C368 11 362 5 359 3C356 1 355 0 353 0C351 -0 355 -4 345 0C335 4 305 20 294 26C283 32 285 34 279 37C273 40 263 45 257 47C251 49 246 49 242 51C238 53 240 55 231 61C222 67 202 80 191 87C180 94 171 97 166 100C161 103 160 104 159 106C158 108 160 108 159 109C158 110 157 113 155 114C153 115 151 117 149 116C147 115 145 111 144 110C143 109 142 108 141 109C140 110 139 114 135 116C131 118 123 118 116 122C109 126 100 134 94 138C88 142 83 140 78 143C73 146 69 152 65 154C61 156 59 156 56 157C53 158 49 161 47 163C45 165 44 166 44 171C44 176 44 187 44 194C44 201 45 204 47 212C49 220 52 233 56 243C60 253 65 264 70 273C75 282 80 289 86 296C92 303 97 309 105 316C113 323 126 332 134 337C142 342 155 346 156 349C157 352 148 356 141 358C134 360 126 360 114 363C102 366 80 376 69 379C58 382 56 380 48 383C40 386 28 394 20 399C12 404 4 410 1 413C-2 416 -0 416 0 417Z";

export function Motif({ width = 96, className, color = "#fff" }: { width?: number; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 1000 593" width={width} height={(width * 593) / 1000} className={className} aria-hidden>
      <path d={MOTIF} fill={color} />
    </svg>
  );
}

// ─── Body silhouettes (200 × 530) ─────────────────────────────────────
const BODY: Record<Sex, string> = {
  female:
    "M111 60L112 65L111 83L111 86L113 89L116 91L137 98L147 102L154 108L156 114L156 119L156 123L150 134L146 144L146 151L147 163L147 167L138 197L135 212L136 222L138 235L148 260L153 278L155 289L155 298L153 318L148 354L135 401L135 411L138 432L138 444L137 455L134 470L125 500L125 505L128 514L128 521L126 525L124 527L119 528L113 528L111 527L110 525L108 516L113 444L113 432L110 398L108 347L105 312L101 289L100 287L99 290L97 302L94 321L90 398L87 432L87 444L92 518L90 525L89 527L87 528L81 528L76 527L74 525L73 522L72 514L75 505L75 500L66 470L64 459L62 444L62 432L65 411L65 401L55 366L51 350L46 311L45 295L45 289L47 278L52 260L62 235L65 222L65 212L62 197L53 167L53 163L54 151L54 144L50 134L44 123L44 117L45 110L47 107L51 104L58 100L84 91L87 89L89 86L89 83L88 65L89 60L94 58L100 57L107 58L111 60ZM148 101L150 100L154 102L159 107L161 113L162 121L166 189L172 237L175 285L179 303L179 312L179 327L177 339L174 348L171 354L169 355L167 354L165 348L165 336L166 311L166 292L163 262L146 124L146 109L147 103L148 101ZM52 101L50 100L46 102L41 107L39 113L38 121L34 189L28 237L25 285L21 303L21 312L21 327L23 339L26 348L29 354L31 355L33 354L35 348L35 336L34 311L34 292L37 262L54 124L54 109L53 103L52 101ZM100 2L110 3L113 4L117 8L120 14L122 22L123 28L123 37L122 44L117 56L113 63L109 66L100 69L91 66L88 64L84 58L79 46L77 32L77 26L78 18L82 9L86 5L90 3L100 2Z",
  male:
    "M115 60L116 62L117 65L115 80L115 83L116 88L121 91L146 97L158 102L161 105L165 110L166 114L166 119L164 128L157 140L154 148L153 164L144 216L144 223L148 271L149 288L148 323L144 360L135 405L135 413L138 438L138 449L137 460L134 474L127 500L127 505L130 514L129 525L127 527L124 528L117 529L113 528L110 526L108 521L108 514L110 497L114 447L114 433L111 398L107 322L106 314L102 300L100 293L99 296L95 311L94 322L89 398L86 433L86 447L92 520L91 524L90 526L88 528L85 529L78 529L74 528L72 526L71 523L70 514L73 505L73 500L66 474L63 460L62 449L62 438L65 413L65 405L56 360L52 323L51 302L52 271L56 223L56 216L47 164L46 148L43 140L36 128L35 123L34 116L36 108L39 105L44 101L54 97L79 91L84 88L86 83L85 80L83 65L84 62L85 60L91 58L100 57L109 58L115 60ZM157 100L159 100L163 103L169 110L172 121L173 135L176 195L181 251L183 290L186 304L186 313L186 329L184 341L181 351L177 357L174 358L172 356L170 350L170 338L172 295L159 166L154 134L154 113L155 104L157 100ZM43 100L41 100L37 103L31 110L28 121L27 135L24 195L19 251L17 290L14 304L14 313L14 329L16 341L19 351L23 357L26 358L28 356L30 350L30 338L28 295L42 163L46 134L46 113L45 104L43 100ZM100 2L111 3L115 5L119 9L123 18L124 31L123 45L121 53L119 59L115 64L111 67L100 70L89 67L86 65L82 61L79 55L77 49L76 35L77 22L79 14L81 9L85 5L89 3L100 2Z",
};

type BodyProps = {
  sex?: Sex;
  width?: number;
  variant?: "dots" | "solid";
  markers?: Marker[];
  garment?: GarmentKey | null;
  garmentStyle?: "flat" | "fabric";
  scaleX?: number; // subtle proportion changes (e.g. bust/hips)
  className?: string;
  glow?: boolean;
  label?: string; // marker label e.g. HERE
  dim?: number;
};

export function BodyFigure({ sex = "female", width = 140, variant = "dots", markers = [], garment = null, garmentStyle = "fabric", scaleX = 1, className, glow = true, label, dim = 1 }: BodyProps) {
  const id = useId().replace(/:/g, "");
  const h = (width * 530) / 200;
  return (
    <svg viewBox="-10 -6 220 542" width={width * 1.1} height={h * 1.02} className={className} style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <pattern id={`d${id}`} width="3.4" height="3.4" patternUnits="userSpaceOnUse">
          <circle cx="1.7" cy="1.7" r="1.05" fill="#fff" />
        </pattern>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset=".55" stopColor="#c1c8d9" stopOpacity=".85" />
          <stop offset="1" stopColor="#687ef5" stopOpacity=".55" />
        </linearGradient>
        <mask id={`m${id}`}>
          <path d={BODY[sex]} fill={`url(#g${id})`} />
        </mask>
        <filter id={`f${id}`} x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={`mk${id}`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <g transform={`translate(${100 - 100 * scaleX} 0) scale(${scaleX} 1)`} opacity={dim}>
        {glow && <path d={BODY[sex]} fill="#687ef5" opacity=".55" filter={`url(#f${id})`} />}
        {variant === "dots" ? (
          <rect x="0" y="0" width="200" height="530" fill={`url(#d${id})`} mask={`url(#m${id})`} />
        ) : (
          <path d={BODY[sex]} fill={`url(#g${id})`} />
        )}
      </g>
      {garment && <GarmentOn garment={garment} style={garmentStyle} />}
      {markers.map((m, i) =>
        m.kind === "ring" ? (
          <g key={i}>
            <ellipse cx={m.x ?? 100} cy={m.y} rx={m.w / 2 + 4} ry={5.5} fill="none" stroke="#8c9cf8" strokeWidth="5" opacity=".6" filter={`url(#mk${id})`} />
            <ellipse cx={m.x ?? 100} cy={m.y} rx={m.w / 2 + 4} ry={5.5} fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="3 2.4" />
          </g>
        ) : (
          <g key={i}>
            <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#8c9cf8" strokeWidth="5" opacity=".55" filter={`url(#mk${id})`} />
            <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#fff" strokeWidth="1.6" strokeDasharray="3 2.4" />
            <circle cx={m.x1} cy={m.y1} r="3" fill="#fff" />
            <circle cx={m.x2} cy={m.y2} r="3" fill="#fff" />
          </g>
        ),
      )}
      {label && markers[0] && (
        <g transform={`translate(${markers[0].kind === "ring" ? (markers[0].x ?? 100) + (markers[0].w / 2) + 6 : markers[0].x2 + 6} ${markers[0].kind === "ring" ? markers[0].y - 22 : markers[0].y1 - 8})`}>
          <rect width="34" height="14" rx="7" fill="#fff" />
          <text x="17" y="10" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#0b0c15" style={{ letterSpacing: ".06em" }}>{label}</text>
        </g>
      )}
    </svg>
  );
}

// ─── Garment flats (viewBox 120 × 160) ────────────────────────────────
type Flat = { outline: string; details: string; extra?: React.ReactNode };
export const FLATS: Record<GarmentKey, Flat> = {
  slip: { outline: "M44 30 Q60 42 76 30 L79 62 L94 150 Q60 157 26 150 L41 62 Z M46 31 L50 8 M74 31 L70 8", details: "M41 62 Q60 66 79 62" },
  wrap: { outline: "M42 14 Q60 22 78 14 L96 24 L90 40 L82 35 L80 62 L98 150 Q60 157 22 150 L40 62 L38 35 L30 40 L24 24 Z", details: "M42 14 L68 62 M78 14 L54 52 M40 62 L80 62 M68 62 L73 84 M68 62 L63 82" },
  aline: { outline: "M45 12 Q60 22 75 12 L80 16 Q78 30 82 40 L80 60 L102 148 Q60 155 18 148 L40 60 L38 40 Q42 30 40 16 Z", details: "M40 60 L80 60 M52 61 L44 150 M68 61 L76 150" },
  cami: { outline: "M46 22 Q60 34 74 22 L78 62 L81 108 Q60 112 39 108 L42 62 Z M47 23 L51 6 M73 23 L69 6", details: "M44 40 Q60 48 76 40" },
  tee: { outline: "M46 16 Q60 26 74 16 L96 24 L106 50 L90 56 L88 46 L88 108 L32 108 L32 46 L30 56 L14 50 L24 24 Z", details: "M46 16 Q60 31 74 16 M32 100 L88 100" },
  shirt: { outline: "M44 16 L60 26 L76 16 L96 24 L108 90 L96 92 L88 52 L88 116 Q60 120 32 116 L32 52 L24 92 L12 90 L24 24 Z", details: "M44 16 L52 32 L60 26 L68 32 L76 16 M60 27 L60 118", extra: <>{[44, 62, 80, 98].map((y) => <circle key={y} cx="63" cy={y} r="1.3" fill="currentColor" stroke="none" />)}</> },
  wideleg: { outline: "M34 10 L86 10 L88 22 L106 150 L68 150 L60 58 L52 150 L14 150 L32 22 Z", details: "M33 21 L87 21 M60 21 L60 46 M46 22 L38 148 M74 22 L82 148" },
  straight: { outline: "M38 10 L82 10 L84 22 L88 150 L64 150 L60 62 L56 150 L32 150 L36 22 Z", details: "M37 21 L83 21 M60 21 L60 44 M40 22 Q47 33 38 40 M80 22 Q73 33 82 40" },
  biasskirt: { outline: "M40 20 L80 20 L82 29 L100 150 Q60 158 20 150 L38 29 Z", details: "M39 29 L81 29 M52 31 L45 150 M68 31 L75 150" },
  mini: { outline: "M40 40 L80 40 L81 50 L102 112 Q60 118 18 112 L39 50 Z", details: "M40 50 L80 50 M60 51 L60 114" },
  flutter: { outline: "M46 16 L60 36 L74 16 L80 20 L80 58 L99 146 Q60 153 21 146 L40 58 L40 20 Z M46 16 Q33 17 25 32 Q34 37 40 31 M74 16 Q87 17 95 32 Q86 37 80 31", details: "M40 58 Q60 62 80 58 M50 60 L42 146 M70 60 L78 146" },
};

export function Flat({ g, size = 120, className, stroke = "#fff", fill = "rgba(255,255,255,.07)" }: { g: GarmentKey; size?: number; className?: string; stroke?: string; fill?: string }) {
  const f = FLATS[g];
  return (
    <svg viewBox="0 0 120 160" width={size} height={(size * 160) / 120} className={className} style={{ color: stroke }} aria-hidden>
      <path d={f.outline} fill={fill} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d={f.details} fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" />
      {f.extra}
    </svg>
  );
}

// where each garment sits on the 200×530 body: flat point (ax,ay) → body (100,by), scale k
const ANCHOR: Record<GarmentKey, { ax: number; ay: number; by: number; k: number }> = {
  slip: { ax: 60, ay: 30, by: 141, k: 1.875 },
  wrap: { ax: 60, ay: 14, by: 92, k: 1.75 },
  aline: { ax: 60, ay: 12, by: 90, k: 1.8 },
  cami: { ax: 60, ay: 22, by: 118, k: 2.0 },
  tee: { ax: 60, ay: 16, by: 90, k: 1.55 },
  shirt: { ax: 60, ay: 16, by: 88, k: 1.5 },
  wideleg: { ax: 60, ay: 10, by: 186, k: 1.95 },
  straight: { ax: 60, ay: 10, by: 186, k: 1.8 },
  biasskirt: { ax: 60, ay: 20, by: 196, k: 1.9 },
  mini: { ax: 60, ay: 40, by: 196, k: 1.9 },
  flutter: { ax: 60, ay: 16, by: 92, k: 1.75 },
};

export function GarmentOn({ garment, style = "fabric" }: { garment: GarmentKey; style?: "flat" | "fabric" }) {
  const a = ANCHOR[garment];
  const f = FLATS[garment];
  const id = useId().replace(/:/g, "");
  return (
    <g transform={`translate(${100 - a.ax * a.k} ${a.by - a.ay * a.k}) scale(${a.k})`} style={{ color: "#fff" }}>
      <defs>
        <linearGradient id={`gf${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8c9cf8" stopOpacity=".95" />
          <stop offset="1" stopColor="#4f63e0" stopOpacity=".75" />
        </linearGradient>
      </defs>
      <path d={f.outline} fill={style === "fabric" ? `url(#gf${id})` : "rgba(11,12,21,.35)"} stroke="currentColor" strokeWidth={1.4 / a.k * 1.6} strokeLinejoin="round" />
      <path d={f.details} fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth={1 / a.k * 1.6} />
    </g>
  );
}

// ─── Pattern pieces ───────────────────────────────────────────────────
const PIECES: Record<PieceKey, { w: number; h: number; d: string; grain: [number, number, number, number]; fold?: boolean }> = {
  bodiceFront: { w: 120, h: 170, d: "M10 30 L46 14 L58 22 Q70 40 92 34 L104 44 Q98 90 106 150 L10 160 Z", grain: [40, 60, 40, 140], fold: true },
  bodiceBack: { w: 120, h: 170, d: "M10 20 L50 12 L60 20 Q72 36 94 30 L104 40 Q98 90 106 150 L10 158 Z", grain: [40, 55, 40, 140], fold: true },
  skirtFront: { w: 150, h: 250, d: "M20 10 L100 10 L136 236 L8 240 Z", grain: [60, 40, 60, 210] },
  skirtBack: { w: 150, h: 250, d: "M24 10 L104 10 L140 236 L10 240 Z M58 10 L64 70 L70 10", grain: [80, 80, 80, 210] },
  sleeve: { w: 150, h: 170, d: "M10 60 Q40 10 75 8 Q110 10 140 60 L126 158 L24 158 Z", grain: [75, 30, 75, 140] },
  facing: { w: 130, h: 70, d: "M8 10 Q65 70 122 10 L122 30 Q65 86 8 30 Z", grain: [65, 36, 65, 56] },
  trouserFront: { w: 130, h: 260, d: "M20 10 L96 10 Q104 40 122 60 L118 250 L28 250 L24 60 Z", grain: [60, 40, 60, 230] },
  trouserBack: { w: 140, h: 260, d: "M20 6 L100 14 Q108 44 132 64 L126 250 L28 250 L22 62 Z", grain: [68, 40, 68, 230] },
  waistband: { w: 170, h: 40, d: "M6 8 L164 8 L164 32 L6 32 Z", grain: [20, 20, 150, 20] },
  collar: { w: 150, h: 60, d: "M8 20 Q75 4 142 20 L136 48 Q75 36 14 48 Z", grain: [40, 30, 110, 30] },
};

export function Piece({ k, label, className, showGrid = false, allowance = false, width }: { k: PieceKey; label?: string; className?: string; showGrid?: boolean; allowance?: boolean; width?: number }) {
  const p = PIECES[k];
  const [x1, y1, x2, y2] = p.grain;
  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} width={width ?? p.w} className={className} aria-hidden style={{ overflow: "visible" }}>
      {showGrid && <rect width={p.w} height={p.h} fill="none" />}
      {allowance && <path d={p.d} fill="none" stroke="#8c9cf8" strokeWidth="7" strokeOpacity=".22" strokeLinejoin="round" />}
      {allowance && <path d={p.d} fill="none" stroke="#8c9cf8" strokeWidth="1" strokeDasharray="3 3" transform={`translate(${p.w / 2} ${p.h / 2}) scale(1.045) translate(${-p.w / 2} ${-p.h / 2})`} />}
      <path d={p.d} fill="rgba(104,126,245,.14)" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8c9cf8" strokeWidth="1.2" />
      <path d={x1 === x2 ? `M${x1 - 3} ${y1 + 5} L${x1} ${y1} L${x1 + 3} ${y1 + 5} M${x2 - 3} ${y2 - 5} L${x2} ${y2} L${x2 + 3} ${y2 - 5}` : `M${x1 + 5} ${y1 - 3} L${x1} ${y1} L${x1 + 5} ${y1 + 3} M${x2 - 5} ${y2 - 3} L${x2} ${y2} L${x2 - 5} ${y2 + 3}`} fill="none" stroke="#8c9cf8" strokeWidth="1.2" />
      {label && (
        <text x={p.w / 2 + (x1 === x2 ? 12 : 0)} y={p.h / 2} textAnchor="middle" fontSize="6.5" fill="#fff" opacity=".8" style={{ letterSpacing: ".05em" }}>
          <tspan x={p.w / 2 + (x1 === x2 ? 14 : 0)} dy="0">{label.toUpperCase()}</tspan>
          <tspan x={p.w / 2 + (x1 === x2 ? 14 : 0)} dy="9">{p.fold ? "CUT 1 ON FOLD" : "CUT 2"}</tspan>
        </text>
      )}
    </svg>
  );
}

// ─── Draggable tick ruler ─────────────────────────────────────────────
export function Ruler({ value, onChange, min, max, step = 0.5, px = 9, className, light = false }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; px?: number; className?: string; light?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; v: number } | null>(null);
  const [w, setW] = useState(320);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const clamp = useCallback((v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step)), [min, max, step]);
  const n = Math.round((max - min) / step);
  const offset = w / 2 - ((value - min) / step) * px;
  const onDown = (e: React.PointerEvent) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); drag.current = { x: e.clientX, v: value }; };
  const onMove = (e: React.PointerEvent) => { if (!drag.current) return; const dv = ((drag.current.x - e.clientX) / px) * step; const nv = clamp(drag.current.v + dv); if (nv !== value) { onChange(nv); try { navigator.vibrate?.(3); } catch {} } };
  const onUp = () => { drag.current = null; };
  return (
    <div ref={ref} className={`relative h-[64px] touch-none select-none overflow-hidden ${className ?? ""}`} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      style={{ maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)", cursor: "ew-resize" }}>
      <svg width={w} height="64" className="absolute inset-0">
        <g transform={`translate(${offset} 0)`}>
          {Array.from({ length: n + 1 }, (_, i) => {
            const major = (i * step) % 5 === 0; const mid = (i * step) % 1 === 0;
            const h = major ? 30 : mid ? 20 : 12;
            return <line key={i} x1={i * px} x2={i * px} y1={40 - h} y2={40} stroke={light ? "#0b0c15" : "#fff"} strokeOpacity={major ? 0.9 : 0.4} strokeWidth={major ? 1.5 : 1} />;
          })}
        </g>
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-[2px] -translate-x-1/2">
        <svg width="16" height="46" viewBox="0 0 16 46"><path d="M2 2h12L8 10z" fill="#fff" /><line x1="8" y1="8" x2="8" y2="44" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </div>
    </div>
  );
}
