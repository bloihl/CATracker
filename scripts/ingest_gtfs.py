import sqlite3
import csv
import os
import zipfile
import urllib.request
import tempfile
import shutil
import sys
import argparse
import time

# --- Database Schema (matched to src/db/migrations.ts) ---
DDL = [
    """CREATE TABLE IF NOT EXISTS agency (
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
    )""",
    """CREATE TABLE IF NOT EXISTS stops (
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
    )""",
    """CREATE TABLE IF NOT EXISTS routes (
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
    )""",
    """CREATE TABLE IF NOT EXISTS trips (
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
    )""",
    """CREATE TABLE IF NOT EXISTS stop_times (
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
    )""",
    """CREATE TABLE IF NOT EXISTS calendar (
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
    )""",
    """CREATE TABLE IF NOT EXISTS calendar_dates (
        feed_key TEXT NOT NULL,
        service_id TEXT NOT NULL,
        date TEXT NOT NULL,
        exception_type TEXT,
        PRIMARY KEY (feed_key, service_id, date)
    )""",
    """CREATE TABLE IF NOT EXISTS shapes (
        feed_key TEXT NOT NULL,
        shape_id TEXT NOT NULL,
        shape_pt_lat REAL,
        shape_pt_lon REAL,
        shape_pt_sequence INTEGER NOT NULL,
        shape_dist_traveled TEXT,
        PRIMARY KEY (feed_key, shape_id, shape_pt_sequence)
    )""",
    """CREATE TABLE IF NOT EXISTS fare_attributes (
        feed_key TEXT NOT NULL,
        fare_id TEXT NOT NULL,
        price TEXT,
        currency_type TEXT,
        payment_method TEXT,
        transfers TEXT,
        agency_id TEXT,
        transfer_duration TEXT,
        PRIMARY KEY (feed_key, fare_id)
    )""",
    """CREATE TABLE IF NOT EXISTS fare_rules (
        feed_key TEXT NOT NULL,
        fare_id TEXT NOT NULL,
        route_id TEXT,
        origin_id TEXT,
        destination_id TEXT,
        contains_id TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS feed_info (
        feed_key TEXT NOT NULL,
        feed_publisher_name TEXT,
        feed_publisher_url TEXT,
        feed_lang TEXT,
        feed_start_date TEXT,
        feed_end_date TEXT,
        feed_version TEXT,
        PRIMARY KEY (feed_key, feed_version)
    )""",
    """CREATE TABLE IF NOT EXISTS route_stops (
        feed_key TEXT NOT NULL,
        route_id TEXT NOT NULL,
        stop_id TEXT NOT NULL,
        PRIMARY KEY (feed_key, route_id, stop_id)
    )""",
    """CREATE TABLE IF NOT EXISTS feed_meta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feed_key TEXT NOT NULL,
        feed_url TEXT,
        last_updated INTEGER,
        etag TEXT,
        last_successful_refresh INTEGER,
        app_version TEXT,
        notes TEXT
    )""",
    "CREATE INDEX IF NOT EXISTS idx_routes_feed_route ON routes(feed_key, route_id)",
    "CREATE INDEX IF NOT EXISTS idx_trips_feed_route ON trips(feed_key, route_id)",
    "CREATE INDEX IF NOT EXISTS idx_trips_feed_shape ON trips(feed_key, shape_id)",
    "CREATE INDEX IF NOT EXISTS idx_stop_times_feed_trip ON stop_times(feed_key, trip_id)",
    "CREATE INDEX IF NOT EXISTS idx_stop_times_feed_stop ON stop_times(feed_key, stop_id)",
    "CREATE INDEX IF NOT EXISTS idx_shapes_feed_shape ON shapes(feed_key, shape_id)",
    "CREATE INDEX IF NOT EXISTS idx_fare_rules_feed_fare ON fare_rules(feed_key, fare_id)",
    "CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(feed_key, route_id)",
    "CREATE INDEX IF NOT EXISTS idx_route_stops_stop ON route_stops(feed_key, stop_id)",
]

# --- GTFS Files and Table Mappings ---
GTFS_FILES = {
    'agency': 'agency.txt',
    'stops': 'stops.txt',
    'routes': 'routes.txt',
    'trips': 'trips.txt',
    'stop_times': 'stop_times.txt',
    'calendar': 'calendar.txt',
    'calendar_dates': 'calendar_dates.txt',
    'shapes': 'shapes.txt',
    'fare_attributes': 'fare_attributes.txt',
    'fare_rules': 'fare_rules.txt',
    'feed_info': 'feed_info.txt',
}

