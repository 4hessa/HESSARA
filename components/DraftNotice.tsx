"use client";
// تنبيه صفحة الدخول بأن نص الاستشارة محفوظ: يظهر فقط إن كان في المتصفح نص كتبه الزائر قبل الدخول فعلًا.
// كان يظهر لكل من جاء من «ابدأ استشارة» ولو لم يكتب شيئًا.
import { useEffect, useState } from "react";
import { useApp } from "./app";
import { DRAFT_KEY } from "./QuickConsult";

export function DraftNotice() {
  const { t } = useApp();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      setSaved(!!JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null")?.text);
    } catch {
      /* تخزين الجلسة غير متاح: لا نص محفوظ */
    }
  }, []);
  if (!saved) return null;
  return (
    <p className="notice notice-accent t-small" style={{ gridTemplateColumns: "1fr" }}>
      {t("نص استشارتك محفوظ مؤقتًا في متصفحك، وسيظهر لك مباشرة بعد الدخول.", "Your consultation text is kept temporarily in your browser and will be back as soon as you sign in.")}
    </p>
  );
}
