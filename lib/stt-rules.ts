// قواعد الإدخال الصوتي المشتركة بين المتصفح والخادم: المدة، والحجم، والحدود، والصيغ.

export const STT = {
  /** أقصى مدة للتسجيل الواحد بالثواني؛ يتوقف التسجيل تلقائيًا عندها. */
  maxSeconds: 120,
  /** أقل من حد جسم الطلب في دوال Vercel (4.5 ميغابايت). دقيقتان بمعدل 32 كيلوبت تقارب نصف ميغابايت. */
  maxBytes: 4_000_000,
  /** تسجيلات لكل مستخدم في اليوم. */
  perUserDaily: 30,
  /** سقف المنصة كلها في اليوم، تحت حد الخطة المجانية لدى المزوّد. */
  platformDaily: 1000,
} as const;

/** صيغ التسجيل المقبولة، وامتداد الملف المرسل إلى خدمة التحويل لكلٍّ منها. */
export const STT_TYPES: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
};

/** ما يجرّبه المتصفح بالترتيب عند التسجيل (Safari يسجّل mp4، والبقية webm أو ogg). */
export const RECORDER_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm"];
