// بعض النماذج التي تُخدَم عبر واجهات متوافقة مع OpenAI (مثل Qwen و DeepSeek R1، ونماذج Ollama المحلية)
// تبثّ خطوات تفكيرها داخل نص الإجابة نفسه، في كتلة <think>…</think> في أوله. هذا المرشّح يحذف تلك الكتلة
// وحدها، ويتحمّل انقسام الوسمين بين دفعات البث. لا يمس وسمًا يظهر في وسط الإجابة، فقد يكون جزءًا منها.
const OPEN = "<think>";
const CLOSE = "</think>";

/** يعيد دالة تُستدعى لكل دفعة نص، ثم مرة أخيرة بـ end=true لتفريغ ما بقي. */
export function thinkFilter(): (chunk: string, end?: boolean) => string {
  let state: "start" | "think" | "lead" | "body" = "start";
  let buf = "";
  return (chunk, end = false) => {
    buf += chunk;
    let out = "";
    while (buf) {
      if (state === "body") {
        out += buf;
        buf = "";
      } else if (state === "start") {
        const s = buf.replace(/^\s+/, "");
        if (s.startsWith(OPEN)) {
          buf = s.slice(OPEN.length);
          state = "think";
        } else if (!end && OPEN.startsWith(s)) {
          break; // مسافات فقط حتى الآن، أو بداية وسم لم تكتمل: يُنتظر ما بعدها
        } else {
          state = "body";
        }
      } else if (state === "think") {
        const i = buf.indexOf(CLOSE);
        if (i === -1) {
          // نص التفكير يُهمل، ويُبقى ذيل قد يكون بداية وسم الإغلاق
          buf = end ? "" : buf.slice(-(CLOSE.length - 1));
          break;
        }
        buf = buf.slice(i + CLOSE.length);
        state = "lead";
      } else {
        // المسافات والأسطر الفارغة بين كتلة التفكير والإجابة
        const s = buf.replace(/^\s+/, "");
        buf = s;
        if (s) state = "body";
      }
    }
    return out;
  };
}
