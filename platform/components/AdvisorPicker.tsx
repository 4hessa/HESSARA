"use client";
// اختيار المستشار: نموذج، ومعه اختياريًا وكيل متخصص. النماذج غير المهيّأة تُعرض معطّلة مع سببها.
import { useState } from "react";
import { AGENTS } from "@/lib/catalog/agents";
import { useApp } from "./app";
import { StatusBadge, VendorMark } from "./bits";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";

export type Advisor = { modelId: string; agentId: string | null };

export function defaultModel(models: { id: string; status: string; engine: string }[], pref?: string | null): string {
  const usable = models.filter((m) => m.status !== "not_configured");
  return usable.find((m) => m.id === pref)?.id ?? usable.find((m) => m.engine === "llm")?.id ?? "hessara-demo";
}

export function AdvisorPicker({ value, onChange, lockAgent, compact }: {
  value: Advisor; onChange: (a: Advisor) => void; lockAgent?: boolean; compact?: boolean;
}) {
  const { models } = useApp();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"models" | "agents">("models");
  const model = models.find((m) => m.id === value.modelId);
  const agent = AGENTS.find((a) => a.id === value.agentId);
  return (
    <>
      <button type="button" className="picker-btn" onClick={() => setOpen(true)} aria-haspopup="dialog"
        aria-label={`المستشار: ${model?.name ?? "غير محدد"}${agent ? `، ${agent.name}` : ""}. اضغط للتغيير`}>
        {model && <VendorMark vendorKey={model.vendorKey} small />}
        <span><bdi>{model?.name ?? "اختر نموذجًا"}</bdi>{agent && !compact ? ` · ${agent.name}` : ""}</span>
        <Icon name="chevron" size={16} />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="اختر مستشارك">
        {!lockAgent && (
          <div className="tabs" role="tablist" style={{ paddingInline: "var(--s-5)" }}>
            <button role="tab" className="tab" aria-selected={tab === "models"} onClick={() => setTab("models")}>النموذج</button>
            <button role="tab" className="tab" aria-selected={tab === "agents"} onClick={() => setTab("agents")}>الوكيل المتخصص (اختياري)</button>
          </div>
        )}
        <div className="dialog-body" role="radiogroup" aria-label={tab === "models" ? "النماذج" : "الوكلاء"}>
          {tab === "models" || lockAgent
            ? models.map((m) => {
                const disabled = m.status === "not_configured";
                return (
                  <button key={m.id} type="button" role="radio" className="option" aria-checked={m.id === value.modelId} disabled={disabled}
                    onClick={() => { onChange({ ...value, modelId: m.id }); setOpen(false); }}>
                    <VendorMark vendorKey={m.vendorKey} />
                    <span className="stack-sm" style={{ gap: 2 }}>
                      <strong><bdi>{m.name}</bdi></strong>
                      <span className="t-caption">{disabled ? "غير مهيّأ على الخادم — يحتاج مفتاح خدمة." : m.tasks.join(" · ")}</span>
                    </span>
                    <StatusBadge model={m} />
                  </button>
                );
              })
            : (
              <>
                <button type="button" role="radio" className="option" aria-checked={!value.agentId} onClick={() => { onChange({ ...value, agentId: null }); setOpen(false); }}>
                  <span className="icon-tile"><Icon name="consult" /></span>
                  <span className="stack-sm" style={{ gap: 2 }}><strong>بدون وكيل</strong><span className="t-caption">استشارة عامة بتعليمات المنصة الأساسية.</span></span>
                  <span />
                </button>
                {AGENTS.map((a) => (
                  <button key={a.id} type="button" role="radio" className="option" aria-checked={a.id === value.agentId} onClick={() => { onChange({ ...value, agentId: a.id }); setOpen(false); }}>
                    <span className="icon-tile"><Icon name={a.icon} /></span>
                    <span className="stack-sm" style={{ gap: 2 }}><strong>{a.name}</strong><span className="t-caption">{a.scope}</span></span>
                    <span />
                  </button>
                ))}
              </>
            )}
        </div>
      </Dialog>
    </>
  );
}
