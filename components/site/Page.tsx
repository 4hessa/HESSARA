// هيكلا الصفحات: الصفحة التعريفية (رسمة + بطل + عمود أوسط + تذييل) كما في الموقع المرجعي،
// وصفحة التطبيق (عنوان في الوسط + عمود أعرض + تذييل) للوحات والأدوات.
import type { CSSProperties, ReactNode } from "react";
import { Art, type ArtProps } from "./Art";
import { Footer } from "./Footer";

export function MarketingPage({ art, heroTop, glow = true, hero, children }: {
  art: ArtProps; heroTop?: string; glow?: boolean; hero: ReactNode; children?: ReactNode;
}) {
  return (
    <>
      <Art {...art} />
      <section className={`hero${glow ? " hero--glow" : ""}`} style={heroTop ? ({ "--hero-top": heroTop } as CSSProperties) : undefined}>
        <div className="hero__inner">{hero}</div>
      </section>
      <div className="sheet">
        {children}
        <Footer />
      </div>
    </>
  );
}

export function AppPage({ title, eyebrow, sub, copy, actions, art, top, narrow, children, footer = true }: {
  title: ReactNode; eyebrow?: ReactNode; sub?: ReactNode; copy?: ReactNode; actions?: ReactNode;
  art?: ArtProps; top?: string; narrow?: boolean; children: ReactNode; footer?: boolean;
}) {
  return (
    <>
      {art && <div className="art-band"><Art {...art} /></div>}
      <section className={`app-hero${art ? " app-hero--art" : ""}`} style={top ? ({ "--app-top": top } as CSSProperties) : undefined}>
        <div className="app-hero__inner">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {sub && <p className="sub">{sub}</p>}
          {copy && <p className="copy">{copy}</p>}
          {actions && <div className="btn-row">{actions}</div>}
        </div>
      </section>
      <div className={`sheet${narrow ? "" : " sheet--wide"}`}>
        <div className={`app-body${narrow ? " app-body--narrow" : ""}`}>{children}</div>
        {footer && <Footer />}
      </div>
    </>
  );
}
