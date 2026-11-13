import type { Metadata } from "next";
import { ModelsClient } from "@/components/ModelsClient";
import { currentUser } from "@/lib/auth";
import { all } from "@/lib/db";

export const metadata: Metadata = { title: "النماذج" };

export default async function ModelsPage() {
  const user = await currentUser();
  const favs = user ? (await all<{ ref: string }>("SELECT ref FROM favorites WHERE user_id = ? AND kind = 'model'", user.id)).map((f) => f.ref) : [];
  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="t-h2">النماذج</h1>
        <p className="muted" style={{ maxWidth: "70ch" }}>مكتبة النماذج التي تدعمها بنية هسّارة. حالة كل نموذج تُقرأ من إعدادات الخادم لحظة فتح الصفحة: «غير مهيّأ» تعني أن مفتاح الخدمة أو اسم الإصدار غير مضبوط، فلا يمكن اختياره للمحادثة.</p>
      </div>
      <ModelsClient favs={favs} />
    </div>
  );
}
