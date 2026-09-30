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

// ─── Official Venty logo (vertical lockup, traced from the brand file) ─
const LOGO = "M1240 1251C1226 1250 1225 1250 1222 1247C1218 1243 1218 1240 1222 1222C1225 1204 1224 1205 1228 1202C1232 1198 1236 1198 1259 1203C1278 1207 1279 1207 1296 1207C1318 1207 1326 1205 1337 1196C1360 1178 1369 1161 1379 1120C1391 1073 1392 1065 1387 1061C1385 1059 1384 1058 1373 1058C1361 1058 1361 1057 1358 1054C1355 1052 1349 1031 1299 870C1268 770 1242 687 1241 685C1238 680 1236 680 1182 680C1128 680 1127 680 1124 685C1122 687 1122 702 1122 839L1122 990L1126 999C1134 1023 1151 1039 1177 1046C1183 1048 1187 1048 1198 1048C1218 1048 1230 1044 1255 1030C1266 1023 1268 1023 1268 1027C1268 1032 1262 1037 1248 1044C1200 1069 1140 1060 1103 1020C1087 1003 1075 978 1071 956C1069 948 1069 929 1069 812L1069 678L1067 675C1064 673 1063 673 1058 673C1053 673 1052 673 1051 671C1050 669 1053 668 1059 668C1064 668 1065 668 1067 665C1069 663 1069 662 1069 587C1069 518 1069 510 1067 508C1066 506 1062 506 1056 508C1053 509 1050 509 1052 506C1053 504 1106 481 1110 481C1115 481 1118 483 1120 487C1123 493 1123 621 1120 631C1117 646 1107 658 1094 664L1087 668L1184 668C1237 668 1282 668 1284 669C1292 670 1288 662 1334 811C1358 887 1378 953 1380 958C1391 984 1405 990 1414 970C1417 966 1457 812 1487 692C1494 662 1494 662 1476 668C1467 672 1463 672 1466 670C1467 669 1563 633 1565 633C1568 633 1565 635 1556 639C1531 649 1513 667 1506 690C1504 694 1480 787 1452 897C1425 1007 1399 1109 1395 1124C1387 1153 1383 1165 1375 1178C1355 1213 1322 1237 1282 1247C1273 1250 1251 1252 1246 1252C1244 1252 1242 1252 1240 1251ZM511 1057C447 1050 388 1007 359 948C325 877 337 793 390 734C463 651 587 646 666 723C694 750 712 777 721 808C724 817 724 819 723 821C721 826 719 827 713 828C704 829 699 835 698 846C698 852 698 853 702 861C716 888 718 916 708 943C702 961 687 984 669 1001C627 1043 569 1063 511 1057ZM750 1057C748 1055 750 1054 755 1054C761 1054 764 1053 766 1049C767 1048 767 995 767 862L767 678L765 675C762 673 761 673 756 673C750 673 747 671 750 669C752 668 810 668 814 669C817 670 820 674 820 678C820 681 824 684 827 684C829 684 833 682 837 681C882 658 938 668 975 703C992 720 1002 738 1009 761L1011 770L1012 910L1012 1049L1015 1052C1018 1054 1019 1054 1024 1054C1029 1054 1030 1054 1030 1056C1029 1057 1027 1058 986 1058C945 1058 943 1057 942 1056C942 1054 943 1054 948 1054C953 1054 954 1054 957 1052L960 1049L960 896C960 743 960 735 957 723C953 710 933 696 908 690C894 686 872 686 860 689C846 693 834 699 826 707L820 713L820 881C820 1073 819 1053 830 1054C837 1054 838 1055 837 1056C837 1058 832 1058 793 1058C766 1058 750 1058 750 1057ZM218 1055C211 1052 205 1047 202 1041C200 1038 167 914 127 764C68 545 53 492 51 489C46 482 42 480 23 478C13 477 5 476 5 476C5 475 32 476 54 476C63 477 67 477 73 479C82 482 93 490 99 497C110 509 108 505 149 664C170 743 188 811 189 814C198 841 221 857 238 848C249 843 260 830 267 816C272 804 273 798 281 745C296 650 301 584 295 569C293 564 288 561 271 552C263 548 257 545 257 544C257 544 266 548 277 552C288 557 317 569 341 579C380 594 389 599 384 599C383 599 376 597 369 594C353 587 346 585 339 587C329 589 322 595 317 606C315 612 312 634 286 824C255 1056 258 1040 249 1049C241 1056 228 1059 218 1055ZM548 1040C628 1034 691 982 698 916C701 891 694 864 679 841C672 831 658 823 640 818L632 816L515 816L398 816L395 818L392 821L392 870C392 909 392 920 393 928C403 992 453 1035 521 1040C527 1040 532 1041 533 1041C534 1041 540 1041 548 1040ZM666 782C669 780 669 777 664 764C657 746 642 723 631 713C618 702 589 690 564 685C548 683 517 683 503 686C485 690 465 697 449 704C441 708 438 710 431 717C418 732 406 751 400 769C397 778 398 779 404 782L409 785L536 785L663 784L666 782ZM554 543C553 543 548 543 544 542C527 539 503 529 493 520C476 506 460 489 452 478C447 471 441 463 439 460C436 456 427 445 420 434C405 414 407 415 386 403C374 395 314 366 307 364C295 361 286 361 261 365C237 369 231 371 207 378C185 386 178 386 178 382C178 380 181 377 199 365C209 357 224 350 232 349C240 348 247 346 268 338C276 335 287 332 293 331C304 329 317 324 319 321C320 321 319 320 314 317C306 313 284 298 275 291C247 267 227 229 219 187C218 177 218 160 219 157C221 152 226 147 232 144C235 142 240 139 243 137C248 132 251 131 258 129C260 128 265 125 270 122C284 112 287 110 294 108C299 107 301 106 304 103C306 100 307 100 309 101C311 102 312 103 312 104C312 108 322 104 323 100C323 96 329 92 341 86C346 84 355 78 361 74C367 70 376 64 381 61C386 58 393 53 396 50C400 46 403 45 408 44C415 42 432 35 440 29C443 27 451 22 458 19C466 15 475 10 479 7C495 -3 504 -2 514 10C522 19 522 21 517 50C515 70 517 97 524 120C528 135 540 152 562 175C580 195 595 204 638 225C684 248 686 249 705 284C723 317 729 330 735 347C744 374 743 399 733 429C728 445 727 449 730 451C734 455 749 440 762 422C770 409 777 396 788 370C799 347 806 333 814 321C820 312 844 286 854 278C858 275 863 270 867 267C873 261 888 253 899 249C902 249 907 246 910 245C913 243 920 241 925 239C930 238 939 235 944 233C949 232 957 229 963 228C992 220 1035 204 1068 187C1087 178 1090 177 1092 180C1095 185 1093 187 1060 215C1035 237 1027 245 1014 264C1008 273 1001 284 998 288C991 297 988 302 980 317C971 334 968 338 955 354C936 377 914 400 900 411C889 418 866 432 845 442C822 453 779 477 766 485C759 490 740 499 736 499C736 499 729 502 720 506C704 514 669 527 655 531C650 532 641 533 634 534C628 535 621 535 620 536C619 536 614 537 610 538C606 539 598 540 592 541C582 543 559 544 554 543Z";
export function VentyLogo({ width = 160, className, color = "#fff" }: { width?: number; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 1567 1252" width={width} height={(width * 1252) / 1567} className={className} role="img" aria-label="Venty">
      <path d={LOGO} fill={color} fillRule="evenodd" />
    </svg>
  );
}

