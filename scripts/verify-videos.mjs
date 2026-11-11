// يتحقق من مرشّحي الفيديو عبر واجهة oEmbed الرسمية ليوتيوب ويكتب data/videos.json.
// لا يُقبل فيديو إلا إذا: (١) أعادت الواجهة ٢٠٠، (٢) طابق العنوان/القناة التعبير المتوقع للمرشّح.
// العنوان واسم القناة يؤخذان من يوتيوب لا من ملف المرشّحين. المدة وتاريخ النشر يُجلبان
// من صفحة المشاهدة إن أمكن، وإلا يُتركان فارغين (لا تُخمَّن أي قيمة).
// التشغيل: npm run videos:verify   — يتطلب اتصالًا بـ www.youtube.com
import fs from "node:fs";

const candidates = JSON.parse(fs.readFileSync("data/video-candidates.json", "utf8"));
const today = new Date().toISOString().slice(0, 10);
const ok = [], rejected = [];
const seen = new Set();

async function meta(id) {
  try {
    const html = await (await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: { "accept-language": "en" }, signal: AbortSignal.timeout(15000) })).text();
    const len = html.match(/"lengthSeconds":"(\d+)"/)?.[1];
    const pub = html.match(/"publishDate":"(\d{4}-\d{2}-\d{2})/)?.[1];
    return { durationSec: len ? Number(len) : null, published: pub ?? null };
  } catch { return { durationSec: null, published: null }; }
}

for (const c of candidates) {
  if (seen.has(c.id)) { rejected.push({ id: c.id, reason: "مكرر" }); continue; }
  seen.add(c.id);
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${c.id}`)}`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) { rejected.push({ id: c.id, reason: `oEmbed ${r.status}` }); continue; }
    const j = await r.json();
    if (!new RegExp(c.expect, "i").test(`${j.title} ${j.author_name}`)) { rejected.push({ id: c.id, reason: `العنوان لا يطابق المتوقع: ${j.title}` }); continue; }
    ok.push({ id: c.id, title: j.title, channel: j.author_name, category: c.category, lang: c.lang, level: c.level, paths: c.paths, ...(await meta(c.id)), verifiedAt: today });
    console.log("✓", c.id, j.title);
  } catch (e) { rejected.push({ id: c.id, reason: `تعذر الاتصال: ${e.cause?.code ?? e.name}` }); }
}

if (ok.length === 0 && rejected.every((r) => r.reason.startsWith("تعذر الاتصال"))) {
  console.error("تعذر الوصول إلى يوتيوب من هذه البيئة؛ لم يُغيَّر data/videos.json.");
  process.exit(2);
}
fs.writeFileSync("data/videos.json", JSON.stringify(ok, null, 1) + "\n");
fs.writeFileSync("data/videos-report.json", JSON.stringify({ date: today, candidates: candidates.length, verified: ok.length, rejected }, null, 1) + "\n");
console.log(`\nالمتحقق منه: ${ok.length} من ${candidates.length}. المرفوض: ${rejected.length}`);
