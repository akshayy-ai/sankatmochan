/**
 * Minimal types for node:sqlite.
 *
 * Node ships SQLite from 22.5, but the @types/node pinned here predates it.
 * Only the surface persistence.ts actually uses is declared.
 */
declare module "node:sqlite" {
  export class StatementSync {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number };
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
