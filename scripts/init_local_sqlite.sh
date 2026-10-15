#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
database_path=${1:-"$project_root/local/data/wetravel.sqlite3"}
database_dir=$(dirname -- "$database_path")

mkdir -p "$database_dir"
sqlite3 "$database_path" < "$project_root/local/sqlite/schema.sql"
sqlite3 "$database_path" < "$project_root/local/sqlite/seed.sql"
if [ "${WETRAVEL_DEMO_DATA:-1}" != "0" ]; then
  sqlite3 "$database_path" < "$project_root/local/sqlite/demo.sql"
fi
sqlite3 "$database_path" "PRAGMA foreign_keys=ON; PRAGMA integrity_check; PRAGMA foreign_key_check;"
printf '%s\n' "Local SQLite database ready: $database_path"
