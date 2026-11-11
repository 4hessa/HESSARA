// المصادقة: كلمات مرور مجزّأة بـ scrypt، وجلسات برموز عشوائية تُخزَّن مجزّأة.
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { get, run, type UserRow } from "./db";

const COOKIE = "hs_session";
const SESSION_DAYS = 30;

export const newId = () => crypto.randomBytes(12).toString("base64url");
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return expected.length === hash.length && crypto.timingSafeEqual(hash, expected);
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = Date.now() + SESSION_DAYS * 864e5;
  run("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?,?,?)", sha(token), userId, expires);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.HESSARA_INSECURE_COOKIE !== "1",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) run("DELETE FROM sessions WHERE token_hash = ?", sha(token));
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<UserRow | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = get<UserRow & { expires_at: number }>(
    "SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
    sha(token),
  );
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    run("DELETE FROM sessions WHERE token_hash = ?", sha(token));
    return null;
  }
  return row;
}

export type PublicUser = {
  id: string; name: string; email: string; avatar: string;
  prefModel: string | null; prefAgent: string | null;
  reminderEnabled: boolean; reminderMinutes: number; personalize: boolean; externalConsent: boolean;
};
export const toPublic = (u: UserRow): PublicUser => ({
  id: u.id, name: u.name, email: u.email, avatar: u.avatar,
  prefModel: u.pref_model, prefAgent: u.pref_agent,
  reminderEnabled: !!u.reminder_enabled, reminderMinutes: u.reminder_minutes,
  personalize: !!u.personalize, externalConsent: !!u.external_consent,
});
