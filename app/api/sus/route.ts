// إرسال استبيان سهولة الاستخدام، أو رفض الدعوة إليه.
import { authed, fail, ok, rateLimit, readJson } from "@/lib/http";
import { langOf, tOf } from "@/lib/i18n";
import { dismissSus, saveSus, validAnswers } from "@/lib/sus";

export const POST = authed(async (req, user) => {
  const t = tOf(req);
  const lang = langOf(req);
  if (!rateLimit(`sus:${user.id}`, 20, 60 * 60_000)) return fail(429, t("محاولات كثيرة. أعد المحاولة لاحقًا.", "Too many attempts. Try again later."));
  const b = await readJson<{ answers?: unknown; dismiss?: unknown }>(req);
  if (b?.dismiss === true) {
    await dismissSus(user.id, lang);
    return ok();
  }
  if (!validAnswers(b?.answers)) return fail(400, t("أجب عن العبارات العشر كلها بدرجة من 1 إلى 5.", "Answer all ten statements with a rating from 1 to 5."));
  await saveSus(user.id, b.answers, lang);
  return ok();
});
