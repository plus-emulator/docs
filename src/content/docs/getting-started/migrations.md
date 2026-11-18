---
title: Database migrations
description: How PlusEMU applies database migrations, how to inspect or apply them by hand, and how to recover from a failed migration.
sidebar:
  order: 4
---

PlusEMU applies pending database migrations before it loads the hotel. With the default settings, it writes a full database backup first and stops if that backup fails. [plusemu-update](/getting-started/updates/) runs the migrations for you. This page is for checking them yourself or fixing a failed one.

## Inspect migrations

To see migration status, run the executable from the directory containing your installed `Config/`. On Linux, run it as the `plusemu` service account, because only that account can read `Config/config.json`:

```bash
cd /var/www/hotel/emulator
sudo -u plusemu ./"Plus Emulator" --migrate-status
```

On Windows, use an Administrator PowerShell:

```powershell
cd C:\Hotel\emulator
& '.\Plus Emulator.exe' --migrate-status
```

The status command changes nothing. To apply pending migrations and exit without starting the hotel, use `--migrate` instead. Keep the emulator service stopped while you run it. On Linux, also run `--migrate` as `plusemu`, so later backups can write to the backup directory.

Migration scripts are compiled into the executable. PlusEMU records applied migrations in `schema_migrations`. The release also includes `Database/Migrations/` and `Database/FreshInstall.sql` for reference.

## What happens at startup

1. Before anything loads, PlusEMU applies the migrations your database does not have yet, in order. It records each one in the `schema_migrations` table. When nothing is pending, startup continues at once.
2. If your database is from before `schema_migrations` existed, PlusEMU checks it for the changes of every earlier migration. It records the ones it finds and applies only the rest.
3. Before it applies anything, it writes a full backup to `backups/`. It uses `mariadb-dump` or `mysqldump` when one is on `PATH`, and its own dump otherwise. It applies migrations only when the backup worked.
4. If a migration fails, PlusEMU logs the file and the statement, and does not start.

## Migration settings

These settings are under `Database.Migrations` in `Config/config.json`.

| Key | Purpose | Default |
| --- | --- | --- |
| `AutoMigrate` | Apply pending migrations at startup. When `false`, PlusEMU refuses to start while migrations are pending. | `true` |
| `Backup` | Back up the database before applying migrations. | `true` |
| `BackupDirectory` | Where backups go. | `backups` |
| `DumpCommand` | Path to `mariadb-dump` or `mysqldump`. Empty means look on `PATH`. | `""` |
| `FurnidataFile` | Path to your hotel's current `FurnitureData.json`. | `""` |

`FurnidataFile` is only needed for a database from before migration 60 (releases before 8 October 2026). That migration moves furniture data into the `furniture` table. PlusEMU stops and asks for this file instead of running the migration without it.

## Other command-line options

- `--migrate-mark-applied <file>` records a migration as applied without running it.
- `--migrate-allow-gaps` applies migrations that look unapplied while later ones look applied.

Use these two only when the startup check cannot place your database history. PlusEMU tells you when that happens.

## MariaDB versions

PlusEMU works with MariaDB 10.6, 10.11, and 11.5 or newer. Use MariaDB 11.5 or newer with PlusEMU 1.0.31 or newer only. Older releases can stop at a migration on these versions.

The hotel database uses one collation: `utf8mb4_unicode_ci`. Columns that need exact matching use `utf8mb4_bin`. MariaDB 11.5 changed the server's default collation to `utf8mb4_uca1400_ai_ci`. A table created without a collation then gets the new default, and joins and foreign keys between two collations fail.

Migration 162 fixes this on existing hotels:

- It sets the database, every table, and every text column to `utf8mb4_unicode_ci`. It keeps `utf8mb4_bin` and ASCII columns as they are.
- It changes only what differs. On a database that already has one collation, it changes nothing.
- It keeps the data and the foreign keys.

On a hotel whose tables drifted to another collation, migration 162 rebuilds those tables. This can take a while on large tables, and it locks each table while it works. Update such a hotel in a quiet moment, and stop other programs that write to the database, such as the website, during the update.

If the new collation would make two rows equal in a unique key, migration 162 stops with the message `Collation change would duplicate a key in <table>.<key>`. Fix or remove the duplicate rows, then start PlusEMU again. The migration runs again from the start.

To check your database before you update:

```sql
SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
  AND TABLE_COLLATION <> 'utf8mb4_unicode_ci';

SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND CHARACTER_SET_NAME <> 'ascii'
  AND COLLATION_NAME NOT IN ('utf8mb4_unicode_ci', 'utf8mb4_bin');
```

When both queries return no rows, migration 162 rebuilds no tables.

## Recover from a failed migration

Read the migration filename and failed statement in the log. Fix the cause before starting again, or restore the database backup and matching previous executable.

Database schema changes can remain after a failed migration. Replacing the executable alone does not restore the previous database state.

The default backup directory is `backups` under the emulator's working directory. Change it with `BackupDirectory`. These migration backups do not replace regular backups of the whole hotel.
