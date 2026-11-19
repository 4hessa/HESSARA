"use client";
// صندوق رسائل «تواصل معنا» لصاحب المشروع: الأحدث أولًا، مع رابط للرد من برنامج البريد وزر حذف.
import { useState } from "react";
import { useApp } from "./app";
import { Icon } from "./Icon";
import { LocalTime } from "./LocalTime";

export type InboxRow = { id: string; name: string | null; email: string; body: string; lang: string; created_at: number };

export function ContactInbox({ initial }: { initial: InboxRow[] }) {
  const { t } = useApp();
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState("");

  async function remove(row: InboxRow) {
    if (!window.confirm(t("حذف هذه الرسالة نهائيًا؟", "Delete this message permanently?"))) return;
    setError("");
    const res = await fetch(`/api/admin/contact/${encodeURIComponent(row.id)}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return setError(t("تعذر حذف الرسالة. حاول مرة أخرى.", "The message could not be deleted. Try again."));
    setRows((r) => r.filter((x) => x.id !== row.id));
  }

  const reply = (row: InboxRow) =>
    `mailto:${row.email}?subject=${encodeURIComponent(row.lang === "ar" ? "رد على رسالتك إلى هسّارة" : "Re: your message to HESSARA")}`;

  return (
    <div className="stack">
      {error && <div className="notice notice-danger" role="alert"><Icon name="alert" /><span>{error}</span></div>}
      {rows.length === 0 ? (
        <p className="muted">{t("لا رسائل.", "No messages.")}</p>
      ) : (
        <ul className="inbox" aria-label={t("الرسائل، الأحدث أولًا", "Messages, newest first")}>
          {rows.map((row) => (
            <li key={row.id} className="card stack-sm">
              <div className="row-between">
                <div className="stack-sm">
                  <strong dir="auto">{row.name ?? t("دون اسم", "No name")}</strong>
                  <a className="link t-small" href={reply(row)} dir="ltr">{row.email}</a>
                </div>
                <span className="t-small muted"><LocalTime ts={row.created_at} /> · {row.lang === "ar" ? "عربي" : "English"}</span>
              </div>
              <p className="inbox__body" dir="auto">{row.body}</p>
              <div className="card-foot">
                <a className="btn btn-primary btn-sm" href={reply(row)}>{t("رد بالبريد", "Reply by email")}</a>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(row)}>
                  <Icon name="trash" size={16} /> {t("حذف", "Delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
