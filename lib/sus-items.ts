// مقياس سهولة الاستخدام المعياري (System Usability Scale)، وضعه John Brooke عام 1986: عشر عبارات، لكل منها
// خمس درجات من 1 (أعارض بشدة) إلى 5 (أوافق بشدة). الدرجة: العبارات الفردية (الإيجابية) تُحسب (الإجابة − 1)،
// والزوجية (السلبية) (5 − الإجابة)، ثم يُضرب المجموع في 2.5 فتكون بين 0 و100. هي درجة للمقارنة، لا نسبة مئوية.
// النص الإنجليزي هو العبارات الأصلية مع وضع اسم المنصة مكان "this system". النص العربي ترجمة المنصة، وليس
// نسخة عربية محكّمة منشورة؛ يُذكر هذا في أي تقرير يستخدم النتائج.
// هذا الملف بلا قاعدة بيانات، فيستورده المتصفح أيضًا.

export const SUS_ITEMS: { ar: string; en: string }[] = [
  { ar: "أظن أنني سأرغب في استخدام هسّارة كثيرًا.", en: "I think that I would like to use HESSARA frequently." },
  { ar: "وجدتُ هسّارة معقّدة دون داعٍ.", en: "I found HESSARA unnecessarily complex." },
  { ar: "وجدتُ هسّارة سهلة الاستخدام.", en: "I thought HESSARA was easy to use." },
  { ar: "أظن أنني سأحتاج إلى مساعدة شخص تقني لأتمكن من استخدام هسّارة.", en: "I think that I would need the support of a technical person to be able to use HESSARA." },
  { ar: "وجدتُ وظائف هسّارة المختلفة متكاملة بشكل جيد.", en: "I found the various functions in HESSARA were well integrated." },
  { ar: "وجدتُ في هسّارة قدرًا كبيرًا من عدم الاتساق.", en: "I thought there was too much inconsistency in HESSARA." },
  { ar: "أتوقع أن معظم الناس سيتعلمون استخدام هسّارة بسرعة كبيرة.", en: "I would imagine that most people would learn to use HESSARA very quickly." },
  { ar: "وجدتُ هسّارة مرهقة جدًا في الاستخدام.", en: "I found HESSARA very cumbersome to use." },
  { ar: "شعرتُ بثقة كبيرة وأنا أستخدم هسّارة.", en: "I felt very confident using HESSARA." },
  { ar: "احتجتُ إلى تعلّم أشياء كثيرة قبل أن أتمكن من البدء في استخدام هسّارة.", en: "I needed to learn a lot of things before I could get going with HESSARA." },
];

export function validAnswers(a: unknown): a is number[] {
  return Array.isArray(a) && a.length === 10 && a.every((v) => Number.isInteger(v) && v >= 1 && v <= 5);
}

/** درجة المقياس من 0 إلى 100، أو null إن كانت الإجابات ناقصة أو خارج المدى. */
export function susScore(a: unknown): number | null {
  if (!validAnswers(a)) return null;
  return a.reduce((s, v, i) => s + (i % 2 === 0 ? v - 1 : 5 - v), 0) * 2.5;
}
