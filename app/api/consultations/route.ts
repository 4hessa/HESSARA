import { newId } from "@/lib/auth";
import { agentById } from "@/lib/catalog/agents";
import { titleFrom } from "@/lib/consult";
import { all, run, type ConsultRow } from "@/lib/db";
import { authed, fail, LIMITS, ok, readJson, str } from "@/lib/http";
import { isUsable } from "@/lib/providers";

export const GET = authed(async (req, user) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim().slice(0, 100);
  const saved = url.searchParams.get("saved") === "1";
  const where = ["c.user_id = ?"];
  const params: (string | number)[] = [user.id];
  if (saved) where.push("c.saved = 1");
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    where.push("(c.title LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM messages m WHERE m.consultation_id = c.id AND m.content LIKE ? ESCAPE '\\'))");
    params.push(like, like);
  }
  const rows = all<ConsultRow>(`SELECT c.* FROM consultations c WHERE ${where.join(" AND ")} ORDER BY c.updated_at DESC LIMIT 100`, ...params);
  return ok({ consultations: rows });
});

export const POST = authed(async (req, user) => {
  const b = await readJson(req);
  const text = str(b?.text, LIMITS.message);
  if (!text) return fail(400, `اكتب نص الاستشارة (حتى ${LIMITS.message} حرف).`);
  const modelId = typeof b?.modelId === "string" ? b.modelId : "";
  if (!isUsable(modelId)) return fail(409, "النموذج المختار غير متاح. اختر نموذجًا آخر.");
  const agentId = typeof b?.agentId === "string" && agentById(b.agentId) ? b.agentId : null;
  const id = newId();
  const now = Date.now();
  run("INSERT INTO consultations (id, user_id, title, model_id, agent_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
    id, user.id, titleFrom(typeof b?.title === "string" && b.title.trim() ? b.title : text), modelId, agentId, now, now);
  return ok({ id });
});
