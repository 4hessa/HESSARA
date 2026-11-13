import { cookies } from "next/headers";
import { EyeRest } from "@/components/EyeRest";
import { Header } from "@/components/Shell";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const t = (await cookies()).get("hs_theme")?.value;
  return (
    <>
      <Header theme={t === "dark" || t === "light" ? t : null} />
      <main id="main" className="main">{children}</main>
      <EyeRest />
    </>
  );
}
