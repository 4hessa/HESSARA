"use client";
// نموذج الإدخال المنظّم للوكيل: يجمع ما يحتاجه مجاله ثم يركّب منه رسالة الاستشارة الأولى.
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AgentDef } from "@/lib/catalog/agents";
import { AdvisorPicker, defaultModel } from "./AdvisorPicker";
import { api, useApp } from "./app";
import { Icon } from "./Icon";
import { pendingKey } from "./QuickConsult";

export function AgentIntake({ agent, initialModel }: { agent: AgentDef; initialModel?: string | null }) {
  const { user, models, t } = useApp();
  const router = useRouter();
  const [modelId, setModelId] = useState(defaultModel(models, initialModel ?? user?.prefModel));
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = agent.intake.find((f) => f.required && !vals[f.key]?.trim());
    if (missing) { setError(t(`الحقل «${missing.label}» مطلوب.`, `The field “${missing.label}” is required.`)); document.getElementById(`in-${missing.key}`)?.focus(); return; }
    const text = agent.intake.filter((f) => vals[f.key]?.trim()).map((f) => `**${f.label}:**\n${vals[f.key].trim()}`).join("\n\n");
    const title = vals[agent.intake.find((f) => f.required)!.key];
    setBusy(true); setError("");
    const r = await api<{ id: string }>("/api/consultations", { body: { text, title, modelId, agentId: agent.id } });
    if (!r.ok) { setBusy(false); setError(r.data.error ?? t("تعذر بدء الاستشارة.", "Could not start the consultation.")); return; }
    try { sessionStorage.setItem(pendingKey(r.data.id), text); } catch { /* */ }
    router.push(`/consult/${r.data.id}`);
  }

  return (
    <form className="card stack" onSubmit={submit} noValidate>
      <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
        <span className="icon-tile"><Icon name={agent.icon} /></span>
        <div><h2 className="t-h3">{agent.name}</h2><p className="muted t-small">{agent.scope}</p></div>
      </div>
      {agent.intake.map((f) => (
        <div className="field" key={f.key}>
          <label className="label" htmlFor={`in-${f.key}`}>{f.label}{f.required ? <span aria-hidden="true"> *</span> : <span className="hint"> {t("(اختياري)", "(optional)")}</span>}</label>
          {f.multiline
            ? <textarea id={`in-${f.key}`} className="textarea" dir="auto" required={f.required} placeholder={f.placeholder} maxLength={5000} value={vals[f.key] ?? ""} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
            : <input id={`in-${f.key}`} className="input" dir="auto" required={f.required} placeholder={f.placeholder} maxLength={300} value={vals[f.key] ?? ""} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />}
        </div>
      ))}
      {error && <p className="field-error" role="alert"><Icon name="alert" size={16} /> {error}</p>}
      <div className="row-between">
        <div className="row"><span className="t-small muted">{t("النموذج الأساسي:", "Base model:")}</span><AdvisorPicker lockAgent compact value={{ modelId, agentId: agent.id }} onChange={(a) => setModelId(a.modelId)} /></div>
        <button className="btn btn-primary" disabled={busy}>{busy && <span className="spinner" />}{t("ابدأ الاستشارة", "Start the consultation")}</button>
      </div>
      <p className="t-caption">{t("ستُنظَّم الإجابة تحت:", "The answer will be organised under:")} {agent.sections.join(t("، ", "; "))}.</p>
    </form>
  );
}
