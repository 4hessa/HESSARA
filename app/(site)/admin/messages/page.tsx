// رسائل «تواصل معنا» لصاحب المشروع (بريده في HESSARA_ADMIN_EMAILS). صفحة مستقلة عن الإحصاءات، لأن تلك
// تعد بأعداد مجمّعة فقط، وهذه تعرض رسائل كتبها زوار إلى صاحب المشروع نفسه. لغيره تبدو غير موجودة.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactInbox } from "@/components/ContactInbox";
import { AppPage } from "@/components/site/Page";
import { CONTACT, listContact } from "@/lib/contact";
import { requireUser } from "@/lib/guard";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { isAdmin } from "@/lib/usage";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("رسائل التواصل", "Contact messages"), robots: { index: false, follow: false } };
}

export default async function AdminMessagesPage() {
  const user = await requireUser("/admin/messages");
  if (!isAdmin(user.email)) notFound();
  const t = makeT(await getLang());
  const rows = await listContact();
  return (
    <AppPage eyebrow={t("لصاحب المشروع", "For the project owner")} title={t("رسائل التواصل", "Contact messages")}
      copy={t(
        `ما أرسله الزوار من نموذج «تواصل معنا». لا تصل إشعارات بالبريد، فتُراجَع هذه الصفحة دوريًا. تُحذف الرسالة تلقائيًا بعد ${CONTACT.retentionDays} يومًا.`,
        `What visitors sent through the contact form. No email notifications are sent, so check this page from time to time. A message is deleted automatically after ${CONTACT.retentionDays} days.`,
      )}
      actions={<Link className="btn btn-ghost btn-sm" href="/admin">{t("إحصاءات المنصة", "Platform statistics")}</Link>}>
      <ContactInbox initial={rows} />
    </AppPage>
  );
}