// ─── Body silhouettes (200 × 530) ─────────────────────────────────────
import { BODY } from "./bodyShape";

type BodyProps = {
  sex?: Sex;
  width?: number;
  variant?: "dots" | "solid"; // legacy, both render the mannequin
  markers?: Marker[];
  garment?: GarmentKey | null;
  garmentStyle?: "flat" | "fabric";
  scaleX?: number; // subtle proportion changes (e.g. bust/hips)
  className?: string;
  glow?: boolean;
  label?: string; // marker label e.g. HERE
  dim?: number;
};

export function BodyFigure({ sex = "female", width = 140, markers = [], garment = null, garmentStyle = "fabric", scaleX = 1, className, glow = true, label, dim = 1 }: BodyProps) {
  const id = useId().replace(/:/g, "");
  const h = (width * 530) / 200;
  const d = BODY[sex];
  return (
    <svg viewBox="-10 -6 220 542" width={width * 1.1} height={h * 1.02} className={className} style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262b45" />
          <stop offset=".45" stopColor="#171a2e" />
          <stop offset="1" stopColor="#0f1122" />
        </linearGradient>
        {/* glossy mannequin: the blurred silhouette is used as a height map and lit like a 3D surface */}
        <filter id={`gl${id}`} x="-10%" y="-5%" width="120%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" result="h" />
          <feSpecularLighting in="h" surfaceScale="7" specularConstant="1.15" specularExponent="22" lightingColor="#dfe3ff" result="sp">
            <fePointLight x="150" y="-60" z="140" />
          </feSpecularLighting>
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
          <feDiffuseLighting in="h" surfaceScale="6" diffuseConstant="1" lightingColor="#6f82f0" result="df">
            <feDistantLight azimuth="200" elevation="18" />
          </feDiffuseLighting>
          <feComposite in="df" in2="SourceAlpha" operator="in" result="df2" />
          <feComposite in="SourceGraphic" in2="df2" operator="arithmetic" k1="0" k2="1" k3=".32" k4="0" result="lit" />
          <feComposite in="lit" in2="sp2" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0" />
        </filter>
        <filter id={`f${id}`} x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
        <filter id={`mk${id}`} x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      <g transform={`translate(${100 - 100 * scaleX} 0) scale(${scaleX} 1)`} opacity={dim}>
        {glow && <path d={d} fill="#687ef5" opacity=".4" filter={`url(#f${id})`} />}
        <path d={d} fill={`url(#b${id})`} filter={`url(#gl${id})`} />
        {garment && <GarmentOn garment={garment} style={garmentStyle} sex={sex} />}
      </g>
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

// ─── Garments fitted to the body (drawn in the body's 200×530 space) ─────
// Landmarks are measured off the silhouettes above; every garment is built from them,
// so shoulders, waist and hips always land on the figure.
type L = { neckY: number; neckH: number; shY: number; shH: number; armY: number; armH: number; bustY: number; bustH: number; waistY: number; waistH: number; hipY: number; hipH: number; crotchY: number; kneeY: number; ankleY: number; elbowY: number; elbowO: number; elbowI: number; wristY: number; wristO: number; wristI: number };
const LM: Record<Sex, L> = {
  female: { neckY: 90, neckH: 10, shY: 101, shH: 49, armY: 134, armH: 43, bustY: 150, bustH: 44, waistY: 205, waistH: 29, hipY: 275, hipH: 48, crotchY: 293, kneeY: 405, ankleY: 494, elbowY: 205, elbowO: 69, elbowI: 54, wristY: 282, wristO: 77, wristI: 67 },
  male: { neckY: 90, neckH: 12, shY: 101, shH: 57, armY: 140, armH: 50, bustY: 156, bustH: 50, waistY: 205, waistH: 39, hipY: 278, hipH: 44, crotchY: 296, kneeY: 404, ankleY: 494, elbowY: 205, elbowO: 75.5, elbowI: 57.5, wristY: 282, wristO: 83.5, wristI: 70.5 },
};
const P = (x: number, y: number) => `${(100 + x).toFixed(1)} ${y.toFixed(1)}`;
// mirror a right-hand half outline (list of [x,y], x ≥ 0 offsets from centre) into a closed path
function sym(pts: [number, number][], neck?: string) {
  const right = pts.map(([x, y]) => P(x, y));
  const left = [...pts].reverse().map(([x, y]) => P(-x, y));
  return `M${right.join(" L")} L${left.join(" L")}${neck ?? ""} Z`;
}
function sleeve(l: L, long: boolean, side: 1 | -1, ease = 3) {
  const s = (x: number) => side * x;
  if (long) return `M${P(s(l.shH - 4), l.shY - 3)} L${P(s(l.shH + ease), l.shY + 4)} L${P(s(l.elbowO + ease), l.elbowY)} L${P(s(l.wristO + ease), l.wristY)} L${P(s(l.wristI - ease), l.wristY)} L${P(s(l.elbowI - ease), l.elbowY)} L${P(s(l.armH), l.armY + 2)} Z`;
  const y = l.shY + 34;
  return `M${P(s(l.shH - 4), l.shY - 3)} L${P(s(l.shH + ease), l.shY + 4)} L${P(s(l.shH + ease + 5), y)} L${P(s(l.armH - 1), y + 4)} L${P(s(l.armH), l.armY + 2)} Z`;
}
function flutterSleeve(l: L, side: 1 | -1) {
  const s = (x: number) => side * x;
  return `M${P(s(l.shH - 6), l.shY - 3)} Q${P(s(l.shH + 18), l.shY)} ${P(s(l.shH + 16), l.shY + 26)} Q${P(s(l.shH + 2), l.shY + 30)} ${P(s(l.armH - 1), l.armY - 4)} Z`;
}

type G = { body: string; extra?: string[]; details: string };
function build(g: GarmentKey, l: L): G {
  const skirt = (hemY: number, hemH: number, e = 4): [number, number][] => [[l.waistH + e, l.waistY], [l.hipH + e - 2, l.hipY - 22], [l.hipH + e, l.hipY], [hemH, hemY]];
  const knee = l.kneeY - 5, midi = l.kneeY + 40;
  const bodice = (e = 3): [number, number][] => [[l.shH - 4, l.shY - 3], [l.shH + 1, l.shY + 3], [l.armH + e, l.armY + 2], [l.bustH + e, l.bustY], [l.waistH + e, l.waistY]];
  const panels = (y0: number, hemY: number, hemH: number) => `M${P(-l.waistH * 0.45, y0)} L${P(-hemH * 0.45, hemY)} M${P(l.waistH * 0.45, y0)} L${P(hemH * 0.45, hemY)}`;
  const waistSeam = (e = 3) => `M${P(-(l.waistH + e), l.waistY)} Q${P(0, l.waistY + 3)} ${P(l.waistH + e, l.waistY)}`;
  const round = ` L${P(-l.neckH - 4, l.neckY)} Q${P(0, l.neckY + 16)} ${P(l.neckH + 4, l.neckY)}`;
  const vneck = (d: number) => ` L${P(-l.neckH - 3, l.neckY - 1)} L${P(0, l.neckY + d)} L${P(l.neckH + 3, l.neckY - 1)}`;
  const shoulderTop = (w = 0): [number, number][] => [[l.neckH + 3 + w, l.neckY - 1]];
  const hemCurve = (hemY: number, hemH: number) => ` Q${P(0, hemY + 7)} ${P(-hemH, hemY)}`;
  switch (g) {
    case "slip": {
      const top = l.bustY - 16, H = l.hipH + 16;
      const pts: [number, number][] = [[l.bustH - 12, top - 4], [l.bustH + 2, top + 4], [l.bustH + 3, l.bustY + 6], ...skirt(knee, H).slice(0)];
      return { body: `M${P(-(l.bustH - 12), top - 4)} Q${P(0, top + 10)} ${P(l.bustH - 12, top - 4)} L${pts.slice(1).map(([x, y]) => P(x, y)).join(" L")}${hemCurve(knee, H)} L${[...pts.slice(1)].reverse().slice(1).map(([x, y]) => P(-x, y)).join(" L")} Z`,
        details: `M${P(-(l.bustH - 12), top - 4)} L${P(-(l.neckH + 16), l.shY - 6)} M${P(l.bustH - 12, top - 4)} L${P(l.neckH + 16, l.shY - 6)} ${waistSeam()}` };
    }
    case "cami": {
      const top = l.bustY - 18, hemY = l.hipY - 12, H = l.hipH + 2;
      return { body: `M${P(-(l.bustH - 12), top - 4)} Q${P(0, top + 10)} ${P(l.bustH - 12, top - 4)} L${P(l.bustH + 3, top + 6)} L${P(l.bustH + 3, l.bustY + 8)} L${P(l.waistH + 6, l.waistY)} L${P(H, hemY)}${hemCurve(hemY, H)} L${P(-(l.waistH + 6), l.waistY)} L${P(-(l.bustH + 3), l.bustY + 8)} L${P(-(l.bustH + 3), top + 6)} Z`,
        details: `M${P(-(l.bustH - 12), top - 4)} L${P(-(l.neckH + 14), l.shY - 6)} M${P(l.bustH - 12, top - 4)} L${P(l.neckH + 14, l.shY - 6)}` };
    }
    case "aline": case "wrap": case "flutter": {
      const hemY = g === "flutter" ? midi : knee, H = l.hipH + (g === "flutter" ? 26 : 20);
      const right: [number, number][] = [...shoulderTop(), ...bodice(), ...skirt(hemY, H).slice(1)];
      const body = `M${right.map(([x, y]) => P(x, y)).join(" L")}${hemCurve(hemY, H)} L${[...right].reverse().slice(1).map(([x, y]) => P(-x, y)).join(" L")}${g === "aline" ? round : vneck(g === "wrap" ? 70 : 40)} Z`;
      const extra = g === "flutter" ? [flutterSleeve(l, 1), flutterSleeve(l, -1)] : g === "wrap" ? [sleeve(l, false, 1), sleeve(l, false, -1)] : undefined;
      const wrapLines = g === "wrap" ? ` M${P(-l.neckH - 3, l.neckY - 1)} L${P(l.waistH * 0.5, l.waistY)} M${P(l.waistH * 0.5, l.waistY + 1)} L${P(l.waistH * 0.62, l.waistY + 36)} M${P(l.waistH * 0.5, l.waistY + 1)} L${P(l.waistH * 0.34, l.waistY + 32)}` : "";
      return { body, extra, details: `${waistSeam()} ${panels(l.waistY + 2, hemY + 2, H)}${wrapLines}` };
    }
    case "tee": case "shirt": {
      const hemY = l.hipY + (g === "shirt" ? 14 : 4), H = l.hipH + 3;
      const right: [number, number][] = [...shoulderTop(g === "shirt" ? -2 : 0), ...bodice(4).slice(0, 3), [Math.max(l.bustH, l.hipH) + 3, l.bustY + 20], [H, hemY]];
      const body = `M${right.map(([x, y]) => P(x, y)).join(" L")}${hemCurve(hemY, H)} L${[...right].reverse().slice(1).map(([x, y]) => P(-x, y)).join(" L")}${g === "shirt" ? vneck(14) : round} Z`;
      const collar = g === "shirt" ? ` M${P(-l.neckH - 1, l.neckY - 1)} L${P(-5, l.neckY + 18)} L${P(0, l.neckY + 14)} L${P(5, l.neckY + 18)} L${P(l.neckH + 1, l.neckY - 1)} M${P(0, l.neckY + 14)} L${P(0, hemY + 6)}` : ` M${P(-H, hemY - 8)} L${P(H, hemY - 8)}`;
      return { body, extra: [sleeve(l, g === "shirt", 1, 4), sleeve(l, g === "shirt", -1, 4)], details: collar.trim() };
    }
    case "wideleg": case "straight": {
      const wide = g === "wideleg";
      const outH = wide ? l.hipH + 12 : l.hipH - 8, inH = wide ? 6 : 5, hemY = l.ankleY + 4;
      const wY = l.waistY + 4;
      const body = `M${P(-(l.waistH + 3), wY)} L${P(l.waistH + 3, wY)} L${P(l.hipH + 3, l.hipY - 14)} L${P(l.hipH + 4, l.hipY)} L${P(outH, hemY)} L${P(inH, hemY)} L${P(2, l.crotchY + 16)} Q${P(0, l.crotchY + 6)} ${P(-2, l.crotchY + 16)} L${P(-inH, hemY)} L${P(-outH, hemY)} L${P(-(l.hipH + 4), l.hipY)} L${P(-(l.hipH + 3), l.hipY - 14)} Z`;
      return { body, details: `M${P(-(l.waistH + 4), wY + 10)} L${P(l.waistH + 4, wY + 10)} M${P(0, wY + 10)} L${P(0, wY + 40)} M${P(-(l.hipH * 0.5), wY + 12)} L${P(-(outH + inH) / 2, hemY)} M${P(l.hipH * 0.5, wY + 12)} L${P((outH + inH) / 2, hemY)}` };
    }
    case "biasskirt": case "mini": {
      const hemY = g === "mini" ? l.crotchY + 55 : l.kneeY + 20, H = l.hipH + (g === "mini" ? 10 : 16);
      const wY = l.waistY;
      const right: [number, number][] = [[l.waistH + 3, wY], [l.hipH + 2, l.hipY - 22], [l.hipH + 4, l.hipY], [H, hemY]];
      const body = `M${right.map(([x, y]) => P(x, y)).join(" L")}${hemCurve(hemY, H)} L${[...right].reverse().slice(1).map(([x, y]) => P(-x, y)).join(" L")} Z`;
      return { body, details: `M${P(-(l.waistH + 3), wY + 9)} L${P(l.waistH + 3, wY + 9)} ${g === "mini" ? `M${P(0, wY + 9)} L${P(0, hemY + 6)}` : panels(wY + 10, hemY + 3, H)}` };
    }
  }
}

export function GarmentOn({ garment, style = "fabric", sex = "female" }: { garment: GarmentKey; style?: "flat" | "fabric"; sex?: Sex }) {
  const id = useId().replace(/:/g, "");
  const g = build(garment, LM[sex]);
  const fill = style === "fabric" ? `url(#gf${id})` : "rgba(11,12,21,.35)";
  return (
    <g style={{ color: "#fff" }}>
      <defs>
        <linearGradient id={`gf${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8c9cf8" stopOpacity=".95" />
          <stop offset="1" stopColor="#4f63e0" stopOpacity=".82" />
        </linearGradient>
      </defs>
      {g.extra?.map((d, i) => <path key={i} d={d} fill={fill} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />)}
      <path d={g.body} fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d={g.details} fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" />
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
