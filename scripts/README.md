# Scripts Directory

This directory contains utility scripts for managing the application.

## Available Scripts

### `migrate-data.js`

Migrates data from a PostgreSQL database to Supabase.

**Usage:**
```bash
npm run db:migrate
```

**Prerequisites:**
1. PostgreSQL database with existing data
2. Supabase project set up
3. Environment variables configured

**Environment Variables:**
- `DB_USER` - PostgreSQL username (default: postgres)
- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_NAME` - PostgreSQL database name (default: suratku)
- `DB_PASSWORD` - PostgreSQL password (default: postgres)
- `DB_PORT` - PostgreSQL port (default: 5432)

### Other Scripts
- `db:setup` - Sets up the database
- `db:init` - Initializes the database
- `db:seed` - Seeds the database with initial data
- `db:fix-sequence` - Fixes database sequence issues

## Running Scripts

To run any script, use npm:

```bash
npm run [script-name]
```

For example:
```bash
npm run db:migrate
```