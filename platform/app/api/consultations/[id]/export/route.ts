import { modelById } from "@/lib/catalog/models";
import { all, get, type ConsultRow, type MessageRow } from "@/lib/db";
import { authed, fail } from "@/lib/http";

export const GET = authed<{ params: Promise<{ id: string }> }>(async (_req, user, ctx) => {
  const c = await get<ConsultRow>("SELECT * FROM consultations WHERE id = ? AND user_id = ?", (await ctx.params).id, user.id);
  if (!c) return fail(404, "الاستشارة غير موجودة.");
  const msgs = await all<MessageRow>("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at, id", c.id);
  const md = [
    `# ${c.title}`,
    `تاريخ الإنشاء: ${new Date(c.created_at).toISOString()}`,
    "",
    ...msgs.map((m) =>
      m.role === "user"
        ? `## المستخدم\n\n${m.content}\n`
        : `## ${modelById(m.model_id)?.name ?? "المساعد"}${m.engine === "demo" ? " (محرك تجريبي)" : " (مولَّد بالذكاء الاصطناعي)"}\n\n${m.content}\n`,
    ),
  ].join("\n");
  return new Response(md, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="hessara-${c.id}.md"`,
    },
  });
});
