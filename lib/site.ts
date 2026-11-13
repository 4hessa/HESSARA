// العنوان العام للموقع (روابط المشاركة، الرابط القانوني، خريطة الموقع): SITE_URL صراحةً، أو عنوان الإنتاج
// الذي يضبطه Vercel تلقائيًا. دون أيٍّ منهما تُحذف هذه الروابط بدل أن تشير إلى عنوان خاطئ (كما في الموقع المرجعي).
export const SITE = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
