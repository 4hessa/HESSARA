// يكمل مدد الفيديوهات الناقصة بالبحث عن معرّف كل فيديو في يوتيوب وقراءة المدة المعروضة له.
// لا يخمّن: إن لم يظهر الفيديو نفسه في النتائج تبقى المدة فارغة.
// التشغيل: NODE_USE_ENV_PROXY=1 node scripts/fill-durations.mjs
import fs from "node:fs";
const videos = JSON.parse(fs.readFileSync("data/videos.json", "utf8"));
const cands = JSON.parse(fs.readFileSync("data/video-candidates.json", "utf8"));
const secs = (t) => t.split(":").map(Number).reduce((a, b) => a * 60 + b, 0);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let filled = 0;
for (const v of videos.filter((x) => !x.durationSec)) {
  for (const q of [v.id, `${v.title} ${v.channel}`]) {
    try {
      await wait(3500);
      const html = await (await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=en`, { headers: { "accept-language": "en", "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(30000) })).text();
      const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
      if (!m) continue;
      let hit = null;
      (function walk(o) {
        if (hit || !o || typeof o !== "object") return;
        if (o.videoRenderer?.videoId === v.id && o.videoRenderer.lengthText?.simpleText) { hit = o.videoRenderer; return; }
        for (const k in o) walk(o[k]);
      })(JSON.parse(m[1]));
      if (hit) {
        v.durationSec = secs(hit.lengthText.simpleText);
        v.views ??= Number((hit.viewCountText?.simpleText?.match(/[\d,]+/)?.[0] ?? "").replace(/,/g, "")) || null;
        const c = cands.find((x) => x.id === v.id);
        if (c) { c.durationSec = v.durationSec; c.views ??= v.views; }
        filled++; console.log("✓", v.id, hit.lengthText.simpleText);
        break;
      }
    } catch (e) { console.error("تعذر:", v.id, e.name); }
  }
}
fs.writeFileSync("data/videos.json", JSON.stringify(videos, null, 1) + "\n");
fs.writeFileSync("data/video-candidates.json", JSON.stringify(cands, null, 1) + "\n");
console.log(`اكتملت مدة ${filled} فيديو. بلا مدة: ${videos.filter((x) => !x.durationSec).length}`);
