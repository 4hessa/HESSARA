// رسائل «تواصل معنا»: تُحفظ في قاعدة بيانات المنصة، ويقرؤها صاحب المشروع وحده في /admin/messages.
// لا تحتاج خدمة بريد ولا اشتراكًا مدفوعًا. لا تُربط بحساب، وتُحذف تلقائيًا بعد مدة الحفظ.
import crypto from "node:crypto";
import { all, get, run } from "./db.ts";
import { CONTACT, type ContactInput } from "./contact-rules.ts";

export { CONTACT, CONTACT_ERRORS, checkContact } from "./contact-rules.ts";
export type { ContactInput } from "./contact-rules.ts";

const DAY = 86_400_000;

export type ContactRow = { id: string; name: string | null; email: string; body: string; lang: string; created_at: number };

/** يحذف ما تجاوز مدة الحفظ. */
export const purgeContact = (now = Date.now()) => run("DELETE FROM contact_messages WHERE created_at < ?", now - CONTACT.retentionDays * DAY);

export async function saveContact(v: ContactInput, lang: string, now = Date.now()): Promise<string> {
  const id = crypto.randomBytes(12).toString("base64url");
  await run("INSERT INTO contact_messages (id, name, email, body, lang, created_at) VALUES (?,?,?,?,?,?)", id, v.name, v.email, v.body, lang, now);
  return id;
}

/** الأحدث أولًا. يحذف ما انتهت مدة حفظه قبل القراءة، فلا يُعرض ما وُعد الزائر بحذفه. */
export async function listContact(limit = 200): Promise<ContactRow[]> {
  await purgeContact();
  return all<ContactRow>("SELECT id, name, email, body, lang, created_at FROM contact_messages ORDER BY created_at DESC LIMIT ?", limit);
}

export async function countContact(since = 0): Promise<number> {
  const r = await get<{ c: unknown }>("SELECT COUNT(*) AS c FROM contact_messages WHERE created_at >= ?", since);
  return Number(r?.c ?? 0);
}

export const deleteContact = (id: string) => run("DELETE FROM contact_messages WHERE id = ?", id);
