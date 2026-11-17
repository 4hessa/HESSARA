import "server-only";
import { cookies, headers } from "next/headers";
import { LANG_COOKIE, makeT, negotiate, type Lang, type T } from "./i18n";

/** لغة الصفحة الحالية: ملف الارتباط أولًا، ثم Accept-Language، ثم العربية. */
export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (c === "ar" || c === "en") return c;
  return negotiate(null, (await headers()).get("accept-language"));
}

export async function getT(): Promise<T> {
  return makeT(await getLang());
}
