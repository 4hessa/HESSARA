import type { Metadata } from "next";
import { LabClient } from "@/components/LabClient";
import { AppPage } from "@/components/site/Page";
import { all, get, type ReviewRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { getT } from "@/lib/i18n-server";
import { firstLlm } from "@/lib/providers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("مختبر النقد والتقييم", "Critique Lab") };
}

const shape = (r: ReviewRow) => ({ id: r.id, mode: r.mode, input: r.input, created_at: r.created_at, engine: r.engine, result: JSON.parse(r.result), criteria: JSON.parse(r.criteria), revised: r.revised });

export default async function LabPage({ searchParams }: { searchParams: Promise<{ review?: string }> }) {
  const raw = (await searchParams).review;
  const sp = { review: typeof raw === "string" ? raw.slice(0, 40) : undefined };
  const user = await requireUser(sp.review ? `/lab?review=${sp.review}` : "/lab");
  const t = await getT();
  const rows = await all<ReviewRow>("SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 10", user.id);
  const initial = sp.review ? await get<ReviewRow>("SELECT * FROM reviews WHERE id = ? AND user_id = ?", sp.review, user.id) : undefined;
  return (
    <AppPage
      art={{ name: "platform", kind: "fade", fade: { "--art-h": "26rem", "--f1": "30%", "--f2": "62%", "--f3": "100%" } }}
      top="15rem"
      eyebrow={t("النقد والتقييم", "Critique & Evaluation")}
      title={t("مختبر النقد والتقييم", "The Critique Lab")}
      copy={t("أدخل إجابة أو خطة أو شفرة أو مقترحًا، واختر نوع المراجعة. الأحكام تصدر وفق معايير معلنة، ولا يدّعي المختبر التحقق من حقيقة لم يُعرض عليه دليلها.",
        "Enter an answer, a plan, code, or a proposal, and choose the kind of review. Verdicts follow stated criteria, and the lab never claims to have verified a fact whose evidence it was not shown.")}
    >
      <LabClient key={initial?.id ?? "new"} initial={initial ? shape(initial) : null} past={rows.map(shape)} hasLlm={!!firstLlm(user.pref_model)} />
    </AppPage>
  );
}
