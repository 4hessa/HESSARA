import { redirect } from "next/navigation";
import { currentUser } from "./auth";

/**
 * للصفحات التي تتطلب حسابًا: يعيد المستخدم أو يحوّل إلى صفحة الدخول مع حفظ الوجهة.
 * signup: لمسار «ابدأ استشارة»، فمن يصل إليه دون حساب زائر جديد في الغالب، فيرى إنشاء الحساب لا «مرحبًا بعودتك».
 */
export async function requireUser(next: string, opts: { signup?: boolean } = {}) {
  const user = await currentUser();
  if (!user) redirect(`/login?${opts.signup ? "mode=signup&" : ""}next=${encodeURIComponent(next)}`);
  return user;
}
