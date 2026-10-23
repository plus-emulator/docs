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

Volt reads `renderer-config.json` and `ui-config.json` from its configuration directory. The installer sets `socket.url` in `renderer-config.json` to your public WebSocket address. For a manual installation, use the `Nitro` address, for example `ws://127.0.0.1:2096`. In production, put a TLS proxy in front of it and use `wss://`.

Current PlusEMU builds generate furniture data from the database. When the emulator serves furniture data during installation, the installer sets `furnidata.url` in `renderer-config.json` to:

```text
https://your-domain/api/gamedata/furnidata
```

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

Enter the password at the prompt. For a desktop database client, use an SSH tunnel to `127.0.0.1:3306` through the server's SSH address. Keep the database port private.
