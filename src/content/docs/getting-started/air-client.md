---
title: Connect the AIR client
description: Set up your hotel for Habbo's AIR client with one installer command, or by hand, and start the client with the launcher, from zero to logged in.
sidebar:
  order: 5
---

Players can play your hotel with Habbo's official AIR desktop client. They start it with a free launcher that points the client to your hotel. This page has two parts:

- [Set up the hotel](#set-up-the-hotel) is for the hotel owner. With the installer, it is one command.
- [Play with the AIR client](#play-with-the-air-client) is for players. You can link players to that section.

Volt does not need any of this. Volt connects to the `Nitro` WebSocket listener. The AIR client connects to the `Flash` TCP listener. Both clients can be used on the same hotel at the same time.

## How it works

1. The player signs in on your website, for example `https://example.com`, and presses **Open AIR client**.
2. The website opens a `habbo://hab?server=example.com&token=<login ticket>` link. The link hands the login ticket to the launcher.
3. The launcher reads `https://example.com/api/client/air.json`. It downloads the AIR client from the `client.url` in that file, or Habbo's current client when there is none.
4. The launcher writes your game address and handshake key into its own copy of the client and starts it with the ticket.
5. The client connects to your game port over plain TCP and logs in. Then it loads the game data from `https://example.com/gamedata/` and the furniture and clothing from the asset addresses in that data.

### Why the client needs a patch

Habbo's AIR client only connects to Habbo's own game servers. Before it connects, it cuts 10 characters off the game address and adds `.habbo.com`. So a client set to `example.com` tries to connect to a Habbo server and shows **Maintenance break**.

Two things fix this, and both are already done for you:

- **The patched client.** PlusEMU publishes a copy of Habbo's client without this check at `https://assets.plusemu.dev/air/latest.json`. The installer points `client.url` at it.
- **The launcher.** HabboCustomLauncher [v2026.11.21](https://github.com/DennisObject/HabboCustomLauncher/releases/tag/v2026.11.21) and newer remove the check from any client it starts, also from Habbo's own client. It then adds `.habbo.com` to your game address, so the 10 characters the client cuts off leave your real address.

Players need launcher v2026.11.21 or newer. Older launchers show **Maintenance break** on every hotel that is not Habbo.

## Set up the hotel

You need:

- A current PlusEMU version. See [keep the client and PlusEMU up to date](#keep-the-client-and-plusemu-up-to-date).
- A domain with HTTPS, for example `example.com`.
- Atom CMS, for the **Open AIR client** button.

### Set up with the installer

If you installed the hotel with the [installer](/getting-started/installation/), one command sets up everything.

On an installed hotel:

- Linux: `sudo plusemu-update --with-air`
- Windows, in Administrator PowerShell: `plusemu-update -WithAir`

On a new hotel, add the option to the installer command:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo bash -s -- --with-air
```

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.ps1))) -WithAir
```

`PLUSEMU_AIR=1` does the same as the option. The installer saves the choice, so every later rerun and `plusemu-update` keeps the AIR client on. You cannot turn it off with the installer: players' launchers keep your game address and handshake key.

The command does all of the steps in [set up by hand](#set-up-by-hand):

1. It reads `https://assets.plusemu.dev/air/latest.json`, downloads Habbo's AIR texts from there and checks their SHA-256. It saves them in the emulator's `Config/air/` folder. Habbo blocks downloads from many servers, so the texts come from PlusEMU's copy.
2. It creates the handshake key `Config/rsa-private.pem` once. It never replaces an existing key.
3. It sets `Flash` to `0.0.0.0:30000`, `Encryption.RsaPrivateKeyFile` and the `AirClient` settings in `Config/config.json`. `ClientUrl` and `ClientVersion` point at the patched client. Your other settings stay.
4. It chooses the game address:
   - With a Cloudflare API token in that run, it adds a DNS-only `A` record `game.<domain>` and uses that name.
   - Without a token, the client connects to the server's IPv4 address.
5. It opens TCP port 30000 to every address: `ufw` on Linux, the firewall rule `plusemu-air-30000` on Windows. The website still accepts HTTPS only from Cloudflare.
6. It passes the AIR paths to the emulator: `location` blocks in nginx, or the IIS rule `PlusEMU AIR client` for the whole server.
7. It sets `AIR_CLIENT_ENABLED=true` in Atom CMS and refreshes its caches, so the website shows the **Open AIR client** button.
8. It restarts the emulator when the settings changed. Players are disconnected for a moment.
9. It checks that `air.json`, `/gamedata/hashes` and port 30000 answer, and adds these checks to the [health check](/getting-started/backups-and-health/#health-check-and-discord-alerts).

At the end it prints the client version, the game address and the steps for players.

To use `game.<domain>` instead of the IP address later, run the command again with your Cloudflare API token:

- Linux: `sudo PLUSEMU_CLOUDFLARE_TOKEN=<token> plusemu-update --with-air`
- Windows: `$env:PLUSEMU_CLOUDFLARE_TOKEN = '<token>'; plusemu-update -WithAir`

The installer does not save the token.

A [local installation](/getting-started/local-install/) uses `127.0.0.1` as the game address and listens on `127.0.0.1` only. It changes no firewall or DNS.

If your PlusEMU version has no AIR support yet, the command saves the choice and asks you to run `plusemu-update`. That update installs the newest PlusEMU and sets up the AIR client.

Then [check that it works](#check-that-it-works).

### Keep the client and PlusEMU up to date

Each PlusEMU version supports exactly one AIR client build from Habbo. The client and the emulator must use the same build, or the client cannot log in.

- With the installer, `plusemu-update` installs the newest PlusEMU and the matching patched client together. Keep your hotel updated. See [updates](/getting-started/updates/).
- When Habbo releases a new AIR client, players keep the published client until PlusEMU publishes a release and a patched client for the new build. Your hotel gets both with the next `plusemu-update`.
- With an empty `AirClient.ClientUrl`, the launcher always downloads Habbo's newest client. Then players cannot log in between Habbo's release and the PlusEMU release that supports it. Use the published client instead.

### Set up by hand

Use these steps without the installer, or to understand what the installer does. The examples use the installer's paths: `/var/www/hotel` on Linux and `C:\Hotel` on Windows. For a manual installation, use your own emulator folder.

#### 1. Create the handshake key

The AIR client checks the server's handshake with an RSA public key. The client only accepts the public exponent `65537`. PlusEMU needs its own 2048-bit key. Never put the private key in a repository.

On Linux, create the key as the emulator's user:

```bash
sudo runuser -u plusemu -- env -C /var/www/hotel/emulator "./Plus Emulator" --generate-rsa-key Config/rsa-private.pem
```

On Windows, in PowerShell:

```powershell
& 'C:\Hotel\emulator\Plus Emulator.exe' --generate-rsa-key 'C:\Hotel\emulator\Config\rsa-private.pem'
```

PlusEMU does not overwrite an existing file. On Linux it writes the key with mode `0600`. It also prints the public modulus. You do not need to copy it anywhere: `air.json` publishes it.

Do not replace the key later. Every player's client is patched with its public part, so a new key logs everybody out until their launcher patches the client again.

You can also create the key with `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out Config/rsa-private.pem`. Make sure the emulator's user can read the file.

Tell PlusEMU where the key is. Use one of these:

- `"Encryption": { "RsaPrivateKeyFile": "rsa-private.pem" }` in `Config/config.json`. A relative path is relative to `Config/`.
- The environment variable `PLUS_RSA_PRIVATE_KEY_FILE` with the path of the key file.
- The environment variable `PLUS_RSA_PRIVATE_KEY` with the PEM text itself.

Without a key, PlusEMU uses an old built-in 1024-bit key with exponent 3 and logs a warning. The AIR client cannot log in with that key, and `air.json` answers 404.

#### 2. Open the game port

The AIR client needs a plain TCP connection to the `Flash` listener. HTTP proxies, such as Cloudflare's proxy, cannot carry this connection.

1. In `Config/config.json`, set `Flash.Hostname` to `0.0.0.0` and `Flash.Port` to the game port. This page uses `30000`, the default of `AirClient.GamePorts`. The default `Flash.Port` is `1232`, so change one of them until they match.
2. Open the port in the firewall:
   - Linux: `sudo ufw allow 30000/tcp`
   - Windows: `netsh advfirewall firewall add rule name=plusemu-air-30000 dir=in action=allow protocol=TCP localport=30000`
3. Choose the game address:
   - The server's public IPv4 address. This works without DNS.
   - Or a hostname, for example `game.example.com`. If your website is behind Cloudflare, add an `A` record named `game` with your server's IPv4 address, and set **Proxy status** to **DNS only**. A proxied hostname only carries HTTP, so the client cannot connect through it.

Both choices show your server's IP address to players. The installer's firewall still accepts HTTPS only from Cloudflare, so the website stays behind Cloudflare. Only the game port is reachable directly.

#### 3. Get the AIR texts

The client needs a full set of Habbo's external variables and texts. They tell the client where to load furniture, clothing, sounds and images. Habbo blocks downloads from many servers, so use PlusEMU's copy. `https://assets.plusemu.dev/air/latest.json` lists the current files and their SHA-256.

On Linux:

```bash
sudo runuser -u plusemu -- mkdir -p /var/www/hotel/emulator/Config/air
cd /var/www/hotel/emulator/Config/air
manifest=$(curl -fsSL https://assets.plusemu.dev/air/latest.json)
sudo runuser -u plusemu -- curl -fsSL -o external_variables.txt "$(jq -r .externalVariables.url <<< "$manifest")"
sudo runuser -u plusemu -- curl -fsSL -o external_flash_texts.txt "$(jq -r .externalFlashTexts.url <<< "$manifest")"
```

On Windows, in PowerShell:

```powershell
$manifest = Invoke-RestMethod https://assets.plusemu.dev/air/latest.json
New-Item -ItemType Directory -Force C:\Hotel\emulator\Config\air | Out-Null
Invoke-WebRequest $manifest.externalVariables.url -OutFile C:\Hotel\emulator\Config\air\external_variables.txt
Invoke-WebRequest $manifest.externalFlashTexts.url -OutFile C:\Hotel\emulator\Config\air\external_flash_texts.txt
```

`plusemu-update` copies the `Config` folder, so it keeps these files.

#### 4. Fill in the `AirClient` settings

Add your values to `Config/config.json`. Use the `version` and `client.url` from `https://assets.plusemu.dev/air/latest.json` for `ClientVersion` and `ClientUrl`. For example:

```json
"Flash": {
    "Hostname": "0.0.0.0",
    "Port": 30000,
    "Name": "Default Flash Server"
},
"Encryption": {
    "RsaPrivateKeyFile": "rsa-private.pem"
},
"AirClient": {
    "UrlPrefix": "https://example.com",
    "ExternalVariablesFiles": ["air/external_variables.txt"],
    "ExternalTextsFiles": ["air/external_flash_texts.txt", "/var/www/hotel/hotel-files/gamedata/ExternalTexts.json"],
    "ProductDataFile": "/var/www/hotel/hotel-files/gamedata/ProductData.json",
    "Variables": {
        "external.texts.txt": "https://example.com/gamedata/external_flash_texts/1",
        "external.override.texts.txt": "https://example.com/gamedata/external_flash_texts/1",
        "badge.image.path": "https://example.com/hotel-files/c_images/album1584",
        "image.library.catalogue.url": "https://example.com/hotel-files/c_images/catalogue/"
    },
    "Name": "PlusEMU",
    "Environment": "en",
    "GameHost": "game.example.com",
    "GamePorts": "30000",
    "ClientVersion": "38-1",
    "ClientUrl": "https://assets.plusemu.dev/air/client/38-1/HabboWin.zip",
    "WebApi": "",
    "PocketApi": "",
    "Configuration": {},
    "TicketLifetimeSeconds": 60,
    "LauncherTokenLifetimeDays": 30
}
```

| Setting | Default | Meaning |
| --- | --- | --- |
| `UrlPrefix` | empty | The public address of the website, for example `https://example.com`. When it is empty, PlusEMU uses the address of the request (`X-Forwarded-Proto` and `Host`). |
| `GameHost` | empty | The game address from [step 2](#2-open-the-game-port): a hostname or an IP address. `air.json` answers 404 while it is empty. |
| `GamePorts` | `30000` | Game ports, separated by commas. The client tries them in order. One of them must be `Flash.Port`. |
| `Environment` | `en` | The environment the client runs as. It must be `en`, `pt`, `de`, `es`, `fi`, `fr`, `it`, `nl`, `tr` or `s2`. The client drops any other value. The launcher handles it, so players never type it. |
| `Name` | `PlusEMU` | The hotel name in `air.json`. |
| `ClientUrl`, `ClientVersion` | empty | Where the launcher downloads the client, and its version. The launcher downloads the client again when `ClientVersion` changes. See [keep the client and PlusEMU up to date](#keep-the-client-and-plusemu-up-to-date). |
| `WebApi`, `PocketApi` | empty | `web.api` and `pocket.api` for the client. When they are empty, the client uses `UrlPrefix`. |
| `Configuration` | `{}` | Extra `key: value` lines for the client's built-in configuration. |
| `ExternalVariablesFiles`, `ExternalTextsFiles`, `ProductDataFile`, `Variables` | empty | The game data. See [game data](#game-data). |
| `TicketLifetimeSeconds` | `60` | How long a ticket from `POST /api/client/air-ticket` works. PlusEMU keeps it between 10 and 300 seconds. A ticket works only once. |
| `LauncherTokenLifetimeDays` | `30` | How long a launcher token works. PlusEMU keeps it between 1 and 365 days. |

Restart the emulator after you change `Config/config.json`:

- Linux: `sudo systemctl restart plusemu`
- Windows: `Restart-Service PlusEMU`

The startup log shows `Handshake RSA key loaded from ... (2048 bits)` when the key works.

#### 5. Route the web paths to the emulator

The PlusEMU web server answers the launcher and the game data on `WebServer.Hostname` and `WebServer.Port`, by default `127.0.0.1:8080`. The website must pass these paths to it.

On Linux, open `/etc/nginx/sites-available/hotel.conf`. Add these blocks inside the HTTPS `server` block, before `location / {`:

```nginx
    # AIR client: launcher file, login tickets and game data, answered by the emulator.
    location = /api/client/air.json {
        limit_except GET HEAD { deny all; }
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }

    location ~ ^/api/client/(air-ticket|air-launcher-token)$ {
        client_max_body_size 4k;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }

    location = /gamedata/hashes {
        limit_except GET HEAD { deny all; }
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }

    location ~ ^/gamedata/(external_flash_texts|external_variables|furnidata_xml|productdata)/[^/]+$ {
        limit_except GET HEAD { deny all; }
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
```

Then test and reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

On Windows with IIS, add URL Rewrite rules that send the same paths to `http://127.0.0.1:8080/{R:0}` with Application Request Routing, and set the server variable `HTTP_X_FORWARDED_PROTO` to `https`. Add `HTTP_X_FORWARDED_PROTO` to the allowed server variables first. Put the rules before the website's own rules. Atom CMS replaces its `public/web.config` on updates, so add the rules for the whole server, not in that file.

#### 6. Turn on the website button

Atom CMS creates the `habbo://` link for a signed-in player.

1. In the website's `.env`, set `AIR_CLIENT_ENABLED=true`. The file is `/var/www/hotel/cms/.env` on Linux and `C:\Hotel\cms\.env` on Windows.
2. Check that `APP_URL` is your public address, for example `https://example.com`. The link uses the host of `APP_URL` as `server`. The launcher only accepts the link when this host is exactly the hotel domain in the launcher. `www.example.com` and `example.com` are different.
3. Reload the configuration cache:

   ```bash
   cd /var/www/hotel/cms && sudo -u www-data php artisan config:cache
   ```

See [the website button](#the-website-button) for what the button does.

### Check that it works

Run these checks from a computer outside the server:

1. The launcher file:

   ```bash
   curl -s https://example.com/api/client/air.json
   ```

   It must answer with JSON that has `game.host`, `game.ports`, `urls.prefix`, `rsa.modulus` and `client.url`. A 404 means that `GameHost` is empty or that PlusEMU has no usable handshake key.

2. The game data:

   ```bash
   curl -s https://example.com/gamedata/hashes
   ```

   It must list `external_texts`, `external_variables`, `furnidata` and `productdata` with your domain in each `url`.

3. The game port, with your game address:

   ```bash
   printf '<policy-file-request/>\0' | nc -w 3 game.example.com 30000
   ```

   It must print a `<cross-domain-policy>` XML text. No answer means that the port is closed, `Flash.Hostname` is still `127.0.0.1`, or the hostname is proxied.

4. A real login: follow [play with the AIR client](#play-with-the-air-client) with a test account, on a computer that never used the AIR client before.

With the installer, the health check runs checks 1 to 3 every 5 minutes.

### Troubleshooting

- **The client shows Maintenance break.** The client shows this for every failed connection, so it does not name the real problem. Check these in order:
  - The player uses launcher v2026.11.21 or newer. Older launchers keep Habbo's `.habbo.com` check.
  - The [checks](#check-that-it-works) pass.
  - The client build and the PlusEMU version match. See the emulator log.
- **`air.json` answers 404, or the launcher says `Hotel config ... returned HTTP 404`.** `AirClient.GameHost` is empty, there is no handshake key, or the key does not use exponent `65537`. Check the startup log for `No RSA private key is configured` or `has public exponent`.
- **`air.json` or `/gamedata/hashes` shows the website's page or a 404 from the website.** The web routes are missing or come after a rule that catches them. See [step 5](#5-route-the-web-paths-to-the-emulator).
- **The client starts but never connects.** Check the game port with `nc`. Check that `GamePorts` contains `Flash.Port`, that the firewall is open, and that a game hostname is **DNS only**.
- **The client connects, then disconnects right away.** The client build and the PlusEMU version do not match. The emulator log shows `Unknown revision connected <build>`. Run `plusemu-update`, or set `ClientUrl` and `ClientVersion` to the published client.
- **The launcher says the environment is not one the AIR client accepts.** `AirClient.Environment` is not one of the allowed values. Use `en` or another value from the list in step 4.
- **The game data answers 500.** A file in `ExternalVariablesFiles`, `ExternalTextsFiles` or `ProductDataFile` does not exist, or the emulator's user cannot read it.
- **Furniture, clothing or images are missing.** The external variables have no base file, or an asset address is wrong. See [game data](#game-data).
- **The login ticket does not work.** A ticket works only once. A ticket from `POST /api/client/air-ticket` works for `TicketLifetimeSeconds`, 60 seconds by default. A ticket from Atom works for 5 minutes. Press **Open AIR client** again.
- **The Open AIR client button does not show.** Sign in, and check `AIR_CLIENT_ENABLED=true` and the configuration cache. Update Atom CMS if it is older than 21 November 2026.
- **The launcher ignores the website link.** The host of Atom's `APP_URL` and the launcher's hotel domain are not the same.
- **A launcher token stopped working.** It expired after `LauncherTokenLifetimeDays`, the player changed their password, or the token was revoked.

## Play with the AIR client

This part is for players. Your hotel must have the [hotel setup](#set-up-the-hotel) done.

### 1. Download the launcher

Download the launcher for your system from [HabboCustomLauncher releases](https://github.com/DennisObject/HabboCustomLauncher/releases/latest). Use v2026.11.21 or newer. This launcher is a fork of LilithRainbows' HabboCustomLauncher with a custom hotel setting.

| System | File |
| --- | --- |
| Windows | `HabboCustomLauncher.exe` |
| macOS with Apple silicon | `HabboCustomLauncher_OSX_arm64` |
| macOS with Intel | `HabboCustomLauncher_OSX_x64` |
| Linux x64 | `HabboCustomLauncher_Linux_x64` |
| Linux ARM64 | `HabboCustomLauncher_Linux_arm64` |

### 2. Start the launcher

The builds are not signed, so your system may warn you.

- **Windows:** run `HabboCustomLauncher.exe`. If SmartScreen warns about an unknown publisher, choose **More info**, then **Run anyway**.
- **macOS:** open Terminal in the download folder and run:

  ```bash
  chmod +x HabboCustomLauncher_OSX_arm64
  xattr -d com.apple.quarantine HabboCustomLauncher_OSX_arm64
  ./HabboCustomLauncher_OSX_arm64
  ```

  On an Intel Mac, use `HabboCustomLauncher_OSX_x64`. The launcher needs write access to `/Applications` to open `habbo://` links.
- **Linux:** run `chmod +x HabboCustomLauncher_Linux_x64 && ./HabboCustomLauncher_Linux_x64`. On ARM64, use `HabboCustomLauncher_Linux_arm64`.

Each start, the launcher registers itself as the program that opens `habbo://` links. Start it once before you use the website button.

### 3. Log in

1. Open the hotel's website in your browser and sign in.
2. Press **Open AIR client**. If the browser asks to open the link with HabboCustomLauncher, allow it.
3. The launcher downloads the client the first time, prepares it for the hotel and starts it. You are logged in.

The launcher keeps a separate copy of the client for each hotel. Your Habbo client folder does not change.

You can also set the hotel in the launcher:

1. Press the gear icon to open **Settings**.
2. In **Hotel domain**, type the hotel's website address without `https://`, for example `example.com`. Use exactly the address of the website, with `www.` if the website uses it.
3. Leave **Hotel token (optional)** empty, unless the hotel gave you a launcher token.
4. Press **OK**, then **Open example.com**. The hotel's website opens, and you continue at step 1 above.

If the hotel gave you a launcher token, paste it in **Hotel token**. The main button then starts the client directly, without the website.

### Go back to Habbo

Open **Settings**, clear **Hotel domain**, and press **OK**. The launcher then works with Habbo's login codes again.

## Reference

### The website button

Atom CMS shows **Open AIR client** when `AIR_CLIENT_ENABLED=true` and the player is signed in:

- **Dusk theme:** under **Go to <hotel name>** on the player's home page.
- **Atom theme:** under **Go to <hotel name>** on the player's home page, and as **AIR client** in the site header.
- **Atom Nuxt front end:** on the player's home page and in the site banner, when the player opened the website from the launcher. The launcher adds `?launcher=air`, and the website remembers it for that browser tab.

The button opens `/game/air`. That route needs a signed-in player and works 10 times per minute. It creates a fresh login ticket and redirects to `habbo://hab?server=<APP_URL host>&token=<login ticket>`. While the setting is off, it answers 404.

Atom also answers `POST /api/v1/client/launch` with `{"client": "air"}` with the same link in `url`. The login ticket works for 5 minutes and only once. `GET /api/v1/bootstrap` shows the setting as `clients.air_enabled`.

Another website must create a fresh login ticket for the player and open `habbo://hab?server=example.com&token=<login ticket>`.

### Game data

After login, the AIR client loads `${url.prefix}/gamedata/hashes` and the four files it lists. PlusEMU builds these files:

| File | Content |
| --- | --- |
| `external_variables` | `ExternalVariablesFiles`, merged in order. Then PlusEMU sets `furnidata.load.url` and `productdata.load.url` to its own files. `Variables` wins over everything. |
| `external_flash_texts` | `ExternalTextsFiles`, merged in order. A file can have `key=value` lines or be a JSON object, such as Volt's `ExternalTexts.json`. |
| `furnidata` | The [generated furniture data](/getting-started/configuration/#furniture-data-endpoints) from your database, as Habbo's XML. |
| `productdata` | `ProductDataFile`: Habbo's XML or text file as it is, or a `ProductData.json` that PlusEMU converts to XML. Without it, PlusEMU uses the furniture names. |

A relative file path is relative to `Config/`. PlusEMU reads a file again when it changes, so a game data change needs no restart.

With Habbo's external variables, the AIR client loads furniture (`flash.dynamic.download.url`), clothing (`flash.client.url` and `external.figurepartlist.txt`) and most images from Habbo's servers. The hotel files pack has Volt's files, not the Flash `.swf` libraries that the AIR client needs. Only these files from the pack work for the AIR client:

- Badge images: `badge.image.path` set to `https://example.com/hotel-files/c_images/album1584`.
- Catalogue images: `image.library.catalogue.url` set to `https://example.com/hotel-files/c_images/catalogue/`.

Habbo's file also points `external.texts.txt` and `external.override.texts.txt` at Habbo. The `Variables` in step 4 point both at your own texts file. The installer sets all four variables.

For your own furniture, host the `.swf` files yourself and change `flash.dynamic.download.url`. See [add furniture](/features/add-furniture/#air-client).

### The published client

`https://assets.plusemu.dev/air/latest.json` lists the current patched client:

| Field | Meaning |
| --- | --- |
| `version` | Habbo's client version and the patch revision, for example `38-1`. Use it as `ClientVersion`. |
| `habboVersion` | Habbo's client version, for example `38`. |
| `client.url`, `client.sha256` | The patched Windows client package. Use the URL as `ClientUrl`. The launcher uses this package on every system. |
| `externalVariables`, `externalFlashTexts` | Habbo's AIR texts for that version, with their SHA-256. |

The files of each version stay at `https://assets.plusemu.dev/air/client/<version>/`. Maintainers build and publish a new version with [`tools/patch-air-client.py`](https://github.com/plus-emulator/plusemu-installer/blob/main/tools/patch-air-client.py) in the installer repository.

### Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/client/air.json` | The launcher file. It has `version`, `name`, `environment`, `game.host` and `game.ports`, `urls`, `rsa.modulus` and `ticket.url`. It has `client` when `ClientUrl` is set, and `configuration` when `Configuration` has entries. |
| `POST /api/client/air-ticket` | With `Authorization: Bearer <launcher token>`, returns `{"ticket": "..."}`. The login ticket is saved in `users.auth_ticket`. |
| `POST /api/client/air-launcher-token` | Send `{"ticket": "<login ticket>"}`. It uses up a live login ticket, such as one the website gives a signed-in player, and returns `{"token", "expiresAt"}`. |
| `DELETE /api/client/air-launcher-token` | Revokes the Bearer token. |
| `GET /gamedata/hashes` | `{"hashes":[{name,url,hash}]}` for `external_texts`, `external_variables`, `furnidata` and `productdata`. |
| `GET /gamedata/external_flash_texts/<hash>` | The merged texts. |
| `GET /gamedata/external_variables/<hash>` | The merged variables. |
| `GET /gamedata/furnidata_xml/<hash>` | The furniture data as XML. |
| `GET /gamedata/productdata/<hash>` | The product data. |

Any hash returns the current file. Only the current hash is cached for good.

### Launcher tokens

A launcher token lets the launcher get login tickets without the website. PlusEMU stores tokens in `user_launcher_tokens` as SHA-256 digests. A token stops working when:

- it is older than `LauncherTokenLifetimeDays`,
- it is revoked with `DELETE /api/client/air-launcher-token`, or
- the player's `credential_generation` changes, for example after a password change.

Atom CMS does not hand out launcher tokens. The website button with a login ticket is the normal way to start the client.
