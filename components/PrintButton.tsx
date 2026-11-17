"use client";
import { useT } from "./app";
import { Icon } from "./Icon";

/** يفتح نافذة الطباعة في المتصفح، ومنها يُحفظ التقرير ملفًا. */
export function PrintButton() {
  const t = useT();
  return (
    <button type="button" className="btn btn-primary no-print" onClick={() => window.print()}>
      <Icon name="print" size={18} /> {t("اطبع أو احفظ ملفًا", "Print or save as a file")}
    </button>
  );
}
