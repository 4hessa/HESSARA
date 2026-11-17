"use client";
// نموذج استبيان سهولة الاستخدام: عشر عبارات، لكل منها مجموعة اختيار من 1 إلى 5. التسميتان اللفظيتان على
// الطرفين فقط كما في المقياس الأصلي، ولكل خيار اسم كامل لقارئ الشاشة.
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api, useApp } from "./app";
import { Icon } from "./Icon";
import { SUS_ITEMS } from "@/lib/sus-items";
import { intlLocale } from "@/lib/i18n";

export function SusForm({ initial }: { initial?: number[] | null }) {
  const { t, lang, toast } = useApp();
  const router = useRouter();
  const [ans, setAns] = useState<(number | null)[]>(initial && initial.length === 10 ? initial : Array(10).fill(null));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const num = (v: number) => new Intl.NumberFormat(intlLocale(lang)).format(v);
  const optName = (v: number) =>
    v === 1 ? t(`${num(1)} من ${num(5)}: أعارض بشدة`, "1 of 5: strongly disagree")
    : v === 5 ? t(`${num(5)} من ${num(5)}: أوافق بشدة`, "5 of 5: strongly agree")
    : t(`${num(v)} من ${num(5)}`, `${v} of 5`);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = ans.flatMap((a, i) => (a === null ? [i + 1] : []));
    if (missing.length) {
      setErr(t(`بقيت عبارات دون إجابة: ${missing.map(num).join("، ")}.`, `Some statements have no answer yet: ${missing.join(", ")}.`));
      formRef.current?.querySelector<HTMLInputElement>(`input[name="q${missing[0]}"]`)?.focus();
      return;
    }
    setErr("");
    setBusy(true);
    const r = await api("/api/sus", { method: "POST", body: { answers: ans } });
    setBusy(false);
    if (r.ok) {
      toast(t("شكرًا، سُجّل تقييمك.", "Thank you, your rating has been recorded."));
      router.push("/home");
      router.refresh();
    } else setErr(r.data.error ?? t("تعذر الحفظ.", "Could not save."));
  };

  return (
    <form ref={formRef} className="sus stack" onSubmit={submit} noValidate>
      {SUS_ITEMS.map((item, i) => (
        <fieldset key={i} className="sus__item">
          <legend><span className="sus__n">{num(i + 1)}.</span> {item[lang]}</legend>
          <div className="sus__opts">
            {[1, 2, 3, 4, 5].map((v) => (
              <label key={v} className="sus__opt">
                <input type="radio" name={`q${i + 1}`} value={v} checked={ans[i] === v} aria-label={optName(v)}
                  onChange={() => setAns((a) => a.map((x, j) => (j === i ? v : x)))} />
                <span aria-hidden="true">{num(v)}</span>
              </label>
            ))}
          </div>
          <div className="sus__ends" aria-hidden="true"><span>{t("أعارض بشدة", "Strongly disagree")}</span><span>{t("أوافق بشدة", "Strongly agree")}</span></div>
        </fieldset>
      ))}
      {err && <div className="notice notice-danger" role="alert"><Icon name="alert" /><span>{err}</span></div>}
      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? t("يُرسل…", "Sending…") : t("أرسل التقييم", "Submit the rating")}</button>
      </div>
    </form>
  );
}
