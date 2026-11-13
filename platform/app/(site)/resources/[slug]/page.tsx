import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESOURCES } from "@/content/resources";
import { ProsePage } from "@/components/site/ProsePage";
import { getLang } from "@/lib/i18n-server";

type P = { params: Promise<{ slug: string }> };
async function find(p: P) {
  const { slug } = await p.params;
  return RESOURCES.find((e) => e.slug === slug);
}

export async function generateMetadata(p: P): Promise<Metadata> {
  const e = await find(p);
  if (!e) return {};
  const d = e[await getLang()];
  return { title: d.title, description: d.description };
}

export default async function ResourcePage(p: P) {
  const e = await find(p);
  if (!e) notFound();
  const lang = await getLang();
  return <ProsePage doc={e[lang]} lang={lang} section="resources" />;
}
