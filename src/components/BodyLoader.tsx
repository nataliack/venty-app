// The 3D body's loader: a small ring, centred in the body's box, while the 3D code and then the body (or a garment)
// download and appear. It waits a beat before showing, so a body already in the cache never flashes it, and fades out
// as the body appears. With reduced motion the ring stands still. Light: no 3D code in here, so it can show while that
// code is still on its way.
import { cx } from "@/components/ui";

export function BodyLoader({ show = true, className }: { show?: boolean; className?: string }) {
  return (
    <div role="status" aria-label="Loading the 3D body" aria-hidden={!show}
      className={cx("pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-300", show ? "body-loader-in" : "opacity-0", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" className="body-loader-ring" aria-hidden>
        <circle cx="14" cy="14" r="11" fill="none" stroke="rgb(255 255 255 / .12)" strokeWidth="2" />
        <circle cx="14" cy="14" r="11" fill="none" stroke="rgb(240 244 254 / .8)" strokeWidth="2" strokeLinecap="round" strokeDasharray="17 52" />
      </svg>
    </div>
  );
}
