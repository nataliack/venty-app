// The app's manifest with one chosen home-screen icon (src/lib/appIcons.ts), one per icon, made at build time. The page's
// <link rel="manifest"> points here once an icon is chosen on "Add Venty to your home screen" (useAppIconLinks in
// Install.tsx), so Android's install uses that icon. Everything else is the app's own manifest (app/manifest.ts).
import manifest from "../../manifest";
import { ICONS, iconSrc, type IconKey } from "@/lib/appIcons";

export const dynamicParams = false;
export function generateStaticParams() {
  return ICONS.map((i) => ({ icon: i.k }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ icon: string }> }) {
  const k = (await params).icon as IconKey;
  const icons = [
    { src: iconSrc(k, 192), sizes: "192x192", type: "image/png" },
    { src: iconSrc(k, 512), sizes: "512x512", type: "image/png" },
    { src: iconSrc(k, 512), sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
  return new Response(JSON.stringify({ ...manifest(), id: "/", icons }), { headers: { "content-type": "application/manifest+json" } });
}
