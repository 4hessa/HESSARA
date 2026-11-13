import type { Metadata } from "next";
import { PAGES } from "@/content/pages";
import { ProsePage } from "@/components/site/ProsePage";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const d = PAGES.careers[lang];
  return pageMeta(lang, d.title, d.description, "/careers");
}

export default async function Page() {
  const lang = await getLang();
  return <ProsePage doc={PAGES.careers[lang]} lang={lang} />;
}
