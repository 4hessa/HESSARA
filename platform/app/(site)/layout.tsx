import { EyeRest } from "@/components/EyeRest";
import { Nav } from "@/components/site/Nav";
import { getT } from "@/lib/i18n-server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <>
      <a className="skip" href="#main">{t("تخطَّ إلى المحتوى", "Skip to content")}</a>
      <div className="page">
        <Nav />
        <main id="main">{children}</main>
      </div>
      <EyeRest />
    </>
  );
}
