// قواعد نموذج «تواصل معنا»: الحدود والتحقق من المدخلات. وحدة خالصة بلا قاعدة بيانات، فيستخدمها
// النموذج في المتصفح (لأطوال الحقول) والخادم (للتحقق) معًا. الحفظ والقراءة في contact.ts.

export const CONTACT = { name: 80, email: 254, minBody: 10, body: 4000, retentionDays: 365 } as const;

export type ContactInput = { name: string | null; email: string; body: string };
export type ContactError = "name" | "email" | "body_short" | "body_long";
export type ContactCheck = { ok: true; value: ContactInput } | { ok: false; error: ContactError } | { ok: false; spam: true };

export const CONTACT_ERRORS: Record<ContactError, { ar: string; en: string }> = {
  name: { ar: `الاسم أطول من ${CONTACT.name} حرفًا.`, en: `The name is longer than ${CONTACT.name} characters.` },
  email: { ar: "اكتب بريدًا إلكترونيًا صحيحًا لنرد عليك.", en: "Enter a valid email address so we can reply." },
  body_short: { ar: `اكتب رسالة من ${CONTACT.minBody} أحرف على الأقل.`, en: `Write a message of at least ${CONTACT.minBody} characters.` },
  body_long: { ar: `الرسالة أطول من ${CONTACT.body} حرف.`, en: `The message is longer than ${CONTACT.body} characters.` },
};

// تُحذف محارف التحكم (عدا السطر الجديد والجدولة) ومحارف التنسيق الخفية، ومنها محارف قلب اتجاه النص
// التي قد تُستخدم لتمويه عنوان أو نص في صفحة القراءة. وتُوحَّد نهايات الأسطر.
const clean = (s: string) =>
  s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").replace(/\p{Cf}/gu, "").trim();
const EMAIL = /^[^\s@<>()[\]",;:]+@[^\s@<>()[\]",;:]+\.[^\s@<>()[\]",;:]{2,}$/;

export function checkContact(raw: Record<string, unknown> | null | undefined): ContactCheck {
  const r = raw ?? {};
  // حقل مخفي عن الزائر (لا يُرى ولا يصل إليه بلوحة المفاتيح)؛ تملؤه البرامج الآلية التي تملأ كل حقل تجده.
  if (typeof r.website === "string" && r.website.trim()) return { ok: false, spam: true };
  const name = typeof r.name === "string" ? clean(r.name).replace(/\s+/g, " ") : "";
  if (name.length > CONTACT.name) return { ok: false, error: "name" };
  const email = typeof r.email === "string" ? clean(r.email) : "";
  if (email.length > CONTACT.email || !EMAIL.test(email)) return { ok: false, error: "email" };
  const body = typeof r.body === "string" ? clean(r.body) : "";
  if (body.length < CONTACT.minBody) return { ok: false, error: "body_short" };
  if (body.length > CONTACT.body) return { ok: false, error: "body_long" };
  return { ok: true, value: { name: name || null, email, body } };
}
