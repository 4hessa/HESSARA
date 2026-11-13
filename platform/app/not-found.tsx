import Link from "next/link";
import { Logo } from "@/components/bits";

export default function NotFound() {
  return (
    <main className="container" style={{ minHeight: "100dvh", display: "grid", placeContent: "center", justifyItems: "center", gap: 24, textAlign: "center" }}>
      <Logo large />
      <h1 className="t-h2">الصفحة غير موجودة</h1>
      <p className="muted">ربما حُذفت الاستشارة أو أن الرابط غير صحيح.</p>
      <Link className="btn btn-primary" href="/">العودة إلى الرئيسية</Link>
    </main>
  );
}
