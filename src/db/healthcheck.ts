import { openDatabase } from './Database';

/**
 * Dev-only: simple smoke test for database read/write.
 */
export async function runDbHealthcheck(): Promise<void> {
  try {
    const db = await openDatabase({ name: 'app.db' });
    await db.withTransaction((tx) => {
      // Note: QuickSQLiteAdapter.withTransaction requires sync callback
      tx.execute('CREATE TABLE IF NOT EXISTS __hc (id INTEGER PRIMARY KEY AUTOINCREMENT, v TEXT)');
      tx.execute('DELETE FROM __hc');
      tx.execute('INSERT INTO __hc (v) VALUES (?)', ['ok']);
      // Read back
      const resPromise = tx.execute('SELECT v FROM __hc LIMIT 1');
      // In native adapter, execute returns Promise; but we didn't await inside transaction.
      // For healthcheck across adapters, do another query outside the transaction.
      return;
    });
    const db2 = await openDatabase({ name: 'app.db' });
    const res = await db2.execute('SELECT v FROM __hc LIMIT 1');
    const value = res.rows?.[0]?.v;
    if (value !== 'ok') {
      console.warn('[db] Healthcheck mismatch; got:', value);
    } else {
      console.log('[db] Healthcheck passed');
    }
    await db2.execute('DROP TABLE IF EXISTS __hc');
    await db2.close();
  } catch (err) {
    console.warn('[db] Healthcheck failed:', err);
  }
}
