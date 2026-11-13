import { agentById } from "@/lib/catalog/agents";
import { modelById } from "@/lib/catalog/models";
import { videoById } from "@/lib/catalog/videos";
import { all, run } from "@/lib/db";
import { authed, fail, ok, readJson } from "@/lib/http";
import { tOf } from "@/lib/i18n";

export const GET = authed(async (_req, user) =>
  ok({ favorites: await all<{ kind: string; ref: string }>("SELECT kind, ref FROM favorites WHERE user_id = ?", user.id) }),
);

export const POST = authed(async (req, user) => {
  const t = tOf(req);
  const b = await readJson(req);
  const kind = b?.kind, ref = b?.ref;
  if (typeof ref !== "string") return fail(400, t("طلب غير صالح.", "Invalid request."));
  const exists = kind === "model" ? modelById(ref) : kind === "agent" ? agentById(ref) : kind === "video" ? videoById(ref) : null;
  if (!exists) return fail(404, t("العنصر غير موجود.", "Item not found."));
  if (b?.on) await run("INSERT INTO favorites (user_id, kind, ref, created_at) VALUES (?,?,?,?) ON CONFLICT DO NOTHING", user.id, kind as string, ref, Date.now());
  else await run("DELETE FROM favorites WHERE user_id = ? AND kind = ? AND ref = ?", user.id, kind as string, ref);
  return ok();
});
