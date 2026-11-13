import { fileURLToPath } from "node:url";

const dev = process.env.NODE_ENV !== "production";
// التطبيق مجلد فرعي في مستودع يضم في جذره موقعًا آخر له ملف قفل حزم خاص به.
// تثبيت الجذر هنا يمنع Next.js من اختيار جذر المستودع للتجميع وتتبّع ملفات الإنتاج.
const root = fileURLToPath(new URL(".", import.meta.url));

// سياسة أمان المحتوى: لا مصادر خارجية سوى الصور المصغّرة من يوتيوب.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://i.ytimg.com",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // لا يُنشئ «next dev» ملف AGENTS.md تلقائيًا داخل المشروع.
  agentRules: false,
  serverExternalPackages: ["pg"],
  turbopack: { root },
  outputFileTracingRoot: root,
  async headers() {
    return [
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // أسماء ملفات الرسومات ثابتة (بلا بصمة محتوى)، فلا تُعلَّم «غير قابلة للتغيير».
      { source: "/art/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
