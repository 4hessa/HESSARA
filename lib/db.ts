// طبقة البيانات: SQLite المضمّنة في Node (node:sqlite) دون اعتماديات أصلية.
// كل استعلام يمرّ بمعرّف المستخدم لضمان عزل البيانات بين الحسابات.
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync as DB } from "node:sqlite";

type G = typeof globalThis & { __hessaraDb?: DB };

function open(): DB {
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");
  const file = process.env.HESSARA_DB_PATH || path.join(process.cwd(), "var", "hessara.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
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
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      model_id TEXT NOT NULL,
      agent_id TEXT,
      saved INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
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
      created_at INTEGER NOT NULL
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
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_review_user ON reviews(user_id, created_at DESC);
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      ref TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, kind, ref)
    );
    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      consultation_id TEXT REFERENCES consultations(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  return db;
}

export function db(): DB {
  const g = globalThis as G;
  if (!g.__hessaraDb) g.__hessaraDb = open();
  return g.__hessaraDb;
}

export function all<T>(sql: string, ...params: (string | number | null)[]): T[] {
  // صفوف node:sqlite بلا نموذج أولي؛ ننسخها إلى كائنات عادية لتمريرها إلى مكونات العميل.
  return db().prepare(sql).all(...params).map((r) => ({ ...r })) as T[];
}
export function get<T>(sql: string, ...params: (string | number | null)[]): T | undefined {
  const r = db().prepare(sql).get(...params);
  return r ? ({ ...r } as T) : undefined;
}
export function run(sql: string, ...params: (string | number | null)[]) {
  return db().prepare(sql).run(...params);
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
