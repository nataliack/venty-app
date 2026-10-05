"use client";
import { useRef, useState, type ReactNode } from "react";
import { useApp, userPhoto, type User } from "@/lib/store";
import { Screen, TopBar, HS, Lead, Pill, Sheet, Toggle, Option, Arrows, Field, Avatar, cx, useToast, useDesk } from "@/components/ui";
import { useInstall } from "@/components/Install";
import { Icon, type IconName } from "@/components/icons";
import { TabBar } from "./home";
import { EXP } from "./setup";

/* You: who you are on a light top (the same light block as home), what you have made as three tiles that say something
   useful and lead somewhere, then plain grouped settings. Edit profile and the two info pages are their own screens. */

// a settings row: an icon badge, the label (and an optional line under it), then a control or a chevron
function Row({ icon, label, sub, onClick, right, danger }: { icon: IconName; label: string; sub?: string; onClick?: () => void; right?: ReactNode; danger?: boolean }) {
  const inner = (
    <>
      <span className="iconbadge grid h-9 w-9 shrink-0 place-items-center rounded-full"><Icon name={icon} size={17} strokeWidth={1.9} /></span>
      <span className="min-w-0 flex-1"><span className={cx("block text-[16px]", danger && "text-[#f0a3b4]")}>{label}</span>{sub && <span className="block text-[13px] leading-snug text-white/50">{sub}</span>}</span>
      {right ?? (onClick && <Icon name="chevR" size={18} className="shrink-0 text-white/40" />)}
    </>
  );
  const cls = "flex min-h-[60px] w-full items-center gap-3.5 px-4 py-3 text-left";
  return onClick && !right ? <button onClick={onClick} className={cx(cls, "transition-colors hover:bg-white/[.03]")}>{inner}</button> : <div className={cls}>{inner}</div>;
}
const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-7">
    <h2 className="px-1 text-[15px] text-white/55">{title}</h2>
    <div className="card-soft mt-2.5 divide-y divide-white/[.07] overflow-hidden rounded-[22px]">{children}</div>
  </section>
);

