// أيقونات البطاقات المرسومة يدويًا في الموقع المرجعي (شبكة ٤٨، خط رفيع). منقولة كما هي.
const ICONS: Record<string, string> = {
  compass: '<circle cx="24" cy="24" r="12.5"/><path d="M24 3l3.4 17.6L45 24l-17.6 3.4L24 45l-3.4-17.6L3 24l17.6-3.4z"/><path d="M13 13l7 7M35 13l-7 7M13 35l7-7M35 35l-7-7"/><circle cx="24" cy="24" r="2.2"/>',
  chart: '<path d="M5 43h38"/><path d="M9 43V29h6v14M19 43V23h6v20M29 43V27h6v16M39 43V19h3"/><path d="M7 21l10-8 8 4 15-12"/><path d="M33 5h7v7"/>',
  scales: '<path d="M24 8v32M15 42h18M19 40h10M8 13h32"/><circle cx="24" cy="6" r="2"/><path d="M8 13L3 27h10zM40 13l-5 14h10z"/><path d="M3 27a5 4 0 0010 0M35 27a5 4 0 0010 0"/>',
  knight: '<path d="M13 43h22M15 43v-4h18v4"/><path d="M17 39c0-9 10-11 8-19l-6 4-6-2c0-7 6-14 15-15l-1-4 4 4c7 3 8 16 2 32"/><circle cx="25" cy="13" r="1"/><path d="M31 15c1 4 0 7-2 10"/>',
  eye: '<path d="M4 24c8-11 32-11 40 0-8 11-32 11-40 0z"/><circle cx="24" cy="24" r="6.5"/><circle cx="24" cy="24" r="2.4"/><path d="M24 11V5M13 13l-3-5M35 13l3-5M24 37v6M13 35l-3 5M35 35l3 5M6 15l-3-3M42 15l3-3"/>',
  network: '<circle cx="24" cy="24" r="5.5"/><circle cx="24" cy="24" r="1.6"/><circle cx="41" cy="24" r="3"/><circle cx="36" cy="12" r="3"/><circle cx="24" cy="7" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="7" cy="24" r="3"/><circle cx="12" cy="36" r="3"/><circle cx="24" cy="41" r="3"/><circle cx="36" cy="36" r="3"/><path d="M29.5 24H38M27.9 20.1l6-6M24 18.5V10M20.1 20.1l-6-6M18.500 24H10M20.1 27.900l-6 6M24 29.500V38M27.900 27.900l6 6"/><path d="M38.500 14.500l1.500 6.500M26.900 6.500l6.300 3.500M14.800 10l6.300-3.500M8 21l1.500-6.500M9.500 33.500L8 27M21.100 41.500l-6.300-3.500M33.200 38l-6.300 3.500M40 27l-1.500 6.500"/>',
  gem: '<path d="M14 9h20l10 11-20 23L4 20z"/><path d="M4 20h40M14 9l4 11 6 23 6-23 4-11M18 20l6-11 6 11"/>',
  astrolabe: '<circle cx="24" cy="26" r="17"/><circle cx="24" cy="26" r="11.500"/><circle cx="24" cy="5.500" r="2.500"/><path d="M24 9v34M7 26h34M12 38l24-24"/><circle cx="24" cy="26" r="2.200"/><path d="M33 12l3 2-2 3M12 38l1-4 3 3z"/>',
  key: '<circle cx="15" cy="15" r="10"/><circle cx="15" cy="15" r="4"/><path d="M22 22l22 22M37 37l5-5M31 31l5-5"/><circle cx="15" cy="15" r="7" stroke-dasharray="1.5 2.500"/>',
  layers: '<path d="M24 5l20 10-20 10L4 15z"/><path d="M4 24l20 10 20-10M4 33l20 10 20-10"/>',
  book: '<path d="M24 12c-6-4-14-4-19-2v28c5-2 13-2 19 3 6-5 14-5 19-3V10c-5-2-13-2-19 2zM24 12v29"/><path d="M9 17c4-1 8-1 11 1M9 23c4-1 8-1 11 1M28 18c3-2 7-2 11-1M28 24c3-2 7-2 11-1"/>',
  shield: '<path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z"/><path d="M24 9l11 4.500V22c0 7-5 13-11 16.500"/><path d="M17 24l5 5 10-11"/>',
  quill: '<path d="M41 5C25 7 14 19 10 37l-3 8"/><path d="M10 37c12-2 25-12 31-32M13 30l11-9M17 24l14-11M12 34h10"/>',
  lantern: '<path d="M18 15h12l4 21H14zM15 36h18v5H15z"/><path d="M19 15a5 5 0 0110 0M24 5v5"/><path d="M24 22c3 3 4 5 4 7a4 4 0 01-8 0c0-2 1-4 4-7z"/>',
  document: '<path d="M11 5h19l8 8v30H11zM30 5v8h8"/><path d="M16 21h17M16 27h17M16 33h11"/>',
  code: '<path d="M16 13L5 24l11 11M32 13l11 11-11 11M28 7l-8 34"/>',
  map: '<path d="M5 10l13-5 12 5 13-5v33l-13 5-12-5-13 5zM18 5v33M30 10v33"/><path d="M9 20l5-2M22 16l4 2M34 22l5-2"/>',
  telescope: '<path d="M6 22l26-13 4 8-26 13zM32 9l5-2.500 4 8-5 2.500M19 28l-7 15M21 27l7 16M20 27v10"/><path d="M40 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  // أيقونات بالأسلوب نفسه لأقسام المنصة التي لا مقابل لها في المرجع
  film: '<rect x="5" y="9" width="38" height="30" rx="2"/><path d="M5 16h38M5 32h38M12 9v7M20 9v7M28 9v7M36 9v7M12 32v7M20 32v7M28 32v7M36 32v7"/><path d="M21 20v8l7-4z"/>',
  loupe: '<circle cx="20" cy="20" r="13"/><circle cx="20" cy="20" r="9" stroke-dasharray="1.5 2.500"/><path d="M29.5 29.5L43 43M39 39l-3 3"/><path d="M15 20h10M20 15v10"/>',
};

export const REF_ICONS = Object.keys(ICONS);

export function RefIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.15} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] ?? ICONS.compass }} />
  );
}
