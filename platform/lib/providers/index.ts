// توجيه النماذج: يحوّل معرّف الفهرس إلى موائم + معرّف المزوّد، ويحسب الحالة الفعلية.
import { MODELS, modelById, type ModelDef, type ModelStatus } from "../catalog/models.ts";
import { anthropicAdapter } from "./anthropic.ts";
import { demoAdapter } from "./demo.ts";
import { geminiAdapter } from "./gemini.ts";
import { openaiCompatAdapter } from "./openaiCompat.ts";
import type { ProviderAdapter } from "./types.ts";

const env = (name?: string) => (name ? process.env[name]?.trim() || undefined : undefined);

type Check = { ok: boolean; at: number; error?: string };
const g = globalThis as typeof globalThis & { __hessaraChecks?: Map<string, Check> };
const checks = (g.__hessaraChecks ??= new Map());

export function recordCheck(id: string, ok: boolean, error?: string) {
  checks.set(id, { ok, at: Date.now(), error });
}

export type ResolvedModel = { def: ModelDef; adapter: ProviderAdapter; apiModel: string };

export function missingConfig(def: ModelDef): string[] {
  if (def.adapter === "demo") return [];
  const miss: string[] = [];
  if (def.env.key && !env(def.env.key)) miss.push(def.env.key);
  if (!def.apiModel && def.env.model && !env(def.env.model)) miss.push(def.env.model);
  if (def.env.baseUrl && !def.env.defaultBaseUrl && !env(def.env.baseUrl)) miss.push(def.env.baseUrl);
  return miss;
}

export function resolveModel(id: string): ResolvedModel | null {
  const def = modelById(id);
  if (!def || missingConfig(def).length) return null;
  const apiModel = def.apiModel || env(def.env.model) || "demo";
  switch (def.adapter) {
    case "demo":
      return { def, adapter: demoAdapter, apiModel };
    case "anthropic":
      return { def, adapter: anthropicAdapter, apiModel };
    case "gemini":
      return { def, adapter: geminiAdapter(env(def.env.key)!), apiModel };
    case "openai":
      return {
        def,
        adapter: openaiCompatAdapter({
          baseUrl: env(def.env.baseUrl) || def.env.defaultBaseUrl!,
          apiKey: env(def.env.key),
        }),
        apiModel,
      };
  }
}

export type ModelView = Omit<ModelDef, "env" | "apiModel"> & {
  status: ModelStatus;
  version: string | null;
  missing: string[];
  checkedAt: number | null;
  checkError: string | null;
  engine: "llm" | "demo";
};

export function modelView(def: ModelDef): ModelView {
  const missing = missingConfig(def);
  const check = checks.get(def.id);
  let status: ModelStatus;
  if (def.adapter === "demo") status = "ready";
  else if (missing.length) status = "not_configured";
  else if (check) status = check.ok ? "ready" : "failed";
  else status = "configured";
  const { env: _e, apiModel, ...rest } = def;
  void _e;
  return {
    ...rest,
    status,
    version: def.adapter === "demo" ? null : apiModel || env(def.env.model) || null,
    missing,
    checkedAt: check?.at ?? null,
    checkError: check && !check.ok ? check.error ?? null : null,
    engine: def.adapter === "demo" ? "demo" : "llm",
  };
}

/** للزائر غير المسجَّل تُحجب تفاصيل التهيئة (أسماء المتغيرات الناقصة وسبب فشل الاختبار). */
export const listModels = (detailed = false): ModelView[] =>
  MODELS.map(modelView).map((m) => (detailed ? m : { ...m, missing: [], checkError: null }));
export const isUsable = (id: string) => resolveModel(id) !== null;

/** أول نموذج لغوي حقيقي مهيّأ؛ يُستخدم لمحرك المراجعة. */
export function firstLlm(preferred?: string | null): ResolvedModel | null {
  if (preferred) {
    const r = resolveModel(preferred);
    if (r && r.def.adapter !== "demo") return r;
  }
  for (const m of MODELS) {
    if (m.adapter === "demo") continue;
    const r = resolveModel(m.id);
    if (r) return r;
  }
  return null;
}
