import type { Metadata } from "next";
import { PAGES } from "@/content/pages";
import { ProsePage } from "@/components/site/ProsePage";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const d = PAGES.about[lang];
  return pageMeta(lang, d.title, d.description, "/about");
}

export default async function Page() {
  const lang = await getLang();
  return <ProsePage doc={PAGES.about[lang]} lang={lang} />;
}
