import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { MediaClient } from "@/components/MediaClient";
import { AppPage } from "@/components/site/Page";
import { currentUser } from "@/lib/auth";
import { CATEGORIES, TARGET_TOTAL, VIDEOS } from "@/lib/catalog/videos";
import { all } from "@/lib/db";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = makeT(lang);
  return pageMeta(lang, t("ميديا هسّارة", "HESSARA Media"), t("مكتبة فيديوهات تعليمية في الذكاء الاصطناعي من مصادرها الأصلية، وكل رابط فيها مفحوص آليًا.", "A library of AI learning videos from their original sources, every link checked automatically."), "/media");
}

export default async function MediaPage() {
  const user = await currentUser();
  const lang = await getLang();
  const t = makeT(lang);
  const saved = user ? (await all<{ ref: string }>("SELECT ref FROM favorites WHERE user_id = ? AND kind = 'video'", user.id)).map((f) => f.ref) : [];
  const remaining = TARGET_TOTAL - VIDEOS.length;
  return (
    <AppPage
      art={{ name: "resources", kind: "fade", fade: { "--art-h": "26rem", "--f1": "30%", "--f2": "62%", "--f3": "100%" } }}
      top="15rem"
      eyebrow={t("مكتبة الفيديو", "Video Library")}
      title={t("ميديا هسّارة", "HESSARA Media")}
      copy={t("مكتبة فيديوهات تعليمية من يوتيوب، تفتح كلها في مصدرها الأصلي. لا يُنشر فيديو هنا إلا بعد التحقق آليًا من وجوده عبر واجهة التضمين الرسمية ليوتيوب. عدد المشاهدات المعروض هو ما أظهره يوتيوب يوم التحقق، وهو مؤشر مساعد لا دليل على الجودة. المستوى تقدير آلي من العنوان، ولم تُراجَع الفيديوهات بالمشاهدة الكاملة.",
        "A library of educational videos from YouTube, each opening at its original source. A video is published here only after its existence has been checked automatically through YouTube's official embed interface. The view count shown is what YouTube displayed on the day of the check: a helpful signal, not evidence of quality. The level is estimated automatically from the title; the videos have not been reviewed by watching them in full.")}
    >
      <details className="card" style={{ marginBottom: "1.5rem" }} open={VIDEOS.length === 0}>
        <summary style={{ cursor: "pointer" }}><strong>{t(`حالة اكتمال المكتبة: ${VIDEOS.length} من ${TARGET_TOTAL} فيديو متحقق منه`, `Library progress: ${VIDEOS.length} of ${TARGET_TOTAL} verified videos`)}</strong>{remaining > 0 && <span className="muted"> — {t(`المتبقي ${remaining}`, `${remaining} remaining`)}</span>}</summary>
        <div className="article" style={{ paddingTop: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">{t("المجال", "Field")}</th><th scope="col">{t("المتحقق منه", "Verified")}</th><th scope="col">{t("الهدف", "Target")}</th></tr></thead>
              <tbody>{CATEGORIES.map((c) => (
                <tr key={c.id}><td>{lang === "ar" ? c.name : c.en}</td><td>{VIDEOS.filter((v) => v.category === c.id).length}</td><td>{c.target}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </details>
      {VIDEOS.length === 0 ? (
        <div className="empty"><Icon name="media" size={28} />
          <p style={{ maxWidth: "60ch" }}>{t("لا فيديوهات منشورة بعد. شغّل سكربت التحقق لنشر المرشّحين. لن تُعرض روابط غير متحقق منها.", "No videos are published yet. Run the verification script to publish candidates. Unverified links will not be shown.")}</p></div>
      ) : <MediaClient videos={VIDEOS} saved={saved} />}
    </AppPage>
  );
}
