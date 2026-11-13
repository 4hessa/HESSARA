"use client";
// تذكير تنظيمي بالاستراحة بعد مدة من الاستخدام النشط. ليس ادعاءً طبيًا.
// يُحسب الوقت النشط فقط (تبويب ظاهر + تفاعل حديث)، ويُحفظ في التخزين المحلي حتى لا يتكرر عند التحديث.
import { useEffect, useRef, useState } from "react";
import { useApp } from "./app";
import { Icon } from "./Icon";

const KEY = "hs_eye";
const TICK = 5_000;
const IDLE_AFTER = 60_000;
const TYPING_GRACE = 8_000;

type State = { active: number; snoozeUntil: number };
const load = (): State => {
  try { return { active: 0, snoozeUntil: 0, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return { active: 0, snoozeUntil: 0 }; }
};
const save = (s: State) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* تخزين غير متاح */ } };

export function EyeRest() {
  const { user, t } = useApp();
  const [show, setShow] = useState(false);
  const lastInput = useRef(Date.now());
  const lastKey = useRef(0);
  const enabled = !!user?.reminderEnabled;
  const limit = (user?.reminderMinutes ?? 10) * 60_000;

  useEffect(() => {
    if (!enabled) { setShow(false); return; }
    const onInput = () => { lastInput.current = Date.now(); };
    const onKey = () => { lastInput.current = lastKey.current = Date.now(); };
    const opts = { passive: true } as const;
    window.addEventListener("pointerdown", onInput, opts);
    window.addEventListener("scroll", onInput, opts);
    window.addEventListener("keydown", onKey, opts);
    const test = new URLSearchParams(location.search).get("eyetest"); // للاختبار الآلي فقط: مدة بالثواني
    const max = test ? Number(test) * 1000 : limit;
    const step = test ? 500 : TICK;
    const timer = setInterval(() => {
      const now = Date.now();
      if (document.hidden || now - lastInput.current > IDLE_AFTER) return;
      const s = load();
      if (s.snoozeUntil > now) return;
      s.active += step;
      save(s);
      // لا يقاطع الكتابة: ينتظر توقف لوحة المفاتيح.
      if (s.active >= max && now - lastKey.current > (test ? 1500 : TYPING_GRACE)) setShow(true);
    }, step);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", onInput);
      window.removeEventListener("scroll", onInput);
      window.removeEventListener("keydown", onKey);
    };
  }, [enabled, limit]);

  if (!show) return null;
  const dismiss = (snoozeMin: number) => {
    save({ active: 0, snoozeUntil: snoozeMin ? Date.now() + snoozeMin * 60_000 : 0 });
    setShow(false);
  };
  return (
    <aside className="eye-rest" role="status" aria-live="polite" aria-label={t("تذكير بالاستراحة", "Break reminder")}>
      <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
        <span className="icon-tile"><Icon name="eye" /></span>
        <div className="grow">
          <strong>{t("وقت استراحة قصيرة", "Time for a short break")}</strong>
          <p className="t-small muted">{t("أرح عينيك قليلًا وانظر إلى شيء بعيد، ثم أكمل عندما تكون مستعدًا.", "Rest your eyes for a moment and look at something far away, then carry on when you are ready.")}</p>
        </div>
      </div>
      <div className="row">
        <button className="btn btn-primary btn-sm" onClick={() => dismiss(0)}>{t("سآخذ استراحة", "I'll take a break")}</button>
        <button className="btn btn-secondary btn-sm" onClick={() => dismiss(5)}>{t("ذكّرني بعد ٥ دقائق", "Remind me in 5 minutes")}</button>
        <button className="btn btn-ghost btn-sm" onClick={() => dismiss(15)}>{t("بعد ١٥ دقيقة", "In 15 minutes")}</button>
      </div>
      <p className="t-caption">{t("يمكن تعطيل التذكير من الملف الشخصي.", "You can turn the reminder off in your profile.")}</p>
    </aside>
  );
}
