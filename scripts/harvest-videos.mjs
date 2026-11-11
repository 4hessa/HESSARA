// يجمع مرشّحين من صفحة نتائج بحث يوتيوب (العنوان، القناة، المدة، المشاهدات كما يعرضها يوتيوب لحظة الجمع)
// ويدمجهم في data/video-candidates.json. لا ينشر شيئًا: النشر يمر بـ verify-videos.mjs.
// معايير آلية: مدة ≥ ٦ دقائق، ليس بثًّا مباشرًا، العنوان يطابق تعبير صلة المجال، حد أدنى للمشاهدات
// (مؤشر مساعد لا دليل جودة)، استبعاد عناوين الوعود المالية، وثلاثة فيديوهات كحد أقصى للقناة في كل مجال.
// التشغيل: NODE_USE_ENV_PROXY=1 node scripts/harvest-videos.mjs
import fs from "node:fs";

const PLAN = {
  intro: { n: 25, rel: /artificial intelligence|\bAI\b|generative|الذكاء الاصطناعي|ذكاء اصطناعي/i, en: ["introduction to artificial intelligence full course", "what is generative AI explained", "AI for beginners course", "how does AI work explained"], ar: ["مقدمة في الذكاء الاصطناعي", "ما هو الذكاء الاصطناعي شرح", "الذكاء الاصطناعي للمبتدئين كورس"] },
  math: { n: 15, rel: /linear algebra|calculus|probabilit|statistic|gradient|matrix|الجبر الخطي|التفاضل|الاحتمالات|الإحصاء|الاحصاء|رياضيات/i, en: ["linear algebra for machine learning", "calculus for machine learning", "probability and statistics for machine learning", "mathematics for machine learning course"], ar: ["الجبر الخطي لتعلم الآلة", "الاحتمالات والإحصاء لعلوم البيانات", "رياضيات الذكاء الاصطناعي"] },
  programming: { n: 20, rel: /python|pytorch|tensorflow|numpy|pandas|بايثون/i, en: ["python for data science full course", "pytorch tutorial for beginners", "numpy tutorial", "pandas tutorial", "tensorflow tutorial for beginners"], ar: ["تعلم بايثون للمبتدئين كورس كامل", "شرح pandas بالعربي", "شرح pytorch بالعربي"] },
  ml: { n: 20, rel: /machine learning|scikit|regression|classification|decision tree|random forest|clustering|تعلم الآلة|تعلم الاله|تعلم الالة|التعلم الآلي/i, en: ["machine learning full course", "scikit-learn tutorial", "machine learning algorithms explained", "decision trees random forest explained", "linear regression machine learning explained"], ar: ["كورس تعلم الآلة بالعربي", "شرح machine learning للمبتدئين بالعربي"] },
  dl: { n: 20, rel: /deep learning|neural network|\bCNN\b|convolution|backprop|\bRNN\b|LSTM|التعلم العميق|الشبكات العصبية|شبكة عصبية/i, en: ["deep learning full course", "neural networks from scratch", "convolutional neural networks explained", "backpropagation explained", "LSTM RNN explained"], ar: ["شرح التعلم العميق بالعربي", "الشبكات العصبية شرح"] },
  llm: { n: 25, rel: /\bLLMs?\b|language model|\bRAG\b|retrieval|prompt|GPT|embedding|النماذج اللغوية|نموذج لغوي|هندسة الأوامر/i, en: ["how large language models work", "build LLM from scratch", "RAG tutorial retrieval augmented generation", "prompt engineering full course", "embeddings vector database explained", "LLM course for developers"], ar: ["شرح النماذج اللغوية الكبيرة LLM", "شرح RAG بالعربي", "هندسة الأوامر prompt engineering بالعربي"] },
  transformers: { n: 15, rel: /transformer|attention|token|\bBPE\b|\bBERT\b|المحولات|الانتباه|ترميز/i, en: ["transformer architecture explained", "attention mechanism explained", "tokenization byte pair encoding explained", "BERT explained", "positional encoding explained"], ar: ["شرح transformers بالعربي", "شرح attention is all you need بالعربي"] },
  finetune: { n: 15, rel: /fine.?tun|LoRA|QLoRA|train|PEFT|distill|الضبط الدقيق|تدريب/i, en: ["fine tuning LLM tutorial", "LoRA QLoRA explained", "train a language model from scratch", "fine tune llama tutorial", "PEFT hugging face fine tuning"], ar: ["fine tuning بالعربي شرح", "تدريب نموذج لغوي"] },
  agents: { n: 20, rel: /agent|LangGraph|LangChain|\bMCP\b|model context protocol|crewai|autogen|tool (use|calling)|function calling|وكيل|وكلاء/i, en: ["build AI agents tutorial", "LangGraph tutorial", "model context protocol MCP explained", "AI agents full course", "function calling tool use LLM tutorial", "multi agent systems crewai tutorial"], ar: ["بناء AI Agent بالعربي", "شرح وكلاء الذكاء الاصطناعي"] },
  local: { n: 15, rel: /local|ollama|llama\.?cpp|vLLM|self.?host|deploy|quantiz|GGUF|LM Studio|inference|محلي|جهازك|استضافة/i, en: ["run LLM locally ollama tutorial", "llama.cpp tutorial", "deploy LLM with vLLM", "self host LLM open webui", "LLM quantization GGUF explained", "LM Studio tutorial"], ar: ["تشغيل نموذج ذكاء اصطناعي على جهازك ollama", "تشغيل LLM محليا"] },
  eval: { n: 10, rel: /evaluat|eval|benchmark|safety|hallucinat|guardrail|red.?team|alignment|interpretab|jailbreak|prompt injection|تقييم|أمان|هلوسة/i, en: ["LLM evaluation tutorial", "AI safety explained", "LLM hallucinations explained guardrails", "red teaming LLM prompt injection", "how to evaluate RAG LLM applications"], ar: ["تقييم النماذج اللغوية", "أمان الذكاء الاصطناعي شرح"] },
};
const PATHS = { intro: ["zero"], math: ["zero"], programming: ["zero"], ml: ["zero"], dl: ["how-llm"], llm: ["how-llm"], transformers: ["how-llm"], finetune: ["train-small"], agents: ["agent"], local: ["run-local"], eval: ["evaluate"] };
const SPAM = /\$\d|make money|get rich|millionaire|passive income|ربح|اربح|الثراء|دولار/i;
const ARABIC = /[؀-ۿ]/;

