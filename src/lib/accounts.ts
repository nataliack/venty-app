// Accounts on this device (4 Nov 2026, Jose: "remember accounts on this phone"). The demo has no server, so an account is
// what was signed up with here: its name, email and photo (never a password), kept with the app's data. Logging in with
// one of these emails brings its name and photo back; an email never used here is said so. Log out keeps them; Reset
// (for the next visitor) clears them with everything else.
import type { User } from "./store";

export type Account = { name: string; email: string; photo?: string | null };
const key = (e: string) => e.trim().toLowerCase();

/** the account for this email, if one was made on this device */
export const findAccount = (list: Account[] | undefined, email: string) => (list ?? []).find((a) => key(a.email) === key(email));

/** the list with this user's account added or brought up to date (was: its email before a change) */
export function remember(list: Account[] | undefined, u: User, was?: string): Account[] {
  const all = list ?? [];
  if (u.guest || !u.email.trim()) return all;
  const drop = new Set([key(u.email), ...(was ? [key(was)] : [])]);
  return [...all.filter((a) => !drop.has(key(a.email))), { name: u.name, email: u.email.trim(), photo: u.photo }];
}
