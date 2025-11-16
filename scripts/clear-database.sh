#!/bin/bash

# Script to clear Cloudflare D1 database and reset migrations
# Usage: ./scripts/clear-database.sh [local|remote]

ENV=${1:-local}

# Function to execute SQL command and ignore errors
execute_sql() {
  local env_flag=$1
  local sql=$2
  wrangler d1 execute D1 $env_flag --command "$sql" 2>/dev/null || true
}

if [ "$ENV" = "remote" ]; then
  echo "Clearing remote D1 database..."
  ENV_FLAG="--remote"
else
  echo "Clearing local D1 database..."
  ENV_FLAG="--local"
fi

# Drop all tables (order matters due to foreign keys)
# Using a single SQL script to drop all tables at once
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS payload_migrations;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS payload_preferences_rels;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS payload_preferences;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS payload_locked_documents_rels;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS payload_locked_documents;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS posts_populated_authors;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS posts_rels;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS posts;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS categories;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS media;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS users_sessions;"
execute_sql "$ENV_FLAG" "DROP TABLE IF EXISTS users;"

echo "Database cleared. Now run: pnpm run payload migrate"

