import { redirect } from "next/navigation";
import { currentUser } from "./auth";

/** للصفحات التي تتطلب حسابًا: يعيد المستخدم أو يحوّل إلى صفحة الدخول مع حفظ الوجهة. */
export async function requireUser(next: string) {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
