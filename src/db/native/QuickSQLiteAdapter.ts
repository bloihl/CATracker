// Native adapter using react-native-quick-sqlite (iOS/Android)
// Implements the Database interface declared in ../Database

import type { Database as DB, DatabaseFactoryOptions, SQLParams, SQLResultSet, Transaction } from '../Database';

function toArray(params?: SQLParams): any[] | undefined {
  if (!params) return undefined;
  if (Array.isArray(params)) return params as any[];
  return Object.values(params as Record<string, any>);
}

export async function createQuickSQLiteDatabase(options?: DatabaseFactoryOptions): Promise<DB> {
  // Lazy import to avoid bundling on web
  const mod: any = await import('react-native-quick-sqlite');
  const root: any = mod?.default ?? mod; // ESM/CJS compatibility
  const api: any = root?.QuickSQLite ?? root; // Some builds nest under QuickSQLite

  const dbName = options?.name ?? 'app.db';
  // Open DB by name (necessary to initialize native side)
  if (typeof api.open === 'function') {
    // Some builds expect a plain string name instead of an options object
    api.open(dbName);
  }
  // Prefer the global proxy if present (this build shape injects it)
  const proxy: any = (globalThis as any)?.__QuickSQLiteProxy || (global as any)?.__QuickSQLiteProxy || null;

  function exec(sql: string, params?: SQLParams) {
    const args = toArray(params) ?? [];
    if (proxy && typeof proxy.execute === 'function') return proxy.execute(dbName, sql, args);
    if (typeof api.execute === 'function') return api.execute(dbName, sql, args);
    if (typeof api.executeAsync === 'function') return api.executeAsync(dbName, sql, args);
    if (typeof api.executeSql === 'function') return api.executeSql(dbName, sql, args);
    throw new Error('react-native-quick-sqlite: no execute function available');
  }

  async function runSingle(sql: string, params?: SQLParams): Promise<SQLResultSet> {
    const res = await Promise.resolve(exec(sql, params));
    const rows = res?.rows?._array ?? res?.rows ?? [];
    const rowsAffected = res?.rowsAffected ?? 0;
    const insertId = (res as any)?.insertId ?? null;
    return { rows, rowsAffected, insertId };
  }

  async function runBatch(statements: { sql: string; params?: SQLParams }[]): Promise<SQLResultSet[]> {
    const out: SQLResultSet[] = [];
    await Promise.resolve(exec('BEGIN'));
    try {
      for (const s of statements) {
        const r = await Promise.resolve(exec(s.sql, s.params));
        const rows = r?.rows?._array ?? r?.rows ?? [];
        const rowsAffected = r?.rowsAffected ?? 0;
        const insertId = (r as any)?.insertId ?? null;
        out.push({ rows, rowsAffected, insertId });
      }
      await Promise.resolve(exec('COMMIT'));
      return out;
    } catch (e) {
      try { await Promise.resolve(exec('ROLLBACK')); } catch {}
      throw e;
    }
  }

  async function withTransaction<T>(fn: (tx: Transaction) => Promise<T> | T): Promise<T> {
    await Promise.resolve(exec('BEGIN'));
    try {
      const tx: Transaction = {
        execute: (sql: string, params?: SQLParams) => runSingle(sql, params),
      };
      const result = await Promise.resolve(fn(tx));
      await Promise.resolve(exec('COMMIT'));
      return result;
    } catch (e) {
      try { await Promise.resolve(exec('ROLLBACK')); } catch {}
      throw e;
    }
  }

  return {
    execute: runSingle,
    executeBatch: runBatch,
    withTransaction,
    close: async () => {
      // Close if available; otherwise no-op
      if (proxy && typeof proxy.close === 'function') return proxy.close(dbName);
      if (typeof api.close === 'function') return api.close({ name: dbName });
    },
  } as DB;
}
