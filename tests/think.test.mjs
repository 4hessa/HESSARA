// حذف كتلة التفكير من أول الإجابة في البث، مع انقسام الوسوم بين الدفعات.
import test from "node:test";
import assert from "node:assert/strict";
const { thinkFilter } = await import("../lib/providers/think.ts");

const run = (chunks) => {
  const f = thinkFilter();
  return chunks.map((c) => f(c)).join("") + f("", true);
};

test("إجابة بلا كتلة تفكير تمر كما هي، ومنها ما يبدأ بوسم آخر", () => {
  assert.equal(run(["التعلم ", "العميق فرع."]), "التعلم العميق فرع.");
  assert.equal(run(["<b>", "مهم</b> جدًا"]), "<b>مهم</b> جدًا");
  assert.equal(run(["<", "/>"]), "</>");
  assert.equal(run(["  ", "\n", "نص"]), "  \nنص");
});

test("كتلة التفكير في أول الإجابة تُحذف ولو انقسم الوسمان بين الدفعات", () => {
  assert.equal(run(["<think>أفكر</think>\n\nالجواب"]), "الجواب");
  assert.equal(run(["\n<thi", "nk>خطوة 1", " خطوة 2</th", "ink>", "\n\n", "الجواب ", "هنا"]), "الجواب هنا");
  assert.equal(run(["<think>", "</think>", "الجواب"]), "الجواب");
});

test("الوسم في وسط الإجابة لا يُمس، وكتلة غير مغلقة لا يُعرض منها شيء", () => {
  assert.equal(run(["قبل <think>x</think> بعد"]), "قبل <think>x</think> بعد");
  assert.equal(run(["<think>تفكير لم ينتهِ"]), "");
});
