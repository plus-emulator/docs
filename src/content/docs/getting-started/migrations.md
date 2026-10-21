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

For a database from before migration 60, set `Database.Migrations.FurnidataFile` to the hotel's existing `FurnitureData.json` if the emulator stops and asks for it.

## Recover from a failed migration

Read the migration filename and failed statement in the log. Fix the cause before starting again, or restore the database backup and matching previous executable.

Database schema changes can remain after a failed migration. Replacing the executable alone does not restore the previous database state.

The default backup directory is `backups` under the emulator's working directory. `Database.Migrations.BackupDirectory` can change it. These migration backups do not replace regular backups of the whole hotel.
