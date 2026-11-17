"use client";
// دعوة إلى استبيان سهولة الاستخدام في اللوحة، لمن أجرى استشارتين على الأقل ولم يُجب ولم يرفض.
import Link from "next/link";
import { useState } from "react";
import { api, useApp } from "./app";

export function SusInvite() {
  const { t, toast } = useApp();
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <section className="card sus-invite stack-sm" aria-labelledby="sus-invite-h">
      <h2 id="sus-invite-h" className="t-h4">{t("رأيك في سهولة استخدام المنصة", "Your view of how easy the platform is to use")}</h2>
      <p className="t-small">{t("عشر عبارات قصيرة تستغرق نحو دقيقتين. تظهر النتائج مجمّعة فقط، وتُستخدم في تقييم مشروع التخرج.",
        "Ten short statements, about two minutes. Results are shown only in aggregate and are used to evaluate this graduation project.")}</p>
      <div className="row">
        <Link className="btn btn-primary btn-sm" href="/survey">{t("ابدأ التقييم", "Start the rating")}</Link>
        <button type="button" className="btn btn-ghost btn-sm" onClick={async () => {
          setHidden(true);
          const r = await api("/api/sus", { method: "POST", body: { dismiss: true } });
          if (r.ok) toast(t("لن تظهر هذه الدعوة مرة أخرى.", "This invitation will not appear again."));
        }}>{t("لا، شكرًا", "No, thanks")}</button>
      </div>
    </section>
  );
}
