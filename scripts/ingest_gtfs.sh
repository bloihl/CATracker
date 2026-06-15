#!/bin/bash

# Simple wrapper for GTFS ingestion script

set -e

DB_PATH=$1
FEED_URL=$2
FEED_KEY=$3

if [ -z "$DB_PATH" ] || [ -z "$FEED_URL" ] || [ -z "$FEED_KEY" ]; then
  echo "Usage: ./ingest_gtfs.sh <db_path> <feed_url> <feed_key>"
  echo "Example: ./ingest_gtfs.sh ./app.db https://example.com/gtfs.zip myfeed"
  exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PYTHON_SCRIPT="$SCRIPT_DIR/ingest_gtfs.py"

python3 "$PYTHON_SCRIPT" --db "$DB_PATH" --url "$FEED_URL" --key "$FEED_KEY"
