/*
  GTFS ingestion core (Commit 4):
  - CSV parsing (PapaParse) with step callback to avoid large memory spikes
  - Row mappers per GTFS table → normalized column/value arrays
  - Batched inserts per table, executed inside an explicit transaction
  - Progress callback for simple status updates

  NOTE: add dependency: `npm install papaparse`
*/

import type { Database, SQLParams } from '@/db/Database';
import Papa from 'papaparse';
import { GTFS_FILES, type CsvFilesMap, type ProgressCallback } from './types';
import {yieldTick} from "@/gtfs/utils/yieldTicks.ts";
import {Platform} from "react-native";

// ------------------------------
// Utilities
// ------------------------------

function toNull(s: any) {
  return s === '' || s === undefined ? null : s;
}

function pushStatement(
  out: { sql: string; params?: SQLParams }[],
  table: string,
  columns: string[],
  values: (string | number | null)[],
) {
  const placeholders = columns.map(() => '?').join(',');
  const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;
  out.push({ sql, params: values });
}

// ------------------------------
// Table mappers (row → [columns, values])
// Keep columns in stable order to reuse prepared SQL
// ------------------------------

function mapAgency(feedKey: string, r: Record<string, string>) {
  const cols = [
    'feed_key','agency_id','agency_name','agency_url','agency_timezone','agency_lang','agency_phone','agency_fare_url','agency_email',
  ];
  const vals = [
    feedKey,
    toNull(r.agency_id), toNull(r.agency_name), toNull(r.agency_url), toNull(r.agency_timezone), toNull(r.agency_lang),
    toNull(r.agency_phone), toNull(r.agency_fare_url), toNull(r.agency_email),
  ];
  return { cols, vals };
}

function mapStops(feedKey: string, r: Record<string, string>) {
  const cols = [
    'feed_key','stop_id','stop_code','stop_name','stop_desc','stop_lat','stop_lon','zone_id','stop_url','location_type','parent_station','stop_timezone','wheelchair_boarding','platform_code',
  ];
  const vals = [
    feedKey,
    toNull(r.stop_id), toNull(r.stop_code), toNull(r.stop_name), toNull(r.stop_desc), toNull(r.stop_lat ? Number(r.stop_lat) : null),
    toNull(r.stop_lon ? Number(r.stop_lon) : null), toNull(r.zone_id), toNull(r.stop_url), toNull(r.location_type), toNull(r.parent_station),
    toNull(r.stop_timezone), toNull(r.wheelchair_boarding), toNull(r.platform_code),
  ];
  return { cols, vals };
}

function mapRoutes(feedKey: string, r: Record<string, string>) {
  const cols = [
    'feed_key','route_id','agency_id','route_short_name','route_long_name','route_desc','route_type','route_url','route_color','route_text_color','route_sort_order',
  ];
  const vals = [
    feedKey,
    toNull(r.route_id), toNull(r.agency_id), toNull(r.route_short_name), toNull(r.route_long_name), toNull(r.route_desc), toNull(r.route_type),
    toNull(r.route_url), toNull(r.route_color), toNull(r.route_text_color), toNull(r.route_sort_order),
  ];
  return { cols, vals };
}

function mapTrips(feedKey: string, r: Record<string, string>) {
  const cols = [
    'feed_key','route_id','service_id','trip_id','trip_headsign','trip_short_name','direction_id','block_id','shape_id','wheelchair_accessible','bikes_allowed',
  ];
  const vals = [
    feedKey,
    toNull(r.route_id), toNull(r.service_id), toNull(r.trip_id), toNull(r.trip_headsign), toNull(r.trip_short_name), toNull(r.direction_id),
    toNull(r.block_id), toNull(r.shape_id), toNull(r.wheelchair_accessible), toNull(r.bikes_allowed),
  ];
  return { cols, vals };
}

