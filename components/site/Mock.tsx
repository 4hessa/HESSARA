// نموذج مصغّر لواجهة المنصة بأسلوب الموقع المرجعي. الشكل كما في المرجع، والمحتوى يصف ميزات
// موجودة فعلًا في هسّارة (لا مخططات أداء ولا احتمالات سيناريوهات مختلَقة).
import type { Lang } from "@/lib/i18n";

type Variant = "advisory" | "consult" | "models";

const COPY = {
  en: {
    preview: "HESSARA workspace preview",
    advisory: { title: "Dashboard", side: ["Dashboard", "Consultations", "Models", "Agents", "Critique Lab", "Media"] },
    consult: { title: "Consultation · Planning agent", side: ["History", "Consultation", "Agents", "Review", "Saved", "Export"] },
    models: { title: "Model registry", side: ["Registry", "Cloud", "Local", "Demo engine", "Favourite", "Docs"] },
    recent: "Recent consultations",
    recentRows: [["Slow LLM app", "Opus 5.5"], ["Graduation plan", "Planning"], ["Split the monolith?", "Sonnet 5.5"]],
    advisor: "Consultation",
    a1: "My LLM app is slow. Where do I start?",
    a2: "Measure each stage first. Here is a plan with a rollback.",
    a3: "Run a critical review on it.",
    type: "Type a message…",
    criteria: "Review criteria",
    met: ["Measured baseline", "Rollback plan", "Stated assumptions"],
    thread: "Thread",
    c1: "Stress-test my project plan against a two-week delay.",
    c2: "Three risks, each with a fallback and an owner.",
    review: "Critical review",
    findings: [["High", "No rollback plan"], ["Medium", "Unmeasured assumption"], ["Low", "Vague milestone"]],
    revised: "Revised version",
    verdicts: "Criteria",
    v: [["Risks identified", "Pass"], ["Rollback plan", "Fail"]],
    runReview: "Run review",
    status: "Status",
    rows: [["Claude Opus 5.5", "Ready", "on"], ["Claude Haiku 5.5", "Configured", ""], ["GPT", "Not configured", "off"], ["Demo engine", "Rules, not AI", "off"]],
    test: "Test connection",
    vendors: "Providers",
    legend: "Status legend",
    legendRows: [["Ready", "on"], ["Configured, untested", ""], ["Not configured", "off"]],
  },
  ar: {
    preview: "معاينة لمساحة عمل هسّارة",
    advisory: { title: "لوحتي", side: ["لوحتي", "الاستشارات", "النماذج", "الوكلاء", "مختبر النقد", "الميديا"] },
    consult: { title: "استشارة · وكيل التخطيط", side: ["السجل", "الاستشارة", "الوكلاء", "المراجعة", "المحفوظات", "التصدير"] },
    models: { title: "سجل النماذج", side: ["السجل", "سحابية", "محلية", "المحرك التجريبي", "المفضل", "التوثيق"] },
    recent: "آخر الاستشارات",
    recentRows: [["تطبيق نموذج لغوي بطيء", "Opus 5.5"], ["خطة مشروع التخرج", "التخطيط"], ["هل أفصل الخدمة؟", "Sonnet 5.5"]],
    advisor: "الاستشارة",
    a1: "تطبيقي المعتمد على نموذج لغوي بطيء. من أين أبدأ؟",
    a2: "قِس كل مرحلة أولًا. هذه خطة مع طريقة تراجع.",
    a3: "شغّل عليها مراجعة نقدية.",
    type: "اكتب رسالة…",
    criteria: "معايير المراجعة",
    met: ["خط أساس مقيس", "خطة تراجع", "افتراضات معلنة"],
    thread: "المحادثة",
    c1: "اختبر خطة مشروعي أمام تأخير أسبوعين.",
    c2: "ثلاث مخاطر، لكلٍّ منها بديل ومسؤول.",
    review: "المراجعة النقدية",
    findings: [["عالية", "لا خطة تراجع"], ["متوسطة", "افتراض غير مقيس"], ["منخفضة", "مرحلة غامضة"]],
    revised: "النسخة المنقّحة",
    verdicts: "المعايير",
    v: [["تحديد المخاطر", "متحقق"], ["خطة التراجع", "غائب"]],
    runReview: "شغّل المراجعة",
    status: "الحالة",
    rows: [["Claude Opus 5.5", "يعمل", "on"], ["Claude Haiku 5.5", "مهيّأ", ""], ["GPT", "غير مهيّأ", "off"], ["المحرك التجريبي", "قواعد، لا ذكاء اصطناعي", "off"]],
    test: "اختبر الاتصال",
    vendors: "المزوّدون",
    legend: "دليل الحالات",
    legendRows: [["يعمل", "on"], ["مهيّأ، لم يُختبر", ""], ["غير مهيّأ", "off"]],
  },
};

const tagClass = (k: string) => `tag${k === "on" ? " tag--on" : k === "off" ? " tag--off" : ""}`;

