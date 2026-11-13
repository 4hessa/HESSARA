import type { Metadata } from "next";
import { PAGES } from "@/content/pages";
import { ProsePage } from "@/components/site/ProsePage";
import { getLang } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const d = PAGES.programs[await getLang()];
  return { title: d.title, description: d.description };
}

export default async function Page() {
  const lang = await getLang();
  return <ProsePage doc={PAGES.programs[lang]} lang={lang} />;
}
