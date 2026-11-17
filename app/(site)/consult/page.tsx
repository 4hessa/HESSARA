import type { Metadata } from "next";
import { QuickConsult } from "@/components/QuickConsult";
import { AppPage } from "@/components/site/Page";
import { HistoryList } from "@/components/Workspace";
import { all, type ConsultRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("الاستشارات", "Consultations") };
}

export default async function ConsultIndex({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser("/consult");
  const t = await getT();
  const saved = (await searchParams).saved === "1";
  const items = await all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100", user.id);
  return (
    <AppPage
      eyebrow={t("سجلّك", "Your record")}
      title={t("الاستشارات", "Consultations")}
      copy={t("ابدأ استشارة جديدة، أو عُد إلى استشارة سابقة. البحث يشمل العناوين ومحتوى الرسائل.", "Start a new consultation, or return to an earlier one. Search covers titles and message content.")}
      narrow
    >
      <div className="stack-lg">
        <QuickConsult />
        <section className="card" style={{ padding: 0, overflow: "hidden" }} aria-label={t("سجل الاستشارات", "Consultation history")}>
          <HistoryList key={saved ? "s" : "a"} items={items} savedOnly={saved} />
        </section>
      </div>
    </AppPage>
  );
}