export function You() {
  const { user, units, experience, set, reset, bodies, patterns, go, replace } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [level, setLevel] = useState(false);
  const [logout, setLogout] = useState(false);
  const { standalone } = useInstall();
  const kiosk = useApp((s) => s.kiosk);
  const { toast, node } = useToast();
  const desk = useDesk();
  const name = user.guest ? "Guest" : user.name;
  const lvl = experience !== null ? EXP[experience]?.t : null;

  // three tiles: a number and a line that tells you something (not just a count)
  const printed = patterns.filter((p) => p.status === "Printed");
  const toPrint = patterns.filter((p) => p.status === "Fitting").length;
  const drafts = patterns.filter((p) => p.status === "Draft").length;
  const tiles: { icon: IconName; n: number; label: string; line: string; go: () => void }[] = [
    { icon: "body", n: bodies.length, label: bodies.length === 1 ? "Body" : "Bodies", line: bodies.length ? bodies.map((b) => b.name).join(", ") : "None yet", go: () => replace("bodies") },
    { icon: "scissors", n: patterns.length, label: patterns.length === 1 ? "Pattern" : "Patterns", line: toPrint ? `${toPrint} ready to print` : drafts ? `${drafts} in progress` : patterns.length ? "All printed" : "None yet", go: () => replace("patterns") },
    { icon: "printer", n: printed.length, label: "Printed", line: printed[0] ? printed[0].name : "Nothing yet", go: () => replace("patterns", { filter: "Printed" }) },
  ];

  return (
    <Screen noPad dock footer={desk ? undefined : <TabBar tab="you" />}>
      <div className="bg-bg">
        <section className="home-hero light-hero relative px-5 pb-7 lg:px-12 lg:py-10">
          <div className="light-mat" aria-hidden />
          <div className="relative">
            <div className="mt-2 flex h-11 items-center justify-between lg:mt-0">
              <span className="text-[15px] font-medium text-[#3f4c80]">Profile</span>
              {!user.guest && <button onClick={() => go("profileEdit")} className="bell-btn tap flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium"><Icon name="pencil" size={15} strokeWidth={2} />Edit profile</button>}
            </div>
            <div className="mt-4 flex flex-col items-center text-center lg:mt-2 lg:flex-row lg:items-center lg:gap-6 lg:text-left">
              <button onClick={() => (user.guest ? go("signup") : go("profileEdit"))} aria-label={user.guest ? "Create an account" : "Change your photo"} className="tap relative rounded-full">
                <Avatar size={desk ? 112 : 104} ring className="shadow-[0_18px_40px_-18px_rgb(38_51_95_/_.55)]" />
                {!user.guest && <span className="bell-btn absolute bottom-0.5 right-0.5 grid h-8 w-8 place-items-center rounded-full"><Icon name="camera" size={15} strokeWidth={2} /></span>}
              </button>
              <div className="min-w-0">
                <h1 className="h1 mt-4 !text-[32px] text-[#26335f] lg:mt-0 lg:!text-[44px]">{name}</h1>
                <p className="mt-1 truncate text-[15px] text-[#5d6a99]">{user.guest ? "Exploring as a guest, on this device" : user.email || "Signed in on this device"}</p>
                {/* what Venty knows about you, in plain words (information, not buttons) */}
                <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[14px] text-[#3f4c80] lg:justify-start">
                  <span className="inline-flex items-center gap-1.5"><Icon name="scissors" size={15} />{lvl ? `${lvl} sewist` : "Sewing level not set"}</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="ruler" size={15} /><span>Measures in <span translate="no">{units}</span></span></span>
                </p>
              </div>
            </div>
            {user.guest && <Pill className="mt-6 lg:max-w-[320px]" onClick={() => go("signup")}>Create an account</Pill>}
          </div>
        </section>
      </div>

      <div className="px-6 pb-4 lg:px-0">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <section className="mt-7">
              <h2 className="px-1 text-[15px] text-white/55">Your studio</h2>
              <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                {tiles.map((t) => (
                  <button key={t.label} onClick={t.go} className="card-soft tap flex min-h-[138px] min-w-0 flex-col rounded-[22px] p-3.5 text-left lg:min-h-[168px] lg:p-5">
                    <span className="iconbadge grid h-9 w-9 place-items-center rounded-full"><Icon name={t.icon} size={17} strokeWidth={1.9} /></span>
                    <span className="serif mt-5 text-[34px] leading-none lg:mt-8 lg:text-[44px]">{t.n}</span>
                    <span className="mt-1.5 text-[14px] font-medium">{t.label}</span>
                    <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/50 lg:text-[13px]">{t.line}</span>
                  </button>
                ))}
              </div>
            </section>
            <Group title="Preferences">
              <Row icon="ruler" label="Units" right={
                <div className="flex rounded-full bg-white/8 p-1">{(["cm", "in"] as const).map((u) => <button key={u} onClick={() => set({ units: u })} aria-pressed={units === u} translate="no" className={cx("h-8 w-12 rounded-full text-[14px] font-medium transition-colors", units === u ? "bg-white text-bg" : "text-white/60")}>{u}</button>)}</div>
              } />
              <Row icon="scissors" label="Sewing level" sub={lvl ? EXP[experience!].d : "Not set yet"} onClick={() => setLevel(true)} />
            </Group>
          </div>
          <div>
            <Group title="App">
              {!standalone && <Row icon="addhome" label="Add Venty to your home screen" sub="Open it in one tap, like an app" onClick={() => go("install")} />}
              <Row icon="book" label="App tour" sub="Three short pages on how Venty works" onClick={() => go("onboarding", { from: "app" })} />
              <Row icon="phone" label="Expo mode" sub="Starts over after 2 minutes idle" right={<Toggle on={kiosk} onChange={(v) => { set({ kiosk: v }); toast(v ? "Expo mode on" : "Expo mode off"); }} />} />
            </Group>
            <Group title="Privacy and AI">
              <Row icon="lock" label="Your privacy" sub="What Venty keeps, and where" onClick={() => go("info", { doc: "privacy" })} />
              <Row icon="sparkle" label="About the AI" sub="What it does, and what to check" onClick={() => go("info", { doc: "ai" })} />
            </Group>
            <Group title="Account">
              {!user.guest && <Row icon="logout" label="Log out" onClick={() => setLogout(true)} />}
              <Row icon="refresh" label="Reset for the next visitor" sub="Or press and hold the top-left corner for 2 seconds" danger onClick={() => setConfirm(true)} />
            </Group>
          </div>
        </div>
      </div>

      <Sheet open={level} onClose={() => setLevel(false)}>
        <h3 className="text-[22px] font-normal tracking-[-.02em]">Your sewing level</h3>
        <div className="mt-4 flex flex-col gap-2.5">
          {EXP.map((e, i) => (
            <Option key={e.t} on={experience === i} onClick={() => { set({ experience: i, prefsDone: true }); setLevel(false); }} className="flex min-h-[72px] flex-col justify-center rounded-[20px] px-4 py-3 pr-12">
              <div className="text-[17px] font-medium">{e.t}</div><div className="mt-0.5 text-[15px] text-white/60">{e.d}</div>
            </Option>
          ))}
        </div>
      </Sheet>
      <Sheet open={logout} onClose={() => setLogout(false)}>
        <h3 className="text-[22px] font-normal">Log out?</h3>
        <p className="mt-2 text-[15px] text-white/60">Your bodies and patterns stay on this device.</p>
        <Pill className="mt-5" onClick={() => { setLogout(false); useApp.setState({ user: { name: "Ana", email: "", guest: true }, stack: [{ id: "welcome" }], dir: -1 }); }}>Log out</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setLogout(false)}>Cancel</Pill>
      </Sheet>
      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <h3 className="text-[22px] font-normal">Start fresh?</h3>
        <p className="mt-2 text-[15px] text-white/60">This clears this visitor’s bodies and patterns and goes back to the start.</p>
        <Pill className="mt-5" onClick={() => { setConfirm(false); reset(); }}>Reset Venty</Pill>
        <Pill variant="dark" className="mt-2.5" onClick={() => setConfirm(false)}>Cancel</Pill>
      </Sheet>
      {node}
    </Screen>
  );
}

