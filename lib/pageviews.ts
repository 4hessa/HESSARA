// عدّاد الزيارات: كم مرة فُتحت كل صفحة في كل يوم. لا يُحفظ أي معرّف للزائر (لا عنوان ولا ملف ارتباط)،
// والمعرّفات داخل الروابط (الاستشارات وروابط المشاركة) تُستبدل بعلامة عامة قبل العدّ.
export function normalizeViewPath(raw: string): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.length > 200) return null;
  let p = raw.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (/^\/(api|admin|_next)(\/|$)/.test(p)) return null;
  p = p.replace(/^\/consult\/(?!new$)[^/]+/, "/consult/:id").replace(/^\/s\/[^/]+/, "/s/:token");
  if (!/^\/[a-z0-9\-/:]*$/i.test(p)) return null;
  return p.slice(0, 120);
}

/** متصفحات الآلات وأدوات الاختبار لا تُحتسب. */
export const isBot = (ua: string) => /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch|playwright/i.test(ua);
