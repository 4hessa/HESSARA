// أيقونات هسّارة: شبكة ٢٤، خط ١٫٥، نهايات مستديرة. أيقونات الأقسام مرسومة خصيصًا للمنصة.
import type { ReactNode } from "react";

const P: Record<string, ReactNode> = {
  // ── الأقسام ──
  consult: <><path d="M4 5.5h16v10.5h-8.5L7 20v-4H4z" /><path d="M9 12.5v-1.5M12 12.5V9M15 12.5v-2.5" /></>,
  models: <><circle cx="5" cy="7" r="1.75" /><circle cx="5" cy="17" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="19" cy="7" r="1.75" /><circle cx="19" cy="17" r="1.75" /><path d="M6.5 8l4 3M6.5 16l4-3M13.5 11l4-3M13.5 13l4 3" /></>,
  agents: <><circle cx="6" cy="6" r="2.25" /><path d="M6 8.25V12a4 4 0 0 0 4 4h4.5" /><path d="M12.5 13.5L15 16l-2.5 2.5" /><rect x="16" y="3.5" width="4.5" height="4.5" rx="1" /><path d="M8.25 6H16" strokeDasharray="1.5 2.5" /><circle cx="18.5" cy="16" r="2" /></>,
  lab: <><rect x="3.5" y="3.5" width="11" height="11" rx="2" /><rect x="9.5" y="9.5" width="11" height="11" rx="2" /><path d="M12.5 15.2l1.8 1.8 3.2-3.6" /><path d="M6.5 7h5M6.5 9.5h2" /></>,
  media: <><rect x="3.5" y="4.5" width="17" height="12" rx="2" /><path d="M10.5 8.2v4.6l3.8-2.3z" /><path d="M3.5 20h6M12.5 20h8" /><circle cx="11" cy="20" r="1.2" /></>,
  // ── الوكلاء ──
  code: <><path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14" /></>,
  layers: <><path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z" /><path d="M3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" /></>,
  neural: <><circle cx="12" cy="4.5" r="1.75" /><circle cx="5" cy="12" r="1.75" /><circle cx="19" cy="12" r="1.75" /><circle cx="12" cy="19.5" r="1.75" /><circle cx="12" cy="12" r="1.25" /><path d="M10.8 5.8L6.2 10.7M13.2 5.8l4.6 4.9M6.2 13.3l4.6 4.9M17.8 13.3l-4.6 4.9M12 6.25v4.5M12 13.25v4.5" /></>,
  flask: <><path d="M9.5 3.5h5M10.5 3.5v6L5 18.5a1.5 1.5 0 0 0 1.3 2.2h11.4a1.5 1.5 0 0 0 1.3-2.2L13.5 9.5v-6" /><path d="M7.5 15h9" /></>,
  shield: <><path d="M12 3.5l7.5 3v5.5c0 4.2-3 7.4-7.5 8.5-4.5-1.1-7.5-4.3-7.5-8.5V6.5z" /><path d="M9 12l2.2 2.2L15.2 10" /></>,
  route: <><circle cx="5.5" cy="18.5" r="2" /><circle cx="18.5" cy="5.5" r="2" /><path d="M7.5 18.5H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6.5" /></>,
  // ── أدوات عامة ──
  send: <><path d="M12 19V5M6 11l6-6 6 6" /></>,
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2" />,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></>,
  bookmark: <path d="M7 4.5h10a1 1 0 0 1 1 1v14l-6-4-6 4v-14a1 1 0 0 1 1-1z" />,
  star: <path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z" />,
  sun: <><circle cx="12" cy="12" r="3.75" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></>,
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: <><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  alert: <><path d="M12 4l9 15.5H3z" /><path d="M12 10v4.5M12 17v.5" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.5v.5" /></>,
  chevron: <path d="M7 10l5 5 5-5" />,
  back: <path d="M10 6l6 6-6 6" />,
  user: <><circle cx="12" cy="8.5" r="3.75" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  settings: <><circle cx="12" cy="12" r="2.75" /><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.75" /></>,
  eyeOff: <><path d="M4 4l16 16M9.9 6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.3 7.8A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.500c1.3 0 2.5-.3 3.6-.8" /><path d="M10 10a2.750 2.750 0 0 0 3.9 3.9" /></>,
  up: <path d="M7 10.500v9M7 10.500l4-6.500a2 2 0 0 1 2 2v3.500h4.500a1.5 1.5 0 0 1 1.5 1.800l-1.2 6.500a1.5 1.5 0 0 1-1.5 1.200H7M4 10.500h3v9H4z" />,
  down: <path d="M17 13.500v-9M17 13.500l-4 6.500a2 2 0 0 1-2-2v-3.500H6.500A1.5 1.5 0 0 1 5 12.700l1.2-6.500A1.5 1.5 0 0 1 7.7 5H17M20 13.500h-3v-9h3z" />,
  retry: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.500v4h-4" /></>,
  export: <><path d="M12 15V4M8 8l4-4 4 4" /><path d="M5 14v4.500A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.500V14" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.500V12l3 2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  external: <><path d="M14 5h5v5M19 5l-8 8" /><path d="M11 6.500H6.500A1.5 1.5 0 0 0 5 8v9.500A1.5 1.5 0 0 0 6.5 19H16a1.5 1.5 0 0 0 1.5-1.500V13" /></>,
  trash: <><path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.400L17 7" /></>,
  arrow: <path d="M19 12H5M11 6l-6 6 6 6" />,
  history: <><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" /><path d="M4.5 4.500v4h4M12 8v4l2.5 1.5" /></>,
  logout: <><path d="M10 4.500H6.500A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.500H10" /><path d="M14 8l4 4-4 4M18 12H9.5" /></>,
  help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.7 9.500a2.4 2.4 0 1 1 3.6 2c-.8.5-1.3 1-1.3 2M12 16.500v.500" /></>,
  panel: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M9.5 4.500v15" /></>,
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}
      style={{ flex: "none" }}>
      {P[name] ?? P.info}
    </svg>
  );
}
