"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useApp } from "./app";
import { Icon } from "./Icon";

export function FavButton({ kind, id, initial, label }: { kind: "model" | "agent" | "video"; id: string; initial: boolean; label: string }) {
  const { user, toast } = useApp();
  const router = useRouter();
  const [on, setOn] = useState(initial);
  return (
    <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={on} aria-label={on ? `إزالة ${label} من المفضلة` : `إضافة ${label} إلى المفضلة`}
      onClick={async () => {
        if (!user) { router.push("/login"); return; }
        setOn(!on);
        const r = await api("/api/favorites", { body: { kind, ref: id, on: !on } });
        if (!r.ok) { setOn(on); toast(r.data.error ?? "تعذر الحفظ."); } else toast(!on ? "أُضيف إلى المفضلة." : "أُزيل من المفضلة.");
      }}>
      <Icon name={kind === "video" ? "bookmark" : "star"} />
    </button>
  );
}
