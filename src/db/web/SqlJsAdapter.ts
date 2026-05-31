// Web adapter using sql.js (WASM SQLite)
// Implements the Database interface declared in ../Database

import type { Database as DB, DatabaseFactoryOptions, SQLParams, SQLResultSet, Transaction } from '../Database';

function toArray(params?: SQLParams): any[] | undefined {
  if (!params) return undefined;
  if (Array.isArray(params)) return params as any[];
  return Object.values(params as Record<string, any>);
}

export async function createWebSqlJsDatabase(options?: DatabaseFactoryOptions): Promise<DB> {
  // Lazy load sql.js (must be available as a dependency and served with wasm)
  const initSqlJs = (await import('sql.js')).default as any;
  const SQL = await initSqlJs({});
  const db = new SQL.Database();

  function rowsFromResult(result: any): any[] {
    // sql.js returns an array of results; map to our format
    if (!result || !result.length) return [];
    const first = result[0];
    if (!first || !first.columns || !first.values) return [];
    const out: any[] = [];
    for (const row of first.values) {
      const obj: any = {};
      for (let i = 0; i < first.columns.length; i++) {
        obj[first.columns[i]] = row[i];
      }
      out.push(obj);
    }
    return out;
  }

  async function runSingle(sql: string, params?: SQLParams): Promise<SQLResultSet> {
    const res = db.exec(sql, toArray(params));
    const rows = rowsFromResult(res);
    // sql.js does not directly expose rowsAffected or last insert id without extra work
    return { rows, rowsAffected: undefined, insertId: null };
  }

  async function runBatch(statements: { sql: string; params?: SQLParams }[]): Promise<SQLResultSet[]> {
    const out: SQLResultSet[] = [];
    db.exec('BEGIN');
    try {
      for (const s of statements) {
        const res = db.exec(s.sql, toArray(s.params));
        out.push({ rows: rowsFromResult(res), rowsAffected: undefined, insertId: null });
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    return out;
  }

  async function withTransaction<T>(fn: (tx: Transaction) => Promise<T> | T): Promise<T> {
    db.exec('BEGIN');
    try {
      const tx: Transaction = { execute: (sql: string, params?: SQLParams) => runSingle(sql, params) };
      const result = await Promise.resolve(fn(tx));
      db.exec('COMMIT');
      return result;
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }

  return {
    execute: runSingle,
    executeBatch: runBatch,
    withTransaction,
    close: async () => { db.close(); },
  } as DB;
}
