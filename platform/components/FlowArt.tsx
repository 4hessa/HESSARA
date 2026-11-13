// رسم هندسي يوضّح مسار الطلب: مشكلة ← مستشار (نموذج/وكيل) ← تحليل ← مراجعة نقدية.
// توضيحي لمسار العمل في المنصة، وليس تمثيلًا لبنية نموذج بعينه.
export function FlowArt() {
  return (
    <svg viewBox="0 0 440 400" width="100%" role="img" aria-label="مخطط: المشكلة تنتقل إلى نموذج أو وكيل، ثم إلى تحليل، ثم إلى مراجعة نقدية تعود بملاحظات" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <g opacity=".55">
        {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${20 + i * 50} 10v380`} strokeDasharray="1 9" />)}
        {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M10 ${25 + i * 50}h420`} strokeDasharray="1 9" />)}
      </g>
      <rect x="150" y="24" width="140" height="52" rx="10" />
      <path d="M172 44h96M172 56h60" />
      <path d="M220 76v34M220 110L96 150M220 110v40M220 110l124 40" />
      {[96, 220, 344].map((x, i) => (
        <g key={x} className={i === 1 ? "hot" : undefined}>
          <circle cx={x} cy="176" r="26" />
          <circle cx={x} cy="176" r="4" fill="currentColor" stroke="none" />
          <circle cx={x - 11} cy="166" r="2.5" /><circle cx={x + 11} cy="166" r="2.5" /><circle cx={x - 11} cy="186" r="2.5" /><circle cx={x + 11} cy="186" r="2.5" />
          <path d={`M${x - 9} 168l6 5M${x + 9} 168l-6 5M${x - 9} 184l6-5M${x + 9} 184l-6-5`} />
        </g>
      ))}
      <path d="M96 202l124 44M220 202v44M344 202l-124 44" />
      <rect x="130" y="246" width="180" height="64" rx="10" />
      <path d="M150 266h90M150 278h140M150 290h110" />
      <g className="hot">
        <path d="M310 278h48a16 16 0 0 1 16 16v38" />
        <rect x="330" y="332" width="88" height="48" rx="10" />
        <path d="M350 358l8 8 16-18" />
        <path d="M330 356H222v-46" strokeDasharray="4 5" />
        <path d="M216 318l6-8 6 8" />
      </g>
      <rect x="22" y="332" width="150" height="48" rx="10" opacity=".8" />
      <path d="M40 350h70M40 362h100" opacity=".8" />
      <path d="M172 356h20" opacity=".8" />
    </svg>
  );
}
