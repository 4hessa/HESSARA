import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge, VendorMark } from "@/components/bits";
import { FlowArt } from "@/components/FlowArt";
import { Icon } from "@/components/Icon";
import { LandingPreview } from "@/components/LandingPreview";
import { QuickConsult } from "@/components/QuickConsult";
import { ReviewView } from "@/components/Review";
import { Footer } from "@/components/Shell";
import { currentUser } from "@/lib/auth";
import { AGENTS } from "@/lib/catalog/agents";
import { TARGET_TOTAL, VIDEOS, videoThumb, videoUrl } from "@/lib/catalog/videos";
import { listModels } from "@/lib/providers";
import { heuristicReview } from "@/lib/review/heuristic";

const EXAMPLES = ["تطبيقي المعتمد على نموذج لغوي بطيء", "راجِع خطة مشروع التخرج", "هل أفصل الخدمة عن التطبيق الأحادي؟"];
const BEFORE = "لتسريع التطبيق انقل قاعدة البيانات إلى خادم أكبر واستبدل النموذج بنموذج أصغر. هذا سيحل المشكلة دائمًا وسيجعل الاستجابة أسرع بنسبة 50%.";
const AFTER = "قبل أي تغيير: قِس زمن كل مرحلة لتحديد الاختناق. إن كان التوليد هو الأبطأ فجرّب نموذجًا أصغر على جزء من المستخدمين وقارن الجودة والزمن بخط الأساس. خطة التراجع: مفتاح تبديل يعيد النموذج السابق. الافتراض غير المتحقق منه: أن قاعدة البيانات ليست هي الاختناق.";

