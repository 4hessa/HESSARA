// مقارنة كلمة-بكلمة بخوارزمية أطول تتابع مشترك (LCS).
export type DiffPart = { type: "same" | "add" | "del"; text: string };

const tokenize = (s: string): string[] => s.match(/\s+|[^\s]+/g) ?? [];

const MAX_CELLS = 6_000_000; // ≈ ٢٤ ميغابايت كحد أقصى

export function diffWords(a: string, b: string): DiffPart[] {
  let A = tokenize(a);
  let B = tokenize(b);
  // للنصوص الطويلة جدًا ننتقل إلى مقارنة الأسطر لضبط الكلفة.
  if (A.length * B.length > MAX_CELLS) {
    A = a.split(/(?<=\n)/);
    B = b.split(/(?<=\n)/);
  }
  // سقف صارم لحجم الجدول: مدخلان كثيرا الأسطر كانا سيحجزان مئات الميغابايت على الخادم.
  if (A.length * B.length > MAX_CELLS)
    return a === b ? [{ type: "same", text: a }] : [{ type: "del", text: a }, { type: "add", text: b }];
  const n = A.length, m = B.length;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const out: DiffPart[] = [];
  const push = (type: DiffPart["type"], text: string) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += text;
    else out.push({ type, text });
  };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { push("same", A[i]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) push("del", A[i++]);
    else push("add", B[j++]);
  }
  while (i < n) push("del", A[i++]);
  while (j < m) push("add", B[j++]);
  return out;
}
