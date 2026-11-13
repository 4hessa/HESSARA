import type { MetadataRoute } from "next";
import { INSIGHTS } from "@/content/insights";
import { RESOURCES } from "@/content/resources";
import { SITE } from "@/lib/site";

// الصفحات العامة فقط (لا صفحات الحساب)، كما كانت خريطة الموقع المرجعي تستثني 404.
const PATHS = [
  "/", "/platform", "/models", "/consulting", "/insights", "/resources",
  ...INSIGHTS.map((e) => `/insights/${e.slug}`), ...RESOURCES.map((e) => `/resources/${e.slug}`),
  "/agents", "/media", "/about", "/careers", "/programs", "/contact", "/help", "/privacy", "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE) return [];
  return PATHS.map((p) => ({ url: `${SITE}${p === "/" ? "" : p}` }));
}
