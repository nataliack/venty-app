import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Venty — AI pattern studio",
    short_name: "Venty",
    description: "Sewing patterns drafted to your exact measurements.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0c15",
    theme_color: "#0b0c15",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
