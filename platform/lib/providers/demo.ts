// المحرك التجريبي: قواعد وكلمات مفتاحية وقوالب ثابتة. ليس نموذجًا لغويًا،
// وتوضّح كل إجابة ذلك في سطرها الأخير. الغرض: إثبات المسار دون مفاتيح خدمات.
import { agentById } from "../catalog/agents.ts";
import type { ProviderAdapter, StreamRequest } from "./types.ts";

type Topic = { id: string; re: RegExp; body: string };

/** القوالب الإنجليزية لكل موضوع (المعرّفات نفسها). */
const EN_BODY: Record<string, string> = {
  latency: `## Problem summary
An application built on a language model responds more slowly than acceptable. The cause is not yet known, and optimising before measuring is guesswork.

## Analysis of likely causes
1. **Generation time itself**: roughly proportional to the number of output tokens. Long answers mean long waits.
2. **Input size**: a large context (a full conversation history, many retrieved documents) raises the time to the first token.
3. **No streaming**: if the application waits for the whole answer before showing it, it will feel slower than it is.
4. **Sequential calls**: chains of several requests to the model or to external tools add up.
5. **What surrounds the model**: retrieval, the database, a cold server start, or a distant region.

## Missing information
- Time to first token and total time, each on its own.
- Input and output token counts per request.
- Is the slowness constant, or only at peak times?

## Suggested steps
1. **Measure first**: log, for every request, the time of each stage (retrieval, waiting for the first token, generation), with the median and the 95th percentile.
2. **Turn on streaming** if it is off; it improves perceived time without changing total time.
3. **Shorten the output**: state the required length in the instructions and cap the maximum tokens.
4. **Shorten the input**: summarise old history, retrieve fewer passages, and cache fixed instructions if the provider supports it.
5. **Run in parallel** whatever does not depend on something else.
6. **Try a smaller model** for simple tasks, measuring quality on a fixed sample.

## How to verify
Compare the median and the 95th percentile before and after each change on the same set of requests, and change one variable at a time.

## Limits of confidence
This is a list of common causes, not a diagnosis of your application; your measurements decide the real order.`,
  bug: `## Problem summary
Unexpected behaviour or an error in the code. Without the code and the full error message the cause cannot be identified.

## Missing information
- The full error message with its stack trace.
- The smallest code that reproduces the problem.
- The input that causes it, and the expected versus actual behaviour.

## Diagnosis steps
1. **Reproduce the error** with a fixed input; what cannot be reproduced cannot be proven fixed.
2. **Read the first line of the trace that belongs to your code**, not to library code.
3. **Print or inspect the values** at that line: type, emptiness, bounds.
4. **Bisect the problem**: disable half of the path and find which half holds the fault.
5. **Write a test that fails** because of the error before changing anything.

## How to verify
The new test passes after the fix, and the other tests are unaffected.

## Limits of confidence
This is a general method; an actual diagnosis needs the code and the message.`,
  architecture: `## Problem summary
An architectural decision that has to balance complexity, scalability, and reliability.

## Missing information
- Current and expected load (requests per second, data size).
- The availability target and acceptable response time.
- The team's size and operational experience.

## Options and their trade-offs
- **Keep the current architecture and fix the bottleneck**: the lowest risk, and it postpones complexity; it may not be enough under strong growth.
- **Split out one specific component**: isolates load and failures; adds networking, deployment, and monitoring.
- **A full redesign**: more flexibility in theory; the highest cost and risk, and usually unjustified before the numbers prove the need.

## Suggested steps
1. Find the bottleneck by measurement, not intuition.
2. Choose the smallest change that removes it.
3. Ship it behind a feature flag with a rollback plan.

## Limits of confidence
No specific recommendation is possible without the figures above.`,
  security: `## Problem summary
A defensive security review of a system you own or are authorised to examine.

## Missing information
- The assets to protect and who can reach them.
- The trust boundaries: which inputs come from outside the system?

## An initial checklist
1. **Authentication and sessions**: passwords hashed with a slow algorithm; cookies set HttpOnly and Secure.
2. **Authorisation**: check ownership of the resource on every request, not only in the interface.
3. **Inputs**: prepared queries, output encoding, and size limits.
4. **Secrets**: kept out of the code and the repository, and rotated when in doubt.
5. **Logs**: security events without personal data or secrets.

## How to verify
A test for each control that tries to bypass it and expects to be refused.

## Limits of confidence
A general list that does not replace a specialist's review of your actual system.`,
  plan: `## Goal and success criterion
Write one sentence describing what must work at the end and how it will be checked.

## The smallest version that proves the idea
One complete path from start to finish, even with the simplest implementation of each step. Build and test it before any expansion.

## Suggested phases
1. **Setup**: requirements, data, environment. Deliverable: a repository that runs locally.
2. **The core path**: the central function, complete. Deliverable: a live demonstration of the path.
3. **Evaluation**: metrics and tests. Deliverable: a repeatable results report.
4. **Expansion**: secondary features, as the remaining time allows.
5. **Documentation and presentation**.

## Risks
- Spreading effort over many unfinished features.
- Depending on an external service that was not tested early.

## Limits of confidence
Durations depend on the team and its experience, which were not given.`,
  research: `## The research question
Frame it so that it can be answered with data: which variable do you change, and what do you measure?

## The hypothesis
A falsifiable statement, with the result that would make it false.

## Methodology
- A clear baseline for comparison.
- One variable changed per experiment.
- An evaluation set kept apart from the development data.

## Threats to validity
Data leakage, a small sample, and choosing the metric after seeing the results.

## What to search for
This engine names no references. Search scientific databases with your topic's keywords, and check every source yourself.`,
};

