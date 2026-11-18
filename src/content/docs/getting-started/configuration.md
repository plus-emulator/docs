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
| [Nightly backups](/getting-started/backups-and-health/) and log | `/var/backups/plusemu/nightly/`, `/var/log/plusemu-backup.log` | `C:\ProgramData\PlusEMU\backups\nightly\`, `C:\ProgramData\PlusEMU\backup.log` |
| [Health check](/getting-started/backups-and-health/#health-check-and-discord-alerts) log | `/var/log/plusemu-health.log` | `C:\ProgramData\PlusEMU\health.log` |
| Setup guide | `/var/www/hotel/setup-guide/index.html` | `C:\Hotel\setup-guide\index.html` |

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
| `AirClient` | [AIR](/getting-started/air-client/) gamedata, launcher settings, and tickets | No public game host by default |

Set your own database password and camera token (`Camera.Bearer`). Do not commit them to a repository.

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

Volt reads `renderer-config.json` and `ui-config.json` from its configuration directory. The installer sets `socket.url` in `renderer-config.json` to your public WebSocket address. On a [local install](/getting-started/local-install/), that address is `ws://localhost/ws`, and every other address is `http://localhost`. For a manual installation, use the `Nitro` address, for example `ws://127.0.0.1:2096`. In production, put a TLS proxy in front of it and use `wss://`.

Current PlusEMU builds generate furniture data from the database. When the emulator serves furniture data during installation, the installer sets `furnidata.url` in `renderer-config.json` to:

```text
https://your-domain/api/gamedata/furnidata
```

On a local install, it is `http://localhost/api/gamedata/furnidata`.

To check the emulator directly on the server:

```bash
curl http://127.0.0.1:8080/api/gamedata/furnidata
```

A JSON response confirms that the emulator serves furniture data. If the public URL fails while the local URL works, inspect the web server route for `/api/gamedata/furnidata`.

### Furniture data endpoints

PlusEMU builds `FurnitureData.json` from the `furniture` rows that have furnidata, plus the purchase fields of the catalogue offers that sell them. It rebuilds the file when the catalogue reloads.

| Endpoint | Returns |
| --- | --- |
| `GET /api/gamedata/furnidata` | `FurnitureData.json`. It uses an `ETag`. A `?v=` that matches the current version is cached for good. |
| `GET /api/gamedata/furnidata/version` | `{"version": "..."}`, the SHA-1 of the current file. |

### Web server address and proxy

The web server uses plain HTTP and has no TLS. Its address is `WebServer.Hostname` and `WebServer.Port` in `Config/config.json`. The default is `127.0.0.1:8080`. If that port is in use, set another one. The startup log prints `Web server listening on ...` when the server is up. If that line is missing, PlusEMU could not use the port.

```json
"WebServer": {
    "Hostname": "127.0.0.1",
    "Port": 8080
}
```

To use it from Volt, proxy `/api/` from the web server that serves the client to PlusEMU. With nginx:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
}
```

Then set `furnidata.url` in `renderer-config.json` to `https://your-domain/api/gamedata/furnidata`.

For local tests with a client loaded over `http://`, you can use `http://127.0.0.1:8080/api/gamedata/furnidata` directly. A client loaded over `https://` cannot do this, because browsers block it (mixed content).

### Furniture data returns 404

Run `curl http://127.0.0.1:8080/api/gamedata/furnidata` on the server.

- **curl returns JSON.** The request from the client does not reach PlusEMU. Check that `furnidata.url` points to a host and port with the `/api/` proxy. For example, `https://localhost/...` goes to port 443, not to PlusEMU.
- **curl also returns 404** (`{"error":"Not found.","code":"not_found"}`). No furniture row has furnidata. A new installation has it. An upgraded database gets it from migration 60. If that migration ran without your `FurnitureData.json`, run it again with the file, then restart PlusEMU:

```bash
{ printf "SET @furnidata = FROM_BASE64('%s');\n" "$(base64 -w0 FurnitureData.json)"; cat Database/Migrations/60_FurnitureFurnidata.sql; } | mysql -u root -p plus
```

See [database migrations](/getting-started/migrations/) for `FurnidataFile`.

The [Wired Web API](/features/wired/#web-api) needs an additional `/api/public/` route. The camera needs a public [photo directory](/features/camera-setup/#serve-the-photos).

## Database access

The installer uses database `plus`, username `hotel`, host `127.0.0.1`, and port `3306`.

Retrieve the database password from the protected installer file. Its key is `DB_PASSWORD` on Linux or `DbPassword` on Windows. These files also contain the initial admin password. Keep their contents private.

On Linux, connect with:

```bash
mariadb --host=127.0.0.1 --port=3306 --user=hotel --password plus
```

Enter the password at the prompt.

### Connect from your PC

For a desktop database client, such as HeidiSQL, you have two choices:

- Use an SSH tunnel to `127.0.0.1:3306` through the server's SSH address. The database port stays private.
- Open the database port to your own IP address with the installer. This works on Linux servers only.

To open the port to your PC's IPv4 address, run on the server:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo bash -s -- --remote-database 203.0.113.7
```

Replace `203.0.113.7` with your own address. You can list several addresses or networks, separated by commas, for example `203.0.113.7,198.51.100.0/24`. Every other address stays blocked. At the end, the installer prints what to fill in on your PC: the server's IP address, port `3306`, user `hotel`, database `plus`, and the password.

To close the database again:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo bash -s -- --remote-database off
```

On an installed hotel, `--remote-database` changes only the firewall rules, the `hotel` database accounts, and the MariaDB listen address. The website, emulator, and client stay as they are. MariaDB and the emulator restart once when the database opens or closes, so players are disconnected for a moment.

A [local install](/getting-started/local-install/) does not need this. Connect to `127.0.0.1`.

## Atom CMS client page

Atom CMS opens the client on its client page. These rules apply to the Atom CMS version of 18 November 2026 and newer:

- **The game keeps running.** When a player opens the website from the client page, the website opens on top of the client. A "Return to hotel" button shows the client again, without a new login.
- **Logout everywhere.** When a player logs out in the client, the website logs them out too, in every open tab.
- **Client buttons.** The home, reload, fullscreen, and online count buttons on the client page are off by default.

To show the client buttons, open Housekeeping, go to the CMS settings, and set `enable_client_buttons` to `1`. `0` hides the buttons again.

Change this setting in Housekeeping, not with SQL. Atom CMS keeps the website settings in its cache, and Housekeeping clears that cache when you save. The headless API reports the setting as `clients.buttons_enabled` in `GET /api/v1/bootstrap`.