export default async function Landing() {
  if (await currentUser()) redirect("/home");
  const models = listModels();
  const featured = ["claude-opus-5-5", "gpt", "gemini"].map((id) => models.find((m) => m.id === id)!);
  const before = heuristicReview("risk", BEFORE, []);
  const after = heuristicReview("risk", AFTER, []);
  const videos = VIDEOS.slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">من المشكلة إلى الحل، بمساعدة الذكاء الاصطناعي</p>
            <h1 className="t-display">مشكلة معقدة؟ مستشارك الذكي أقرب مما تتوقع.</h1>
            <p className="t-lead">استكشف نماذج الذكاء الاصطناعي والوكلاء المتخصصين، واحصل على تحليل واضح وحلول عملية، وراجع الإجابات قبل اتخاذ قراراتك.</p>
            <div className="row">
              <a href="#start" className="btn btn-primary">ابدأ استشارتك</a>
              <Link href="/agents" className="btn btn-secondary">استكشف الوكلاء</Link>
            </div>
            <div id="start"><QuickConsult examples={EXAMPLES} /></div>
          </div>
          <div className="hero-art" aria-hidden="false"><FlowArt /></div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="how">
        <div className="container">
          <div className="section-head"><p className="eyebrow">كيف تعمل هسّارة؟</p><h2 id="how" className="t-h2">ثلاث خطوات من السؤال إلى خطة قابلة للتحقق</h2></div>
          <ol className="grid-3 steps">
            {[
              ["consult", "اشرح مشكلتك", "اكتب ما تواجهه وحدّد المجال المطلوب. كلما زادت التفاصيل قلّ التخمين."],
              ["agents", "اختر مستشارك", "اختر النموذج أو الوكيل المتخصص المناسب، وترى دائمًا من كتب كل إجابة."],
              ["lab", "احصل على التحليل وراجِعه", "اقرأ الأسباب والخطوات، ثم اطلب مراجعة نقدية مستقلة تكشف الثغرات والمخاطر."],
            ].map(([icon, title, body], i) => (
              <li key={title} className="card step">
                <div className="row-between"><span className="icon-tile"><Icon name={icon} /></span><span className="step-num">0{i + 1}</span></div>
                <h3 className="t-h3">{title}</h3><p className="muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="models">
        <div className="container">
          <div className="row-between" style={{ alignItems: "end", marginBottom: "var(--s-6)" }}>
            <div className="section-head" style={{ marginBottom: 0 }}><p className="eyebrow">النماذج الذكية</p><h2 id="models" className="t-h2">اختر النموذج، واعرف حالته الحقيقية</h2>
              <p className="muted">الحالة المعروضة تُحسب من إعدادات الخادم الفعلية: لا يُعرض نموذج متاحًا ما لم يكن متصلًا.</p></div>
            <Link href="/models" className="link">كل النماذج</Link>
          </div>
          <div className="grid-3">
            {featured.map((m) => (
              <article key={m.id} className="card">
                <div className="row-between"><VendorMark vendorKey={m.vendorKey} /><StatusBadge model={m} /></div>
                <h3 className="t-h3"><bdi>{m.name}</bdi></h3>
                <p className="t-caption">المزوّد: <bdi>{m.vendor}</bdi></p>
                <p className="muted t-small">{m.description}</p>
                <div className="chips">{m.tasks.map((t) => <span key={t} className="badge">{t}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="agents">
        <div className="container">
          <div className="section-head"><p className="eyebrow">الوكلاء المتخصصون</p><h2 id="agents" className="t-h2">وكيل لكل نوع من المشكلات</h2>
            <p className="muted">لكل وكيل تعليمات تخصصية، ونموذج إدخال يطلب المعلومات اللازمة لمجاله، وبنية إجابة مختلفة، ونمط مراجعة افتراضي.</p></div>
          <div className="grid-3">
            {AGENTS.map((a) => (
              <Link key={a.id} href={`/agents#${a.id}`} className="card card-link">
                <span className="icon-tile"><Icon name={a.icon} /></span>
                <h3 className="t-h3">{a.name}</h3><p className="muted t-small">{a.scope}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="lab">
        <div className="container">
          <div className="section-head"><p className="eyebrow">مختبر النقد والتقييم</p><h2 id="lab" className="t-h2">لا تعتمد على إجابة لم تُراجَع</h2>
            <p className="muted">المثال التالي حقيقي: النصان فُحصا للتو بنمط «محلل المخاطر» في المراجع القاعدي للمنصة، والنتائج المعروضة هي مخرجاته الفعلية.</p></div>
          <div className="compare">
            <div className="card"><span className="badge badge-danger">قبل المراجعة — {before.findings.length} ملاحظات</span><p className="quote">{BEFORE}</p><ReviewView result={{ ...before, strengths: [], limits: [] , needsHuman: false }} /></div>
            <div className="compare-arrow"><Icon name="arrow" size={28} /></div>
            <div className="card"><span className="badge badge-ok">بعد التنقيح — {after.findings.length} ملاحظات</span><p className="quote">{AFTER}</p><ReviewView result={{ ...after, limits: [], needsHuman: false }} /></div>
          </div>
          <p className="t-caption" style={{ marginTop: "var(--s-4)" }}>المراجع القاعدي يكشف غياب عناصر بنيوية ولا يتحقق من صحة المعلومات. عند تهيئة نموذج لغوي تُجرى المراجعة به وفق المعايير نفسها.</p>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="try">
        <div className="container">
          <div className="section-head"><p className="eyebrow">تجربة المنصة</p><h2 id="try" className="t-h2">جرّب المسار كاملًا هنا</h2>
            <p className="muted">واجهة حية تتصل بخادم هسّارة: أرسل سؤالًا تجريبيًا، استقبل الرد مبثوثًا، ثم شغّل المراجعة النقدية.</p></div>
          <LandingPreview />
        </div>
      </section>

      <section className="section" aria-labelledby="media">
        <div className="container">
          <div className="row-between" style={{ alignItems: "end", marginBottom: "var(--s-6)" }}>
            <div className="section-head" style={{ marginBottom: 0 }}><p className="eyebrow">ميديا هسّارة</p><h2 id="media" className="t-h2">مكتبة تعليمية من مصادرها الأصلية</h2></div>
            <Link href="/media" className="link">افتح المكتبة</Link>
          </div>
          {videos.length ? (
            <div className="grid-3">
              {videos.map((v) => (
                <a key={v.id} href={videoUrl(v.id)} target="_blank" rel="noopener noreferrer" className="card card-link">
                  <div className="video-thumb"><img src={videoThumb(v.id)} alt="" loading="lazy" width={480} height={270} /></div>
                  <h3 className="t-h4" dir="auto">{v.title}</h3><p className="t-caption" dir="auto">{v.channel} · يوتيوب</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty"><Icon name="media" size={28} /><p>لم يُنشر أي فيديو بعد. تُعرض هنا فقط الفيديوهات التي جرى التحقق من روابطها آليًا، والهدف {TARGET_TOTAL} فيديو.</p><Link href="/media" className="link">تفاصيل حالة المكتبة</Link></div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
