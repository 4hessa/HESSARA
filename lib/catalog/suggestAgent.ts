// اقتراح الوكيل المتخصص من كلمات السؤال. تصنيف حتمي بالكلمات المفتاحية (عربية وإنجليزية)، لا ذكاء اصطناعي:
// يُعرض اقتراحًا يقبله المستخدم أو يتجاهله، ولا يُطبَّق تلقائيًا. عند التعادل أو غياب الدلالة لا يُقترح شيء.
export type SuggestedAgent = "coding" | "systems" | "ai" | "research" | "security" | "planning";

const RULES: { id: SuggestedAgent; words: string[] }[] = [
  {
    id: "coding",
    words: ["شفرة", "الكود", "كود ", "برمجة", "برمجي", "دالة", "استثناء", "رسالة الخطأ", "بايثون", "جافاسكربت", "تايبسكربت", "مكتبة", "مترجم",
      "bug", "error", "exception", "traceback", "function", "code", "python", "javascript", "typescript", "react", "node", "compile", "undefined", "regex"],
  },
  {
    id: "systems",
    words: ["بنية", "معمارية", "قاعدة البيانات", "قواعد البيانات", "خادم", "خوادم", "التوسع", "الموثوقية", "زمن الاستجابة", "بطيء", "بطيئة", "بطء", "الأداء", "التخزين المؤقت",
      "architecture", "scalab", "database", "server", "latency", "cache", "microservice", "kubernetes", "docker", "infrastructure", "load balanc", "throughput", "performance", "slow"],
  },
  {
    id: "ai",
    words: ["نموذج لغوي", "النماذج اللغوية", "تعلم الآلة", "تعلّم الآلة", "التعلم العميق", "تدريب النموذج", "الضبط الدقيق", "الذكاء الاصطناعي", "ذكاء اصطناعي", "شبكة عصبية", "بيانات التدريب", "التضمين",
      "llm", "machine learning", "deep learning", "fine-tun", "training", "embedding", "prompt", " rag ", "dataset", "neural", "transformer", "overfit"],
  },
  {
    id: "research",
    words: ["بحث علمي", "البحث العلمي", "فرضية", "منهجية", "دراسة", "ورقة علمية", "الأدبيات", "عينة", "إحصائي", "تجربة علمية", "رسالة ماجستير", "استبانة",
      "research", "hypothesis", "methodology", "paper", "literature", "statistic", "survey", "thesis", "experiment"],
  },
  {
    id: "security",
    words: ["الأمن", " أمن ", "أمان", "ثغرة", "ثغرات", "اختراق", "تشفير", "صلاحيات", "مصادقة", "كلمة المرور", "كلمات المرور", "هجوم", "حماية", "التصيد",
      "security", "secure", "vulnerab", "attack", "encrypt", "authentication", "authoriz", "password", "xss", "csrf", "injection", "owasp", "phishing", "firewall"],
  },
  {
    id: "planning",
    words: ["خطة", "خطت", "جدول زمني", "مراحل", "مرحلة", "مشروع تخرج", "المتطلبات", "مهام", "أسابيع", "أسبوع", "خارطة طريق", "مخرجات",
      "plan", "timeline", "milestone", "roadmap", "requirement", "schedule", "week", "sprint", "deliverable"],
  },
];

const norm = (s: string) => s.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا");

/** الوكيل الأكثر صلة بنص السؤال، أو null إذا كان النص قصيرًا أو الدلالة غائبة أو متعادلة. */
export function suggestAgent(text: string): SuggestedAgent | null {
  const t = ` ${norm(text)} `;
  if (t.trim().length < 15) return null;
  const scores = RULES.map((r) => ({ id: r.id, n: r.words.filter((w) => t.includes(norm(w))).length })).sort((a, b) => b.n - a.n);
  if (!scores[0].n || scores[0].n === scores[1].n) return null;
  return scores[0].id;
}
