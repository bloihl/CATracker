// Minimal GTFS types and helpers used during ingestion.
// We intentionally keep fields as string | number | null to avoid coercion issues.

export type Maybe<T> = T | null | undefined;

export interface Progress {
  /** short phase id (e.g., 'download', 'unzip', 'parse:routes', 'insert:stops') */
  phase: string;
  /** a human readable message */
  message?: string;
  /** current item count within this phase */
  current?: number;
  /** total item count for this phase, if known */
  total?: number;
}

export type ProgressCallback = (p: Progress) => void;

export interface CsvFilesMap {
  // filename (e.g., 'routes.txt') -> file content as string
  [filename: string]: string | undefined;
}

// Known GTFS filenames we will parse (others are ignored for now)
export const GTFS_FILES = {
  agency: 'agency.txt',
  stops: 'stops.txt',
  routes: 'routes.txt',
  trips: 'trips.txt',
  stop_times: 'stop_times.txt',
  calendar: 'calendar.txt',
  calendar_dates: 'calendar_dates.txt',
  shapes: 'shapes.txt',
  fare_attributes: 'fare_attributes.txt',
  fare_rules: 'fare_rules.txt',
  feed_info: 'feed_info.txt',
} as const;

export type GtfsTableName = keyof typeof GTFS_FILES | 'route_stops' | 'feed_meta';
