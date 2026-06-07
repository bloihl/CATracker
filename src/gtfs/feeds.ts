export interface FeedConfig {
  key: string;   // e.g., 'hoodriver'
  url: string;   // zip URL
  name?: string; // display name
}

export const DEFAULT_FEEDS: FeedConfig[] = [
  {
    key: 'hoodriver',
    url: 'https://oregon-gtfs.trilliumtransit.com/gtfs_data/hoodriver-or-us/hoodriver-or-us.zip',
    name: 'Hood River CAT (Trillium)',
  },
];
