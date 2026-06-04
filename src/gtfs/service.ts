import { openDatabase } from '@/db/Database';
import type { ProgressCallback } from './types';
import { downloadAndExtract } from './download';
import { ingestFromCsvFiles } from './ingestCore';
import type { FeedConfig } from './feeds';

// Very small event emitter for UI updates after refresh
class SimpleEmitter {
  private listeners: Record<string, Function[]> = {};
  on(event: string, fn: Function) {
    (this.listeners[event] = this.listeners[event] || []).push(fn);
    return () => this.off(event, fn);
  }
  off(event: string, fn: Function) {
    this.listeners[event] = (this.listeners[event] || []).filter(f => f !== fn);
  }
  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach(f => f(...args));
  }
}

export const feedEvents = new SimpleEmitter();

// Tables that carry GTFS data keyed by feed_key (delete/promote in this order)
const GTFS_TABLES = [
  // child/helper first for safe delete
  'route_stops',
  'stop_times',
  'trips',
  'shapes',
  'calendar_dates',
  'calendar',
  'fare_rules',
  'fare_attributes',
  // parents near the end
  'routes',
  'stops',
  'agency',
  'feed_info',
] as const;

export async function buildRouteStops(feedKey: string): Promise<void> {
  const db = await openDatabase({ name: 'app.db' });
  // Build distinct route_id ↔ stop_id mapping from stop_times × trips
  await db.execute('DELETE FROM route_stops WHERE feed_key = ?', [feedKey]);
  const sql = `
    INSERT OR IGNORE INTO route_stops(feed_key, route_id, stop_id)
    SELECT st.feed_key, t.route_id, st.stop_id
    FROM stop_times st
    JOIN trips t ON t.feed_key = st.feed_key AND t.trip_id = st.trip_id
    WHERE st.feed_key = ? AND t.route_id IS NOT NULL AND st.stop_id IS NOT NULL
    GROUP BY st.feed_key, t.route_id, st.stop_id
  `;
  await db.execute(sql, [feedKey]);
}

export async function updateFeedMeta(feedKey: string, url: string): Promise<void> {
  const db = await openDatabase({ name: 'app.db' });
  const now = Date.now();
  await db.execute(
      'INSERT INTO feed_meta(feed_key, feed_url, last_updated, last_successful_refresh) VALUES(?,?,?,?)',
      [feedKey, url, now, now]
  );
}

async function deleteFeedData(feedKey: string): Promise<void> {
  const db = await openDatabase({ name: 'app.db' });
  for (const t of GTFS_TABLES) {
    await db.execute(`DELETE FROM ${t} WHERE feed_key = ?`, [feedKey]);
  }
}

async function promoteTmpToReal(realKey: string, tmpKey: string): Promise<void> {
  const db = await openDatabase({ name: 'app.db' });
  // Single short transaction: delete current real, then promote tmp → real
  await db.withTransaction(async (tx) => {
    for (const t of GTFS_TABLES) {
      await tx.execute(`DELETE FROM ${t} WHERE feed_key = ?`, [realKey]);
    }
    for (const t of GTFS_TABLES) {
      await tx.execute(`UPDATE ${t} SET feed_key = ? WHERE feed_key = ?`, [realKey, tmpKey]);
    }
  });
}

export interface RefreshOptions {
  feed: FeedConfig;
  onProgress?: ProgressCallback;
}

// Two‑phase import: import → postprocess under tmp key → atomic swap → meta update
export async function refreshFeed({ feed, onProgress }: RefreshOptions): Promise<void> {
  const { key: realKey, url } = feed;
  const tmpKey = `${realKey}__tmp`;

  onProgress?.({ phase: 'start', message: `Refreshing ${feed.name || realKey}` });

  // Ensure we start with a clean tmp key (previous failed attempt, etc.)
  onProgress?.({ phase: 'cleanup', message: 'Cleaning temporary data…' });
  await deleteFeedData(tmpKey);

  // Download & extract → ingest to tmp
  onProgress?.({ phase: 'download', message: 'Downloading & unzipping feed…' });
  const files = await downloadAndExtract({ feedKey: tmpKey, url, onProgress });

  onProgress?.({ phase: 'import', message: 'Importing tables…' });
  const db = await openDatabase({ name: 'app.db' });
  await ingestFromCsvFiles(db, tmpKey, files, onProgress);

  // Build helper mapping for tmp
  onProgress?.({ phase: 'post', message: 'Building route_stops…' });
  await buildRouteStops(tmpKey);

  // Atomic swap: remove current real rows, promote tmp rows to real key
  onProgress?.({ phase: 'swap', message: 'Finalizing update…' });
  await promoteTmpToReal(realKey, tmpKey);

  // Record success and notify UI
  await updateFeedMeta(realKey, url);
  onProgress?.({ phase: 'done', message: 'Refresh complete' });
  feedEvents.emit('refreshed', { feedKey: realKey });
}