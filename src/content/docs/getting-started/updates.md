---
title: Update PlusEMU
description: Update PlusEMU and Volt with plusemu-update or by hand, and understand database migrations and backups.
sidebar:
  order: 3
---

To see what changed in each release, read the [changelog](/changelog/).

On a hotel set up with the installer, use the `plusemu-update` command on Linux and on Windows. For a manual installation, [update by hand](#update-by-hand).

Running the normal installer command again does not update the emulator or the client. It does install a newer hotel files pack when one exists, fetches Atom CMS again, and rewrites the web server configuration.

## Update with plusemu-update

The first time, install the command. On Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo bash -s -- update
```

On Windows, in an Administrator PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.ps1))) -Update
```

This also runs the first update. After that, run `sudo plusemu-update` on Linux or `plusemu-update` on Windows.

The command:

1. Shows the installed and newest versions of PlusEMU, Volt, and the hotel files, then asks before it changes anything.
2. Downloads and checks the new releases and the hotel files pack.
3. Backs up the database, the emulator, the client, and the hotel files to `/var/backups/plusemu/` on Linux or `C:\ProgramData\PlusEMU\backups\` on Windows. It keeps the 3 newest backups.
4. Installs the new versions and applies the database migrations.
5. Installs the newest hotel files pack when it changed: furniture, clothing, effects, badges, texts, icons, and sounds (about 550 MB). Stock files are replaced. Files you added stay. The emulator's `Config/figuredata.xml` is replaced by the release copy that matches the pack.
6. Keeps your `Config/` and `configuration/` files and files you added. It adds new settings and keeps the values you changed.
7. Restores the backup automatically if a step fails.

When the emulator is updated, players are disconnected for about a minute. Players get the new client when they reload the hotel page. The command does not update Atom CMS.

| Linux | Windows | What it does |
| --- | --- | --- |
| `--check` | `-Check` | Shows the available updates and changes nothing. |
| `--yes` | `-Yes` | Skips the "Update now?" question. |
| `--assets` | `-Assets` | Updates the hotel files only, without stopping the emulator. See below. |
| `--rollback` | `-Rollback` | Restores the newest backup. |

`--with-assets` from older guides is still accepted and does nothing. The hotel files are part of every update.

`--rollback` also restores the database. Game progress since that backup is lost. Before it restores, the command backs up the current state, so you can run `--rollback` again to undo it.

The update log is `/var/log/plusemu-update.log` on Linux or `C:\ProgramData\PlusEMU\update.log` on Windows. Remove passwords before you share it.

### Add missing hotel files only

To get new stock content without any downtime, run:

```bash
sudo plusemu-update --assets
```

On Windows: `plusemu-update -Assets`.

When the published pack changed, the command downloads it and adds every stock file your hotel does not have. Files you already have stay as they are, including stock files you edited. Only the `gamedata` folder (the index of clothing, effects, products, and texts) is replaced by the pack's copy. Your previous `gamedata` folder is kept in the backups folder as `gamedata-<version>`, so you can copy edited texts back by hand.

The emulator keeps running. New clothing also needs the emulator's `Config/figuredata.xml` from the matching release. Run the full `plusemu-update` when new clothing does not show.

### The hotel files pack

Both installers download `hotel-files.tar.gz` from the [hotel-files release](https://github.com/plus-emulator/plusemu-installer/releases/tag/hotel-files). It is rebuilt from the asset bucket, so new assets reach every hotel with the next update. The first 12 characters of the pack's SHA-256 are the version the installer records in `versions.env` or `versions.json`.

## Update by hand

Update the emulator from a [PlusEMU release](https://github.com/plus-emulator/PlusEMU/releases).

### Prepare the update

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

### Start the new version

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
