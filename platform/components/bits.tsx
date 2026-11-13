// عناصر عرض صغيرة مشتركة (تعمل على الخادم والعميل).
import { intlLocale, type Lang } from "@/lib/i18n";
import type { ModelView } from "@/lib/providers";

// رمز نصي محايد للجهة المطوّرة. ليس شعارًا رسميًا ولا يحاكي أي علامة تجارية.
const MONO: Record<string, string> = {
  hessara: "هـ", anthropic: "An", openai: "Oa", google: "Go", meta: "Me", alibaba: "Al", deepseek: "Ds", local: "Lo",
};
export function VendorMark({ vendorKey, small }: { vendorKey: string; small?: boolean }) {
  return <span className={`vendor-mark${small ? " sm" : ""}`} aria-hidden="true">{MONO[vendorKey] ?? "?"}</span>;
}

// صور رمزية تجريدية من أنماط ثنائية (٥×٥ متناظرة). لا ترتبط بجنس المستخدم.
const PATTERNS: Record<string, string> = {
  a1: "0110011110101011111001010",
  a2: "1010101110110111010100100",
  a3: "0010011011111110101011011",
  a4: "1101100100111111010101110",
  a5: "0111010101111110010011011",
  a6: "1000111011011101101110001",
};
export const AVATAR_IDS = Object.keys(PATTERNS);
export function Avatar({ id, large, label }: { id: string; large?: boolean; label?: string }) {
  const bits = PATTERNS[id] ?? PATTERNS.a1;
  return (
    <span className={`avatar${large ? " lg" : ""}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 7 7" width="100%" height="100%">
        {[...bits].map((b, i) => {
          const col = i % 5, row = Math.floor(i / 5);
          const x = col < 3 ? col : 4 - col; // تناظر أفقي
          const on = bits[row * 5 + x] === "1";
          return on ? <rect key={i} x={col + 1} y={row + 1} width="1.02" height="1.02" fill="currentColor" /> : null;
        })}
      </svg>
    </span>
  );
}

export const STATUS_LABEL: Record<ModelView["status"], { ar: string; en: string; cls: string }> = {
  ready: { ar: "يعمل", en: "Ready", cls: "badge-ok" },
  configured: { ar: "مهيّأ — لم يُختبر بعد", en: "Configured, not yet tested", cls: "badge-accent" },
  not_configured: { ar: "غير مهيّأ", en: "Not configured", cls: "" },
  failed: { ar: "فشل آخر اختبار", en: "Last test failed", cls: "badge-danger" },
};
export function StatusBadge({ model, lang = "ar" }: { model: ModelView; lang?: Lang }) {
  const s = model.engine === "demo" ? { ar: "تجريبي — يعمل دون مفاتيح", en: "Demo — runs without keys", cls: "badge-warn" } : STATUS_LABEL[model.status];
  return <span className={`badge ${s.cls}`}>{s[lang]}</span>;
}

export const fmtDate = (ts: number, lang: Lang = "ar") =>
  new Intl.DateTimeFormat(intlLocale(lang), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(ts);
