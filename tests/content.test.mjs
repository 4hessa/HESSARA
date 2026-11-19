// المصادر في مقالات «رؤى» وقائمة القراءة: كل رقم بين معقوفين في النص له مصدر في القائمة، وكل مصدر مستشهد به،
// واللغتان متطابقتان في عدد المصادر، وكل رابط خارجي آمن (https). يمنع هذا أن تنفصل الأرقام عن مصادرها مع التعديل.
import test from "node:test";
import assert from "node:assert/strict";

const { INSIGHTS } = await import("../content/insights.ts");
const { RESOURCES } = await import("../content/resources.ts");
const { mailHref } = await import("../lib/mail.ts");

const HEAD = { en: "## Sources", ar: "## المصادر" };
const links = (md) => [...md.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);

test("مقالات رؤى: كل استشهاد مرقّم له مصدر، وكل مصدر مستشهد به، واللغتان متطابقتان", () => {
  for (const e of INSIGHTS) {
    const counts = {};
    for (const lang of ["en", "ar"]) {
      const body = e[lang].body;
      const at = body.lastIndexOf(HEAD[lang]);
      assert.ok(at > 0, `${e.slug}/${lang}: لا قسم للمصادر`);
      const text = body.slice(0, at), list = body.slice(at);
      const items = (list.match(/^\d+\. /gm) ?? []).length;
      const cited = new Set([...text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
      assert.ok(items > 0, `${e.slug}/${lang}: قائمة المصادر فارغة`);
      for (const n of cited) assert.ok(n >= 1 && n <= items, `${e.slug}/${lang}: [${n}] بلا مصدر`);
      for (let n = 1; n <= items; n++) assert.ok(cited.has(n), `${e.slug}/${lang}: المصدر ${n} غير مستشهد به`);
      assert.match(list, lang === "en" ? /Sources checked on / : /رُوجعت المصادر في /, `${e.slug}/${lang}: لا تاريخ مراجعة`);
      counts[lang] = items;
    }
    assert.equal(counts.en, counts.ar, `${e.slug}: عدد المصادر يختلف بين اللغتين`);
  }
});

test("الروابط الخارجية في المقالات وقائمة القراءة كلها https، والقائمة متطابقة بين اللغتين", () => {
  for (const e of [...INSIGHTS, ...RESOURCES]) {
    for (const lang of ["en", "ar"]) {
      for (const href of links(e[lang].body)) assert.ok(href.startsWith("/") || href.startsWith("https://"), `${e.slug}/${lang}: ${href}`);
    }
  }
  const list = RESOURCES.find((e) => e.slug === "ai-labs-reading-list");
  assert.ok(list, "قائمة القراءة موجودة");
  const ext = (lang) => links(list[lang].body).filter((h) => h.startsWith("https://"));
  assert.deepEqual(ext("ar"), ext("en"), "الروابط نفسها وبالترتيب نفسه في اللغتين");
  assert.ok(ext("en").length >= 25);
});

test("المصادر العربية: الروابط نفسها في اللغتين، وكلها من مواقع الجهات الرسمية المذكورة", () => {
  const doc = RESOURCES.find((e) => e.slug === "arabic-ai-sources");
  assert.ok(doc, "الوثيقة موجودة");
  const ext = (lang) => links(doc[lang].body).filter((h) => h.startsWith("https://"));
  assert.deepEqual(ext("ar"), ext("en"), "الروابط نفسها وبالترتيب نفسه في اللغتين");
  assert.ok(ext("ar").length >= 14);
  const official = new Set(["sdaia.gov.sa", "www.un.org", "unesdoc.unesco.org", "www.unescwa.org"]);
  for (const href of ext("ar")) assert.ok(official.has(new URL(href).host), href);
  assert.equal(new Set(ext("ar")).size, ext("ar").length, "لا رابط مكرر");
});

test("زر البريد يركّب رسالة إلى عنوان صحيح الشكل، والموضوع مرمَّز", () => {
  const href = mailHref("رسالة من موقع هسّارة & سؤال");
  assert.match(href, /^mailto:[a-z0-9.]+@[a-z0-9-]+\.[a-z]{2,}\?subject=/);
  assert.equal(decodeURIComponent(href.split("?subject=")[1]), "رسالة من موقع هسّارة & سؤال");
});