const secs = (t) => t.split(":").map(Number).reduce((a, b) => a * 60 + b, 0);
const views = (t = "") => Number((t.match(/[\d,]+/)?.[0] ?? "0").replace(/,/g, ""));
function level(title) {
  if (/beginner|intro|basics|for everyone|explained simply|للمبتدئين|مقدمة|أساسيات|من الصفر/i.test(title)) return "مبتدئ";
  if (/advanced|from scratch|paper|deep dive|internals|reproduce|متقدم/i.test(title)) return "متقدم";
  return "متوسط";
}
function extraPaths(cat, title) {
  const p = new Set(PATHS[cat]);
  if (/from scratch|train/i.test(title) && ["llm", "dl", "finetune"].includes(cat)) p.add("train-small");
  if (/deploy|api|serve|vLLM|host|استضافة/i.test(title)) p.add("host");
  if (/eval|benchmark|تقييم/i.test(title)) p.add("evaluate");
  return [...p];
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function search(q, lang) {
  for (let i = 0; ; i++) {
    try { await wait(1200); return await searchOnce(q, lang); }
    catch (e) { if (i >= 3) throw e; await wait(4000 * (i + 1)); }
  }
}
async function searchOnce(q, lang) {
  const r = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=en`, { headers: { "accept-language": "en", "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(30000) });
  const html = await r.text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) return [];
  const out = [];
  (function walk(o) {
    if (!o || typeof o !== "object") return;
    if (o.videoRenderer?.videoId) {
      const v = o.videoRenderer;
      if (v.lengthText?.simpleText) out.push({ id: v.videoId, title: v.title?.runs?.map((x) => x.text).join("") ?? "", channel: v.ownerText?.runs?.[0]?.text ?? "", durationSec: secs(v.lengthText.simpleText), views: views(v.viewCountText?.simpleText), lang });
      return;
    }
    for (const k in o) walk(o[k]);
  })(JSON.parse(m[1]));
  return out;
}

const existing = JSON.parse(fs.readFileSync("data/video-candidates.json", "utf8")).filter((c) => c.source !== "search");
const excluded = JSON.parse(fs.readFileSync("data/video-curation.json", "utf8")).excluded;
const taken = new Set([...existing.map((c) => c.id), ...Object.keys(excluded)]);
const added = [];
for (const [cat, plan] of Object.entries(PLAN)) {
  const have = existing.filter((c) => c.category === cat).length;
  const pool = [];
  for (const [lang, qs] of [["en", plan.en], ["ar", plan.ar]])
    for (const q of qs) { try { pool.push(...(await search(q, lang))); } catch (e) { console.error("فشل البحث:", q, e.name); } }
  const perChannel = {};
  const pick = (lang, quota) => {
    const got = [];
    for (const v of pool.filter((x) => x.lang === lang).sort((a, b) => b.views - a.views)) {
      if (got.length >= quota) break;
      const isAr = ARABIC.test(v.title);
      if (taken.has(v.id) || v.durationSec < 360 || SPAM.test(v.title) || !plan.rel.test(v.title)) continue;
      if (lang === "ar" ? !isAr : isAr) continue;
      if (v.views < (lang === "ar" ? 3000 : 30000)) continue;
      if ((perChannel[v.channel] = (perChannel[v.channel] ?? 0) + 1) > 3) continue;
      taken.add(v.id);
      got.push({ id: v.id, category: cat, lang, level: level(v.title), paths: extraPaths(cat, v.title), expect: ".", durationSec: v.durationSec, views: v.views, source: "search", searchTitle: v.title, searchChannel: v.channel });
    }
    return got;
  };
  const need = Math.max(0, plan.n - have);
  const ar = pick("ar", Math.ceil(need * 0.3));
  const en = pick("en", need - ar.length);
  added.push(...ar, ...en);
  console.log(`${cat}: يدوي ${have} + عربي ${ar.length} + إنجليزي ${en.length} / الهدف ${plan.n}`);
}
fs.writeFileSync("data/video-candidates.json", JSON.stringify([...existing, ...added], null, 1) + "\n");
console.log(`أضيف ${added.length} مرشّحًا من البحث. المجموع ${existing.length + added.length}.`);
