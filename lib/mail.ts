// بريد التواصل يُركَّب عند الطلب: جزءان مقلوبان يجمعهما @، فلا يوجد العنوان كاملًا في الشيفرة ولا في أي صفحة.
// يستعمله زر البريد (components/site/Mail.tsx)، ويختبر شكلَه tests/content.test.mjs دون أن يذكر العنوان.
const PARTS = ["as.inarhazla.asseh", "moc.liamg"] as const;
const rev = (s: string) => [...s].reverse().join("");

export const mailHref = (subject: string) => `mailto:${rev(PARTS[0])}@${rev(PARTS[1])}?subject=${encodeURIComponent(subject)}`;
