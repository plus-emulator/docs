---
title: Connect the AIR client
description: Create the handshake key, serve the AIR game data, and set up the launcher file and login tickets for Habbo's AIR client.
sidebar:
  order: 5
---

Habbo's official AIR client connects to the `Flash` TCP listener. It needs a handshake key, game data from the web server, and optionally a launcher file. Volt does not need any of this. Volt connects to the `Nitro` WebSocket listener.

The settings for this page are in the `AirClient` and `Encryption` sections of `Config/config.json`. See [configuration](/getting-started/configuration/).

## Create the handshake key

The AIR client checks the server's handshake with an RSA public key. It fixes the exponent at `65537`. PlusEMU needs its own 2048-bit key with that exponent. The private key is never part of the repository.

Create the key:

```bash
./"Plus Emulator" --generate-rsa-key Config/rsa-private.pem
```

You can also use `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out Config/rsa-private.pem`.

PlusEMU writes the key with mode `0600` and prints the public modulus. Give the modulus to the client as `rsa.modulus` in `air.json`.

Then tell PlusEMU where the key is. Use one of these:

- Set `"Encryption": { "RsaPrivateKeyFile": "rsa-private.pem" }` in `Config/config.json`. The path is relative to `Config/`.
- Set the environment variable `PLUS_RSA_PRIVATE_KEY_FILE` to the path of the key file, for example `/run/secrets/rsa-private.pem`.
- Set the environment variable `PLUS_RSA_PRIVATE_KEY` to the PEM text itself.

Without a key, PlusEMU uses an old built-in 1024-bit key with exponent 3 and logs a warning. The AIR client cannot log in with that key. Volt does not use this handshake, so it does not need a key.

## Let players reach the game port

The `Flash` listener binds to `Flash.Hostname`. The default is `127.0.0.1`. For players outside the server, use a public address such as `0.0.0.0`. Use a hostname that is not proxied over HTTP.

## Serve the game data

After login, the AIR client loads `${url.prefix}/gamedata/hashes` and the four files it lists. The web server builds them from the hotel's own data.

| Endpoint | Content |
| --- | --- |
| `GET /gamedata/hashes` | `{"hashes":[{name,url,hash}]}` for `external_texts`, `external_variables`, `furnidata` and `productdata` |
| `GET /gamedata/external_flash_texts/<hash>` | `key=value` texts merged from `AirClient.ExternalTextsFiles`. The files can be `key=value` files or JSON objects, such as Volt's `ExternalTexts.json`. |
| `GET /gamedata/external_variables/<hash>` | `key=value` variables merged from `AirClient.ExternalVariablesFiles`, then `furnidata.load.url` and `productdata.load.url`, then `AirClient.Variables` |
| `GET /gamedata/furnidata_xml/<hash>` | The [generated furniture data](/getting-started/configuration/#furniture-data-endpoints) as Habbo's XML |
| `GET /gamedata/productdata/<hash>` | `AirClient.ProductDataFile` (XML or text as is, `ProductData.json` converted to XML). Without it, the furniture names. |

Any hash returns the current file. Only the current hash is cached for good.

Set `AirClient.UrlPrefix` to the public address of the hotel, for example `https://example.com`. When it is empty, PlusEMU uses the address of the request (`X-Forwarded-Proto` and `Host`).

Put the client asset roots, such as `flash.dynamic.download.url`, in an external variables file or in `AirClient.Variables`.

Route these paths from the public site to the web server:

- `/gamedata/hashes`
- `/gamedata/external_flash_texts/`
- `/gamedata/external_variables/`
- `/gamedata/furnidata_xml/`
- `/gamedata/productdata/`

## Set up the launcher

The AIR launcher, with your own domain, reads `https://<domain>/api/client/air.json` and patches the client with it. The web server serves this file only when `AirClient.GameHost` is set and a handshake key is configured. Otherwise it answers 404.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/client/air.json` | Returns `environment`, `game.host` and `game.ports`, `urls`, `rsa.modulus`, `ticket.url`, and `client` when `AirClient.ClientUrl` is set. |
| `POST /api/client/air-ticket` | With `Authorization: Bearer <launcher token>`, returns `{"ticket": "..."}`. This game ticket is saved in `users.auth_ticket`. It logs in once and expires after `AirClient.TicketLifetimeSeconds` (default 60). |
| `POST /api/client/air-launcher-token` | Send `{"ticket": "<game ticket>"}`. It uses up a live game ticket, such as one the website gives a signed-in user, and returns `{"token", "expiresAt"}`. |
| `DELETE /api/client/air-launcher-token` | Revokes the Bearer token. |

Launcher tokens are stored in `user_launcher_tokens` as SHA-256 digests. A token expires after `AirClient.LauncherTokenLifetimeDays` (default 30). It also stops working when the user's `credential_generation` changes, for example after a password change.

The website can skip tokens and link a signed-in user to `habbo://hab?server=<domain>&token=<game ticket>`.

`AirClient.Environment` must be one of `en`, `pt`, `de`, `es`, `fi`, `fr`, `it`, `nl`, `tr` or `s2`. The client drops any other value.

Without `AirClient.ClientUrl`, the launcher downloads Habbo's current client. Its build must match the packet headers of your PlusEMU version.
