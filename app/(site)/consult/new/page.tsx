import type { Metadata } from "next";
import Link from "next/link";
import { AgentIntake } from "@/components/AgentIntake";
import { QuickConsult } from "@/components/QuickConsult";
import { AppPage } from "@/components/site/Page";
import { agentById } from "@/lib/catalog/agents";
import { requireUser } from "@/lib/guard";
import { getLang } from "@/lib/i18n-server";
import { makeT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("استشارة جديدة", "New consultation") };
}

export default async function NewConsult({ searchParams }: { searchParams: Promise<{ agent?: string; model?: string }> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(sp as Record<string, string>).toString();
  await requireUser(`/consult/new${qs ? `?${qs}` : ""}`);
  const lang = await getLang();
  const t = makeT(lang);
  const agent = agentById(sp.agent, lang);
  return (
    <AppPage
      eyebrow={t("ابدأ", "Begin")}
      title={t("استشارة جديدة", "New consultation")}
      copy={agent
        ? t("املأ ما تعرفه من الحقول؛ كل حقل يقلّل ما سيضطر الوكيل إلى افتراضه.", "Fill in what you know; every field reduces what the agent has to assume.")
        : t("اشرح المشكلة بما يكفي من السياق، واختر النموذج أو الوكيل من الزر أسفل الحقل.", "Describe the problem with enough context, and choose the model or agent from the button under the field.")}
      narrow
    >
      {agent ? (
        <div className="stack">
          <AgentIntake agent={agent} initialModel={sp.model} />
          <p className="t-small muted">{t("تفضّل الكتابة الحرة؟", "Prefer to write freely?")} <Link className="link" href="/consult/new">{t("ابدأ دون وكيل", "Start without an agent")}</Link></p>
        </div>
      ) : (
        <QuickConsult autoFocus restoreDraft initialModel={sp.model}
          examples={lang === "ar"
            ? ["تطبيقي المعتمد على نموذج لغوي بطيء وأريد معرفة السبب", "راجِع بنية نظامي قبل زيادة الحمل"]
            : ["My LLM-based app is slow and I want to know why", "Review my system's architecture before the load grows"]} />
      )}
    </AppPage>
  );
}