function mapStopTimes(feedKey: string, r: Record<string, string>) {
  const cols = [
    'feed_key','trip_id','arrival_time','departure_time','stop_id','stop_sequence','stop_headsign','pickup_type','drop_off_type','shape_dist_traveled','timepoint',
  ];
  const vals = [
    feedKey,
    toNull(r.trip_id), toNull(r.arrival_time), toNull(r.departure_time), toNull(r.stop_id), toNull(r.stop_sequence ? Number(r.stop_sequence) : null),
    toNull(r.stop_headsign), toNull(r.pickup_type), toNull(r.drop_off_type), toNull(r.shape_dist_traveled), toNull(r.timepoint),
  ];
  return { cols, vals };
}

function mapCalendar(feedKey: string, r: Record<string, string>) {
  const cols = [
    'feed_key','service_id','monday','tuesday','wednesday','thursday','friday','saturday','sunday','start_date','end_date',
  ];
  const vals = [
    feedKey,
    toNull(r.service_id), toNull(r.monday), toNull(r.tuesday), toNull(r.wednesday), toNull(r.thursday), toNull(r.friday), toNull(r.saturday),
    toNull(r.sunday), toNull(r.start_date), toNull(r.end_date),
  ];
  return { cols, vals };
}

function mapCalendarDates(feedKey: string, r: Record<string, string>) {
  const cols = [ 'feed_key','service_id','date','exception_type' ];
  const vals = [ feedKey, toNull(r.service_id), toNull(r.date), toNull(r.exception_type) ];
  return { cols, vals };
}

function mapShapes(feedKey: string, r: Record<string, string>) {
  const cols = [ 'feed_key','shape_id','shape_pt_lat','shape_pt_lon','shape_pt_sequence','shape_dist_traveled' ];
  const vals = [
    feedKey,
    toNull(r.shape_id), toNull(r.shape_pt_lat ? Number(r.shape_pt_lat) : null), toNull(r.shape_pt_lon ? Number(r.shape_pt_lon) : null),
    toNull(r.shape_pt_sequence ? Number(r.shape_pt_sequence) : null), toNull(r.shape_dist_traveled),
  ];
  return { cols, vals };
}

function mapFareAttributes(feedKey: string, r: Record<string, string>) {
  const cols = [ 'feed_key','fare_id','price','currency_type','payment_method','transfers','agency_id','transfer_duration' ];
  const vals = [ feedKey, toNull(r.fare_id), toNull(r.price), toNull(r.currency_type), toNull(r.payment_method), toNull(r.transfers), toNull(r.agency_id), toNull(r.transfer_duration) ];
  return { cols, vals };
}

function mapFareRules(feedKey: string, r: Record<string, string>) {
  const cols = [ 'feed_key','fare_id','route_id','origin_id','destination_id','contains_id' ];
  const vals = [ feedKey, toNull(r.fare_id), toNull(r.route_id), toNull(r.origin_id), toNull(r.destination_id), toNull(r.contains_id) ];
  return { cols, vals };
}

function mapFeedInfo(feedKey: string, r: Record<string, string>) {
  const cols = [ 'feed_key','feed_publisher_name','feed_publisher_url','feed_lang','feed_start_date','feed_end_date','feed_version' ];
  const vals = [ feedKey, toNull(r.feed_publisher_name), toNull(r.feed_publisher_url), toNull(r.feed_lang), toNull(r.feed_start_date), toNull(r.feed_end_date), toNull(r.feed_version) ];
  return { cols, vals };
}

// ------------------------------
// Batch insert helpers per table
// ------------------------------

async function insertBatch(db: Database, table: string, cols: string[], rows: (string | number | null)[][]) {
  const statements: { sql: string; params?: SQLParams }[] = [];
  for (const vals of rows) pushStatement(statements, table, cols, vals);
  await db.executeBatch(statements);
}

