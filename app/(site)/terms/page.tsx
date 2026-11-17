import type { Metadata } from "next";
import { PAGES } from "@/content/pages";
import { ProsePage } from "@/components/site/ProsePage";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const d = PAGES.terms[lang];
  return pageMeta(lang, d.title, d.description, "/terms");
}

export default async function Page() {
  const lang = await getLang();
  return <ProsePage doc={PAGES.terms[lang]} lang={lang} />;
}
