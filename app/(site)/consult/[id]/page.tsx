import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/Workspace";
import { all, get, type ConsultRow, type MessageRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";

export const metadata: Metadata = { title: "استشارة" };

export default async function ConsultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/consult/${id}`);
  const c = get<ConsultRow>("SELECT * FROM consultations WHERE id = ? AND user_id = ?", id, user.id);
  if (!c) notFound();
  const messages = all<MessageRow>("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at, rowid", c.id);
  const history = all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100", user.id);
  return <Workspace key={c.id} consultation={{ ...c }} messages={messages.map((m) => ({ ...m }))} history={history.map((h) => ({ ...h }))} />;
}
