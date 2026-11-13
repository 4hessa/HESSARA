// للعناوين التي لا تطابق أي مسار: تُعرض خارج تخطيط (site) فتحتاج الشريط والهيكل بنفسها.
import { Nav } from "@/components/site/Nav";
import { NotFoundView } from "@/components/site/NotFoundView";
import { getLang } from "@/lib/i18n-server";

export default async function NotFound() {
  const lang = await getLang();
  return (
    <>
      <a className="skip" href="#main">{lang === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}</a>
      <div className="page">
        <Nav />
        <main id="main"><NotFoundView lang={lang} /></main>
      </div>
    </>
  );
}
