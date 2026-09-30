// Light haptic feedback for taps.
// Android browsers support the Vibration API. iPhone Safari has no Vibration API, but toggling a native
// <input type="checkbox" switch> (Safari 17.4+) plays the system "tick", so we flip a hidden one.
// Both only work inside a user gesture (a tap). Everywhere else this silently does nothing.
let ios: HTMLLabelElement | null = null;
let last = 0;

export type Haptic = "tap" | "select" | "success";

export function haptic(kind: Haptic = "tap") {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (now - last < 40) return; // don't double-fire on nested buttons
  last = now;
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(kind === "success" ? [14, 70, 22] : kind === "select" ? 6 : 10);
      return;
    }
    if (!/iP(hone|ad|od)/.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent))) return;
    if (!ios) {
      ios = document.createElement("label");
      ios.setAttribute("aria-hidden", "true");
      ios.style.cssText = "position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("switch", "");
      input.tabIndex = -1;
      ios.appendChild(input);
      document.body.appendChild(ios);
    }
    ios.click();
  } catch {
    /* haptics are a nice-to-have */
  }
}
