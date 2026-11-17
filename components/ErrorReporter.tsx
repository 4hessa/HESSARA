"use client";
// يرسل أخطاء JavaScript التي تقع في متصفح الزائر إلى سجل الأخطاء الداخلي: نوع الخطأ، ورسالته (تُنقّى في الخادم)،
// وقالب الصفحة. لا يُرسل أي معرّف للزائر. خمسة تقارير على الأكثر لكل تحميل للصفحة، ويُتجاهل ما يأتي من
// إضافات المتصفح والنصوص الخارجية، وانقطاع الطلبات عند مغادرة الصفحة.
import { useEffect } from "react";

let sent = 0;

export function reportClientError(kind: string, message: string) {
  if (sent >= 5) return;
  sent++;
  try {
    void fetch("/api/client-error", {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, message: String(message ?? "").slice(0, 500), path: location.pathname }),
    }).catch(() => {});
  } catch {
    /* لا شيء */
  }
}

export function ErrorReporter() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const src = e.filename || "";
      if (!src && e.message === "Script error.") return; // نص من نطاق آخر لا تُعرف تفاصيله
      if (src && !src.startsWith(location.origin)) return; // إضافات المتصفح
      const err = e.error as { name?: unknown } | null;
      reportClientError(typeof err?.name === "string" ? err.name : "Error", e.message || "");
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { name?: unknown; message?: unknown } | null;
      const name = typeof r?.name === "string" ? r.name : typeof e.reason;
      if (name === "AbortError") return;
      reportClientError(`unhandledrejection:${name}`, typeof r?.message === "string" ? r.message : String(e.reason ?? ""));
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
