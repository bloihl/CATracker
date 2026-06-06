import { openDatabase } from './Database';

function ddl(strings: TemplateStringsArray) {
  return strings.join(' ').replace(/\s+/g, ' ').trim();
}

export async function runMigrations(): Promise<void> {
  const db = await openDatabase({ name: 'app.db' });

  // Use a single batch where possible for speed; some engines prefer per-statement
  const statements: { sql: string }[] = [];

  // Core GTFS tables with multi-feed support (feed_key TEXT)
  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS agency (
    feed_key TEXT NOT NULL,
    agency_id TEXT,
    agency_name TEXT,
    agency_url TEXT,
    agency_timezone TEXT,
    agency_lang TEXT,
    agency_phone TEXT,
    agency_fare_url TEXT,
    agency_email TEXT,
    PRIMARY KEY (feed_key, agency_id)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS stops (
    feed_key TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    stop_code TEXT,
    stop_name TEXT,
    stop_desc TEXT,
    stop_lat REAL,
    stop_lon REAL,
    zone_id TEXT,
    stop_url TEXT,
    location_type TEXT,
    parent_station TEXT,
    stop_timezone TEXT,
    wheelchair_boarding TEXT,
    platform_code TEXT,
    PRIMARY KEY (feed_key, stop_id)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS routes (
    feed_key TEXT NOT NULL,
    route_id TEXT NOT NULL,
    agency_id TEXT,
    route_short_name TEXT,
    route_long_name TEXT,
    route_desc TEXT,
    route_type TEXT,
    route_url TEXT,
    route_color TEXT,
    route_text_color TEXT,
    route_sort_order TEXT,
    PRIMARY KEY (feed_key, route_id)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS trips (
    feed_key TEXT NOT NULL,
    route_id TEXT,
    service_id TEXT,
    trip_id TEXT NOT NULL,
    trip_headsign TEXT,
    trip_short_name TEXT,
    direction_id TEXT,
    block_id TEXT,
    shape_id TEXT,
    wheelchair_accessible TEXT,
    bikes_allowed TEXT,
    PRIMARY KEY (feed_key, trip_id)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS stop_times (
    feed_key TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    arrival_time TEXT,
    departure_time TEXT,
    stop_id TEXT NOT NULL,
    stop_sequence INTEGER,
    stop_headsign TEXT,
    pickup_type TEXT,
    drop_off_type TEXT,
    shape_dist_traveled TEXT,
    timepoint TEXT
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS calendar (
    feed_key TEXT NOT NULL,
    service_id TEXT NOT NULL,
    monday TEXT,
    tuesday TEXT,
    wednesday TEXT,
    thursday TEXT,
    friday TEXT,
    saturday TEXT,
    sunday TEXT,
    start_date TEXT,
    end_date TEXT,
    PRIMARY KEY (feed_key, service_id)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS calendar_dates (
    feed_key TEXT NOT NULL,
    service_id TEXT NOT NULL,
    date TEXT NOT NULL,
    exception_type TEXT,
    PRIMARY KEY (feed_key, service_id, date)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS shapes (
    feed_key TEXT NOT NULL,
    shape_id TEXT NOT NULL,
    shape_pt_lat REAL,
    shape_pt_lon REAL,
    shape_pt_sequence INTEGER NOT NULL,
    shape_dist_traveled TEXT,
    PRIMARY KEY (feed_key, shape_id, shape_pt_sequence)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS fare_attributes (
    feed_key TEXT NOT NULL,
    fare_id TEXT NOT NULL,
    price TEXT,
    currency_type TEXT,
    payment_method TEXT,
    transfers TEXT,
    agency_id TEXT,
    transfer_duration TEXT,
    PRIMARY KEY (feed_key, fare_id)
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS fare_rules (
    feed_key TEXT NOT NULL,
    fare_id TEXT NOT NULL,
    route_id TEXT,
    origin_id TEXT,
    destination_id TEXT,
    contains_id TEXT
  )` });

  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS feed_info (
    feed_key TEXT NOT NULL,
    feed_publisher_name TEXT,
    feed_publisher_url TEXT,
    feed_lang TEXT,
    feed_start_date TEXT,
    feed_end_date TEXT,
    feed_version TEXT,
    PRIMARY KEY (feed_key, feed_version)
  )` });

  // Helper: route_stops (materialized mapping for fast queries)
  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS route_stops (
    feed_key TEXT NOT NULL,
    route_id TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    PRIMARY KEY (feed_key, route_id, stop_id)
  )` });

  // Meta: track feed refreshes
  statements.push({ sql: ddl`CREATE TABLE IF NOT EXISTS feed_meta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_key TEXT NOT NULL,
    feed_url TEXT,
    last_updated INTEGER,
    etag TEXT,
    last_successful_refresh INTEGER,
    app_version TEXT,
    notes TEXT
  )` });

  // Indexes for performance
  const indexes: string[] = [
    'CREATE INDEX IF NOT EXISTS idx_routes_feed_route ON routes(feed_key, route_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_feed_route ON trips(feed_key, route_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_feed_shape ON trips(feed_key, shape_id)',
    'CREATE INDEX IF NOT EXISTS idx_stop_times_feed_trip ON stop_times(feed_key, trip_id)',
    'CREATE INDEX IF NOT EXISTS idx_stop_times_feed_stop ON stop_times(feed_key, stop_id)',
    'CREATE INDEX IF NOT EXISTS idx_shapes_feed_shape ON shapes(feed_key, shape_id)',
    'CREATE INDEX IF NOT EXISTS idx_fare_rules_feed_fare ON fare_rules(feed_key, fare_id)',
    'CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(feed_key, route_id)',
    'CREATE INDEX IF NOT EXISTS idx_route_stops_stop ON route_stops(feed_key, stop_id)',
  ];
  indexes.forEach(sql => statements.push({ sql }));
  try {
    // Execute in a transaction
    await db.withTransaction((tx) => {
      // Native adapter requires sync callback; we just enqueue promises via tx.execute
      for (const s of statements) {
        // We ignore result rows for DDL
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        tx.execute(s.sql);
      }
      return;
    });
    console.log('[db] Migrations completed');
  }catch (e) {
    console.error('[db] Migration failed:', e);
  }
}
