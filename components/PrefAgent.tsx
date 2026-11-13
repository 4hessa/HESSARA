"use client";
import { api, useApp } from "./app";

export function PrefAgentButton({ id, name }: { id: string; name: string }) {
  const { user, setUser, toast, t } = useApp();
  if (!user) return null;
  const on = user.prefAgent === id;
  return (
    <button className="btn btn-secondary btn-sm" aria-pressed={on} onClick={async () => {
      const r = await api<{ user: NonNullable<typeof user> }>("/api/me", { method: "PATCH", body: { prefAgent: on ? null : id } });
      if (r.ok) { setUser(r.data.user); toast(on ? t("أُلغي الوكيل المفضل.", "Favourite agent cleared.") : t(`أصبح ${name} وكيلك المفضل.`, `${name} is now your favourite agent.`)); } else toast(r.data.error ?? t("تعذر الحفظ.", "Could not save."));
    }}>{on ? t("الوكيل المفضل ✓", "Favourite agent ✓") : t("اجعله المفضل", "Make it my favourite")}</button>
  );
}
