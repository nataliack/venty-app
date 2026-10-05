import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const grotesk = localFont({
  src: [
    { path: "../fonts/familjen-grotesk-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/familjen-grotesk-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/familjen-grotesk-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/familjen-grotesk-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-grotesk",
  display: "swap",
});

const num = localFont({
  src: [{ path: "../fonts/bigilla-bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-num",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Venty — AI pattern studio",
  description: "See a dress you love. Wear it, made for you. Sewing patterns drafted to your exact measurements.",
  manifest: "/manifest.webmanifest",
  // Status bar: see-through (black-translucent). On iOS 26 this alone makes a home-screen web app one status bar (47pt)
  // short at the bottom (WebKit bug 301108). The cure is in globals.css (html.pwa): a document slightly taller than the
  // screen makes iOS grow the window to the full screen.
  // iOS reads this setting only when the app is ADDED to the home screen: re-add after changing it.
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Venty" },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon-192.png", type: "image/png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0c15",
};

// html.pwa: opened from the home screen. html.vp-short: innerHeight is shorter than the screen. Only shown in the
// display readout (You tab); the layout no longer reacts to it, since on a real iPhone it read "short" while the app
// actually reached the bottom edge.
const PWA_BOOT = `(function(){try{
var d=document.documentElement;
var preview=location.hostname==="localhost"&&localStorage.getItem("venty-preview-pwa")==="1"; // dev only: preview the home-screen layout
if(!(preview||window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true))return;
d.classList.add("pwa");
var fit=function(){var portrait=window.innerHeight>window.innerWidth;var gap=(portrait?screen.height:screen.width)-window.innerHeight;d.classList.toggle("vp-short",portrait&&gap>20);};
fit();window.addEventListener("resize",fit);window.addEventListener("orientationchange",function(){setTimeout(fit,300);});
}catch(e){}})();`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${grotesk.variable} ${num.variable}`} suppressHydrationWarning>
      <body>
        {children}
        {/* Opened from the home screen (no browser bars)? Mark it before the app starts, so the layout can drop
            the space it reserves for Safari's toolbar. */}
        <Script id="pwa-boot" strategy="beforeInteractive">{PWA_BOOT}</Script>
      </body>
    </html>
  );
}
