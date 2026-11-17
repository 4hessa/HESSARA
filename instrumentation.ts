// يلتقط Next.js هنا كل خطأ غير معالج في الخادم (عرض الصفحات ومسارات الواجهة البرمجية)، فيُحصى في سجل الأخطاء
// الداخلي بقالب المسار لا بالرابط الفعلي. شيفرة قاعدة البيانات تُحمَّل في بيئة Node فقط.
type ErrorRequest = Readonly<{ path: string; method: string }>;
type ErrorContext = Readonly<{ routePath: string; routeType: string }>;

export async function onRequestError(error: unknown, _request: ErrorRequest, context: ErrorContext) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { recordServerError } = await import("./lib/errors.ts");
    await recordServerError(error, context?.routePath ?? "(unknown)");
  } catch (e) {
    console.error("[errors] could not record:", (e as Error)?.name);
  }
}