// Parse and insert a single CSV file
async function parseAndInsert(
  db: Database,
  feedKey: string,
  filename: string,
  csvText: string,
  onProgress?: ProgressCallback,
) {
  let table = '' as keyof typeof GTFS_FILES | '';
  for (const k in GTFS_FILES) {
    const key = k as keyof typeof GTFS_FILES;
    if (GTFS_FILES[key] === filename) {
      table = key;
      break;
    }
  }
  if (!table) return; // ignore unknown csvs

  const batch: (string | number | null)[][] = [];

  const flush = async () => {
    if (!batch.length) return;
    const mapper =
        table === 'agency' ? mapAgency :
        table === 'stops' ? mapStops :
        table === 'routes' ? mapRoutes :
        table === 'trips' ? mapTrips :
        table === 'stop_times' ? mapStopTimes :
        table === 'calendar' ? mapCalendar :
        table === 'calendar_dates' ? mapCalendarDates :
        table === 'shapes' ? mapShapes :
        table === 'fare_attributes' ? mapFareAttributes :
        table === 'fare_rules' ? mapFareRules :
        table === 'feed_info' ? mapFeedInfo : null;
    if (!mapper) {
      batch.length = 0;
      return;
    }

    // Derive columns once from the first row mapping
    const {cols} = mapper(feedKey, {} as any);

    const isAndroid = Platform.OS === 'android';
    const BASE_BATCH = isAndroid ? 200 : 600; // conservative on Android
    const BATCH_SIZE = (filename === 'stop_times.txt') ? (isAndroid ? 120 : 400) : BASE_BATCH;

    onProgress?.({phase: `parse:${table}`, message: `Parsing ${filename}`});

    // 1) Parse once to an array of rows
    const rows: Record<string, string>[] = await new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        fastMode: true,         // safe speedup if data is CSV without crazy quotes
        complete: (results: any) => resolve((results?.data || []) as Record<string, string>[]),
        error: (error: any) => reject(error),
      });
    });

    let total = 0;
    const totalRows = rows.length;

    async function pushBatch(chunk: (string | number | null)[][]) {
      if (!chunk.length) return;
      await insertBatch(db, table, cols, chunk);
    }

    function processFrom(start: number, resolve: () => void, reject: (e: any) => void) {
      try {
        const end = Math.min(start + BATCH_SIZE, totalRows);
        const chunk: (string | number | null)[][] = [];

        for (let i = start; i < end; i++) {
          const {vals} = mapper!(feedKey, rows[i]);
          chunk.push(vals);
        }
        total += (end - start);

        // Flush this chunk, then schedule the next chunk as a macrotask
        pushBatch(chunk)
            .then(() => {
              if (end >= totalRows) {
                onProgress?.({phase: `insert:${table}`, message: `Inserted ${filename}`, current: total});
                return resolve();
              }
              yieldTick(() => processFrom(end, resolve, reject));
            })
            .catch(reject);
      } catch (e) {
        reject(e);
      }
    }

    // Kick off the trampoline and await completion exactly once
    await new Promise<void>((resolve, reject) => processFrom(0, resolve, reject));
  }
}

// Public API: parse provided CSV files and insert into DB in a single transaction per table set
export async function ingestFromCsvFiles(
  db: Database,
  feedKey: string,
  files: CsvFilesMap,
  onProgress?: ProgressCallback,
) {
  // Note: Avoid starting an outer transaction here because the native adapter's
  // executeBatch already wraps batched inserts in BEGIN/COMMIT. Nesting would
  // cause "cannot start a transaction within a transaction" on some engines.
  for (const [_key, path] of Object.entries(GTFS_FILES)) {
    const filename = path; // e.g., 'routes.txt'
    const csv = files[filename];
    if (!csv) continue; // skip missing optional files
    await parseAndInsert(db, feedKey, filename, csv, onProgress);
    // Yield between tables for RN scheduler stability
    await new Promise(res => (typeof setImmediate === 'function' ? setImmediate(res) : setTimeout(res, 0)));
  }
}
