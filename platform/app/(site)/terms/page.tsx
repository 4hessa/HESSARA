import type { Metadata } from "next";
import { PAGES } from "@/content/pages";
import { ProsePage } from "@/components/site/ProsePage";
import { getLang } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const d = PAGES.terms[await getLang()];
  return { title: d.title, description: d.description };
}

export default async function Page() {
  const lang = await getLang();
  return <ProsePage doc={PAGES.terms[lang]} lang={lang} />;
}
