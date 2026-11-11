"use client";
import { api, useApp } from "./app";

export function PrefAgentButton({ id, name }: { id: string; name: string }) {
  const { user, setUser, toast } = useApp();
  if (!user) return null;
  const on = user.prefAgent === id;
  return (
    <button className="btn btn-secondary btn-sm" aria-pressed={on} onClick={async () => {
      const r = await api<{ user: NonNullable<typeof user> }>("/api/me", { method: "PATCH", body: { prefAgent: on ? null : id } });
      if (r.ok) { setUser(r.data.user); toast(on ? "أُلغي الوكيل المفضل." : `أصبح ${name} وكيلك المفضل.`); } else toast(r.data.error ?? "تعذر الحفظ.");
    }}>{on ? "الوكيل المفضل ✓" : "اجعله المفضل"}</button>
  );
}