// a picked photo, as a small square JPEG (centre crop), so it can be kept on the device
async function squarePhoto(file: File, size = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
    const s = Math.min(img.naturalWidth, img.naturalHeight);
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    c.getContext("2d")!.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
    return c.toDataURL("image/jpeg", 0.85);
  } finally { URL.revokeObjectURL(url); }
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export function ProfileEdit() {
  const { user, set, back } = useApp();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [photo, setPhoto] = useState<string | null>(userPhoto(user));
  const file = useRef<HTMLInputElement>(null);
  const changed = name.trim() !== user.name || email.trim() !== user.email || photo !== userPhoto(user);
  const valid = name.trim().length > 0 && (!email.trim() || emailOk(email));
  const save = () => { set({ user: { ...user, name: name.trim(), email: email.trim(), photo } as User }); back(); };
  // the avatar here shows the picture being edited, not the saved one
  const preview = photo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={photo} alt="" className="h-full w-full object-cover" />
    : <span className="text-[44px] font-medium leading-none text-[#3f4c80]">{(name.trim()[0] ?? "A").toUpperCase()}</span>;
  return (
    <Screen header={<TopBar left="back" />} footer={<Arrows hidePrev ready={changed && valid} onNext={save} label="Save" />}>
      <div className="lg:mx-auto lg:max-w-[520px]">
        <HS className="mt-2 lg:mt-0">Edit profile</HS>
        <div className="mt-6 flex flex-col items-center">
          <button onClick={() => file.current?.click()} aria-label="Change photo" className="tap relative rounded-full">
            <span className="avatar avatar-ring relative grid h-[112px] w-[112px] place-items-center overflow-hidden rounded-full">{preview}</span>
            <span className="bell-btn absolute bottom-0.5 right-0.5 grid h-9 w-9 place-items-center rounded-full"><Icon name="camera" size={16} strokeWidth={2} /></span>
          </button>
          <div className="mt-3 flex gap-2">
            <button onClick={() => file.current?.click()} className="chip">{photo ? "Change photo" : "Add a photo"}</button>
            {photo && <button onClick={() => setPhoto(null)} className="chip">Remove</button>}
          </div>
          <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { try { setPhoto(await squarePhoto(f)); } catch { /* not an image we can read */ } } }} />
        </div>
        <div className="mt-7 flex flex-col gap-4">
          <Field label="Name" value={name} onChange={setName} placeholder="Your name" autoComplete="given-name" error={!name.trim() ? "Add your name" : undefined} />
          <Field label="Email" value={email} onChange={setEmail} type="email" inputMode="email" placeholder="you@example.com" autoComplete="email" error={email.trim() && !emailOk(email) ? "Check your email address" : undefined} />
        </div>
        <p className="mt-4 flex items-start gap-2 text-[14px] leading-snug text-white/55"><Icon name="lock" size={17} className="mt-px shrink-0" />Your photo and details stay on this device.</p>
      </div>
    </Screen>
  );
}

