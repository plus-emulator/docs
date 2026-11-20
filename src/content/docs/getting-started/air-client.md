---
title: Connect the AIR client
description: Set up your hotel for Habbo's AIR client, add the website button, and start the client with the launcher, from zero to logged in.
sidebar:
  order: 5
---

Players can play your hotel with Habbo's official AIR desktop client. They start it with a free launcher that points the client to your hotel. This page has two parts:

- [Set up the hotel](#set-up-the-hotel) is for the hotel owner. Do it once.
- [Play with the AIR client](#play-with-the-air-client) is for players. You can link players to that section.

Volt does not need any of this. Volt connects to the `Nitro` WebSocket listener. The AIR client connects to the `Flash` TCP listener. Both clients can be used on the same hotel at the same time.

## How it works

1. The player sets the launcher to your domain, for example `example.com`.
2. The launcher opens `https://example.com/?launcher=air` in the browser. The player signs in.
3. The player presses **Open AIR client** on the website. The website opens a `habbo://hab?server=example.com&token=<login ticket>` link, which hands the ticket to the launcher.
4. The launcher reads `https://example.com/api/client/air.json`. It downloads Habbo's AIR client, writes your game address and handshake key into its own copy of the client, and starts it with the ticket.
5. The client connects to your game port over plain TCP and logs in. Then it loads the game data from `https://example.com/gamedata/` and the furniture and clothing from the asset addresses in that data.

## Set up the hotel

You need:

- A current PlusEMU version. See [keep PlusEMU up to date](#1-keep-plusemu-up-to-date).
- A domain with HTTPS, for example `example.com`.
- A second hostname for the game port that is not proxied over HTTP, for example `game.example.com`.
- Atom CMS with its Atom Nuxt front end, for the **Open AIR client** button. See [add the website button](#7-add-the-website-button).

The examples use the paths of the [installer](/getting-started/installation/) on Linux. For a manual installation, use your own emulator folder.

### What the installer does and does not do

The installer does not set up the AIR client. After an installation:

- `Flash.Hostname` is `127.0.0.1`, so only the server itself can reach the game port. `Flash.Port` is `1232`.
- There is no handshake key and the `AirClient` section is empty, so `/api/client/air.json` answers 404.
- The website has no routes for `/api/client/` and `/gamedata/`.
- The firewall only opens SSH, HTTP and HTTPS.
- Atom CMS has `AIR_CLIENT_ENABLED=false`.

Do the steps below once. `plusemu-update` keeps them: it copies your `Config` folder, including the key, into each new emulator version. It also keeps your changes to the website's nginx file. If you run the full installer again, it writes a new nginx file, so add the routes again.

The installer does give you one useful thing: the hotel files pack has the badge and catalogue images that the AIR client can use. See [set up the game data](#5-set-up-the-game-data).

### 1. Keep PlusEMU up to date

PlusEMU always targets the newest AIR client build from Habbo. Each PlusEMU version supports exactly one build. The client and the emulator must use the same build, or the client cannot log in.

- Leave `AirClient.ClientUrl` empty. The launcher then downloads Habbo's current AIR client.
- Keep PlusEMU updated with `sudo plusemu-update` (Linux) or `plusemu-update` (Windows). See [updates](/getting-started/updates/).

When Habbo releases a new AIR client, the launcher downloads it. Players can log in again after you install the PlusEMU release that supports it.

:::note
You can hold an older build for a short time, for example while the PlusEMU release for Habbo's newest build is not out yet. Set `AirClient.ClientUrl` to the `flash-windows` address and `AirClient.ClientVersion` to `flash-windows-version` from `https://www.habbo.com/gamedata/clienturls`, as they were for the build you want to keep. The launcher uses this Windows package on every system. Empty `ClientUrl` again after you update PlusEMU.
:::

### 2. Create the handshake key

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

You can also create the key with `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out Config/rsa-private.pem`. Make sure the emulator's user can read the file.

Tell PlusEMU where the key is. Use one of these:

- `"Encryption": { "RsaPrivateKeyFile": "rsa-private.pem" }` in `Config/config.json`. A relative path is relative to `Config/`.
- The environment variable `PLUS_RSA_PRIVATE_KEY_FILE` with the path of the key file.
- The environment variable `PLUS_RSA_PRIVATE_KEY` with the PEM text itself.

Without a key, PlusEMU uses an old built-in 1024-bit key with exponent 3 and logs a warning. The AIR client cannot log in with that key, and `air.json` answers 404.

### 3. Open the game port

The AIR client needs a plain TCP connection to the `Flash` listener. HTTP proxies cannot carry this connection.

1. In `Config/config.json`, set `Flash.Hostname` to `0.0.0.0` and `Flash.Port` to the game port. This page uses `30000`, the default of `AirClient.GamePorts`. The default `Flash.Port` is `1232`, so change one of them until they match.
2. Open the port in the firewall:
   - Linux: `sudo ufw allow 30000/tcp`
   - Windows: `New-NetFirewallRule -DisplayName 'PlusEMU AIR client' -Direction Inbound -Protocol TCP -LocalPort 30000 -Action Allow`
3. Give the game port its own hostname, for example `game.example.com`. If your website is behind Cloudflare, add an `A` record named `game` with your server's IPv4 address, and set **Proxy status** to **DNS only**. A proxied hostname only carries HTTP, so the client cannot connect through it.

A DNS-only hostname shows your server's IP address. The installer's firewall still accepts HTTPS only from Cloudflare, so the website stays behind Cloudflare. Only the game port is reachable directly.

### 4. Fill in the `AirClient` settings

Add your values to the `AirClient` section of `Config/config.json`. For example:

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
    "ClientVersion": "",
    "ClientUrl": "",
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
| `GameHost` | empty | The public hostname of the game port, for example `game.example.com`. `air.json` answers 404 while it is empty. |
| `GamePorts` | `30000` | Game ports, separated by commas. The client tries them in order. One of them must be `Flash.Port`. |
| `Environment` | `en` | The environment the client runs as. It must be `en`, `pt`, `de`, `es`, `fi`, `fr`, `it`, `nl`, `tr` or `s2`. The client drops any other value. |
| `Name` | `PlusEMU` | The hotel name in `air.json`. |
| `ClientUrl`, `ClientVersion` | empty | Leave them empty, so the launcher uses Habbo's current client. See [keep PlusEMU up to date](#1-keep-plusemu-up-to-date). |
| `WebApi`, `PocketApi` | empty | `web.api` and `pocket.api` for the client. When they are empty, the client uses `UrlPrefix`. |
| `Configuration` | `{}` | Extra `key: value` lines for the client's built-in configuration. |
| `ExternalVariablesFiles`, `ExternalTextsFiles`, `ProductDataFile`, `Variables` | empty | The game data. See [set up the game data](#5-set-up-the-game-data). |
| `TicketLifetimeSeconds` | `60` | How long a ticket from `POST /api/client/air-ticket` works. PlusEMU keeps it between 10 and 300 seconds. A ticket works only once. |
| `LauncherTokenLifetimeDays` | `30` | How long a launcher token works. PlusEMU keeps it between 1 and 365 days. |

Restart the emulator after you change `Config/config.json`:

```bash
sudo systemctl restart plusemu
```

The startup log shows `Handshake RSA key loaded from ... (2048 bits)` when the key works.

### 5. Set up the game data

After login, the AIR client loads `${url.prefix}/gamedata/hashes` and the four files it lists. PlusEMU builds these files:

| File | Content |
| --- | --- |
| `external_variables` | `ExternalVariablesFiles`, merged in order. Then PlusEMU sets `furnidata.load.url` and `productdata.load.url` to its own files. `Variables` wins over everything. |
| `external_flash_texts` | `ExternalTextsFiles`, merged in order. A file can have `key=value` lines or be a JSON object, such as Volt's `ExternalTexts.json`. |
| `furnidata` | The [generated furniture data](/getting-started/configuration/#furniture-data-endpoints) from your database, as Habbo's XML. |
| `productdata` | `ProductDataFile`: Habbo's XML or text file as it is, or a `ProductData.json` that PlusEMU converts to XML. Without it, PlusEMU uses the furniture names. |

A relative file path is relative to `Config/`. PlusEMU reads a file again when it changes, so a game data change needs no restart.

**The external variables need a full base file.** They tell the client where to load furniture, clothing, sounds and images. PlusEMU only adds its own furniture data and product data addresses. Start from Habbo's current file:

```bash
sudo runuser -u plusemu -- mkdir -p /var/www/hotel/emulator/Config/air
sudo runuser -u plusemu -- curl -fsSL -o /var/www/hotel/emulator/Config/air/external_variables.txt https://www.habbo.com/gamedata/external_variables/1
sudo runuser -u plusemu -- curl -fsSL -o /var/www/hotel/emulator/Config/air/external_flash_texts.txt https://www.habbo.com/gamedata/external_flash_texts/1
```

`plusemu-update` copies the `Config` folder, so it keeps these files.

With Habbo's file, the AIR client loads furniture (`flash.dynamic.download.url`), clothing (`flash.client.url` and `external.figurepartlist.txt`) and most images from Habbo's servers. The hotel files pack has Volt's files, not the Flash `.swf` libraries that the AIR client needs. Only these files from the pack work for the AIR client:

- Badge images: set `badge.image.path` to `https://example.com/hotel-files/c_images/album1584`.
- Catalogue images: set `image.library.catalogue.url` to `https://example.com/hotel-files/c_images/catalogue/`.

Habbo's file also points `external.texts.txt` and `external.override.texts.txt` at Habbo. Point both at your own texts file in `Variables`, as in the example in step 4.

For your own furniture, host the `.swf` files yourself and change `flash.dynamic.download.url`. See [add furniture](/features/add-furniture/#air-client).

### 6. Route the web paths to the emulator

The PlusEMU web server answers the launcher and the game data on `WebServer.Hostname` and `WebServer.Port`, by default `127.0.0.1:8080`. The website must pass these paths to it.

On a Linux installation, open `/etc/nginx/sites-available/hotel.conf`. Add these blocks inside the HTTPS `server` block, before `location / {`:

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

On Windows with IIS, add URL Rewrite rules that send the same paths to `http://127.0.0.1:8080`.

### 7. Add the website button

Atom CMS creates the `habbo://` link for a signed-in player.

1. In the website's `.env`, set `AIR_CLIENT_ENABLED=true`. On a Linux installation, the file is `/var/www/hotel/cms/.env`.
2. Check that `APP_URL` is your public address, for example `https://example.com`. The link uses the host of `APP_URL` as `server`. The launcher only accepts the link when this host is exactly the **Hotel domain** in the launcher. `www.example.com` and `example.com` are different.
3. Reload the configuration cache:

   ```bash
   cd /var/www/hotel/cms && sudo -u www-data php artisan config:cache
   ```

Atom then answers `POST /api/v1/client/launch` with `{"client": "air"}` with `habbo://hab?server=<APP_URL host>&token=<login ticket>`. The login ticket works for 5 minutes and only once. While the setting is off, this request answers 404. `GET /api/v1/bootstrap` shows the setting as `clients.air_enabled`.

The **Open AIR client** button is part of the Atom Nuxt front end. It shows on the player's home page and in the site banner when all of these are true:

- `AIR_CLIENT_ENABLED=true`.
- The player is signed in.
- The player opened the website from the launcher. The launcher adds `?launcher=air`, and the website remembers it for that browser tab.

The Atom CMS website that the installer sets up has no **Open AIR client** button. Its API answers the launch request, so you can add your own button that calls `POST /api/v1/client/launch` with `{"client": "air"}` for the signed-in player and opens the `url` from the answer. Another website must create a fresh login ticket for the player and open `habbo://hab?server=example.com&token=<login ticket>`.

### 8. Check that it works

Run these checks from a computer outside the server:

1. The launcher file:

   ```bash
   curl -s https://example.com/api/client/air.json
   ```

   It must answer with JSON that has `game.host`, `game.ports`, `urls.prefix` and `rsa.modulus`. A 404 means that `GameHost` is empty or that PlusEMU has no usable handshake key.

2. The game data:

   ```bash
   curl -s https://example.com/gamedata/hashes
   ```

   It must list `external_texts`, `external_variables`, `furnidata` and `productdata` with your domain in each `url`.

3. The game port:

   ```bash
   printf '<policy-file-request/>\0' | nc -w 3 game.example.com 30000
   ```

   It must print a `<cross-domain-policy>` XML text. No answer means that the port is closed, `Flash.Hostname` is still `127.0.0.1`, or the hostname is proxied.

4. A real login: follow [play with the AIR client](#play-with-the-air-client) with a test account.

### Troubleshooting

- **`air.json` answers 404, or the launcher says `Hotel config ... returned HTTP 404`.** `AirClient.GameHost` is empty, there is no handshake key, or the key does not use exponent `65537`. Check the startup log for `No RSA private key is configured` or `has public exponent`.
- **`air.json` or `/gamedata/hashes` shows the website's page or a 404 from the website.** The nginx routes are missing or come after a block that catches them. See [step 6](#6-route-the-web-paths-to-the-emulator).
- **The client starts but never connects.** Check the game port with `nc`. Check that `GamePorts` contains `Flash.Port`, that the firewall is open, and that the game hostname is **DNS only**.
- **The client connects, then disconnects right away.** The client build and the PlusEMU version do not match. The emulator log shows `Unknown revision connected <build>`. Update PlusEMU, and leave `ClientUrl` empty.
- **The launcher says the environment is not one the AIR client accepts.** `AirClient.Environment` is not one of the allowed values. Use `en` or another value from the list in step 4.
- **The game data answers 500.** A file in `ExternalVariablesFiles`, `ExternalTextsFiles` or `ProductDataFile` does not exist, or the emulator's user cannot read it.
- **Furniture, clothing or images are missing.** The external variables have no base file, or an asset address is wrong. See [set up the game data](#5-set-up-the-game-data).
- **The login ticket does not work.** A ticket works only once. A ticket from `POST /api/client/air-ticket` works for `TicketLifetimeSeconds`, 60 seconds by default. A ticket from Atom works for 5 minutes. Press **Open AIR client** again.
- **The Open AIR client button does not show.** Open the website from the launcher's **Open** button, sign in, and check `AIR_CLIENT_ENABLED` and the configuration cache.
- **The launcher ignores the website link.** The host of Atom's `APP_URL` and the launcher's **Hotel domain** are not the same.
- **A launcher token stopped working.** It expired after `LauncherTokenLifetimeDays`, the player changed their password, or the token was revoked.

## Play with the AIR client

This part is for players. Your hotel must have the [hotel setup](#set-up-the-hotel) done.

### 1. Download the launcher

Download the launcher for your system from [HabboCustomLauncher releases](https://github.com/DennisObject/HabboCustomLauncher/releases/latest). This launcher is a fork of LilithRainbows' HabboCustomLauncher with a custom hotel setting.

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

On the first start, the launcher downloads Habbo's AIR client. Each start, it registers itself as the program that opens `habbo://` links.

### 3. Set your hotel

1. Press the gear icon to open **Settings**.
2. In **Hotel domain**, type the hotel's website address without `https://`, for example `example.com`. Use exactly the address of the website, with `www.` if the website uses it.
3. Leave **Hotel token (optional)** empty, unless the hotel gave you a launcher token.
4. Press **OK**.

### 4. Log in

1. Press **Open example.com** in the launcher. The hotel's website opens in your browser.
2. Sign in, if you are not signed in yet.
3. Press **Open AIR client** on the website. If the browser asks to open the link with HabboCustomLauncher, allow it.
4. The launcher prepares the client for the hotel and starts it. You are logged in.

The launcher keeps a separate copy of the client for each hotel. Your Habbo client folder does not change.

If the hotel gave you a launcher token, paste it in **Hotel token**. The main button then starts the client directly, without the website.

### Go back to Habbo

Open **Settings**, clear **Hotel domain**, and press **OK**. The launcher then works with Habbo's login codes again.

## Reference

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
