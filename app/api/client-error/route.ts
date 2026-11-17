// خطأ JavaScript وقع في متصفح زائر: يُحصى في سجل الأخطاء الداخلي دون أي معرّف للزائر. يرد دائمًا 204.
import { ipLimit, readJson, sameOrigin } from "@/lib/http";
import { clientRoute, recordError } from "@/lib/errors";
import { isBot } from "@/lib/pageviews";

const done = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  if (!sameOrigin(req) || isBot(req.headers.get("user-agent") ?? "") || !ipLimit(req, "client-error", 20, 60_000)) return done();
  const b = await readJson<{ kind?: unknown; message?: unknown; path?: unknown }>(req);
  const kind = typeof b?.kind === "string" ? b.kind.replace(/[^\w:.-]/g, "").slice(0, 60) || "Error" : "Error";
  const message = typeof b?.message === "string" ? b.message.slice(0, 500) : "";
  await recordError("client", clientRoute(b?.path), kind, message).catch(() => {});
  return done();
}
