---
title: Update PlusEMU
description: Replace the emulator safely and understand automatic database migrations and backups.
sidebar:
  order: 3
---

Update the emulator from a [PlusEMU release](https://github.com/plus-emulator/PlusEMU/releases). Running the installer again does not update the emulator or the client. It does fetch Atom CMS again and rewrite the web server configuration, so do not use it to update.

## Prepare the update

1. Read the release notes for client, website, and configuration requirements.
2. Download the archive for your system: `plusemu-linux-x64.tar.gz`, `plusemu-linux-arm64.tar.gz`, or `plusemu-win-x64.zip`.
3. Check the archive against the release's `SHA256SUMS` file. On Linux, run `sha256sum --check --ignore-missing SHA256SUMS` in the download directory.
4. Back up the database, emulator configuration, website configuration, and camera photos.
5. Stop the emulator before replacing its executable.

On Linux:

```bash
sudo systemctl stop plusemu
```

On Windows:

```powershell
Stop-Service PlusEMU
```

Extract the release into a separate directory. Compare its `Config/config.json` with your installed settings and add any required new keys. Keep your database password, the camera token (`Camera.Bearer`), and your custom settings.

Replace the installed executable and the `snowstorm/` directory with the new ones. Compare `Config/figuredata.xml` with the release copy. Keep the previous files with your backup. On Linux, preserve executable permissions and allow the `plusemu` service account to read the new file.

## Start the new version

On Linux:

```bash
sudo systemctl start plusemu
sudo journalctl -u plusemu -f
```

On Windows:

```powershell
Start-Service PlusEMU
Get-Content C:\Hotel\emulator\service\shawl_for_PlusEMU_rCURRENT.log -Tail 50 -Wait
```

PlusEMU applies pending database migrations before loading the hotel. With the default settings, it writes a full database backup first and stops if that backup fails.

After startup, sign in, enter a room, and open the catalogue. Check the log for migration or configuration errors.

If you also update Volt, preserve its hotel configuration and restart the camera renderer so it loads the new `camera.html` build.

## Inspect migrations separately

To see migration status, run the new executable from the directory containing your installed `Config/`. On Linux, run it as the `plusemu` service account, because only that account can read `Config/config.json`:

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