const TOPICS: Topic[] = [
  {
    id: "latency",
    re: /(بطي|بطء|سرعة الاستجابة|زمن الاستجابة|تأخ[رّ]|الأداء|latency|slow|performance|response time)/i,
    body: `## ملخص المشكلة
تطبيق يعتمد على نموذج لغوي واستجابته أبطأ من المقبول. السبب غير محدد بعد، والتحسين قبل القياس تخمين.

## تحليل الأسباب المحتملة
1. **زمن التوليد نفسه**: يتناسب تقريبًا مع عدد رموز الإخراج. إجابات طويلة = انتظار طويل.
2. **حجم الإدخال**: سياق كبير (سجل محادثة كامل، مستندات مسترجعة كثيرة) يرفع زمن أول رمز.
3. **غياب البث**: إن انتظر التطبيق اكتمال الإجابة قبل عرضها فسيبدو أبطأ مما هو.
4. **استدعاءات متسلسلة**: سلاسل من عدة طلبات للنموذج أو لأدوات خارجية تُجمع أزمنتها.
5. **ما حول النموذج**: الاسترجاع، قاعدة البيانات، بداية باردة للخادم، أو بُعد المنطقة الجغرافية.

## المعلومات الناقصة
- زمن أول رمز والزمن الكلي، كلٌّ على حدة.
- عدد رموز الإدخال والإخراج لكل طلب.
- هل البطء ثابت أم في أوقات الذروة فقط؟

## الخطوات المقترحة
1. **قِس أولًا**: سجّل لكل طلب زمن كل مرحلة (استرجاع، انتظار أول رمز، توليد) والوسيط والمئين ٩٥.
2. **فعّل البث** إن لم يكن مفعّلًا؛ يحسّن الزمن المحسوس دون تغيير الزمن الكلي.
3. **قلّص الإخراج**: حدّد الطول المطلوب في التعليمات وحدّ الرموز الأقصى.
4. **قلّص الإدخال**: لخّص السجل القديم وقلّل المقاطع المسترجعة، واستخدم التخزين المؤقت للتعليمات الثابتة إن دعمه المزوّد.
5. **نفّذ بالتوازي** ما لا يعتمد على بعضه.
6. **جرّب نموذجًا أصغر** للمهام البسيطة مع قياس الجودة على عيّنة ثابتة.

## طريقة التحقق
قارن الوسيط والمئين ٩٥ قبل كل تغيير وبعده على المجموعة نفسها من الطلبات، وغيّر متغيرًا واحدًا في كل مرة.

## حدود الثقة
هذه قائمة أسباب شائعة لا تشخيصًا لتطبيقك؛ الترتيب الفعلي تحدده قياساتك.`,
  },
  {
    id: "bug",
    re: /(خطأ|استثناء|لا يعمل|يتعطل|ينهار|error|exception|bug|traceback|null|undefined|crash|broken|does ?n[o']?t work)/i,
    body: `## ملخص المشكلة
سلوك غير متوقع أو خطأ في الشفرة. دون الشفرة ورسالة الخطأ الكاملة لا يمكن تحديد السبب.

## المعلومات الناقصة
- نص رسالة الخطأ كاملًا مع تتبّع المكدّس.
- أصغر شفرة تعيد إنتاج المشكلة.
- المدخل الذي يسبّبها، والسلوك المتوقع مقابل الفعلي.

## خطوات التشخيص
1. **أعد إنتاج الخطأ** بمدخل ثابت؛ ما لا يُعاد إنتاجه لا يُثبَت إصلاحه.
2. **اقرأ أول سطر في التتبّع يخصّ شفرتك** لا شفرة المكتبات.
3. **اطبع أو افحص القيم** عند ذلك السطر: النوع، الفراغ، الحدود.
4. **نصّف المشكلة**: عطّل نصف المسار وحدّد أي النصفين يحوي الخلل.
5. **اكتب اختبارًا يفشل** بسبب الخطأ قبل تعديل أي شيء.

## طريقة التحقق
الاختبار الجديد ينجح بعد الإصلاح، وبقية الاختبارات لم تتأثر.

## حدود الثقة
هذه منهجية عامة؛ التشخيص الفعلي يحتاج الشفرة والرسالة.`,
  },
  {
    id: "architecture",
    re: /(بنية|معمار|توسع|توسّع|خدمات مصغ|قاعدة بيانات|تصميم النظام|architecture|scal|microservice|monolith|database|system design)/i,
    body: `## ملخص المشكلة
قرار معماري يحتاج موازنة بين التعقيد والتوسع والاعتمادية.

## المعلومات الناقصة
- الحمل الحالي والمتوقع (طلبات في الثانية، حجم البيانات).
- هدف التوفر وزمن الاستجابة المقبول.
- حجم الفريق وخبرته التشغيلية.

## البدائل ومقايضاتها
- **إبقاء البنية الحالية مع تحسين الاختناق**: أقل مخاطرة، ويؤجل التعقيد؛ قد لا يكفي عند نمو كبير.
- **فصل مكوّن واحد محدد**: يعزل الحمل والأعطال؛ يضيف شبكة ونشرًا ومراقبة.
- **إعادة تصميم شاملة**: مرونة أعلى نظريًا؛ أعلى كلفة ومخاطرة، وغالبًا غير مبررة قبل ثبوت الحاجة بالأرقام.

## الخطوات المقترحة
1. حدّد الاختناق بالقياس لا بالحدس.
2. اختر أصغر تغيير يزيله.
3. نفّذه خلف مفتاح تبديل مع خطة تراجع.

## حدود الثقة
لا توصية محددة دون الأرقام أعلاه.`,
  },
  {
    id: "security",
    re: /(أمن|ثغر|اختراق|تشفير|مصادقة|صلاحيات|security|auth|vulnerab|encrypt|threat|login)/i,
    body: `## ملخص المشكلة
مراجعة أمنية دفاعية لنظام تملكه أو مصرَّح لك بفحصه.

## المعلومات الناقصة
- الأصول المطلوب حمايتها ومن يصل إليها.
- حدود الثقة: ما المدخلات القادمة من خارج النظام؟

## قائمة فحص أولية
1. **المصادقة والجلسات**: كلمات مرور مجزّأة بخوارزمية بطيئة، ملفات ارتباط بخصائص HttpOnly وSecure.
2. **التفويض**: تحقّق من ملكية المورد في كل طلب، لا في الواجهة فقط.
3. **المدخلات**: استعلامات مُعدّة، وترميز المخرجات، وحدود للحجم.
4. **الأسرار**: خارج الشفرة والمستودع، وتدويرها عند الشك.
5. **السجلات**: أحداث أمنية دون بيانات شخصية أو أسرار.

## طريقة التحقق
اختبار لكل ضابط يحاول تجاوزه ويتوقع الرفض.

## حدود الثقة
قائمة عامة لا تغني عن مراجعة مختص لنظامك الفعلي.`,
  },
  {
    id: "plan",
    re: /(خطة|مراحل|جدول|مشروع تخرج|متطلبات|roadmap|plan|milestone|schedule|requirements|graduation project)/i,
    body: `## الهدف ومعيار النجاح
حدّد جملة واحدة تصف ما يجب أن يعمل في النهاية وكيف سيُفحص.

## أصغر نسخة قابلة للإثبات
مسار واحد كامل من البداية إلى النهاية، ولو بأبسط تنفيذ لكل خطوة. يُبنى أولًا ويُختبر قبل أي توسّع.

## المراحل المقترحة
1. **التثبيت**: المتطلبات، البيانات، البيئة. المخرج: مستودع يعمل محليًا.
2. **المسار الأساسي**: الوظيفة المركزية كاملة. المخرج: عرض حي للمسار.
3. **التقييم**: مقاييس واختبارات. المخرج: تقرير نتائج قابل للتكرار.
4. **التوسّع**: ميزات ثانوية بحسب الوقت المتبقي.
5. **التوثيق والعرض**.

## المخاطر
- توزيع الجهد على ميزات كثيرة غير مكتملة.
- اعتماد على خدمة خارجية لم تُختبر مبكرًا.

## حدود الثقة
المدد الزمنية تعتمد على الفريق والخبرة ولم تُذكر.`,
  },
  {
    id: "research",
    re: /(بحث|فرضية|منهجية|ورقة|دراسة|research|hypothes|methodolog|thesis|study)/i,
    body: `## السؤال البحثي
صُغه بحيث يمكن الإجابة عنه ببيانات: ما المتغير الذي تغيّره، وما الذي تقيسه؟

## الفرضية
عبارة قابلة للدحض، مع تحديد النتيجة التي ستجعلها خاطئة.

## المنهجية
- خط أساس واضح للمقارنة.
- متغير واحد يتغيّر في كل تجربة.
- مجموعة تقييم معزولة عن بيانات التطوير.

## تهديدات الصدق
تسرّب البيانات، صغر العيّنة، اختيار المقياس بعد رؤية النتائج.

## ما يجب البحث عنه
لا يذكر هذا المحرك مراجع. ابحث في قواعد البيانات العلمية بالكلمات المفتاحية لموضوعك وتحقق من كل مصدر بنفسك.`,
  },
];

const GENERAL = `## ملخص
لم يطابق سؤالك أيًّا من الموضوعات التي يغطيها المحرك التجريبي (أداء تطبيقات النماذج اللغوية، تشخيص الأخطاء، البنية، الأمن، التخطيط، البحث).

## منهجية عامة لتحليل مشكلة تقنية
1. **حدّد المشكلة بدقة**: ما المتوقع وما الحاصل؟ ومتى بدأ؟
2. **اجمع الأدلة** قبل افتراض السبب: سجلات، قياسات، خطوات إعادة الإنتاج.
3. **اكتب الفرضيات** ورتّبها بكلفة اختبارها.
4. **اختبر فرضية واحدة** في كل مرة.
5. **تحقّق من الحل** بمعيار محدد سلفًا.

## حدود الثقة
هذه إجابة عامة لا تحليلًا لسؤالك.`;

const FOLLOW_UP = `المحرك التجريبي لا يتابع سياق المحادثة: يصنّف كل رسالة منفردة بكلمات مفتاحية. للحصول على متابعة حقيقية اختر نموذجًا لغويًا مهيّأً من قائمة النماذج.

يمكنك في الأثناء طلب **مراجعة نقدية** للإجابة السابقة، أو حفظ الاستشارة.`;

const FOOTER = "\n\n---\n*إجابة من المحرك التجريبي لهسّارة: قالب ثابت اختير بمطابقة كلمات مفتاحية، وليس مخرجات نموذج ذكاء اصطناعي.*";

const GENERAL_EN = `## Summary
Your question did not match any of the topics the demo engine covers (performance of language-model applications, debugging, architecture, security, planning, research).

## A general method for analysing a technical problem
1. **Define the problem precisely**: what is expected, what happens, and since when?
2. **Gather evidence** before assuming a cause: logs, measurements, steps to reproduce.
3. **Write down hypotheses** and order them by the cost of testing them.
4. **Test one hypothesis** at a time.
5. **Verify the solution** against a criterion set in advance.

## Limits of confidence
This is a general answer, not an analysis of your question.`;

const FOLLOW_UP_EN = `The demo engine does not follow the conversation's context: it classifies each message on its own by keywords. For a real follow-up, choose a configured language model from the list of models.

Meanwhile you can request a **critical review** of the previous answer, or save the consultation.`;

const FOOTER_EN = "\n\n---\n*An answer from HESSARA's demo engine: a fixed template chosen by keyword matching, not the output of an AI model.*";

export function demoAnswer(system: string, userTurns: string[]): string {
  // لغة الإجابة تتبع لغة تعليمات النظام، وهي لغة الواجهة عند الإرسال.
  const ar = /[\u0600-\u06FF]/.test(system);
  const last = userTurns[userTurns.length - 1] ?? "";
  if (userTurns.length > 1 && last.length < 160) return ar ? FOLLOW_UP + FOOTER : FOLLOW_UP_EN + FOOTER_EN;
  const topic = TOPICS.find((t) => t.re.test(last));
  const agentId = system.match(/(?:معرّف الوكيل|Agent id): (\w+)/)?.[1];
  const agent = agentById(agentId, ar ? "ar" : "en");
  let out = topic ? (ar ? topic.body : EN_BODY[topic.id] ?? topic.body) : ar ? GENERAL : GENERAL_EN;
  if (agent) {
    out = (ar
      ? `> **${agent.name}** (وضع تجريبي). مع نموذج لغوي حقيقي تُنظَّم الإجابة تحت: ${agent.sections.join("، ")}.\n\n`
      : `> **${agent.name}** (demo mode). With a real language model the answer is organised under: ${agent.sections.join("; ")}.\n\n`) + out;
  }
  return out + (ar ? FOOTER : FOOTER_EN);
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(t); resolve(); }, { once: true });
  });

export const demoAdapter: ProviderAdapter = {
  async *stream(req: StreamRequest) {
    const text = demoAnswer(req.system, req.messages.filter((m) => m.role === "user").map((m) => m.content));
    const delay = process.env.HESSARA_DEMO_DELAY_MS ? Number(process.env.HESSARA_DEMO_DELAY_MS) : 12;
    const parts = text.match(/\S+\s*/g) ?? [text];
    for (let i = 0; i < parts.length; i += 3) {
      if (req.signal?.aborted) return;
      yield parts.slice(i, i + 3).join("");
      if (delay) await sleep(delay, req.signal);
    }
  },
};
