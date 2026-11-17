// استشارة مشاركة للقراءة فقط عبر رابط أنشأه صاحبها. لا تكشف هوية صاحبها، ولا تفهرسها محركات البحث،
// وتختفي فور إلغاء المشاركة أو حذف الاستشارة.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConsultReport } from "@/components/ConsultReport";
import { PrintButton } from "@/components/PrintButton";
import { AppPage } from "@/components/site/Page";
import { get } from "@/lib/db";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { loadReport, validShareToken } from "@/lib/report";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("استشارة مشاركة", "Shared consultation"), robots: { index: false, follow: false } };
}

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!validShareToken(token)) notFound();
  const share = await get<{ consultation_id: string }>("SELECT consultation_id FROM shares WHERE token = ?", token);
  const data = share ? await loadReport(share.consultation_id) : null;
  if (!data) notFound();
  const lang = await getLang();
  const t = makeT(lang);
  return (
    <AppPage
      eyebrow={t("استشارة مشاركة للقراءة فقط", "A shared consultation, read only")}
      title={data.c.title}
      copy={t("شاركها صاحبها من منصة هسّارة للاستشارات بالذكاء الاصطناعي. يستطيع إيقاف هذا الرابط في أي وقت.", "Its owner shared it from HESSARA, an AI consultation platform, and can stop this link at any time.")}
      actions={<><a className="btn btn-primary no-print" href="/consult/new">{t("ابدأ استشارتك", "Start your own consultation")}</a><PrintButton /></>}
    >
      <ConsultReport data={data} lang={lang} />
    </AppPage>
  );
}
