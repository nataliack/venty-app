import type { SVGProps } from "react";

const P: Record<string, React.ReactNode> = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  chevR: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  chevD: <path d="M6 9.5 12 15l6-5.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <path d="M5.5 12.5l4.2 4.2L18.5 8" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></>,
  tape: <><circle cx="9" cy="12" r="5.5" /><circle cx="9" cy="12" r="1.6" /><path d="M14.5 12H21v4h-6.5" /></>,
  friend: <><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19c.9-3 3-4.6 5.5-4.6s4.6 1.6 5.5 4.6" /><circle cx="16.5" cy="9.5" r="2.4" /><path d="M16 14.4c2.2 0 3.8 1.3 4.5 4" /></>,
  shirt: <path d="M8.5 4 4 6.5l1.8 4 2.2-1V20h8V9.5l2.2 1 1.8-4L15.5 4c-.5 1.4-1.8 2.3-3.5 2.3S9 5.4 8.5 4z" />,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" /></>,
  wall: <><rect x="4" y="4" width="16" height="16" rx="1.5" /><path d="M4 9.5h16M4 15h16M10 4v5.5M15 9.5V15M9 15v5" /></>,
  phone: <><rect x="7" y="3.5" width="10" height="17" rx="2.2" /><path d="M11 17.5h2" /></>,
  camera: <><path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z" /><circle cx="12" cy="13.2" r="3.4" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.6-4.6" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5" /></>,
  upload: <><path d="M12 15.5V5M7.5 9.5 12 5l4.5 4.5" /><path d="M5 15v4h14v-4" /></>,
  sparkle: <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />,
  printer: <><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="7" rx="1.5" /><path d="M7 14h10v6H7z" /></>,
  ruler: <><path d="M3.5 15.5 15.5 3.5l5 5-12 12z" /><path d="M7 12l2 2M9.5 9.5l1.5 1.5M12 7l2 2" /></>,
  scissors: <><circle cx="6.5" cy="7" r="2.5" /><circle cx="6.5" cy="17" r="2.5" /><path d="M8.6 8.4 19 17M8.6 15.6 19 7" /></>,
  home: <><path d="M4.5 10.5 12 4.5l7.5 6V19.5h-5v-5h-5v5h-5z" /></>,
  image: <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M5 17l4.5-4 3 2.5 3-3L20 16.5" /></>,
  pencil: <path d="M5 19l1-4L16 5l3 3L9 18zM14 7l3 3" />,
  info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5M12 8v.2" /></>,
  sliders: <><path d="M5 7h9M18 7h1M5 17h3M12 17h7" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  refresh: <><path d="M19 12a7 7 0 1 1-2.1-5" /><path d="M19 4.5V8h-3.5" /></>,
  download: <><path d="M12 4.5V15M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19.5h14" /></>,
  layers: <><path d="M12 4 3.5 8.5 12 13l8.5-4.5z" /><path d="M3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5" /></>,
  mic: <><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></>,
  rotate: <><path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L19.5 9" /><path d="M19.5 4.5V9H15" /><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1L4.5 15" /></>,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></>,
  share: <><path d="M12 3.5v11M8 7.2 12 3.5l4 3.7" /><path d="M8.5 10H6.5A1.5 1.5 0 0 0 5 11.5v7A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 10h-2" /></>,
  eraser: <><path d="M9 19.5h10M4.8 14.6l8.8-8.8a2 2 0 0 1 2.8 0l2.8 2.8a2 2 0 0 1 0 2.8L12 18.6a3 3 0 0 1-2.1.9H8.4a3 3 0 0 1-2.1-.9l-1.5-1.5a1.7 1.7 0 0 1 0-2.5z" /><path d="m9.5 9.9 5.6 5.6" /></>,
  undo: <><path d="M9 14 4.5 9.5 9 5" /><path d="M4.5 9.5H14a5.5 5.5 0 0 1 0 11h-2" /></>,
  imageplus: <><path d="M20 12.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" /><circle cx="9" cy="10" r="1.5" /><path d="m5 17.5 4.5-4 3 2.5 3-3 4 3.5M18 3.5v6M15 6.5h6" /></>,
  addhome: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8.5v7M8.5 12h7" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  help: <><circle cx="12" cy="12" r="8" /><path d="M9.8 9.6a2.3 2.3 0 1 1 3.2 2.1c-.7.3-1 .8-1 1.5v.3M12 16.4v.2" /></>,
  map: <><path d="M4 6.5 9 4.5l6 2 5-2v13l-5 2-6-2-5 2z" /><path d="M9 4.5v13M15 6.5v13" /></>,
  body: <><circle cx="12" cy="5" r="2.2" /><path d="M8 20l1.2-7.5L7 9.5l5-1.5 5 1.5-2.2 3L16 20" /></>,
  dress: <path d="M9.5 3.5 9 7.5l-3.5 13h13L15 7.5l-.5-4M9 7.5h6" />,
  flash: <path d="M13 3 6 13.5h5L10 21l7-10.5h-5z" />,
  keyboard: <><rect x="3.5" y="6.5" width="17" height="11" rx="2" /><path d="M7 10h.1M10 10h.1M13 10h.1M16.5 10h.1M8 14h8" /></>,
  more: <path d="M6 12h.1M12 12h.1M18 12h.1" strokeWidth={3} />,
  move: <><path d="M12 4v16M4 12h16" /><path d="M9.5 6.5 12 4l2.5 2.5M9.5 17.5 12 20l2.5-2.5M6.5 9.5 4 12l2.5 2.5M17.5 9.5 20 12l-2.5 2.5" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="9" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  heart: <path d="M12 19s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7.5a3.8 3.8 0 0 1 7 2C19 14.6 12 19 12 19z" />,
  logout: <><path d="M14 5H5.5v14H14" /><path d="M10 12h10M16.5 8.5 20 12l-3.5 3.5" /></>,
  trash: <><path d="M5 7h14M9.5 7V5h5v2M7 7l1 12.5h8L17 7" /></>,
  eye: <><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.5" /></>,
  bell: <><path d="M6.5 15.2V9.7a5.5 5.5 0 0 1 11 0v5.5l1.6 1.6H4.9z" /><path d="M10 18.9a2.1 2.1 0 0 0 4 0" /></>,
  video: <><rect x="3.5" y="6.5" width="12" height="11" rx="2" /><path d="M15.5 10.5 20.5 8v8l-5-2.5" /></>,
  book: <><path d="M5 5.5A2 2 0 0 1 7 4h12v14H7a2 2 0 0 0-2 2z" /><path d="M5 20V5.5" /></>,
  triangle: <path d="M12 5 20 19H4z" />,
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 22, className, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden {...rest}>
      {P[name]}
    </svg>
  );
}

export function AppleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8s2.1-1.2 2.9-2.4c.9-1.3 1.3-2.7 1.3-2.7s-2.4-1-2.4-4.1zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" />
    </svg>
  );
}

export function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}
