"use client";
// صفحة الخطأ غير المتوقع بدل الشاشة البيضاء. خطأ الخادم يسجّله الخادم نفسه (له digest)، وخطأ المتصفح يُرسل من هنا.
import Link from "next/link";
import { useEffect } from "react";
import { useApp } from "@/components/app";
import { reportClientError } from "@/components/ErrorReporter";
import { MarketingPage } from "@/components/site/Page";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useApp();
  useEffect(() => {
    if (!error.digest) reportClientError(error.name || "Error", error.message || "");
  }, [error]);
  return (
    <MarketingPage
      art={{ name: "home" }}
      glow={false}
      hero={
        <>
          <h1>{t("حدث خطأ غير متوقع", "Something went wrong")}</h1>
          <p className="hero__sub">{t("تعذّر عرض هذه الصفحة الآن", "This page could not be shown right now")}</p>
          <div className="hero__copy"><p>{t("محتوى استشاراتك محفوظ. جرّب إعادة المحاولة، أو ارجع إلى الرئيسية.", "Your consultations are safe. Try again, or go back to the home page.")}</p></div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => reset()}>{t("أعد المحاولة", "Try again")}</button>
            <Link className="btn btn--ghost" href="/">{t("العودة إلى الرئيسية", "Return Home")}</Link>
          </div>
        </>
      }
    />
  );
}
