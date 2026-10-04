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
  // "black", not "black-translucent": iOS 26 shortens home-screen apps by the status-bar height when it is translucent
  // (WebKit bug 301108), leaving a dead strip at the bottom. With "black" the app starts under the status bar and reaches the bottom edge.
  appleWebApp: { capable: true, statusBarStyle: "black", title: "Venty" },
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

const PWA_BOOT = `(function(){try{
var standalone=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;
if(!standalone)return;var d=document.documentElement;d.classList.add("pwa");
function fit(){var portrait=window.innerHeight>=window.innerWidth,a=screen.width,b=screen.height;
d.style.setProperty("--app-h",(portrait?Math.max(a,b):Math.min(a,b))+"px");}
fit();window.addEventListener("resize",fit);window.addEventListener("orientationchange",function(){setTimeout(fit,300);});
}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${grotesk.variable} ${num.variable}`} suppressHydrationWarning>
      <body>
        {children}
        {/* Opened from the home screen (no browser bars)? Mark it before the app starts, and size the app to the
            full screen, so the layout can run edge to edge instead of leaving room for Safari's toolbar. */}
        <Script id="pwa-boot" strategy="beforeInteractive">{PWA_BOOT}</Script>
      </body>
    </html>
  );
}
