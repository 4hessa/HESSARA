import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// كما في الموقع المرجعي: الزحف مسموح، ويُذكر رابط خريطة الموقع حين يُعرف العنوان العام.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(SITE ? { sitemap: `${SITE}/sitemap.xml` } : {}),
  };
}