export function Mock({ variant = "advisory", lang }: { variant?: Variant; lang: Lang }) {
  const c = COPY[lang];
  const v = c[variant];
  return (
    <div className="mock" role="img" aria-label={`${c.preview}: ${v.title}`}>
      <div className="mock__rail"><i /><i /><i /><i /><i /><i /></div>
      <div className="mock__side"><b>HESSARA</b>{v.side.map((s, i) => <span key={s} className={i === 1 ? "on" : ""}>{s}</span>)}</div>
      <div className="mock__main">
        <div className="mock__bar"><span>{v.title}</span><em><i /><i /><i /></em></div>
        {variant === "advisory" && (
          <>
            <div className="pane"><b>{c.recent}</b>
              <div className="lines">
                {c.recentRows.map(([t, m]) => <div key={t}><span>{t}</span><span className="tag">{m}</span></div>)}
              </div>
              <svg viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 19.5h120" stroke="#bbb" strokeWidth=".5" />{[8, 13, 10, 16, 12, 18, 15, 19].map((h, i) => <rect key={i} x={6 + i * 14} y={19 - h} width="7" height={h} fill={i % 2 ? "#111" : "#b9b9b5"} />)}</svg>
            </div>
            <div className="pane pane--tall"><b>{c.advisor}</b>
              <span className="bubble">{c.a1}</span>
              <span className="bubble bubble--in">{c.a2}</span>
              <span className="bubble">{c.a3}</span>
              <span className="field">{c.type}</span>
            </div>
            <div className="pane"><b>{c.criteria}</b>
              <svg viewBox="0 0 120 44" aria-hidden="true"><circle cx="24" cy="22" r="14" fill="none" stroke="#dcdcd8" strokeWidth="5" /><circle cx="24" cy="22" r="14" fill="none" stroke="#111" strokeWidth="5" strokeDasharray="59 88" transform="rotate(-90 24 22)" /><g><rect x="52" y="10" width="4" height="4" fill="#111" /><rect x="60" y="11" width="44" height="2" fill="#cfcfcb" /><rect x="52" y="20" width="4" height="4" fill="#111" /><rect x="60" y="21" width="34" height="2" fill="#cfcfcb" /><rect x="52" y="30" width="4" height="4" fill="#fff" stroke="#111" strokeWidth=".8" /><rect x="60" y="31" width="40" height="2" fill="#cfcfcb" /></g></svg>
              <div className="lines">{c.met.map((m, i) => <div key={m}><span>{m}</span><span className={tagClass(i < 2 ? "on" : "off")}>{i < 2 ? "✓" : "✕"}</span></div>)}</div>
            </div>
          </>
        )}
        {variant === "consult" && (
          <>
            <div className="pane"><b>{c.thread}</b>
              <span className="bubble">{c.c1}</span>
              <span className="bubble bubble--in">{c.c2}</span>
              <span className="field">{c.type}</span>
            </div>
            <div className="pane pane--tall"><b>{c.review}</b>
              <div className="lines">
                {c.findings.map(([s, t], i) => <div key={t}><span>{t}</span><span className={tagClass(i === 0 ? "on" : i === 2 ? "off" : "")}>{s}</span></div>)}
              </div>
              <svg viewBox="0 0 110 60" aria-hidden="true"><g fill="none" stroke="#888" strokeWidth=".7"><path d="M8 10h60M8 20h80M8 30h50M8 40h70M8 50h40" /></g><path d="M8 20h80" stroke="#111" strokeWidth="1.6" /><path d="M8 40h70" stroke="#111" strokeWidth="1.6" strokeDasharray="2 2" /></svg>
              <span className="pill">{c.revised}</span>
            </div>
            <div className="pane"><b>{c.verdicts}</b>
              <div className="lines">{c.v.map(([k, s], i) => <div key={k}><span>{k}</span><span className={tagClass(i === 0 ? "on" : "off")}>{s}</span></div>)}</div>
              <span className="pill">{c.runReview}</span>
            </div>
          </>
        )}
        {variant === "models" && (
          <>
            <div className="pane pane--tall"><b>{c.status}</b>
              <div className="lines" style={{ gap: "0.32rem" }}>
                {c.rows.map(([n, s, k]) => <div key={n}><span>{n}</span><span className={tagClass(k)}>{s}</span></div>)}
              </div>
              <span className="pill">{c.test}</span>
            </div>
            <div className="pane"><b>{c.vendors}</b>
              <svg viewBox="0 0 120 40" aria-hidden="true">
                {["An", "Oa", "Go", "Ds", "Al", "Me"].map((m, i) => (
                  <g key={m} transform={`translate(${4 + (i % 3) * 40} ${i < 3 ? 2 : 22})`}>
                    <rect width="34" height="16" rx="2" fill="#fff" stroke="#111" strokeWidth=".6" />
                    <text x="17" y="11" fontSize="7" textAnchor="middle" fill="#111" fontFamily="Newsreader, serif" direction="ltr">{m}</text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="pane"><b>{c.legend}</b>
              <div className="lines">{c.legendRows.map(([l, k]) => <div key={l}><span>{l}</span><span className={tagClass(k)}>&nbsp;&nbsp;</span></div>)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
