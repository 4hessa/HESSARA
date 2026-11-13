"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { useT } from "./app";
import { Icon } from "./Icon";

// نافذة حوارية مبنية على <dialog> الأصلي: حبس التركيز وزر الهروب يوفرهما المتصفح.
export function Dialog({ open, onClose, title, children, variant }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; variant?: "sheet" | "sheet-start";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const t = useT();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`dialog${variant ? " drawer" : ""}${variant === "sheet-start" ? " start" : ""}`}
      aria-labelledby={id}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      {open && (
        <>
          <div className="dialog-head">
            <h2 id={id}>{title}</h2>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label={t("إغلاق", "Close")}><Icon name="close" /></button>
          </div>
          {children}
        </>
      )}
    </dialog>
  );
}
