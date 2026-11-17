"use client";
// يرسل اسم الصفحة المفتوحة إلى عدّاد الزيارات. يحترم خيار «عدم التتبّع» في المتصفح فلا يرسل شيئًا حينها.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageView() {
  const path = usePathname();
  useEffect(() => {
    try {
      const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
      if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
      void fetch("/api/pv", { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ p: path }) }).catch(() => {});
    } catch {
      /* لا شيء */
    }
  }, [path]);
  return null;
}
