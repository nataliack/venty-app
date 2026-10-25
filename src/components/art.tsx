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

// ─── Official Venty logo (the final stacked lockup: the mark above "Venty", from the brand file, paths exact) ─
export const LOGO = [
  "M1318.17 1060.59V1487.75C1318.17 1494.85 1312.42 1500.6 1305.32 1500.6H1294.22C1293.24 1500.6 1292.46 1501.38 1292.46 1502.36C1292.46 1503.35 1293.24 1504.13 1294.22 1504.13H1415.82C1416.8 1504.13 1417.58 1503.35 1417.58 1502.36C1417.58 1501.38 1416.8 1500.6 1415.82 1500.6H1404.7C1397.59 1500.6 1391.85 1494.85 1391.85 1487.75V1118.24C1391.85 1091.35 1384.83 1064.46 1371.97 1039.91C1360.28 1016.51 1342.75 995.486 1321.69 979.109C1291.28 956.898 1255.03 945.2 1217.63 944.016H1215.29C1186.29 944.016 1157.3 951.497 1131.91 965.274C1123.97 969.578 1113.6 964.177 1113.57 955.165C1113.57 949.042 1108.6 944.045 1102.48 944.045H1015.95C1014.97 944.045 1014.19 944.825 1014.19 945.807C1014.19 946.789 1014.97 947.569 1015.95 947.569H1027.07C1034.17 947.569 1039.92 953.316 1039.92 960.422V1487.78C1039.92 1494.88 1034.17 1500.63 1027.07 1500.63H1015.98C1014.99 1500.63 1014.22 1501.41 1014.22 1502.39C1014.22 1503.37 1014.99 1504.15 1015.98 1504.15H1137.57C1138.55 1504.15 1139.33 1503.37 1139.33 1502.39C1139.33 1501.41 1138.55 1500.63 1137.57 1500.63H1126.48C1119.37 1500.63 1113.63 1494.88 1113.63 1487.78V1060.94C1113.63 1023.85 1137.83 990.894 1173.41 980.467C1187.97 976.192 1203.04 973.217 1215.95 973.217C1256.22 973.217 1280.74 986.735 1295.61 1002.3C1310.49 1017.87 1318.25 1039.04 1318.25 1060.62L1318.17 1060.59Z",
  "M544.972 840.786C543.643 840.237 454.716 803.815 447.12 800.696C439.466 797.548 378.872 772.852 373.327 770.426C372.923 770.253 372.46 770.166 372.027 770.282C371.421 770.426 370.901 771.09 371.132 771.668C371.276 772.101 371.709 772.332 372.085 772.563C382.425 778.311 393.775 782.701 403.422 789.605C415.841 798.472 418.585 816.322 419.596 830.446C420.578 844.166 419.596 857.856 418.758 871.547C416.274 912.591 411.162 953.519 405.588 994.245C401.198 1026.33 396.317 1058.37 391.147 1090.34C384.995 1128.44 379.074 1168.3 348.2 1195.16C340.893 1201.51 332.199 1206.86 322.581 1207.95C310.942 1209.28 299.332 1204.17 290.234 1196.78C260.11 1172.28 255.258 1128.47 246.045 1092.82C237.409 1059.38 228.744 1025.9 220.109 992.454C201.711 921.285 183.313 850.116 164.915 778.947C161.074 764.129 157.348 749.254 153.42 734.466C142.792 694.607 106.776 666.821 65.5329 666.647H64.9842C64.4643 666.647 63.9155 666.647 63.3957 666.647H60.9118C59.8143 666.647 58.7457 666.647 57.6482 666.647H53.7203C52.2473 666.647 50.7454 666.647 49.2724 666.619H44.4492C42.7451 666.619 41.0411 666.59 39.3371 666.59H34.0806C32.3188 666.59 30.557 666.561 28.8241 666.561H23.6542C22.008 666.561 20.3617 666.532 18.7443 666.532H14.181C12.8235 666.532 11.4661 666.503 10.1086 666.503H6.64283C5.74749 666.503 4.82327 666.503 3.92793 666.503H2.07949C1.41521 666.503 0 666.416 0 667.052C0 667.687 2.05061 667.774 3.03259 667.889L4.44781 668.034L18.6288 669.622L24.1163 670.229L29.1996 670.807L33.3874 671.269L36.2178 671.587C36.5355 671.615 36.8821 671.702 37.1998 671.702C51.2653 671.702 64.2621 680.656 68.2767 693.971C73.7643 712.139 78.5875 730.538 83.613 748.821C105.188 827.355 125.636 906.207 146.691 984.886C165.955 1056.89 185.219 1128.9 204.484 1200.91C220.802 1261.91 237.12 1322.94 253.438 1383.94C259.619 1407.05 265.8 1430.13 271.98 1453.23C276.89 1471.6 279.865 1490.06 297.887 1500.46C324.748 1515.94 359.752 1499.1 363.882 1468.31L444.636 866.81C453.994 832.901 477.186 818.141 509.649 831.428L543.181 845.177C544.365 845.668 545.752 845.09 546.243 843.906C546.734 842.721 546.156 841.335 544.972 840.844V840.786Z",
  "M994.518 1170.58C1000.03 1167.31 996.857 1155.21 995.067 1149.96C943.628 1001.03 757.802 897.282 608.339 972.148C341.643 1099.5 427.596 1502.94 724.097 1506.52C804.417 1507.5 885.46 1469 937.158 1407.83C975.976 1361.87 993.391 1303.01 978.344 1243.94C972.336 1220.32 960.495 1184.18 969.65 1176.1C978.806 1168.01 989.03 1173.84 994.547 1170.58H994.518ZM728.083 1482.06C675.229 1481.57 623.01 1464.41 583.673 1427.53C552.539 1398.32 532.553 1354.16 521.664 1313.47C510.314 1270.95 508.523 1225.8 517.159 1182.62C519.267 1172.11 521.78 1155.67 535.758 1155.67H886.673C924.104 1155.67 993.449 1260.52 943.772 1363C919.974 1412.1 872.117 1446.65 820.967 1465.71C791.536 1476.69 759.708 1482.35 728.083 1482.06ZM723.057 978.301C835.639 978.301 890.716 1058.22 910.472 1095.97C915.064 1104.75 908.739 1115.27 898.803 1115.27H557.997C548.582 1115.27 542.17 1105.65 545.838 1096.98C561.723 1059.69 609.436 978.272 723.057 978.272V978.301Z",
  "M2076.69 928.101C2075.48 928.563 2030.05 945.662 2029.87 945.778C2029.76 945.865 2029.64 945.951 2029.64 946.096C2029.64 946.211 2029.73 946.298 2029.82 946.356C2030.25 946.558 2030.83 946.24 2031.2 946.096C2031.78 945.893 2032.36 945.72 2032.94 945.547C2034.09 945.2 2035.25 944.882 2036.43 944.622C2038.74 944.074 2041.08 943.669 2043.45 943.409C2047.49 942.947 2052.46 942.803 2055.93 945.287C2056.65 945.807 2057.25 946.413 2057.75 947.135C2058.27 947.915 2058.64 948.782 2058.84 949.706C2059.1 950.804 2059.16 951.959 2059.1 953.085C2059.05 954.212 2058.84 955.425 2058.55 956.551C2024.42 1091.64 1986.96 1237.36 1953.34 1369.35C1947.65 1386.43 1940.57 1398.21 1929.45 1398.21C1909.06 1398.21 1883.67 1319.91 1883.67 1319.91L1772.25 957.938C1770.14 951.092 1763.81 946.442 1756.65 946.442H1456.11C1455.79 946.442 1455.53 946.182 1455.53 945.865C1455.53 945.547 1455.79 945.287 1456.11 945.287C1485.34 945.027 1510.17 926.397 1520.11 899.853C1520.72 898.207 1520.92 896.445 1521.47 894.77C1521.47 894.712 1521.5 894.625 1521.53 894.567C1522.19 892.603 1522.59 890.524 1523.17 888.531C1524.5 883.996 1524.5 879.952 1524.5 875.129V691.256C1524.5 679.385 1512.2 671.471 1501.39 676.439L1426.59 710.753C1425.75 711.128 1425.32 712.11 1425.61 712.977C1425.95 714.016 1427.14 714.507 1428.12 714.045L1436.5 710.059C1443.14 706.882 1450.82 711.735 1450.82 719.1V933.589C1450.82 940.694 1445.07 946.442 1437.97 946.442H1426.88C1425.93 946.442 1425.12 947.222 1425.12 948.204C1425.12 949.186 1425.9 949.966 1426.88 949.966H1438C1445.1 949.966 1450.85 955.714 1450.85 962.819V1333.51C1450.85 1360.4 1457.87 1386.14 1470.72 1410.69C1482.42 1435.24 1499.95 1456.29 1521.01 1471.49C1551.42 1494.88 1587.66 1506.58 1625.07 1506.58H1627.41C1662.93 1506.58 1696.46 1496.67 1725.29 1476.86C1727.65 1475.62 1730.02 1474.35 1732.42 1472.99C1735.34 1471.17 1740.25 1465.91 1736.49 1459.38C1731.78 1451.24 1691.64 1494.71 1635.93 1494.71C1580.21 1494.71 1524.5 1456.67 1524.5 1384.63V982.258C1524.5 975.875 1527.42 969.809 1532.56 966.054C1535.68 963.772 1539.75 962.01 1544.86 962.01H1679.39C1691.61 962.01 1698.6 966.083 1701.14 975.615C1701.83 978.243 1702.76 980.842 1703.57 983.442C1705.7 990.345 1707.87 997.277 1710.04 1004.18C1713.3 1014.69 1716.59 1025.21 1719.89 1035.72C1724.07 1049.12 1728.26 1062.55 1732.45 1075.96C1737.33 1091.58 1742.21 1107.18 1747.06 1122.81C1752.41 1139.9 1757.75 1157.03 1763.09 1174.13C1768.7 1192.04 1774.27 1209.95 1779.87 1227.85C1785.51 1245.85 1791.14 1263.87 1796.74 1281.87C1802.17 1299.28 1807.6 1316.67 1813.06 1334.09C1818.08 1350.18 1823.11 1366.29 1828.13 1382.38C1832.52 1396.48 1836.94 1410.57 1841.33 1424.64C1844.89 1436.02 1848.44 1447.4 1851.99 1458.78C1854.47 1466.75 1856.99 1474.72 1859.47 1482.69C1861.75 1489.94 1862.91 1499.65 1869.03 1504.47C1871.28 1506.23 1874.06 1507.19 1876.86 1507.74C1883.96 1509.12 1891.27 1508.17 1898.49 1508.23C1901.47 1508.23 1904.59 1508.46 1907.16 1509.93C1910.39 1511.81 1912.3 1515.42 1912.96 1519.09C1913.65 1522.93 1913.65 1527.98 1912.76 1531.77C1904.01 1569.26 1897.31 1608.25 1883.3 1644.27C1870.24 1677.83 1845.84 1709.6 1809.85 1719.51C1778.37 1728.17 1744.58 1724.25 1713.39 1716.56C1699.18 1713.07 1679.88 1706.11 1674.45 1725.37L1667.18 1766.33C1665.65 1775 1671.65 1783.14 1680.38 1784.3C1689.59 1785.51 1698.92 1786 1707.78 1786C1752.2 1786 1796.65 1770.81 1834.06 1743.92C1874.98 1713.5 1904.21 1669.08 1914.72 1618.79L2076.89 980.554C2084.49 953.923 2105.26 926.975 2130.41 911.204C2130.87 910.916 2132.58 909.876 2131.8 908.605C2131.11 907.507 2129.29 908.374 2128.42 908.663L2076.55 928.101H2076.69Z",
  "M619.823 25.0127C624.577 22.0044 627.073 22.0765 631.88 19.6243C647.161 11.828 660.294 -2.48179 678.52 0.37042C688.732 1.96732 707.767 22.6944 707.734 31.9944C707.656 56.3843 699.814 80.5262 700.432 105.57C700.625 116.376 701.769 127.145 703.859 137.743C704.396 140.597 705.181 144.359 705.96 148.346C708.435 160.988 710.174 173.925 715.433 185.674C720.751 197.546 727.823 210.519 733.023 217.21C744.992 232.608 762.065 251.277 775.785 265.097C804.527 293.524 846.79 315.004 882.892 332.163C927.142 353.195 945.208 359.199 969.402 403.521C996.034 452.304 1026.77 502.741 1029.45 556.347C1029.45 592.738 1022.71 618.329 1014.97 636.523C1003.7 663.005 1012.46 670.926 1032.99 650.823C1096.64 588.519 1101.72 491.68 1165.56 435.805C1168.55 433.189 1180.64 418.569 1183.72 415.992C1192.2 408.897 1201.81 401.266 1210.48 393.855L1213.78 390.22C1214.78 389.199 1215.75 388.311 1216.7 387.523C1225.49 380.205 1236.09 375.256 1246.53 370.604C1252.66 367.868 1258.8 366.177 1267.73 362.952C1269.54 362.295 1278.84 357.566 1281.65 356.256C1285.83 353.553 1307.41 348.613 1313.43 346.323C1322.66 342.811 1332.96 338.859 1342.33 336.022C1364.58 331.014 1374.76 327.461 1395.95 320.111C1431.44 309.343 1466.78 293.785 1500.05 277.338C1510.09 272.378 1521.17 267.248 1530.96 261.528C1532.98 260.352 1535.39 260.057 1537.6 260.786C1542.99 262.559 1544.82 269.261 1540.9 273.372C1511.48 304.201 1474.71 328.121 1447.29 360.378C1434.04 375.972 1425.14 394.177 1412.88 410.686C1409.03 415.875 1405.03 422.644 1400.5 427.241C1384.52 448.61 1372.66 478.947 1356.13 500.797C1329.64 535.804 1295.92 574.711 1261.46 601.726C1249.03 611.463 1228.62 621.659 1214.59 631.055C1195.72 641.756 1174.75 649.736 1155.84 659.891C1131.42 673.008 1107.13 687.358 1082.63 700.445C1076.15 703.902 1069.56 709.701 1064.03 712.92C1059.31 716.49 1052.09 719.885 1046.68 722.635C1038.66 725.787 1030.2 729.273 1021.87 731.378C1009.13 736.244 984.716 750.052 971.988 754.5C931.876 768.504 905.866 782.319 862.296 783.597C857.066 783.749 848.725 787.214 842.666 787.789C838.959 788.592 835.329 789.513 831.541 789.633C822.21 790.542 812.921 793.324 803.313 794.875C788.846 797.211 772.298 797.273 757.326 796.695C733.082 794.781 699.35 783.506 678.004 771.275C665.474 764.098 640.253 736.156 627.884 725.933C615.41 715.617 603.952 692.506 593.373 680.281C574.073 657.98 559.299 633.823 541.636 610.7C537.293 604.945 516.759 594.318 509.836 589.774C500.941 583.934 500.94 584.166 482.481 574.893C469.426 568.334 449.426 558.291 445.556 556.347C428.812 547.939 424.44 546.687 406.83 537.839C402.94 535.884 398.778 534.523 394.497 533.746C382.472 531.556 369.71 528.877 358.713 530.78C339.165 535.3 303.068 537.604 275.847 546.505C259.011 552.014 241.427 558.317 224.222 562.524C220.665 563.392 216.905 564.104 213.207 564.855C210.757 565.35 208.296 563.99 207.361 561.659C206.371 559.196 207.491 556.394 209.823 555.139C219.931 549.701 226.469 542.615 236.423 535.3C248.168 526.672 260.484 520.416 273.72 514.435C281.15 511.14 290.04 511.691 297.643 509.49C317.568 503.72 337.078 495.643 356.749 489.302C372.208 484.321 390.16 485.28 404.773 476.323C409.051 473.702 411.43 474.251 414.932 470.284C415.165 470.02 415.236 469.654 415.13 469.32C415.058 469.085 414.909 468.886 414.696 468.768C414.296 468.549 413.928 468.417 413.441 468.279C400.123 464.476 358.698 435.233 348.072 425.567C310.236 391.143 287.16 350.671 274.414 301.205C272.515 293.84 270.022 285.779 268.796 277.974C268.157 273.916 267.585 269.84 266.926 265.785C265.408 256.443 265.239 246.569 265.892 236.825C266.815 223.054 278.051 213.985 290.732 208.669C292.404 207.969 294.52 206.875 295.944 205.752C301.466 201.399 307.221 194.908 313.117 192.195C319.479 189.266 324.639 190.105 331.448 186.054C354.676 172.239 359.915 160.625 384.399 156.948C387.624 156.464 390.078 154.194 391.041 151.063C391.388 149.928 392.1 148.704 393.081 148.042C396.434 145.782 398.772 147.451 402.283 149.774C402.963 150.224 403.202 151.118 402.829 151.845C402.49 152.507 402.645 153.356 403.337 153.624C404.236 153.973 405.196 153.97 406.34 154.088C406.381 154.092 406.419 154.114 406.439 154.148C406.48 154.205 406.471 154.283 406.419 154.331L404.948 155.699C404.875 155.766 404.84 155.864 404.851 155.963C404.881 156.159 405.085 156.276 405.266 156.2L409.836 154.304C410.076 154.205 410.324 154.129 410.575 154.074C412.807 153.584 415.002 152.87 416.809 151.625C419.354 149.873 418.446 146.293 419.654 143.441C420.182 142.198 421.233 141.205 422.275 140.352C440.615 125.355 452.426 124.802 470.451 111.3C473.804 109.453 476.632 107.049 479.627 104.663C491.309 96.6939 507.227 88.6288 517.88 80.3913C533.152 68.5828 527.303 67.3905 547.984 63.406C554.708 62.1108 573.165 51.9715 580.534 49.1128C585.986 46.9967 596.653 36.91 602.691 34.3228C608.438 31.0985 614.733 28.6757 619.823 25.0127Z",
];
// ─── The mark as a cover: a band of its own at the very top of a page, with the bird very large and cropped inside
// it, in one faint, smooth fill that fades out at the bottom of the band. Nothing sits on it: the page's title starts
// below it. "dark" for the dark pages, "light" for the light tops. The caller sizes the band; the crop is in
// .mark-cover in globals.css. Purely decoration. ───
export function MarkCover({ tone = "dark", className, style }: { tone?: "dark" | "light"; className?: string; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, "");
  const light = tone === "light";
  return (
    <div aria-hidden className={`mark-cover relative overflow-hidden pointer-events-none ${className ?? ""}`} style={style}>
      <svg viewBox="200 -10 1350 820" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`mf${id}`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor={light ? "#687ef5" : "#fff"} stopOpacity={light ? 0.11 : 0.06} />
            <stop offset="1" stopColor={light ? "#687ef5" : "#fff"} stopOpacity={light ? 0.03 : 0.015} />
          </linearGradient>
        </defs>
        <path d={LOGO[4]} fill={`url(#mf${id})`} />
      </svg>
    </div>
  );
}

