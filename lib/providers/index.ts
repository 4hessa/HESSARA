// توجيه النماذج: يحوّل معرّف الفهرس إلى موائم + معرّف المزوّد، ويحسب الحالة الفعلية.
// طريق الوصول إلى كل نموذج: بوابة Vercel للذكاء الاصطناعي إن كانت متاحة وللنموذج معرّف فيها،
// وإلا مفتاح المزوّد المباشر. نتيجة آخر اختبار اتصال تُحفظ في قاعدة البيانات، فلا تضيع بين نسخ الخادم.
import type { Lang } from "../i18n.ts";
import { all, run } from "../db.ts";
import { localizeModel, MODELS, modelById, type ModelDef, type ModelStatus } from "../catalog/models.ts";
import { anthropicAdapter } from "./anthropic.ts";
import { demoAdapter } from "./demo.ts";
import { gatewayBaseUrl, gatewayEnabled, gatewayError, gatewayToken } from "./gateway.ts";
import { geminiAdapter } from "./gemini.ts";
import { openaiCompatAdapter } from "./openaiCompat.ts";
import type { ProviderAdapter } from "./types.ts";

const env = (name?: string) => (name ? process.env[name]?.trim() || undefined : undefined);

export type Route = "demo" | "gateway" | "direct";

/** ما ينقص الطريق المباشر: مفتاح المزوّد، ومعرّف الإصدار، والعنوان. */
function directMissing(def: ModelDef): string[] {
  const miss: string[] = [];
  if (def.env.key && !env(def.env.key)) miss.push(def.env.key);
  if (!def.apiModel && def.env.model && !env(def.env.model)) miss.push(def.env.model);
  if (def.env.baseUrl && !def.env.defaultBaseUrl && !env(def.env.baseUrl)) miss.push(def.env.baseUrl);
  return miss;
}

/** البوابة أولًا حين تكون متاحة (HESSARA_ROUTE=direct يعطّلها)، ثم المفتاح المباشر؛ null إن لم يتوفر أي طريق. */
export function routeOf(def: ModelDef): Route | null {
  if (def.adapter === "demo") return "demo";
  if (def.gateway && gatewayEnabled()) return "gateway";
  return directMissing(def).length ? null : "direct";
}

export function missingConfig(def: ModelDef): string[] {
  return routeOf(def) ? [] : directMissing(def);
}

/** معرّف النموذج لدى الجهة التي ستُخاطَب فعلًا. */
function apiModelOf(def: ModelDef, route: Route | null): string | null {
  if (route === "gateway") return def.gateway ?? null;
  return def.apiModel || env(def.env.model) || null;
}

// نتيجة آخر اختبار لكل نموذج. ref يربطها بالطريق والإصدار اللذين اختُبرا، فتُهمل إن تغيّر أيهما.
type Check = { ok: boolean; at: number; ref: string; error?: { ar: string; en: string } };
const g = globalThis as typeof globalThis & { __hessaraChecks?: Map<string, Check>; __hessaraChecksSync?: number };
const checks = (g.__hessaraChecks ??= new Map());
const refOf = (def: ModelDef) => {
  const r = routeOf(def);
  return `${r ?? "none"}:${r ? apiModelOf(def, r) ?? "" : ""}`;
};

/** يسجّل نتيجة اختبار أو استدعاء فعلي، في الذاكرة وفي قاعدة البيانات. */
export async function recordCheck(id: string, ok: boolean, error?: string | { ar: string; en: string }) {
  const def = modelById(id);
  if (!def) return;
  const c: Check = { ok, at: Date.now(), ref: refOf(def), error: typeof error === "string" ? { ar: error, en: error } : error };
  checks.set(id, c);
  try {
    await run(
      "INSERT INTO model_checks (model_id, ok, at, ref, error_ar, error_en) VALUES (?,?,?,?,?,?) " +
        "ON CONFLICT (model_id) DO UPDATE SET ok = excluded.ok, at = excluded.at, ref = excluded.ref, error_ar = excluded.error_ar, error_en = excluded.error_en",
      id, ok ? 1 : 0, c.at, c.ref, c.error?.ar ?? null, c.error?.en ?? null,
    );
  } catch (e) {
    console.error("[models] could not save the check result:", (e as Error).message);
  }
}

