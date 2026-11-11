import type { Metadata } from "next";
import { QuickConsult } from "@/components/QuickConsult";
import { HistoryList } from "@/components/Workspace";
import { all, type ConsultRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";

export const metadata: Metadata = { title: "الاستشارات" };

export default async function ConsultIndex({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser("/consult");
  const saved = (await searchParams).saved === "1";
  const items = all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100", user.id);
  return (
    <div className="container page" style={{ maxWidth: 860 }}>
      <div className="page-head">
        <h1 className="t-h2">الاستشارات</h1>
        <p className="muted">ابدأ استشارة جديدة، أو عُد إلى استشارة سابقة. البحث يشمل العناوين ومحتوى الرسائل.</p>
      </div>
      <div className="stack-lg">
        <QuickConsult />
        <section className="card" style={{ padding: 0, overflow: "hidden" }} aria-label="سجل الاستشارات">
          <HistoryList key={saved ? "s" : "a"} items={items} savedOnly={saved} />
        </section>
      </div>
    </div>
  );
}
