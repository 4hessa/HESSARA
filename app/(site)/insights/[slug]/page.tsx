import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INSIGHTS } from "@/content/insights";
import { ProsePage } from "@/components/site/ProsePage";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

type P = { params: Promise<{ slug: string }> };
async function find(p: P) {
  const { slug } = await p.params;
  return INSIGHTS.find((e) => e.slug === slug);
}

export async function generateMetadata(p: P): Promise<Metadata> {
  const e = await find(p);
  if (!e) return {};
  const lang = await getLang();
  const d = e[lang];
  return pageMeta(lang, d.title, d.description, `/insights/${e.slug}`);
}

export default async function InsightPage(p: P) {
  const e = await find(p);
  if (!e) notFound();
  const lang = await getLang();
  return <ProsePage doc={e[lang]} lang={lang} section="insights" />;
}
