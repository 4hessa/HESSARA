// تسجيل فتح صفحة: يزيد عدّاد (اليوم، المسار) بواحد. لا يُحفظ شيء عن الزائر نفسه.
import { run } from "@/lib/db";
import { ipLimit, readJson, sameOrigin } from "@/lib/http";
import { isBot, normalizeViewPath } from "@/lib/pageviews";
import { usageDay } from "@/lib/usage";

const done = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  if (!sameOrigin(req) || isBot(req.headers.get("user-agent") ?? "") || !ipLimit(req, "pv", 60, 60_000)) return done();
  const b = await readJson(req);
  const path = normalizeViewPath(typeof b?.p === "string" ? b.p : "");
  if (path)
    await run("INSERT INTO page_views (day, path, views) VALUES (?,?,1) ON CONFLICT (day, path) DO UPDATE SET views = page_views.views + 1", usageDay(), path)
      .catch(() => {});
  return done();
}
