import type { Metadata } from "next";
import { LabClient } from "@/components/LabClient";
import { all, type ReviewRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { firstLlm } from "@/lib/providers";

export const metadata: Metadata = { title: "مختبر النقد والتقييم" };

const shape = (r: ReviewRow) => ({ id: r.id, mode: r.mode, input: r.input, created_at: r.created_at, engine: r.engine, result: JSON.parse(r.result), criteria: JSON.parse(r.criteria), revised: r.revised });

export default async function LabPage({ searchParams }: { searchParams: Promise<{ review?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser(sp.review ? `/lab?review=${sp.review}` : "/lab");
  const rows = all<ReviewRow>("SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 10", user.id);
  const initial = sp.review ? all<ReviewRow>("SELECT * FROM reviews WHERE id = ? AND user_id = ?", sp.review, user.id)[0] : undefined;
  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="t-h2">مختبر النقد والتقييم</h1>
        <p className="muted" style={{ maxWidth: "72ch" }}>أدخل إجابة أو خطة أو شفرة أو مقترحًا، واختر نوع المراجعة. الأحكام تصدر وفق معايير معلنة، ولا يدّعي المختبر التحقق من حقيقة لم يُعرض عليه دليلها.</p>
      </div>
      <LabClient key={initial?.id ?? "new"} initial={initial ? shape(initial) : null} past={rows.map(shape)} hasLlm={!!firstLlm(user.pref_model)} />
    </div>
  );
}
