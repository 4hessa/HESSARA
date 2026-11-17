// بيانات تقرير الاستشارة: الاستشارة ورسائلها والمراجعات المرتبطة بها. يستخدمها تقرير صاحب الاستشارة ورابط المشاركة.
import { all, get, type ConsultRow, type MessageRow, type ReviewRow } from "./db";

export type ReportData = { c: ConsultRow; messages: MessageRow[]; reviews: ReviewRow[] };

export async function loadReport(consultationId: string, userId?: string): Promise<ReportData | null> {
  const c = userId
    ? await get<ConsultRow>("SELECT * FROM consultations WHERE id = ? AND user_id = ?", consultationId, userId)
    : await get<ConsultRow>("SELECT * FROM consultations WHERE id = ?", consultationId);
  if (!c) return null;
  const messages = await all<MessageRow>("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at, id", c.id);
  const reviews = await all<ReviewRow>("SELECT * FROM reviews WHERE consultation_id = ? ORDER BY created_at, id", c.id);
  return { c: { ...c }, messages: messages.map((m) => ({ ...m })), reviews: reviews.map((r) => ({ ...r })) };
}

/** رمز المشاركة صالح الشكل قبل أي استعلام. */
export const validShareToken = (t: string) => /^[A-Za-z0-9_-]{20,64}$/.test(t);
