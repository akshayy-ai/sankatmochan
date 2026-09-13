import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { LiveCase } from "./caseStore";

/**
 * Durable storage for cases.
 *
 * The in-memory array stays the working set — every read path in the app is
 * synchronous and stays that way. This is a write-through mirror: cases are
 * saved as they change and reloaded on boot, so a restart mid-incident no
 * longer loses the caller.
 *
 * It is deliberately impossible for this layer to break ingest. Every call is
 * wrapped: if the database is unavailable, unwritable, or corrupt, the app
 * carries on in memory exactly as it did before and says so in the log. An
 * emergency line that refuses a report because its disk is full is worse than
 * one that forgets the report later.
 *
 * Node ships SQLite from 22.5, so this adds no dependency and nothing to
 * compile in the Alpine image.
 */

const DB_PATH = process.env.CASE_DB_PATH || "/data/sankatmochan.db";

let db: DatabaseSync | null = null;
let broken = false;

function init(): DatabaseSync | null {
  if (db) return db;
  if (broken) return null;

  try {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    const handle = new DatabaseSync(DB_PATH);

    // WAL lets the console keep reading while ingest writes.
    handle.exec("PRAGMA journal_mode = WAL");
    handle.exec("PRAGMA synchronous = NORMAL");

    // One row per case. The mutable body is stored as JSON rather than spread
    // across columns, because LiveCase has gained fields repeatedly and a
    // migration for each would be a liability with no benefit here. The
    // columns that exist are the ones queried on.
    handle.exec(`
      CREATE TABLE IF NOT EXISTS cases (
        id          TEXT PRIMARY KEY,
        chat_id     INTEGER NOT NULL DEFAULT 0,
        channel     TEXT,
        severity    TEXT,
        category    TEXT,
        created_at  TEXT,
        updated_at  INTEGER NOT NULL,
        body        TEXT NOT NULL
      )
    `);
    handle.exec("CREATE INDEX IF NOT EXISTS idx_cases_updated ON cases(updated_at DESC)");
    handle.exec("CREATE INDEX IF NOT EXISTS idx_cases_chat ON cases(chat_id)");

    db = handle;
    console.log(`[persistence] ready at ${DB_PATH}`);
    return db;
  } catch (err) {
    // Recorded once, then never retried — a disk problem will not fix itself
    // between two webhook calls, and retrying on every case would turn a
    // storage fault into a latency fault on the ingest path.
    broken = true;
    console.error(`[persistence] DISABLED — running in memory only: ${err}`);
    return null;
  }
}

/** Save or update a case. Never throws. */
export function saveCase(c: LiveCase): void {
  const h = init();
  if (!h) return;
  try {
    h.prepare(
      `INSERT INTO cases (id, chat_id, channel, severity, category, created_at, updated_at, body)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         severity = excluded.severity,
         category = excluded.category,
         updated_at = excluded.updated_at,
         body = excluded.body`
    ).run(
      c.id,
      c.chatId ?? 0,
      c.channel ?? "",
      c.severity ?? "",
      c.category ?? "",
      c.timestamp ?? new Date().toISOString(),
      Date.now(),
      JSON.stringify(c)
    );
  } catch (err) {
    console.error(`[persistence] save failed for ${c.id}: ${err}`);
  }
}

/** Remove a case. Used when one is evicted from the working set. */
export function deleteCase(id: string): void {
  const h = init();
  if (!h) return;
  try {
    h.prepare("DELETE FROM cases WHERE id = ?").run(id);
  } catch (err) {
    console.error(`[persistence] delete failed for ${id}: ${err}`);
  }
}

/**
 * Load the most recent cases back into memory on boot.
 *
 * Only `limit` are restored, matching the in-memory cap — the rest stay on
 * disk for the record without crowding an operator's queue with last week's
 * incidents.
 */
export function loadCases(limit: number): LiveCase[] {
  const h = init();
  if (!h) return [];
  try {
    const rows = h
      .prepare("SELECT body FROM cases ORDER BY updated_at DESC LIMIT ?")
      .all(limit) as { body: string }[];

    const out: LiveCase[] = [];
    for (const r of rows) {
      try {
        out.push(JSON.parse(r.body) as LiveCase);
      } catch {
        // One unreadable row must not cost the other forty-nine.
      }
    }
    console.log(`[persistence] restored ${out.length} cases`);
    return out;
  } catch (err) {
    console.error(`[persistence] load failed: ${err}`);
    return [];
  }
}

/** Total rows held, including those beyond the in-memory window. */
export function caseCount(): number | null {
  const h = init();
  if (!h) return null;
  try {
    const row = h.prepare("SELECT COUNT(*) AS n FROM cases").get() as { n: number };
    return row.n;
  } catch {
    return null;
  }
}

export function isEnabled(): boolean {
  return init() !== null;
}
