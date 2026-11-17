// تقرير الاستشارة لصاحبها: صفحة مرتبة تُطبع أو تُحفظ ملفًا من المتصفح.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsultReport } from "@/components/ConsultReport";
import { PrintButton } from "@/components/PrintButton";
import { AppPage } from "@/components/site/Page";
import { requireUser } from "@/lib/guard";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { loadReport } from "@/lib/report";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("تقرير الاستشارة", "Consultation report"), robots: { index: false, follow: false } };
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/consult/${id}/report`);
  const lang = await getLang();
  const t = makeT(lang);
  const data = await loadReport(id, user.id);
  if (!data) notFound();
  return (
    <AppPage
      eyebrow={t("تقرير الاستشارة", "Consultation report")}
      title={data.c.title}
      actions={<><PrintButton /><Link className="btn btn-secondary no-print" href={`/consult/${id}`}>{t("عودة إلى الاستشارة", "Back to the consultation")}</Link></>}
    >
      <ConsultReport data={data} lang={lang} />
    </AppPage>
  );
}