export function VentyLogo({ width = 160, className, color = "#fff" }: { width?: number; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 2132 1786" width={width} height={(width * 1786) / 2132} className={className} role="img" aria-label="Venty">
      {LOGO.map((d, i) => <path key={i} d={d} fill={color} />)}
    </svg>
  );
}

// ─── Body silhouettes (200 × 530) ─────────────────────────────────────
import { BODY } from "./bodyShape";
import { LM, P, buildSpec, type L, type GarmentSpec } from "./garment";
export type { GarmentSpec } from "./garment";

type BodyProps = {
  sex?: Sex;
  width?: number;
  variant?: "dots" | "solid"; // legacy, both render the mannequin
  markers?: Marker[];
  garment?: GarmentKey | null;
  spec?: GarmentSpec | null; // when given, the garment is drawn from its details (neckline, sleeves, length, fit…)
  garmentStyle?: "flat" | "fabric";
  scaleX?: number; // subtle proportion changes (e.g. bust/hips)
  className?: string;
  glow?: boolean;
  label?: string; // marker label e.g. HERE
  dim?: number;
};

export function BodyFigure({ sex = "female", width = 140, markers = [], garment = null, spec = null, garmentStyle = "fabric", scaleX = 1, className, glow = true, label, dim = 1 }: BodyProps) {
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
        {(garment || spec) && <GarmentOn garment={garment ?? "flutter"} spec={spec} style={garmentStyle} sex={sex} />}
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

// ─── Seated figure (side view, on a hard chair) for the rise: the tape runs down the side, waist to seat ───
export function SeatedFigure({ className, width = 170 }: { className?: string; width?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="36 6 176 272" width={width} height={(width * 272) / 176} className={className} style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`sb${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#262b45" /><stop offset=".45" stopColor="#171a2e" /><stop offset="1" stopColor="#0f1122" /></linearGradient>
        <filter id={`sg${id}`} x="-10%" y="-5%" width="120%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="h" />
          <feSpecularLighting in="h" surfaceScale="6" specularConstant="1.1" specularExponent="22" lightingColor="#dfe3ff" result="sp"><fePointLight x="160" y="-40" z="120" /></feSpecularLighting>
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
          <feDiffuseLighting in="h" surfaceScale="5" diffuseConstant="1" lightingColor="#6f82f0" result="df"><feDistantLight azimuth="200" elevation="18" /></feDiffuseLighting>
          <feComposite in="df" in2="SourceAlpha" operator="in" result="df2" />
          <feComposite in="SourceGraphic" in2="df2" operator="arithmetic" k1="0" k2="1" k3=".32" k4="0" result="lit" />
          <feComposite in="lit" in2="sp2" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0" />
        </filter>
        <filter id={`sglow${id}`} x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="12" /></filter>
        <filter id={`smk${id}`} x="-200%" y="-50%" width="500%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      {/* chair */}
      <g stroke="rgb(255 255 255 / .32)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M60 96 L60 184" /><path d="M58 186 L170 186" /><path d="M64 188 L64 270" /><path d="M164 188 L164 270" />
      </g>
      <g>
        <g fill="#687ef5" opacity=".35" filter={`url(#sglow${id})`}><ellipse cx="94" cy="40" rx="16" ry="20" /><rect x="68" y="70" width="52" height="112" rx="22" /><rect x="78" y="152" width="104" height="30" rx="15" /><rect x="158" y="160" width="22" height="106" rx="11" /></g>
        <g fill={`url(#sb${id})`} filter={`url(#sg${id})`}>
          <ellipse cx="94" cy="40" rx="16" ry="20" />
          <rect x="87" y="54" width="14" height="22" rx="6" />
          <path d="M80 72 C70 75 68 92 70 112 C72 132 70 152 68 168 C68 178 76 184 90 184 L120 184 C128 176 124 156 116 142 C111 132 114 118 117 106 C120 92 113 79 104 74 C96 70 88 70 80 72 Z" />
          <rect x="78" y="154" width="104" height="30" rx="15" />
          <rect x="158" y="162" width="22" height="104" rx="11" />
          <rect x="154" y="256" width="44" height="14" rx="7" />
          <path d="M84 80 C76 100 80 124 92 142 L104 138 C96 122 93 102 98 84 Z" />
          <rect x="94" y="134" width="52" height="13" rx="6.5" />
        </g>
      </g>
      {/* tape: down the side, from the waist to the chair seat */}
      <line x1="96" y1="132" x2="96" y2="185" stroke="#8c9cf8" strokeWidth="5" opacity=".55" filter={`url(#smk${id})`} />
      <line x1="96" y1="132" x2="96" y2="185" stroke="#fff" strokeWidth="1.6" strokeDasharray="3 2.4" />
      <circle cx="96" cy="132" r="3" fill="#fff" /><circle cx="96" cy="185" r="3" fill="#fff" />
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
// a flutter sleeve: a loose, flared cap that falls past the shoulder in soft waves (wider and longer than a cap sleeve)
function flutterSleeve(l: L, side: 1 | -1) {
  const s = (x: number) => side * x;
  const y = l.shY + 46;
  return `M${P(s(l.shH - 7), l.shY - 4)} Q${P(s(l.shH + 22), l.shY - 2)} ${P(s(l.shH + 30), y)} Q${P(s(l.shH + 22), y + 7)} ${P(s(l.shH + 15), y - 2)} Q${P(s(l.shH + 8), y + 5)} ${P(s(l.armH + 1), y - 6)} L${P(s(l.armH), l.armY + 2)} Z`;
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
      const hemY = g === "aline" ? knee : midi, H = l.hipH + (g === "aline" ? 20 : 26); // the flutter and wrap dresses are midi length
      const right: [number, number][] = [...shoulderTop(), ...bodice(), ...skirt(hemY, H).slice(1)];
      const body = `M${right.map(([x, y]) => P(x, y)).join(" L")}${hemCurve(hemY, H)} L${[...right].reverse().slice(1).map(([x, y]) => P(-x, y)).join(" L")}${g === "aline" ? round : vneck(g === "wrap" ? 70 : 40)} Z`;
      const extra = g === "flutter" ? [flutterSleeve(l, 1), flutterSleeve(l, -1)] : g === "wrap" ? [flutterSleeve(l, 1), flutterSleeve(l, -1)] : undefined;
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

export function GarmentOn({ garment, spec, style = "fabric", sex = "female" }: { garment: GarmentKey; spec?: GarmentSpec | null; style?: "flat" | "fabric"; sex?: Sex }) {
  const id = useId().replace(/:/g, "");
  const g = spec ? buildSpec(spec, LM[sex]) : build(garment, LM[sex]);
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

export const pieceSize = (k: PieceKey) => ({ w: PIECES[k].w, h: PIECES[k].h });

// A point a fraction t along a piece's outline (by length), for the pen that draws it. Measured on a detached path,
// kept per piece.
const PATHS: Partial<Record<PieceKey, SVGPathElement>> = {};
function pointOn(k: PieceKey, t: number): [number, number] | null {
  if (typeof document === "undefined") return null;
  try {
    let el = PATHS[k];
    if (!el) { el = document.createElementNS("http://www.w3.org/2000/svg", "path"); el.setAttribute("d", PIECES[k].d); PATHS[k] = el; }
    const p = el.getPointAtLength(el.getTotalLength() * t);
    return [p.x, p.y];
  } catch { return null; }
}

// tone: "dark" (white lines, for the dark screens) or "light" (ink lines on paper, like a printed pattern).
// draw (0..1): how much of the outline is drawn, for drafting animations; the fill and markings follow once it closes.
export function Piece({ k, label, className, showGrid = false, allowance = false, width, tone = "dark", draw }: { k: PieceKey; label?: string; className?: string; showGrid?: boolean; allowance?: boolean | number; width?: number; tone?: "dark" | "light"; draw?: number }) {
  const p = PIECES[k];
  // the allowance band widens with the amount (a number in cm; true draws the usual 1.5 cm)
  const cm = typeof allowance === "number" ? allowance : 1.5;
  const band = Math.min(40, 4 + cm * 2), grow = 1 + Math.min(0.24, 0.012 + cm * 0.022);
  const [x1, y1, x2, y2] = p.grain;
  const light = tone === "light";
  const ink = light ? "#131523" : "#fff";
  const grain = light ? "#4f63e0" : "#8c9cf8";
  const drawing = draw !== undefined;
  const closed = !drawing || draw >= 0.999;
  const marks = { opacity: closed ? 1 : 0, transition: "opacity .5s ease" };
  // while it draws, a pen point sits at the end of the line
  const pen = drawing && draw > 0.001 && !closed ? pointOn(k, draw) : null;
  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} width={width ?? p.w} className={className} aria-hidden style={{ overflow: "visible" }}>
      {showGrid && <rect width={p.w} height={p.h} fill="none" />}
      {allowance && <path d={p.d} fill="none" stroke="#8c9cf8" strokeWidth={band} strokeOpacity=".22" strokeLinejoin="round" />}
      {allowance && <path d={p.d} fill="none" stroke="#8c9cf8" strokeWidth="1" strokeDasharray="3 3" transform={`translate(${p.w / 2} ${p.h / 2}) scale(${grow}) translate(${-p.w / 2} ${-p.h / 2})`} />}
      <path d={p.d} fill={light ? "rgba(104,126,245,.13)" : "rgba(104,126,245,.14)"} stroke="none" style={marks} />
      <path d={p.d} fill="none" stroke={ink} strokeWidth={light ? 2 : 1.4} strokeLinejoin="round" {...(drawing ? { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - Math.max(0, Math.min(1, draw)) } : {})} />
      {pen && <g transform={`translate(${pen[0]} ${pen[1]})`}><circle r="16" fill="#687ef5" opacity=".16" /><circle r="7" fill="#687ef5" stroke="#fff" strokeWidth="2.6" /></g>}
      <g style={marks}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={grain} strokeWidth="1.2" />
        <path d={x1 === x2 ? `M${x1 - 3} ${y1 + 5} L${x1} ${y1} L${x1 + 3} ${y1 + 5} M${x2 - 3} ${y2 - 5} L${x2} ${y2} L${x2 + 3} ${y2 - 5}` : `M${x1 + 5} ${y1 - 3} L${x1} ${y1} L${x1 + 5} ${y1 + 3} M${x2 - 5} ${y2 - 3} L${x2} ${y2} L${x2 - 5} ${y2 + 3}`} fill="none" stroke={grain} strokeWidth="1.2" />
        {label && (
          <text x={p.w / 2 + (x1 === x2 ? 12 : 0)} y={p.h / 2} textAnchor="middle" fontSize="6.5" fill={ink} opacity={light ? 0.75 : 0.8}>
            <tspan x={p.w / 2 + (x1 === x2 ? 14 : 0)} dy="0">{label}</tspan>
            <tspan x={p.w / 2 + (x1 === x2 ? 14 : 0)} dy="9" opacity=".7">{p.fold ? "Cut 1 on fold" : "Cut 2"}</tspan>
          </text>
        )}
      </g>
    </svg>
  );
}

// ─── Draggable tick ruler ─────────────────────────────────────────────
// The ticks stand on the ruler's bottom edge, so inside a card (.dial) they sit flush with the card's edges.
// Quiet ticks (the value above is what matters); the pointer is one white line in the middle.
// numbers: write the centimetres over every fifth tick, like a tape measure (ticks then follow the real values)
export function Ruler({ value, onChange, min, max, step = 0.5, px = 9, h = 52, className, light = false, numbers = false }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; px?: number; h?: number; className?: string; light?: boolean; numbers?: boolean }) {
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
  // a drag keeps going wherever the finger goes until it lifts, even far outside the ruler: the moves are followed on
  // the whole window (the latest value and onChange are read through refs, so a long drag never acts on old ones)
  const live = useRef({ value, onChange });
  useEffect(() => { live.current = { value, onChange }; });
  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, v: value };
    const id = e.pointerId;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id || !drag.current) return;
      const nv = clamp(drag.current.v + ((drag.current.x - ev.clientX) / px) * step);
      if (nv !== live.current.value) { live.current.value = nv; live.current.onChange(nv); try { navigator.vibrate?.(3); } catch {} }
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      drag.current = null;
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  };
  return (
    <div ref={ref} className={`relative touch-none select-none overflow-hidden ${className ?? ""}`} onPointerDown={onDown}
      style={{ height: h, maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)", cursor: "ew-resize" }}>
      <svg width={w} height={h} className="absolute inset-0">
        <g transform={`translate(${offset} 0)`}>
          {Array.from({ length: n + 1 }, (_, i) => {
            const v = min + i * step;
            const major = ((numbers ? v : i * step) % 5) === 0; const mid = (i * step) % 1 === 0;
            const t = major ? h * (numbers ? 0.34 : 0.42) : mid ? h * (numbers ? 0.2 : 0.26) : h * 0.15;
            return <g key={i}>
              <line x1={i * px} x2={i * px} y1={h - t} y2={h} stroke={light ? "#0b0c15" : "#fff"} strokeOpacity={major ? 0.42 : mid ? 0.24 : 0.14} strokeWidth={major ? 1.5 : 1} />
              {numbers && major && <text x={i * px} y={h - t - 6} textAnchor="middle" fontSize="11" fill={light ? "#0b0c15" : "#fff"} fillOpacity=".5" style={{ fontVariantNumeric: "tabular-nums" }}>{v}</text>}
            </g>;
          })}
        </g>
      </svg>
      <span className={`pointer-events-none absolute bottom-0 left-1/2 w-[2px] -translate-x-1/2 rounded-t-full ${light ? "bg-[#4f63e0]" : "bg-white"}`} style={{ height: h * 0.62 }} />
    </div>
  );
}
