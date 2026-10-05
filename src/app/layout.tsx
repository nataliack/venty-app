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
  // Status bar: "default" (opaque), NOT black-translucent. On iOS 26, black-translucent makes every home-screen web app
  // one status bar (47pt) short at the bottom, an unpaintable strip on every screen (WebKit bug 301108). That is the root
  // cause of the "dark block" at the bottom. The opaque bar takes each screen's top colour from theme-color (useStatusTint
  // in App.tsx), so it still blends in. iOS reads this only when the app is ADDED to the home screen: re-add after changes.
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Venty" },
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
if(window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true)document.documentElement.classList.add("pwa");
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
