import type { Metadata } from "next";
import Link from "next/link";
import { AgentIntake } from "@/components/AgentIntake";
import { QuickConsult } from "@/components/QuickConsult";
import { agentById } from "@/lib/catalog/agents";
import { requireUser } from "@/lib/guard";

export const metadata: Metadata = { title: "استشارة جديدة" };

export default async function NewConsult({ searchParams }: { searchParams: Promise<{ agent?: string; model?: string }> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(sp as Record<string, string>).toString();
  await requireUser(`/consult/new${qs ? `?${qs}` : ""}`);
  const agent = agentById(sp.agent);
  return (
    <div className="container page" style={{ maxWidth: 820 }}>
      <div className="page-head">
        <h1 className="t-h2">استشارة جديدة</h1>
        <p className="muted">{agent ? "املأ ما تعرفه من الحقول؛ كل حقل يقلّل ما سيضطر الوكيل إلى افتراضه." : "اشرح المشكلة بما يكفي من السياق، واختر النموذج أو الوكيل من الزر أسفل الحقل."}</p>
      </div>
      {agent ? (
        <div className="stack">
          <AgentIntake agent={agent} initialModel={sp.model} />
          <p className="t-small muted">تفضّل الكتابة الحرة؟ <Link className="link" href="/consult/new">ابدأ دون وكيل</Link></p>
        </div>
      ) : <QuickConsult autoFocus restoreDraft initialModel={sp.model} examples={["تطبيقي المعتمد على نموذج لغوي بطيء وأريد معرفة السبب", "راجِع بنية نظامي قبل زيادة الحمل"]} />}
    </div>
  );
}
