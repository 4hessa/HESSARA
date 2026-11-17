// رسمة رأس الصفحة: أحادية اللون، مدمجة بالضرب فوق الورق، ومقصوصة من الوسط على الهاتف.
// منقولة كما هي من الموقع المرجعي (src/components/Art.astro) مع ملف القياسات نفسه.
import manifest from "@/data/art.json";

export type ArtName = keyof typeof manifest;
// dark: رسمة داكنة الأصل (خطوط فاتحة على أسود)، فلا تُعكس في الوضع الداكن.
export type ArtProps = { name: ArtName; kind?: "frame" | "fade"; x?: string; y?: string; s?: number; fade?: Record<string, string>; dark?: boolean };

type Entry = { w: number; h: number; widths: number[]; mw?: number; mobile?: number[] };

export function Art({ name, kind = "frame", x = "0rem", y = "0rem", s = 1, fade = {}, dark = false }: ArtProps) {
  const m = manifest[name] as Entry;
  const set = (ext: string) => m.widths.map((w) => `/art/${name}-${w}.${ext} ${w}w`).join(", ");
  const mset = (ext: string) => (m.mobile ?? []).map((w) => `/art/${name}-m${w}.${ext} ${w}w`).join(", ");
  // الهاتف (≤540px) يرسمها بعرض 36rem = 540px ويُرسل إليه القص الأوسط؛ الأعرض يرسمها max(100vw, 90rem).
  const phone = "(max-width: 540px)";
  const sizes = `(max-width: 820px) ${Math.round(1280 * s)}px, max(${Math.round(100 * s)}vw, ${Math.round(1260 * s)}px)`;
  const fallback = m.widths.includes(1920) ? 1920 : m.widths[0];
  const style = { "--art-x": x, "--art-y": y, "--art-s": s, ...fade } as React.CSSProperties;
  return (
    <div className={`art art--${kind}${dark ? " art--dark" : ""}`} style={style} aria-hidden="true">
      <picture>
        {m.mobile && <source media={phone} type="image/avif" srcSet={mset("avif")} sizes={`${Math.round(540 * s)}px`} width={m.mw} height={m.h} />}
        {m.mobile && <source media={phone} type="image/webp" srcSet={mset("webp")} sizes={`${Math.round(540 * s)}px`} width={m.mw} height={m.h} />}
        <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
        <img src={`/art/${name}-${fallback}.webp`} width={m.w} height={m.h} alt="" decoding="async" fetchPriority="high" />
      </picture>
    </div>
  );
}
