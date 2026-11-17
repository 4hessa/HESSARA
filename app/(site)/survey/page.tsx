// استبيان سهولة الاستخدام (SUS). الإجابة مرتبطة بالحساب وتُحذف معه، وتظهر لصاحب المشروع مجمّعة فقط.
import type { Metadata } from "next";
import { SusForm } from "@/components/SusForm";
import { AppPage } from "@/components/site/Page";
import { requireUser } from "@/lib/guard";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { userSus } from "@/lib/sus";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("سهولة الاستخدام", "Ease of use"), robots: { index: false, follow: false } };
}

export default async function SurveyPage() {
  const user = await requireUser("/survey");
  const lang = await getLang();
  const t = makeT(lang);
  const prev = await userSus(user.id);
  return (
    <AppPage eyebrow={t("تقييم المنصة", "Rate the platform")} title={t("ما مدى سهولة استخدام هسّارة؟", "How easy is HESSARA to use?")}
      copy={t("لكل عبارة اختر درجة من 1 (أعارض بشدة) إلى 5 (أوافق بشدة) حسب تجربتك. أجب عن العبارات كلها ولا تطِل التفكير في أي منها؛ إن لم تعرف بماذا تجيب فاختر 3.",
        "For each statement choose a rating from 1 (strongly disagree) to 5 (strongly agree) based on your experience. Answer every statement without thinking too long about any of them; if you are not sure, choose 3.")}
      narrow>
      <div className="stack">
        {prev && <p className="notice notice-accent t-small">{t("يوجد تقييم سابق منك، وإجاباته معروضة أدناه. الإرسال الجديد يحل محله.", "You have rated before; your answers are shown below. Submitting again replaces them.")}</p>}
        <SusForm initial={prev?.answers ?? null} />
        <p className="t-small muted">{t("هذا مقياس سهولة الاستخدام المعياري (عشر عبارات). تُحفظ إجابتك مع حسابك وتُحذف معه، ولا تظهر لصاحب المشروع إلا مجمّعة مع غيرها دون اسمك أو بريدك.",
          "This is the standard System Usability Scale (ten statements). Your answer is stored with your account and deleted with it, and the project owner only sees it aggregated with others, without your name or email.")}</p>
      </div>
    </AppPage>
  );
}
