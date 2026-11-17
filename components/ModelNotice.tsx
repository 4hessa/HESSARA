"use client";
// تنبيه صريح ما دام لا يوجد نموذج ذكاء اصطناعي حقيقي نجح آخر اتصال به: من يدخل ليجرّب الذكاء الاصطناعي
// يعرف قبل التسجيل وأثناء الاستشارة أن المتاح المؤكد هو المحرك التجريبي. يختفي تلقائيًا بعد أول نجاح لأي نموذج،
// لأن الحالة تأتي من نتائج الاتصال المحفوظة (model_checks) مع قائمة النماذج التي يرسلها الخادم لكل صفحة.
import Link from "next/link";
import { useApp } from "./app";
import { Icon } from "./Icon";

export function ModelNotice({ className = "" }: { className?: string }) {
  const { models, t } = useApp();
  if (models.some((m) => m.engine === "llm" && m.status === "ready")) return null;
  return (
    <p className={`notice notice-warn model-notice ${className}`.trim()} data-testid="model-notice">
      <Icon name="alert" />
      <span>
        {t("لا يوجد الآن نموذج ذكاء اصطناعي حقيقي مؤكَّد العمل على المنصة. المحرك التجريبي يعمل، لكنه ليس ذكاءً اصطناعيًا.",
          "No real AI model is currently confirmed to work on the platform. The demo engine works, but it is not AI.")}{" "}
        <Link className="link" href="/models">{t("حالة كل نموذج", "Status of each model")}</Link>
      </span>
    </p>
  );
}
