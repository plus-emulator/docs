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

## Recover from a failed migration

Read the migration filename and failed statement in the log. Fix the cause before starting again, or restore the database backup and matching previous executable.

Database schema changes can remain after a failed migration. Replacing the executable alone does not restore the previous database state.

The default backup directory is `backups` under the emulator's working directory. Change it with `BackupDirectory`. These migration backups do not replace regular backups of the whole hotel.