// Plain pages for privacy and the AI. Every line is true of this demo; the real product will need its own policy.
const DOCS: Record<string, { t: string; lead: string; parts: [string, string][] }> = {
  privacy: {
    t: "Your privacy",
    lead: "Venty keeps what you make on this device.",
    parts: [
      ["What is saved", "Your bodies, measurements, patterns and preferences are saved in this browser, on this device. Nothing is sent to a server."],
      ["Your scan photos", "Photos from a body scan are kept as small pictures with that body, so you can look back at them. Delete the body and its photos go with it."],
      ["The studio", "Photos and sketches you add in the studio are used while you make the pattern. They are not saved once you start a new one."],
      ["Signing in", "In this demo, signing in only sets your name and picture on this device. There is no account on a server."],
      ["Clearing everything", "Reset in your profile removes everything Venty saved on this device."],
    ],
  },
  ai: {
    t: "About the AI",
    lead: "Venty uses AI to turn a picture into a pattern drafted to your body.",
    parts: [
      ["In this demo", "The AI steps are simulated: reading your garment, estimating measurements from photos and drafting the pattern show how Venty will work, not real results."],
      ["Check every estimate", "Measurements read from photos can be off, so each one has to be checked before it is used. A wrong bust or hip measurement changes the whole pattern."],
      ["Test the fit first", "Before cutting your good fabric, sew a quick test version (a toile) from cheap fabric, then adjust the pattern."],
    ],
  },
};
export function Info({ p }: { p?: Record<string, unknown> }) {
  const doc = DOCS[(p?.doc as string) ?? "privacy"] ?? DOCS.privacy;
  return (
    <Screen header={<TopBar left="back" />}>
      <div className="lg:mx-auto lg:max-w-[640px]">
        <HS className="mt-2 lg:mt-0">{doc.t}</HS>
        <Lead className="mt-3">{doc.lead}</Lead>
        <div className="card-soft mt-6 divide-y divide-white/[.07] rounded-[22px] px-5">
          {doc.parts.map(([h, b]) => (
            <div key={h} className="py-4">
              <h2 className="text-[17px] font-medium">{h}</h2>
              <p className="mt-1 text-[15px] leading-relaxed text-white/65">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
