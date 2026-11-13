// طبقة البيانات: واجهة واحدة غير متزامنة (all / get / run) فوق ثلاثة محركات:
//   • SQLite المضمّنة في Node (الافتراضي محليًا، ملف على القرص).
//   • PostgreSQL عبر DATABASE_URL (للاستضافة عديمة الحالة حيث لا قرص دائم).
//   • PGlite (Postgres داخل العملية) عند HESSARA_PGLITE=1 — لاختبار مسار Postgres آليًا دون خادم.
// الاستعلامات مكتوبة بمجموعة مشتركة من SQL وبعلامات «?»، وتُحوَّل إلى $1..$n لـ Postgres.
// كل استعلام في التطبيق يمرّ بمعرّف المستخدم لضمان عزل البيانات بين الحسابات.
import fs from "node:fs";
import path from "node:path";

type Param = string | number | null;
type Row = Record<string, unknown>;
interface Driver { query(sql: string, params: Param[]): Promise<Row[]>; }

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      pass_hash TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT 'a1',
      pref_model TEXT,
      pref_agent TEXT,
      reminder_enabled INTEGER NOT NULL DEFAULT 1,
      reminder_minutes INTEGER NOT NULL DEFAULT 10,
      personalize INTEGER NOT NULL DEFAULT 0,
      external_consent INTEGER NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      model_id TEXT NOT NULL,
      agent_id TEXT,
      saved INTEGER NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_consult_user ON consultations(user_id, updated_at DESC);
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model_id TEXT,
      engine TEXT,
      status TEXT NOT NULL DEFAULT 'complete',
      feedback INTEGER,
      created_at BIGINT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_msg_consult ON messages(consultation_id, created_at);
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      consultation_id TEXT REFERENCES consultations(id) ON DELETE CASCADE,
      message_id TEXT,
      mode TEXT NOT NULL,
      criteria TEXT NOT NULL DEFAULT '[]',
      input TEXT NOT NULL,
      result TEXT NOT NULL,
      engine TEXT NOT NULL,
      revised TEXT,
      created_at BIGINT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_review_user ON reviews(user_id, created_at DESC);
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      ref TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      PRIMARY KEY (user_id, kind, ref)
    );
    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      consultation_id TEXT REFERENCES consultations(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
`;

const toPg = (sql: string) => { let i = 0; return sql.replace(/\?/g, () => "$" + ++i); };
// أعمدة الوقت BIGINT: تعيدها محركات Postgres نصًا، فنحوّلها إلى أرقام (قيم الميلي ثانية آمنة ضمن Number).
const TIME_COLS = new Set(["created_at", "updated_at", "expires_at"]);
const fixRow = (r: Row): Row => {
  const o: Row = { ...r };
  for (const k in o) if (TIME_COLS.has(k) && typeof o[k] !== "number" && o[k] != null) o[k] = Number(o[k]);
  return o;
};

async function sqliteDriver(): Promise<Driver> {
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");
  // على الاستضافة عديمة الحالة (VERCEL) نظام الملفات للقراءة فقط عدا /tmp، وما يُكتب فيه مؤقت:
  // يُفقد عند إعادة تشغيل الدالة ولا يُشارَك بين النسخ. يصلح للمعاينة فقط؛ للبيانات الدائمة اضبط DATABASE_URL.
  const file = process.env.HESSARA_DB_PATH || (process.env.VERCEL ? "/tmp/hessara.db" : path.join(process.cwd(), "var", "hessara.db"));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return {
    async query(sql, params) {
      const st = db.prepare(sql);
      // صفوف node:sqlite بلا نموذج أولي؛ تُنسخ إلى كائنات عادية لتمريرها إلى مكونات العميل.
      if (/^\s*(SELECT|WITH)/i.test(sql)) return st.all(...params).map((r) => ({ ...r }));
      st.run(...params);
      return [];
    },
  };
}

// مفتاح قفل ثابت يسلسل إنشاء الجداول بين نسخ الخادم: CREATE TABLE IF NOT EXISTS المتزامن
// من عدة اتصالات قد يفشل في Postgres بتعارض على فهرس أسماء الأنواع.
const SCHEMA_LOCK = 72519430;

async function pgDriver(url: string): Promise<Driver> {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 10_000 });
  // خطأ على اتصال خامل (مثل إغلاقه من جهة الخادم) يُطلق حدثًا على المجمّع؛ دون مستمع تنهار العملية كلها.
  pool.on("error", (e) => console.error("[db] idle client error:", e.message));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [SCHEMA_LOCK]);
    await client.query(SCHEMA);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
  return { async query(sql, params) { return (await pool.query(toPg(sql), params)).rows.map(fixRow); } };
}

async function pgliteDriver(): Promise<Driver> {
  // اسم الحزمة مركّب عمدًا حتى لا يضمّها المجمِّع إلى بناء الإنتاج: هي اعتمادية اختبار فقط.
  const name = ["@electric-sql", "pglite"].join("/");
  const { PGlite } = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ name)) as typeof import("@electric-sql/pglite");
  const db = new PGlite(process.env.HESSARA_PGLITE_DIR || undefined);
  // المسار نفسه الذي يسلكه pgDriver، ليغطيه الاختبار الشامل على PGlite.
  await db.exec("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock($1)", [SCHEMA_LOCK]);
  await db.exec(SCHEMA);
  await db.exec("COMMIT");
  return { async query(sql, params) { return ((await db.query(toPg(sql), params)).rows as Row[]).map(fixRow); } };
}

type G = typeof globalThis & { __hessaraDriver?: Promise<Driver> };
function driver(): Promise<Driver> {
  const g = globalThis as G;
  if (!g.__hessaraDriver) {
    const created = process.env.HESSARA_PGLITE === "1"
      ? pgliteDriver()
      : process.env.DATABASE_URL
        ? pgDriver(process.env.DATABASE_URL)
        : sqliteDriver();
    // لا يُحفظ الفشل: تعيد الطلبات التالية المحاولة بدل أن تفشل كلها حتى إعادة تشغيل النسخة.
    g.__hessaraDriver = created.catch((e) => {
      g.__hessaraDriver = undefined;
      throw e;
    });
  }
  return g.__hessaraDriver;
}

export const dbEngine = () => (process.env.HESSARA_PGLITE === "1" ? "pglite" : process.env.DATABASE_URL ? "postgres" : "sqlite");

export async function all<T>(sql: string, ...params: Param[]): Promise<T[]> {
  return (await (await driver()).query(sql, params)) as T[];
}
export async function get<T>(sql: string, ...params: Param[]): Promise<T | undefined> {
  return (await all<T>(sql, ...params))[0];
}
export async function run(sql: string, ...params: Param[]): Promise<void> {
  await (await driver()).query(sql, params);
}

export type UserRow = {
  id: string; email: string; name: string; pass_hash: string; avatar: string;
  pref_model: string | null; pref_agent: string | null;
  reminder_enabled: number; reminder_minutes: number; personalize: number;
  external_consent: number; created_at: number;
};
export type ConsultRow = {
  id: string; user_id: string; title: string; model_id: string; agent_id: string | null;
  saved: number; created_at: number; updated_at: number;
};
export type MessageRow = {
  id: string; consultation_id: string; role: "user" | "assistant"; content: string;
  model_id: string | null; engine: string | null; status: string; feedback: number | null; created_at: number;
};
export type ReviewRow = {
  id: string; user_id: string; consultation_id: string | null; message_id: string | null;
  mode: string; criteria: string; input: string; result: string; engine: string;
  revised: string | null; created_at: number;
};
