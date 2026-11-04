// What the device is, read once before the app starts (FRAME_BOOT, in layout.tsx), from the device itself and never from
// the window's width (inside the phone frame the window is a phone's width on any computer):
// - html.phone: a real phone (an iPhone or an Android phone; or, whatever it says it is, a touch screen no wider than a
//   phone's, as a phone asking for the desktop site). Tablets and computers are not phones.
// - html.framed: a tablet or a computer, not opened from the home screen: the page shows the app inside a phone
//   (PhoneFrame), the app itself running in a frame of a phone's size, so every screen is exactly its phone layout.
// - html.in-frame: this is the app inside that frame.
// ?noframe=1 (or localStorage venty-noframe = 1) keeps the app full width on a computer, for design work.
export const FRAME_BOOT = `(function(){try{
var d=document.documentElement,ua=navigator.userAgent;
var phone=/iPhone|iPod/.test(ua)||(/Android/.test(ua)&&/Mobile/.test(ua))||(window.matchMedia("(pointer: coarse)").matches&&Math.min(screen.width,screen.height)<600);
var standalone=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;
var inFrame=false;try{inFrame=window.self!==window.top;}catch(e){inFrame=true;}
var off=/[?&]noframe=1/.test(location.search);try{off=off||localStorage.getItem("venty-noframe")==="1";}catch(e){}
if(phone)d.classList.add("phone");
if(inFrame)d.classList.add("in-frame");
else if(!phone&&!standalone&&!off)d.classList.add("framed");
// the colour the last screen had at its top (useStatusTint keeps it): the page and the device take it at once, so a
// reload never flashes the dark default round Safari's bars (html.booting, until the app has drawn its screen)
if(!d.classList.contains("framed")){try{var t=localStorage.getItem("venty-tint");if(t&&/^#[0-9a-f]{3,8}$/i.test(t)){d.style.background=t;d.style.setProperty("--boot-bg",t);d.classList.add("booting");}}catch(e){}}
}catch(e){}})();`;

const has = (c: string) => typeof document !== "undefined" && document.documentElement.classList.contains(c);
/** a real phone (not a tablet, not a computer) */
export const isPhone = () => has("phone");
/** opened from the home screen */
export const isStandalone = () => has("pwa") || (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches);
/** this page shows the app inside the phone frame */
export const isFramed = () => has("framed");
