"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useApp } from "./app";
import { Icon } from "./Icon";

export function FavButton({ kind, id, initial, label }: { kind: "model" | "agent" | "video"; id: string; initial: boolean; label: string }) {
  const { user, toast, t } = useApp();
  const router = useRouter();
  const [on, setOn] = useState(initial);
  return (
    <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={on} aria-label={on ? t(`إزالة ${label} من المفضلة`, `Remove ${label} from favourites`) : t(`إضافة ${label} إلى المفضلة`, `Add ${label} to favourites`)}
      onClick={async () => {
        if (!user) { router.push("/login"); return; }
        setOn(!on);
        const r = await api("/api/favorites", { body: { kind, ref: id, on: !on } });
        if (!r.ok) { setOn(on); toast(r.data.error ?? t("تعذر الحفظ.", "Could not save.")); } else toast(!on ? t("أُضيف إلى المفضلة.", "Added to favourites.") : t("أُزيل من المفضلة.", "Removed from favourites."));
      }}>
      <Icon name={kind === "video" ? "bookmark" : "star"} />
    </button>
  );
}