def get_columns(table_name):
    # This is a bit manual but ensures we match ingestCore.ts
    mapping = {
        'agency': ['feed_key','agency_id','agency_name','agency_url','agency_timezone','agency_lang','agency_phone','agency_fare_url','agency_email'],
        'stops': ['feed_key','stop_id','stop_code','stop_name','stop_desc','stop_lat','stop_lon','zone_id','stop_url','location_type','parent_station','stop_timezone','wheelchair_boarding','platform_code'],
        'routes': ['feed_key','route_id','agency_id','route_short_name','route_long_name','route_desc','route_type','route_url','route_color','route_text_color','route_sort_order'],
        'trips': ['feed_key','route_id','service_id','trip_id','trip_headsign','trip_short_name','direction_id','block_id','shape_id','wheelchair_accessible','bikes_allowed'],
        'stop_times': ['feed_key','trip_id','arrival_time','departure_time','stop_id','stop_sequence','stop_headsign','pickup_type','drop_off_type','shape_dist_traveled','timepoint'],
        'calendar': ['feed_key','service_id','monday','tuesday','wednesday','thursday','friday','saturday','sunday','start_date','end_date'],
        'calendar_dates': ['feed_key','service_id','date','exception_type'],
        'shapes': ['feed_key','shape_id','shape_pt_lat','shape_pt_lon','shape_pt_sequence','shape_dist_traveled'],
        'fare_attributes': ['feed_key','fare_id','price','currency_type','payment_method','transfers','agency_id','transfer_duration'],
        'fare_rules': ['feed_key','fare_id','route_id','origin_id','destination_id','contains_id'],
        'feed_info': ['feed_key','feed_publisher_name','feed_publisher_url','feed_lang','feed_start_date','feed_end_date','feed_version'],
    }
    return mapping.get(table_name)

def ingest_gtfs(db_path, feed_url, feed_key):
    print(f"Starting ingestion for {feed_key}...")

    with tempfile.TemporaryDirectory() as tmp_dir:
        zip_path = os.path.join(tmp_dir, "feed.zip")
        extract_dir = os.path.join(tmp_dir, "extracted")
        os.makedirs(extract_dir)

        print(f"Downloading {feed_url}...")
        urllib.request.urlretrieve(feed_url, zip_path)

        print("Extracting...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("Running migrations...")
        for statement in DDL:
            cursor.execute(statement)

        # Clear existing data for this feed_key
        print(f"Cleaning up old data for {feed_key}...")
        for table in list(GTFS_FILES.keys()) + ['route_stops']:
            cursor.execute(f"DELETE FROM {table} WHERE feed_key = ?", (feed_key,))

        for table, filename in GTFS_FILES.items():
            file_path = os.path.join(extract_dir, filename)
            if not os.path.exists(file_path):
                continue

            cols = get_columns(table)
            placeholders = ",".join(["?"] * len(cols))
            sql = f"INSERT INTO {table} ({','.join(cols)}) VALUES ({placeholders})"

            print(f"Ingesting {filename}...")
            with open(file_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                batch = []
                for row in reader:
                    vals = []
                    for col in cols:
                        if col == 'feed_key':
                            vals.append(feed_key)
                        else:
                            val = row.get(col)
                            if val == '' or val is None:
                                vals.append(None)
                            else:
                                # Simple type coercion for REAL/INTEGER columns
                                if col in ['stop_lat', 'stop_lon', 'shape_pt_lat', 'shape_pt_lon']:
                                    try: vals.append(float(val))
                                    except: vals.append(None)
                                elif col in ['stop_sequence', 'shape_pt_sequence']:
                                    try: vals.append(int(val))
                                    except: vals.append(None)
                                else:
                                    vals.append(val)
                    batch.append(vals)
                    if len(batch) >= 1000:
                        cursor.executemany(sql, batch)
                        batch = []
                if batch:
                    cursor.executemany(sql, batch)

        print("Building route_stops...")
        route_stops_sql = """
            INSERT OR IGNORE INTO route_stops(feed_key, route_id, stop_id)
            SELECT st.feed_key, t.route_id, st.stop_id
            FROM stop_times st
            JOIN trips t ON t.feed_key = st.feed_key AND t.trip_id = st.trip_id
            WHERE st.feed_key = ? AND t.route_id IS NOT NULL AND st.stop_id IS NOT NULL
            GROUP BY st.feed_key, t.route_id, st.stop_id
        """
        cursor.execute(route_stops_sql, (feed_key,))

        print("Updating feed_meta...")
        now_ms = int(time.time() * 1000)
        cursor.execute(
            'INSERT INTO feed_meta(feed_key, feed_url, last_updated, last_successful_refresh) VALUES(?,?,?,?)',
            (feed_key, feed_url, now_ms, now_ms)
        )

        conn.commit()
        conn.close()
        print("Done!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest GTFS feed into SQLite")
    parser.add_argument("--db", required=True, help="Path to SQLite database")
    parser.add_argument("--url", required=True, help="URL to GTFS zip")
    parser.add_argument("--key", required=True, help="Feed key (e.g. hoodriver)")

    args = parser.parse_args()
    ingest_gtfs(args.db, args.url, args.key)
