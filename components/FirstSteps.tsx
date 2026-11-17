"use client";
// لوحة البداية لمن لم يبدأ أي استشارة بعد: ثلاث خطوات تشرح مسار المنصة، وتُخفى بنقرة وتبقى مخفية في هذا المتصفح.
import { useEffect, useState } from "react";
import { useApp } from "./app";
import { Icon } from "./Icon";

const KEY = "hs_first_steps_done";

export function FirstSteps() {
  const { t } = useApp();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(localStorage.getItem(KEY) !== "1"); } catch { setShow(true); }
  }, []);
  if (!show) return null;
  const steps = [
    { title: t("اكتب سؤالك", "Write your question"), text: t("اشرح المشكلة بما يكفي من السياق في الحقل أدناه.", "Describe the problem, with enough context, in the box below.") },
    { title: t("اختر النموذج أو الوكيل", "Choose the model or agent"), text: t("من زر المستشار أسفل الحقل، ويقترح الموقع وكيلًا مناسبًا من كلمات سؤالك.", "Use the advisor button under the box; the site suggests a matching agent from your question's wording.") },
    { title: t("راجِع الإجابة واحفظها", "Review the answer and keep it"), text: t("شغّل مراجعة نقدية على أي إجابة، ثم احفظ الاستشارة أو شاركها أو اطبع تقريرها.", "Run a critical review on any answer, then save the consultation, share it, or print its report.") },
  ];
  return (
    <section className="first-steps" aria-label={t("كيف تبدأ", "How to start")}>
      <div className="row-between">
        <h2 className="t-h4">{t("ابدأ من هنا: استشارتك في ثلاث خطوات", "Start here: your consultation in three steps")}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShow(false); try { localStorage.setItem(KEY, "1"); } catch { /* يكفي الإخفاء الآن */ } }}>
          <Icon name="check" size={16} /> {t("فهمت", "Got it")}
        </button>
      </div>
      <ol>
        {steps.map((s) => <li key={s.title}><strong>{s.title}</strong><span className="muted">{s.text}</span></li>)}
      </ol>
    </section>
  );
}
