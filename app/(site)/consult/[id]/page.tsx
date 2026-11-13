import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/Workspace";
import { all, get, type ConsultRow, type MessageRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("استشارة", "Consultation") };
}

export default async function ConsultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/consult/${id}`);
  const c = await get<ConsultRow>("SELECT * FROM consultations WHERE id = ? AND user_id = ?", id, user.id);
  if (!c) notFound();
  const messages = await all<MessageRow>("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at, id", c.id);
  const history = await all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100", user.id);
  return <Workspace key={c.id} consultation={{ ...c }} messages={messages.map((m) => ({ ...m }))} history={history.map((h) => ({ ...h }))} />;
}
