// رسالة من نموذج «تواصل معنا». تُحفظ في قاعدة البيانات لصاحب المشروع؛ لا يلزم حساب ولا خدمة بريد.
// الحماية: أصل الموقع نفسه، وحقل مخفي يكشف البرامج الآلية، وحد لكل اتصال، وسقف يومي للموقع كله.
import { checkContact, CONTACT_ERRORS, saveContact } from "@/lib/contact";
import { fail, ok, readJson, sameOrigin } from "@/lib/http";
import { langOf, makeT } from "@/lib/i18n";
import { allow, allowIp } from "@/lib/limits";

export async function POST(req: Request) {
  const lang = langOf(req);
  const t = makeT(lang);
  if (!sameOrigin(req)) return fail(403, t("مصدر الطلب غير مسموح.", "Request origin not allowed."));
  const c = checkContact(await readJson(req));
  // البرنامج الآلي يتلقى ردًّا عاديًا ولا يُحفظ شيء، فلا يعرف أنه كُشف.
  if ("spam" in c) return ok();
  if (!c.ok) return fail(400, CONTACT_ERRORS[c.error][lang]);
  if (!(await allowIp(req, "contact", 5, 3_600_000)))
    return fail(429, t("أُرسلت رسائل كثيرة من هذا الاتصال. حاول بعد ساعة.", "Too many messages from this connection. Try again in an hour."));
  if (!(await allow("contact:all", 100, 86_400_000)))
    return fail(429, t("بلغت رسائل اليوم حدها الأقصى. حاول غدًا، أو راسلنا بالبريد.", "Today's message limit has been reached. Try tomorrow, or email us."));
  await saveContact(c.value, lang);
  return ok();
}
