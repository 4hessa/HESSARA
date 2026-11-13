"use client";
// سياق التطبيق في المتصفح: المستخدم، النماذج، الإشعارات العابرة، وموافقة الإرسال الخارجي.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PublicUser } from "@/lib/auth";
import type { ModelView } from "@/lib/providers";
import { Dialog } from "./Dialog";

export type ApiResult<T> = { ok: boolean; status: number; data: T & { error?: string; code?: string } };
export async function api<T = Record<string, unknown>>(path: string, init?: { method?: string; body?: unknown; signal?: AbortSignal }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method: init?.method ?? (init?.body ? "POST" : "GET"),
      headers: init?.body ? { "content-type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
      signal: init?.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    return { ok: false, status: 0, data: { error: "تعذر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة." } as never };
  }
}

type Ctx = {
  user: PublicUser | null;
  setUser: (u: PublicUser) => void;
  models: ModelView[];
  setModels: (m: ModelView[]) => void;
  toast: (msg: string) => void;
  ensureConsent: () => Promise<boolean>;
};
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("AppProvider مفقود");
  return c;
};

export function AppProvider({ user: u0, models: m0, children }: { user: PublicUser | null; models: ModelView[]; children: ReactNode }) {
  const [user, setUser] = useState(u0);
  const [models, setModels] = useState(m0);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [consentOpen, setConsentOpen] = useState(false);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const seq = useRef(0);

  useEffect(() => setUser(u0), [u0]);

  const toast = useCallback((msg: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const ensureConsent = useCallback(() => {
    if (user?.externalConsent) return Promise.resolve(true);
    setConsentOpen(true);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, [user]);

  const answer = async (yes: boolean) => {
    if (yes) {
      const r = await api<{ user: PublicUser }>("/api/me", { method: "PATCH", body: { externalConsent: true } });
      if (r.ok) setUser(r.data.user);
      else { toast(r.data.error ?? "تعذر حفظ الموافقة."); yes = false; }
    }
    setConsentOpen(false);
    resolver.current?.(yes);
    resolver.current = null;
  };

  const value = useMemo(() => ({ user, setUser, models, setModels, toast, ensureConsent }), [user, models, toast, ensureConsent]);
  return (
    <AppCtx.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>
      <Dialog open={consentOpen} onClose={() => answer(false)} title="إرسال النص إلى مزوّد خارجي">
        <div className="dialog-body">
          <p>النموذج الذي اخترته تشغّله جهة خارجية. لإتمام الطلب سيُرسَل نص استشارتك وسجل هذه المحادثة إلى مزوّد النموذج لمعالجته وفق سياساته.</p>
          <ul className="list-check">
            <li><span aria-hidden="true">•</span><span>لا تُرسَل بيانات حسابك (الاسم والبريد).</span></li>
            <li><span aria-hidden="true">•</span><span>لا تلصق أسرارًا أو بيانات شخصية حساسة في الاستشارة.</span></li>
            <li><span aria-hidden="true">•</span><span>يمكنك سحب الموافقة في أي وقت من الملف الشخصي.</span></li>
          </ul>
        </div>
        <div className="dialog-foot">
          <button className="btn btn-primary" onClick={() => answer(true)}>أوافق وأتابع</button>
          <button className="btn btn-secondary" onClick={() => answer(false)}>إلغاء</button>
        </div>
      </Dialog>
    </AppCtx.Provider>
  );
}