/** يقرأ النتائج المحفوظة، ومنها ما كتبته نسخ الخادم الأخرى، مرة كل maxAgeMs على الأكثر. */
export async function syncChecks(maxAgeMs = 15_000) {
  if (g.__hessaraChecksSync && Date.now() - g.__hessaraChecksSync < maxAgeMs) return;
  g.__hessaraChecksSync = Date.now();
  try {
    type Row = { model_id: string; ok: number | string; at: number | string; ref: string; error_ar: string | null; error_en: string | null };
    for (const r of await all<Row>("SELECT model_id, ok, at, ref, error_ar, error_en FROM model_checks")) {
      const at = Number(r.at);
      const cur = checks.get(r.model_id);
      if (!cur || cur.at < at)
        checks.set(r.model_id, { ok: Number(r.ok) === 1, at, ref: r.ref, error: r.error_ar ? { ar: r.error_ar, en: r.error_en ?? r.error_ar } : undefined });
    }
  } catch (e) {
    console.error("[models] could not load check results:", (e as Error).message);
  }
}

export type ResolvedModel = { def: ModelDef; adapter: ProviderAdapter; apiModel: string; route: Route };

export function resolveModel(id: string): ResolvedModel | null {
  const def = modelById(id);
  const route = def ? routeOf(def) : null;
  if (!def || !route) return null;
  if (route === "demo") return { def, route, adapter: demoAdapter, apiModel: "demo" };
  const apiModel = apiModelOf(def, route)!;
  // رمز المصادقة يُقرأ هنا، داخل الطلب الجاري، لأن رمز OIDC يخص كل استدعاء.
  if (route === "gateway")
    return { def, route, apiModel, adapter: openaiCompatAdapter({ baseUrl: gatewayBaseUrl(), apiKey: gatewayToken(), onError: gatewayError }) };
  switch (def.adapter) {
    case "anthropic":
      return { def, route, apiModel, adapter: anthropicAdapter };
    case "gemini":
      return { def, route, apiModel, adapter: geminiAdapter(env(def.env.key)!) };
    default:
      return {
        def,
        route,
        apiModel,
        adapter: openaiCompatAdapter({ baseUrl: env(def.env.baseUrl) || def.env.defaultBaseUrl!, apiKey: env(def.env.key) }),
      };
  }
}

export type ModelView = Omit<ModelDef, "env" | "apiModel" | "gateway"> & {
  status: ModelStatus;
  version: string | null;
  /** طريق الوصول: بوابة Vercel أو مفتاح المزوّد المباشر. */
  route: Route | null;
  missing: string[];
  checkedAt: number | null;
  checkError: string | null;
  engine: "llm" | "demo";
};

export function modelView(def: ModelDef, lang: Lang = "ar"): ModelView {
  const route = routeOf(def);
  const check = checks.get(def.id);
  const current = check && check.ref === refOf(def) ? check : undefined;
  let status: ModelStatus;
  if (route === "demo") status = "ready";
  else if (!route) status = "not_configured";
  else if (current) status = current.ok ? "ready" : "failed";
  else status = "configured";
  const { env: _e, apiModel: _a, gateway: _g, ...rest } = localizeModel(def, lang);
  void _e; void _a; void _g;
  return {
    ...rest,
    status,
    version: route === "demo" ? null : apiModelOf(def, route),
    route,
    missing: missingConfig(def),
    checkedAt: current?.at ?? null,
    checkError: current && !current.ok ? current.error?.[lang] ?? null : null,
    engine: def.adapter === "demo" ? "demo" : "llm",
  };
}

/** النموذج المحلي يحتاج خادمًا يشغّله بجانب المنصة، وهذا غير متاح على استضافة Vercel؛ فلا يُعرض هناك ما لم يُضبط عنوانه. */
export function visibleModels(): ModelDef[] {
  return MODELS.filter((d) => !(d.vendorKey === "local" && process.env.VERCEL === "1" && !routeOf(d)));
}

/** للزائر غير المسجَّل تُحجب تفاصيل التهيئة (أسماء المتغيرات الناقصة وسبب فشل الاختبار). */
export async function listModels(detailed = false, lang: Lang = "ar"): Promise<ModelView[]> {
  await syncChecks();
  return visibleModels().map((d) => modelView(d, lang)).map((m) => (detailed ? m : { ...m, missing: [], checkError: null }));
}
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
