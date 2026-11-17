// اللغتان: العربية والإنجليزية. اللغة تُحفظ في ملف الارتباط hs_lang، وعند غيابه تُستنتج من
// ترويسة Accept-Language، وإلا فالعربية. يعمل هذا الملف على الخادم والمتصفح وفي اختبارات Node.
export type Lang = "ar" | "en";
export const LANGS: readonly Lang[] = ["ar", "en"];
export const LANG_COOKIE = "hs_lang";
export const DEFAULT_LANG: Lang = "ar";

/** نص بلغتين. */
export type Bi = { ar: string; en: string };
/** دالة الترجمة: تُمرَّر الصيغتان معًا في موضع الاستخدام فلا يُنسى أحدهما. */
export type T = (ar: string, en: string) => string;

export const isLang = (v: unknown): v is Lang => v === "ar" || v === "en";
export const makeT = (lang: Lang): T => (ar, en) => (lang === "ar" ? ar : en);
export const pick = <V>(b: { ar: V; en: V }, lang: Lang): V => b[lang];
export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");
export const other = (lang: Lang): Lang => (lang === "ar" ? "en" : "ar");

/** يختار من Accept-Language أول لغة مدعومة حسب ترتيب الأفضلية (q). */
export function fromAcceptLanguage(header: string | null | undefined): Lang | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { base: tag.split("-")[0], q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .filter((x) => x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (const { base } of ranked) if (isLang(base)) return base;
  return null;
}

export const negotiate = (cookie: string | null | undefined, accept: string | null | undefined): Lang =>
  isLang(cookie) ? cookie : fromAcceptLanguage(accept) ?? DEFAULT_LANG;

/** لغة طلب وارد إلى مسار الواجهة البرمجية (من ملف الارتباط ثم Accept-Language). */
export function langOf(req: Request): Lang {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)hs_lang=(ar|en)(?:;|$)/);
  return negotiate(m?.[1], req.headers.get("accept-language"));
}
export const tOf = (req: Request): T => makeT(langOf(req));

/** وسم Intl لكل لغة (العربية بأرقامها الافتراضية كما كانت المنصة تعرض التواريخ). */
export const intlLocale = (lang: Lang) => (lang === "ar" ? "ar" : "en-GB");
