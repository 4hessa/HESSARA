import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { MediaClient } from "@/components/MediaClient";
import { currentUser } from "@/lib/auth";
import { CATEGORIES, TARGET_TOTAL, VIDEOS } from "@/lib/catalog/videos";
import { all } from "@/lib/db";

export const metadata: Metadata = { title: "ميديا هسّارة" };

export default async function MediaPage() {
  const user = await currentUser();
  const saved = user ? all<{ ref: string }>("SELECT ref FROM favorites WHERE user_id = ? AND kind = 'video'", user.id).map((f) => f.ref) : [];
  const remaining = TARGET_TOTAL - VIDEOS.length;
  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="t-h2">ميديا هسّارة</h1>
        <p className="muted" style={{ maxWidth: "72ch" }}>مكتبة فيديوهات تعليمية من يوتيوب، تفتح كلها في مصدرها الأصلي. لا يُنشر فيديو هنا إلا بعد التحقق آليًا من وجوده عبر واجهة التضمين الرسمية ليوتيوب. عدد المشاهدات المعروض هو ما أظهره يوتيوب يوم التحقق، وهو مؤشر مساعد لا دليل على الجودة. المستوى تقدير آلي من العنوان، ولم تُراجَع الفيديوهات بالمشاهدة الكاملة.</p>
      </div>
      <details className="card" style={{ marginBottom: "var(--s-5)" }} open={VIDEOS.length === 0}>
        <summary style={{ cursor: "pointer" }}><strong>حالة اكتمال المكتبة: {VIDEOS.length} من {TARGET_TOTAL} فيديو متحقق منه</strong>{remaining > 0 && <span className="muted"> — المتبقي {remaining}</span>}</summary>
        <table className="t-small" style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead><tr style={{ textAlign: "start" }}><th style={{ textAlign: "start", padding: "6px 0" }}>المجال</th><th style={{ textAlign: "start" }}>المتحقق منه</th><th style={{ textAlign: "start" }}>الهدف</th></tr></thead>
          <tbody>{CATEGORIES.map((c) => (
            <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}><td style={{ padding: "6px 0" }}>{c.name}</td><td>{VIDEOS.filter((v) => v.category === c.id).length}</td><td>{c.target}</td></tr>
          ))}</tbody>
        </table>
      </details>
      {VIDEOS.length === 0 ? (
        <div className="empty"><Icon name="media" size={28} />
          <p style={{ maxWidth: "60ch" }}>لا فيديوهات منشورة بعد. شغّل سكربت التحقق لنشر المرشّحين. لن تُعرض روابط غير متحقق منها.</p></div>
      ) : <MediaClient videos={VIDEOS} saved={saved} />}
    </div>
  );
}
