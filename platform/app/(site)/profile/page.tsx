import type { Metadata } from "next";
import { ProfileClient } from "@/components/ProfileClient";
import { AppPage } from "@/components/site/Page";
import { requireUser } from "@/lib/guard";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("الملف الشخصي", "Profile") };
}

export default async function ProfilePage() {
  await requireUser("/profile");
  const t = await getT();
  return (
    <AppPage eyebrow={t("حسابك", "Your account")} title={t("الملف الشخصي والإعدادات", "Profile & Settings")} narrow>
      <ProfileClient />
    </AppPage>
  );
}
