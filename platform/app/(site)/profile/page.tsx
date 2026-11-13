import type { Metadata } from "next";
import { ProfileClient } from "@/components/ProfileClient";
import { requireUser } from "@/lib/guard";

export const metadata: Metadata = { title: "الملف الشخصي" };

export default async function ProfilePage() {
  await requireUser("/profile");
  return (
    <div className="container page">
      <div className="page-head"><h1 className="t-h2">الملف الشخصي والإعدادات</h1></div>
      <ProfileClient />
    </div>
  );
}
