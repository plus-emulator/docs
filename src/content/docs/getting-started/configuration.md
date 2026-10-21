---
title: Configuration
description: Find emulator, client, and website settings, service commands, and the database connection.
sidebar:
  order: 2
---

PlusEMU, Volt, and Atom CMS each have their own settings. The installer connects them during setup.

## File locations

| File or directory | Linux installer | Windows installer |
| --- | --- | --- |
| Hotel root | `/var/www/hotel` | `C:\Hotel` |
| Emulator settings | `/var/www/hotel/emulator/Config/config.json` | `C:\Hotel\emulator\Config\config.json` |
| Client configuration | `/var/www/hotel/client/configuration/` | `C:\Hotel\client\configuration\` |
| Website settings | `/var/www/hotel/cms/.env` | `C:\Hotel\cms\.env` |
| Saved installer answers and credentials | `/etc/plusemu/hotel.env` | `C:\ProgramData\PlusEMU\hotel.json` |
| Installer log | `/var/log/plusemu-install.log` | `C:\ProgramData\PlusEMU\install.log` |
| Installed versions | `/etc/plusemu/versions.env` | `C:\ProgramData\PlusEMU\versions.json` |
| [Update](/getting-started/updates/) backups and log | `/var/backups/plusemu/`, `/var/log/plusemu-update.log` | `C:\ProgramData\PlusEMU\backups\`, `C:\ProgramData\PlusEMU\update.log` |

For a manual installation, `Config/config.json` is relative to the emulator's working directory. Logging uses `Config/nlog.config`.

## Emulator settings

| Section | Purpose | Default address |
| --- | --- | --- |
| `Database` | MariaDB or MySQL connection and migration settings | `127.0.0.1:3306` |
| `Nitro` | WebSocket listener used by Volt | `127.0.0.1:2096` |
| `Flash` | TCP listener for the AIR client | `127.0.0.1:1232` |
| `Rcon` | Remote control connection used by the website | `127.0.0.1:30001` |
| `WebServer` | Generated furniture data and HTTP APIs | `127.0.0.1:8080` |
| `Camera` | Private renderer connection and photo storage | `127.0.0.1:3921` |
| `AirClient` | AIR gamedata, launcher settings, and tickets | No public game host by default |

The installer keeps the emulator and database on local addresses. The web server forwards public client requests to the emulator.

Changes to `Config/config.json` take effect after an emulator restart. Game settings stored in the `server_settings` database table work differently. You can reload them without a restart. Staff need both `command.update` and `command.update_configuration` to reload them with `:update settings`.

## Restart and inspect the emulator

On Linux:

```bash
sudo systemctl restart plusemu
sudo journalctl -u plusemu -f
```

On Windows, use an Administrator PowerShell:

```powershell
Restart-Service PlusEMU
Get-Content C:\Hotel\emulator\service\shawl_for_PlusEMU_rCURRENT.log -Tail 50 -Wait
```

## Client connection and furniture data

Volt reads `renderer-config.json` and `ui-config.json` from its configuration directory. The installer sets `socket.url` in `renderer-config.json` to your public WebSocket address.

Current PlusEMU builds generate furniture data from the database. When the emulator serves furniture data during installation, the installer sets `furnidata.url` in `renderer-config.json` to:

```text
https://your-domain/api/gamedata/furnidata
```

To check the emulator directly on the server:

```bash
curl http://127.0.0.1:8080/api/gamedata/furnidata
```

A JSON response confirms that the emulator serves furniture data. If the public URL fails while the local URL works, inspect the web server route for `/api/gamedata/furnidata`.

The [Wired Web API](/features/wired/#web-api) needs an additional `/api/public/` route. The camera needs a public [photo directory](/features/camera-setup/#serve-the-photos).

## Database access

The installer uses database `plus`, username `hotel`, host `127.0.0.1`, and port `3306`.

Retrieve the database password from the protected installer file. Its key is `DB_PASSWORD` on Linux or `DbPassword` on Windows. These files also contain the initial admin password. Keep their contents private.

On Linux, connect with:

```bash
mariadb --host=127.0.0.1 --port=3306 --user=hotel --password plus
```

Enter the password at the prompt. For a desktop database client, use an SSH tunnel to `127.0.0.1:3306` through the server's SSH address. Keep the database port private.
